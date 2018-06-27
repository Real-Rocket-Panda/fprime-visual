import IConfig from "../Common/Config";
import DataImporter from "../DataImport/DataImporter";
import { Promise } from "es6-promise";

export enum ViewType {
  Function = "Function View",
  InstanceCentric = "InstanceCentric View",
  Component = "Component View",
}

export interface IMockComponent {
  name: string;
  namespace: string;
  ports: string[];
}

export interface IMockInstance {
  id: string;
  model_id: number;
  ports: { [p: string]: string };
  properties: { [p: string]: string };
}

export interface IMockConnection {
  from: { inst: IMockInstance, port: string };
  to: { inst: IMockInstance, port: string };
}

export interface IMockTopology {
  name: string;
  connections: IMockConnection[];
}

export interface IMockModel {
  instances: IMockInstance[];
  connections: IMockConnection[];
  components: IMockComponent[];
}

export default class FPPModelManager {
  private dataImporter: DataImporter = new DataImporter();
  private instances: IMockInstance[];
  private topologies: IMockTopology[];
  private components: IMockComponent[];
  private keywords: string[] = ["base_id", "name"];
  constructor() {
    this.instances = [];
    this.topologies = [];
    this.components = [];
  }


  public loadModel(config: IConfig): Promise<{[k: string]: string[]}> {
    const models = this.dataImporter.invokeCompiler(config);
    return models.then((data): Promise<any> => {
      if (data == null || data.namespace == null) {
        // console.log("model is null!!");
        return new Promise((_resolve, reject) => {
          reject("model is null");
        });
      }

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
          const ps: {[p: string]: string} = {};
          if (ele.$.type) {
            const type = ele.$.type.split("\.");
            if (type.length === 2) {
              const namespace = type[0];
              const name = type[1];
              this.components.forEach((c: IMockComponent) => {
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

        // console.log(this.instances);

        data.namespace.system[0].topology.forEach((ele: any) => {
          const cons: IMockConnection[] = [];
          ele.connection.forEach((con: any) => {
            const source = this.instances.filter(
              (i) => i.id === con.source[0].$.instance)[0];
            const target = this.instances.filter(
              (i) => i.id === con.target[0].$.instance)[0];

            cons.push({
                from: {inst: source, port: con.source[0].$.port},
                to: {inst: target, port: con.target[0].$.port},
            });
            // console.log(cons);
          });

          this.topologies.push({
            name: ele.$.name,
            connections: cons,
          });

        });
        // console.log(this.topologies);
        // console.log(this.components);

      }

      return new Promise((resolve, _reject) => {
        const viewList: {[k: string]: string[]}
          = {topologies: [], instances: [], components: []};
        this.topologies.forEach((e: IMockTopology) => {
          viewList.topologies.push(e.name);
        });
        this.instances.forEach((e: IMockInstance) => {
          viewList.instances.push(e.id);
        });
        this.components.forEach((e: IMockComponent) => {
          viewList.components.push(e.name);
        });

        resolve(viewList);
      });
    });

  }

  public query(viewName: string, viewType: string): any {
    switch (viewType) {
      case ViewType.Function: {
        const cons: IMockConnection[] = this.topologies.filter(
              (i) => i.name === viewName)[0].connections;
        const ins: IMockInstance[] = [];
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
        const ins: IMockInstance[] = [];
        const cons: IMockConnection[] = [];
        const comps = this.components.filter((i) => i.name === viewName);
        // console.log(comps);
        return {
          instances: ins,
          connections: cons,
          components: comps,
        };
      }
      case ViewType.InstanceCentric: {
        const ins: IMockInstance[] = [];
        const cons: IMockConnection[] = [];
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

  public getMockFunctionView2(): IMockModel {
    const cons: IMockConnection[] = [];
    this.topologies.forEach((e) => {
      e.connections.forEach((c) => {
        cons.push(c);
      });
    });
    return  {
      instances: this.instances,
      connections: cons,
      components: this.components,
    };
  }
}
