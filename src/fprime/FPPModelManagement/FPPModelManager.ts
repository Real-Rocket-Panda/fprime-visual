export default class FPPModelManager {

  public getMockFunctionView1() {
    const c1 = { id: "c1", ports: { p1: "p1", p2: "p2"} };
    const c2 = { id: "c2", ports: { p1: "p1" } };
    const c3 = { id: "c3", ports: { p1: "p1", p2: "p2" } };
    const c4 = { id: "c4", ports: { p1: "p1" } };

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

  public getMockInstanceView1() {
    return { instances: [], topologies: [] };
  }

  public getMockComponentView1() {
    return { instances: [], topologies: [] };
  }

}
