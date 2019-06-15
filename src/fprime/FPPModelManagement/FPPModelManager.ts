import IConfig from "../Common/Config";
import DataImporter, { IOutput } from "../DataImport/DataImporter";
import fs from 'fs';

/**
 * 
 */
export enum ViewType {
  Function = "Function View",
  InstanceCentric = "InstanceCentric View",
  Component = "Component View",
  PortType = "PortType View",
}

/**
 *
 */
export interface IFPPPort {
  name: string;
  properties: { [key: string]: any };
}

/**
 * 
 */
export interface IFPPComponent {
  name: string;
  namespace: string;
  ports: IFPPPort[];
}

/**
 * 
 */
export interface IFPPInstance {
  name: string;
  base_id: string;
  ports: { [p: string]: IFPPPort };
  properties: { [p: string]: string };
}

/**
 * 
 */
export interface IFPPConnection {
  from: { inst: IFPPInstance, port: IFPPPort };
  to: { inst: IFPPInstance, port: IFPPPort };
}

/**
 * 
 */
export interface IFPPTopology {
  name: string;
  connections: IFPPConnection[];
}

/**
 * 
 */
export interface IFPPModel {
  instances: IFPPInstance[];
  connections: IFPPConnection[];
  components: IFPPComponent[];
}

/**
 *
 */
export default class FPPModelManager {
  private dataImporter: DataImporter = new DataImporter();
  private instances: IFPPInstance[] = [];
  private topologies: IFPPTopology[] = [];
  private components: IFPPComponent[] = [];
  private ports: IFPPPort[] = [];
  private keywords: string[] = ["base_id", "name"];

  /**
   *
   */
  public async loadModel(
      config: IConfig, output?: IOutput): Promise<{ [k: string]: string[] }> {

    // Reset all the model object lists
    this.reset();

    // Invoke the compiler
    const data = await this.dataImporter.invokeCompiler(config, output);
    console.dir(data);

    // Load the model from xml object and return the view list
    if (data == null || data.length === 0) {
      throw new Error("fail to parse model data, model is null!");
    }

    data.forEach((i: any) => {
      this.components = this.components.concat(this.generateComponents(
        i.namespace.component,
      ));
    });

    // add the port instance to port type arrays
    this.components.forEach((comp: IFPPComponent) => {
      this.ports = this.ports.concat(comp.ports.filter((p : IFPPPort) => {
        return this.ports.find((pp : IFPPPort) => {
          return pp.name === p.name;
        }) === undefined;
      }));
    });

    data.forEach((i: any) => {
      if (i.namespace.system == null || i.namespace.system.length === 0) {
        return;
      }

      this.instances = this.instances.concat(this.generateInstances(
        i.namespace.$.name,
        i.namespace.system[0].instance,
      ));
    });

    data.forEach((i: any) => {
      if (i.namespace.system == null || i.namespace.system.length === 0) {
        return;
      }

      this.topologies = this.topologies.concat(this.generateTopologies(
        i.namespace.$.name,
        i.namespace.system[0].topology,
      ));
    });

    // Return the view list of the model
    const viewlist: { [k: string]: string[] } = {
      topologies: [],
      instances: [],
      components: [],
      ports: [],
    };
    this.topologies.forEach((e: IFPPTopology) => {
      viewlist.topologies.push(e.name);
    });

    this.instances.forEach((e: IFPPInstance) => {
      viewlist.instances.push(e.name);
    });

    this.components.forEach((e: IFPPComponent) => {
      viewlist.components.push(e.name);
    });

    this.ports.forEach((e: IFPPPort) => {
      viewlist.ports.push(e.name);
    })


    // Add output information
    if (output) {
      output.appendOutput("Generate view list...");
    }
    return viewlist;
  }

  public query(viewName: string, viewType: string): any {
    switch (viewType) {
      case ViewType.Function: {
        const cons: IFPPConnection[] = this.topologies.filter(
          (i) => i.name === viewName)[0].connections;
        let ins: IFPPInstance[] = [];
        cons.forEach((c) => {
          if (ins.indexOf(c.from.inst) === -1) {
            ins.push(Object.assign({}, c.from.inst));
          }
          if (ins.indexOf(c.to.inst) === -1) {
            ins.push(Object.assign({}, c.to.inst));
          }
        });

        ins = this.filterUnusedPorts(ins, cons);
        return {
          instances: ins,
          connections: cons,
          components: [],
        };
      }
      case ViewType.Component: {
        const ins: IFPPInstance[] = [];
        const cons: IFPPConnection[] = [];
        const comps = this.components.filter((i) => i.name === viewName);
        return {
          instances: ins,
          connections: cons,
          components: comps,
        };
      }
      case ViewType.InstanceCentric: {
        let ins: IFPPInstance[] = [];
        const cons: IFPPConnection[] = [];
        const root = this.instances.filter((i) => i.name === viewName)[0];

        this.topologies.forEach((t) => {
          t.connections.forEach((c) => {
            if (c.from.inst === root) {
              ins.push(Object.assign({}, c.to.inst));
              cons.push(c);
            }
            if (c.to.inst === root) {
              ins.push(Object.assign({}, c.from.inst));
              cons.push(c);
            }
          });
        });
        ins.push(Object.assign({}, root));
        ins = this.filterUnusedPorts(ins, cons);
        return {
          instances: ins,
          connections: cons,
          components: [],
        };
      }
      default: {
        return null;
      }
    }
  }

