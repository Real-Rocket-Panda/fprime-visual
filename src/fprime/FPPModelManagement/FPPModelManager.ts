import IConfig from "../Common/Config";
import DataImporter from "../DataImport/DataImporter";

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
  topologies: IMockConnection[];
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


  public loadModel(config: IConfig) {
    const models = this.dataImporter.invokeCompiler(config);
    models.then((data) => {
      if (data == null || data.namespace == null) {
        console.log("model is null!!");
        return;
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

        console.log(this.instances);

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
        console.log(this.topologies);

      }
    });

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
      topologies: cons,
    };
  }

  public getMockFunctionView1(): IMockModel {
    const c1 = {
      id: "c1", model_id: 0, ports: { p1: "p1", p2: "p2"}, properties: {},
    };
    const c2 = { id: "c2", model_id: 1, ports: { p1: "p1" }, properties: {}};
    const c3 = {
      id: "c3", model_id: 2, ports: { p1: "p1", p2: "p2" }, properties: {},
  };
    const c4 = { id: "c4", model_id: 0, ports: { p1: "p1" }, properties: {}};

    return {
      instances: [c1, c2, c3, c4],
      topologies: [
        {
          from: { inst: c1, port: c1.ports.p1 },
          to: { inst: c2, port: c2.ports.p1 },
        },
        {
          from: { inst: c1, port: c1.ports.p2 },
          to: { inst: c3, port: c3.ports.p1 },
        },
        {
          from: { inst: c3, port: c3.ports.p2 },
          to: { inst: c2, port: c2.ports.p1 },
        },
        {
          from: { inst: c1, port: c1.ports.p2 },
          to: { inst: c4, port: c4.ports.p1 },
        },
      ],
    };
  }

  public getMockComponentView1(): IMockModel {
    const c1 = {
      id: "c1", model_id: 0, ports: { p1: "p1", p2: "p2"}, properties: {},
    };

    return {
      instances: [c1],
      topologies: [],
    };
  }

}
