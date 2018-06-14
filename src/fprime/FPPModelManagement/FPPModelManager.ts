export interface IMockInstance {
  id: string;
  ports: { [p: string]: string };
}

export interface IMockConnection {
  from: { inst: IMockInstance, port: string };
  to: { inst: IMockInstance, port: string };
}

export interface IMockModel {
  instances: IMockInstance[];
  topologies: IMockConnection[];
}

export default class FPPModelManager {

  public getMockFunctionView1(): IMockModel {
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

  public getMockInstanceView1(): IMockModel {
    const c1 = { id: "c1", ports: { p1: "p1", p2: "p2"} };
    const c2 = { id: "c2", ports: { p1: "p1", p2: "p2", p3: "p3"  } };
    const c3 = { id: "c3", ports: { p1: "p1", p2: "p2", p3: "p3"  } };
    const c4 = { id: "c4", ports: { p1: "p1", p2: "p2", p3: "p3"   } };
    const c5 = { id: "c5", ports: { p1: "p1", p2: "p2", p3: "p3"   } };
    const c6 = { id: "c6", ports: { p1: "p1", p2: "p2", p3: "p3"   } };
    const c7 = { id: "c7", ports: { p1: "p1", p2: "p2", p3: "p3"   } };
    const c8 = { id: "c8", ports: { p1: "p1", p2: "p2", p3: "p3"   } };
    const c9 = { id: "c9", ports: { p1: "p1", p2: "p2", p3: "p3"   } };
    const c10 = { id: "c10", ports: { p1: "p1", p2: "p2", p3: "p3"   } };
    // const c11 = { id: "c11", ports: { p1: "p1", p2: "p2", p3: "p3"   } };
    // const c12 = { id: "c12", ports: { p1: "p1", p2: "p2", p3: "p3"   } };

    return {
      instances: [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10],
      topologies: [
        {
          from: { inst: c1, port: c1.ports.p1 },
          to: { inst: c2, port: c2.ports.p3 },
        },
        {
          from: { inst: c1, port: c1.ports.p2 },
          to: { inst: c5, port: c5.ports.p3 },
        },
        {
          from: { inst: c1, port: c1.ports.p1 },
          to: { inst: c2, port: c3.ports.p2 },
        },
        {
          from: { inst: c1, port: c1.ports.p2 },
          to: { inst: c3, port: c3.ports.p2 },
        },
        {
          from: { inst: c3, port: c3.ports.p2 },
          to: { inst: c5, port: c5.ports.p2 },
        },
        {
          from: { inst: c1, port: c1.ports.p2 },
          to: { inst: c4, port: c4.ports.p1 },
        },
        {
          from: { inst: c2, port: c2.ports.p1 },
          to: { inst: c3, port: c3.ports.p3 },
        },
        {
          from: { inst: c3, port: c3.ports.p1 },
          to: { inst: c4, port: c4.ports.p3 },
        },
        {
          from: { inst: c4, port: c4.ports.p1 },
          to: { inst: c5, port: c5.ports.p3 },
        },
        {
          from: { inst: c4, port: c4.ports.p2 },
          to: { inst: c7, port: c7.ports.p2 },
        },
        {
          from: { inst: c4, port: c4.ports.p3 },
          to: { inst: c6, port: c6.ports.p3 },
        },
        {
          from: { inst: c5, port: c5.ports.p1 },
          to: { inst: c6, port: c6.ports.p3 },
        },
        {
          from: { inst: c5, port: c5.ports.p2 },
          to: { inst: c9, port: c9.ports.p2 },
        },
        {
          from: { inst: c5, port: c5.ports.p3 },
          to: { inst: c8, port: c8.ports.p3 },
        },
        {
          from: { inst: c6, port: c6.ports.p1 },
          to: { inst: c7, port: c7.ports.p3 },
        },
        {
          from: { inst: c7, port: c3.ports.p1 },
          to: { inst: c8, port: c8.ports.p3 },
        },
        {
          from: { inst: c7, port: c7.ports.p2 },
          to: { inst: c10, port: c10.ports.p2 },
        },
        {
          from: { inst: c7, port: c7.ports.p3 },
          to: { inst: c2, port: c2.ports.p3 },
        },
        {
          from: { inst: c8, port: c8.ports.p1 },
          to: { inst: c9, port: c9.ports.p3 },
        },
        {
          from: { inst: c8, port: c8.ports.p3 },
          to: { inst: c1, port: c1.ports.p1 },
        },
        {
          from: { inst: c9, port: c9.ports.p1 },
          to: { inst: c10, port: c10.ports.p3 },
        },
        {
          from: { inst: c10, port: c10.ports.p3 },
          to: { inst: c4, port: c4.ports.p3 },
        },
      ],
    };
  }

  public getMockComponentView1(): IMockModel {
    const c1 = { id: "c1", ports: { p1: "p1", p2: "p2"} };

    return {
      instances: [c1],
      topologies: [],
    };
  }

}