  /**
   * Add a new port type to the current model
   * The default values of the port should includes:
   *  - a default name past by param
   *  - instance number of the port type is 0 
   * @param defaultName default name of the new port type
   */
  public addNewPortType(defaultName: string) {
    const port: IFPPPort = {
      name: defaultName,
      properties: {
        ["name"]: defaultName,
        ["number"]: "0",
      },
    }
    this.ports.push(port);
  }

  /**
   * Add a new component to the current model.
   * The default values of the component should includes:
   *  - a default name pass by param
   *  - an unspecified namespace
   *  - an empty port array 
   * Then the model should be updated in the source file 
   * in an async way.
   * 
   * @param defaultName default name of the new component
   */
  public addNewComponent(defaultName : string) {
    const item: IFPPComponent[] = [];
    const ps: IFPPPort[] = [];
    item.push({
      name: defaultName,
      namespace: "unspecified",
      ports: ps,
    });

    this.components = this.components.concat(item);
    // TODO: (async) update the model data
  }

  /**
   * Add a new instance to the current model.
   * The instance should created only when the corresponding component exists.
   * The default values of the instance should includes:
   *  - name: @param defaultName
   *  - base_id: defalut should be ? @todo
   *  - ports: the ports array in the component
   *  - 
   * 
   * @param defaultName default name of the new instance
   * @param cpName name of the corresponding component
   */
  public addNewInstance(defaultName : string, cpName: string) {
    const ps: { [p: string]: IFPPPort } = {};
    const type = cpName.split("\.");
      if (type.length !== 2) {
        throw new Error("Invalid type format for [" + cpName + "]");
      }

      const namespace = type[0];
      const name = type[1];
      this.components.forEach((c: IFPPComponent) => {
        if (c.name === namespace + "." + name && c.namespace === namespace) {
          c.ports.forEach((p: IFPPPort) => {
            ps[p.name] = p;
          });
        }
      });
    
    const item: IFPPInstance = {
      name: namespace + "." + defaultName,
      base_id: "-1",
      ports: ps,
      properties: {
        ["type"]: cpName,
        ["namespace"]: namespace,
      }
    };

    this.instances.push(item);
    console.dir(item);
    // TODO: (async) update the model data
  }

  /**
   * Add an empty function view AKA. new topology
   * The default values of the topology should includes:
   *  - a default name pass by param
   *  - an empty connection array 
   * @param defaultName default name of the new function view
   */
  public addNewFunctionView(defaultName : string) {
    const item: IFPPTopology[] = [];
    item.push({
      name: defaultName,
      connections: []
    });

    this.topologies = this.topologies.concat(item);
    // TODO: (async) update the model data
  }

  public deletePortType(name: string) : boolean {
    this.ports = this.ports.filter((i) => i.name !== name);
    return true;
  }

  /**
   * If you want to delete a component, 
   * you need to cope with all the relevant instance and topology
   * @param name name of the component to delete
   */
  public deleteComponent(name: string) : boolean {
    this.components = this.components.filter((i) => i.name !== name);
    return true;
  }
  
  public deleteInstance(name: string) : boolean {
    this.instances = this.instances.filter((i) => i.name !== name);
    return true;
  }

  public deleteTopology(name: string) : boolean {
    this.topologies = this.topologies.filter((i) => i.name !== name);
    return true;
  }

  public addPortToComponent(portname: string, compname: string): boolean {
    let port = this.ports.find((i) => i.name === portname);
    let comp = this.components.find((i) => i.name === compname);
    if(port == undefined || comp == undefined) return false;

    comp.ports.push(port);
    console.log(comp);
    return true;
  }

  public addInstanceToTopo(instname: string, toponame: string): boolean {
    //
    return false;
  }

