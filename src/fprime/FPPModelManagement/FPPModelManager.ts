import IConfig from "../Common/Config";
import DataImporter from "../DataImport/DataImporter";

/**
 * 
 */
export enum ViewType {
  Function = "Function View",
  InstanceCentric = "InstanceCentric View",
  Component = "Component View",
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
  id: string;
  model_id: string;
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
  private keywords: string[] = ["base_id", "name"];

  /**
   *
   */
  public async loadModel(config: IConfig): Promise<{
    output: string;
    viewlist: { [k: string]: string[] };
  }> {

    // Reset all the model object lists
    this.reset();

    // Invoke the compiler
    const re = await this.dataImporter.invokeCompiler(config);

    // Load the model from xml object and return the view list
    const data = re.representation;
    if (data == null || data.namespace == null) {
      throw new Error("fail to parse model data, model is null!");
    }
    // Load the model data to FPP model manager
    if (!data.namespace.system || data.namespace.system.length !== 1) {
      throw new Error(
        "fail to parse model data, the number of system section is invalid",
      );
    }

    this.components = this.components.concat(this.generateComponents(
      data.namespace.component,
    ));

    this.instances = this.instances.concat(this.generateInstances(
      data.namespace.system[0].instance,
    ));

    this.topologies = this.topologies.concat(this.generateTopologies(
      data.namespace.system[0].topology,
    ));

    // Return the view list of the model
    const viewlist: { [k: string]: string[] } = {
      topologies: [],
      instances: [],
      components: [],
    };
    this.topologies.forEach((e: IFPPTopology) => {
      viewlist.topologies.push(e.name);
    });

    this.instances.forEach((e: IFPPInstance) => {
      viewlist.instances.push(e.id);
    });

    this.components.forEach((e: IFPPComponent) => {
      viewlist.components.push(e.name);
    });

    // Add output information
    const output = re.output + "View list generated...\n";
    return { output, viewlist };
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
        // console.log(ins);
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
        // console.log(comps);
        return {
          instances: ins,
          connections: cons,
          components: comps,
        };
      }
      case ViewType.InstanceCentric: {
        let ins: IFPPInstance[] = [];
        const cons: IFPPConnection[] = [];
        const root = this.instances.filter((i) => i.id === viewName)[0];

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

  private reset() {
    this.instances = [];
    this.topologies = [];
    this.components = [];
  }

  private generateComponents(components: any[]): IFPPComponent[] {
    const res: IFPPComponent[] = [];

    if (components === null) {
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

      res.push({
        name: ele.$.name,
        namespace: ele.$.namespace,
        ports: ps,
      });
    });

    return res;
  }

  private generateInstances(instances: any[]): IFPPInstance[] {
    const res: IFPPInstance[] = [];

    if (instances === null) {
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
        if (c.name === name && c.namespace === namespace) {
          c.ports.forEach((p: IFPPPort) => {
            ps[p.name] = p;
          });
        }
      });

      res.push({
        id: ele.$.name,
        model_id: ele.$.base_id,
        ports: ps,
        properties: props,
      });
    });

    return res;
  }

  private generateTopologies(topologies: any[]): IFPPTopology[] {
    const res: IFPPTopology[] = [];

    if (topologies === null) {
      return res;
    }

    topologies.forEach((ele: any) => {
      const cons: IFPPConnection[] = [];
      ele.connection.forEach((con: any) => {
        const source = this.instances.filter(
          (i) => i.id === con.source[0].$.instance)[0];
        const target = this.instances.filter(
          (i) => i.id === con.target[0].$.instance)[0];


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
        name: ele.$.name,
        connections: cons,
      });
    });

    return res;
  }

  private getPortByInstance(ins: IFPPInstance, portName: string): IFPPPort {
    return this.getPortsByInstance(ins).filter((p) => p.name === portName)[0];
  }

  private getPortsByInstance(ins: IFPPInstance): IFPPPort[] {
    const prop: string[] = ins.properties.type.split(".");
    const name: string = prop[1];
    const namespace: string = prop[0];
    const comp = this.components.filter(
      (c) => c.name === name && c.namespace === namespace,
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
