import IConfig from "../Common/Config";
import DataImporter from "../DataImport/DataImporter";
import { Promise } from "es6-promise";

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
export interface IFPPComponent {
  name: string;
  namespace: string;
  ports: string[];
}

/**
 * 
 */
export interface IFPPInstance {
  id: string;
  model_id: number;
  ports: { [p: string]: string };
  properties: { [p: string]: string };
}

/**
 * 
 */
export interface IFPPConnection {
  from: { inst: IFPPInstance, port: string };
  to: { inst: IFPPInstance, port: string };
}

/**
 * 
 */
export interface IMockTopology {
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
  private topologies: IMockTopology[] = [];
  private components: IFPPComponent[] = [];
  private keywords: string[] = ["base_id", "name"];

  /**
   * 
   */
  public loadModel(config: IConfig): Promise<{
    output: string;
    viewlist: { [k: string]: string[] };
  }> {
    // Invoke the compiler
    const compilerResult = this.dataImporter.invokeCompiler(config);

    return compilerResult.then((re) => {
      // Load the model from xml object and return the view list
      const data = re.representation;
      if (data == null || data.namespace == null) {
        throw new Error("fail to parse model data, model is null!");
      }
      // Load the model data to FPP model manager
      if (data.namespace.system && data.namespace.system.length === 1) {

        data.namespace.component.forEach((ele: any) => {
          const ps: string[] = [];
          ele.port.forEach((p: any) => {
            ps.push(p.$.name);
          });

          this.components.push({
            name: ele.$.name,
            namespace: ele.$.namespace,
            ports: ps,
          });
        });

        // console.dir(this.components);
        data.namespace.system[0].instance.forEach((ele: any) => {
          const props: { [p: string]: string } = {};
          for (const key in ele.$) {
            if (!ele.$.hasOwnProperty(key)) {
              continue;
            }
            if (this.keywords.indexOf(key) === -1) {
              props[key] = ele.$[key];
            }
          }
          const ps: { [p: string]: string } = {};
          if (ele.$.type) {
            const type = ele.$.type.split("\.");
            if (type.length === 2) {
              const namespace = type[0];
              const name = type[1];
              this.components.forEach((c: IFPPComponent) => {
                if (c.name === name && c.namespace === namespace) {
                  let cnt = 1;
                  c.ports.forEach((p: string) => {
                    ps["p" + cnt] = p;
                    cnt++;
                  });
                }
              });

            }
          }
          this.instances.push({
            id: ele.$.name,
            model_id: ele.$.base_id,
            ports: ps,
            properties: props,
          });
        });

        data.namespace.system[0].topology.forEach((ele: any) => {
          const cons: IFPPConnection[] = [];
          ele.connection.forEach((con: any) => {
            const source = this.instances.filter(
              (i) => i.id === con.source[0].$.instance)[0];
            const target = this.instances.filter(
              (i) => i.id === con.target[0].$.instance)[0];

            cons.push({
              from: { inst: source, port: con.source[0].$.port },
              to: { inst: target, port: con.target[0].$.port },
            });
          });

          this.topologies.push({
            name: ele.$.name,
            connections: cons,
          });

        });
      }

      // Return the view list of the model
      const viewlist: { [k: string]: string[] } = {
        topologies: [],
        instances: [],
        components: [],
      };
      this.topologies.forEach((e: IMockTopology) => {
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
    });
  }

  public query(viewName: string, viewType: string): any {
    switch (viewType) {
      case ViewType.Function: {
        const cons: IFPPConnection[] = this.topologies.filter(
          (i) => i.name === viewName)[0].connections;
        const ins: IFPPInstance[] = [];
        cons.forEach((c) => {
          if (ins.indexOf(c.from.inst) === -1) {
            ins.push(c.from.inst);
          }
          if (ins.indexOf(c.to.inst) === -1) {
            ins.push(c.to.inst);
          }
        });

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
        const ins: IFPPInstance[] = [];
        const cons: IFPPConnection[] = [];
        const root = this.instances.filter((i) => i.id === viewName)[0];

        this.topologies.forEach((t) => {
          t.connections.forEach((c) => {
            if (c.from.inst === root) {
              ins.push(c.to.inst);
              cons.push(c);
            }
            if (c.to.inst === root) {
              ins.push(c.from.inst);
              cons.push(c);
            }
          });
        });
        ins.push(root);
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
}