  /**
   * Output the model into the selected folder
   */
  public writeToFile(folderPath: string) {
    const tab: string = "    ";


    // let componentSet: { [namespace: string]: new Set(); } = {};
    let componentContent: string = "";
    this.components.forEach((e: IFPPComponent) => {
      componentContent += e.name + " " + e.namespace + "\n";
      // for (const key in e.) {
      //     const value = e.properties[key];
      //     if (key === "type")
      //     {
      //         portTypeSet.add(value)
      //     }
      //     // portTypeContent = portTypeContent + (tab + "arg " + key + ":" + value + "\n");
      // }
      // portTypeContent = portTypeContent + "}\n";
    });


    // this.topologies.forEach((e: IFPPTopology) => {
    //     viewlist.topologies.push(e.name);
    // });
    //
    // this.instances.forEach((e: IFPPInstance) => {
    //     viewlist.instances.push(e.name);
    // });
    //
    // this.components.forEach((e: IFPPComponent) => {
    //     viewlist.components.push(e.name);
    // });



    fs.writeFile(folderPath.concat("\\test.fpp"), componentContent, (err) => {
      if (err) {
        throw err;
      }
    });
  }

  private reset() {
    this.instances = [];
    this.topologies = [];
    this.components = [];
  }

  private generateComponents(components: any[]): IFPPComponent[] {
    const res: IFPPComponent[] = [];

    if (components == null || components.length === 0) {
      return res;
    }

    components.forEach((ele: any) => {
      const ps: IFPPPort[] = [];
      ele.port.forEach((port: any) => {
        const p: IFPPPort = {
          name: port.$.name,
          properties: {},
        };

        p.properties = port.$;
        ps.push(p);
      });
      const ns = ele.$.namespace;

      res.push({
        name: ns + "." + ele.$.name,
        namespace: ns,
        ports: ps,
      });
    });

    return res;
  }

  private generateInstances(ns: string, instances: any[]): IFPPInstance[] {
    const res: IFPPInstance[] = [];

    if (instances == null || instances.length === 0) {
      return res;
    }

    instances.forEach((ele: any) => {
      const props: { [p: string]: string } = {};
      for (const key in ele.$) {
        if (!ele.$.hasOwnProperty(key)) {
          continue;
        }
        if (this.keywords.indexOf(key) === -1) {
          props[key] = ele.$[key];
        }
      }
      const ps: { [p: string]: IFPPPort } = {};
      if (ele.$.type === null) {
        throw new Error("The type of element is null.");
      }

      const type = ele.$.type.split("\.");
      if (type.length !== 2) {
        throw new Error("Invalid type format for [" + type + "]");
      }

      const namespace = type[0];
      const name = type[1];
      this.components.forEach((c: IFPPComponent) => {
        if (c.name === namespace + "." + name && c.namespace === namespace) {
          c.ports.forEach((p: IFPPPort) => {
            ps[p.name] = p;
          });
        }
      });

      res.push({
        name:  ns + "." + ele.$.name,
        base_id: ele.$.base_id,
        ports: ps,
        properties: props,
      });
    });

    return res;
  }

  private generateTopologies(ns: string, topologies: any[]): IFPPTopology[] {
    const res: IFPPTopology[] = [];
    if (topologies == null) {
      return res;
    }

    topologies.forEach((ele: any) => {
      const cons: IFPPConnection[] = [];
      ele.connection.forEach((con: any) => {
        const source = this.instances.filter(
          (i) => i.name === ns + "." + con.source[0].$.instance)[0];
        const target = this.instances.filter(
          (i) => i.name === ns + "." + con.target[0].$.instance)[0];


        cons.push({
          from: {
            inst: source,
            port: this.getPortByInstance(source, con.source[0].$.port),
          },
          to: {
            inst: target,
            port: this.getPortByInstance(target, con.target[0].$.port),
          },
        });
      });

      res.push({
        name: ns + "." + ele.$.name,
        connections: cons,
      });
    });

    return res;
  }

  private getPortByInstance(
    ins: IFPPInstance, portName: string): IFPPPort {
    return this.getPortsByInstance(ins)
    .filter((p) => p.name === portName)[0];
  }

  private getPortsByInstance(ins: IFPPInstance): IFPPPort[] {
    const prop: string[] = ins.properties.type.split(".");
    const name: string = prop[1];
    const namespace: string = prop[0];
    const comp = this.components.filter(
      (c) => c.name === namespace + "." + name && c.namespace === namespace,
    )[0];
    return comp.ports;
  }

  private filterUnusedPorts(
    ins: IFPPInstance[], cons: IFPPConnection[],
  ): IFPPInstance[] {
    ins.forEach((i) => {
      const ps: { [k: string]: IFPPPort } = {};
      Object.keys(i.ports).forEach((key) => {
        const p = i.ports[key];
        cons.forEach((c) => {
          if (c.from.port === p) {
            ps[key] = p;
          }
          if (c.to.port === p) {
            ps[key] = p;
          }
        });
      });
      i.ports = ps;
    });
    return ins;
  }
}
