import { expect } from "chai";
import { IFPPModel } from "fprime/FPPModelManagement/FPPModelManager";
import { IFPPInstance } from "fprime/FPPModelManagement/FPPModelManager";
import ViewDescriptor, { IEdge } from "fprime/ViewManagement/ViewDescriptor";
import { IGraph, INode } from "fprime/ViewManagement/ViewDescriptor";
import { NodeType, EdgeType } from "fprime/ViewManagement/ViewDescriptor";
import { ICytoscapeJSON } from "fprime/ViewManagement/ViewDescriptor";
import { IStyle } from "fprime/DataImport/StyleConverter";

const ins1: IFPPInstance = {
  name: "ins_1",
  base_id: "1",
  ports: {
    p1: { name: "p1", properties: { direction: "out", kind: "async" } },
    p2: { name: "p2", properties: { direction: "out", kind: "sync" } },
  },
  properties: { key1: "val1", key2: "val2" },
};

const ins2: IFPPInstance = {
  name: "ins_2",
  base_id: "2",
  ports: { p1: { name: "p1", properties: { direction: "in", num: "2",
                                           kind: "async" } } },
  properties: { key1: "val1" },
};

const mockModel: IFPPModel = {
  instances: [ins1, ins2],
  connections: [
    {
      from: { inst: ins1, port: ins1.ports.p1 },
      to: { inst: ins2, port: ins2.ports.p1 },
    },
    {
      from: { inst: ins1, port: ins1.ports.p2 },
      to: { inst: ins2, port: ins2.ports.p1 },
    },
  ],
  components: [
    {
      name: "comp_1",
      namespace: "ref",
      ports: [
        { name: "p1", properties: { direction: "out", kind: "async" } },
        { name: "p2", properties: { direction: "out", kind: "sync" } },
      ],
      kind: "active",
    },
    {
      name: "comp_2",
      namespace: "ref",
      ports: [{ name: "p1", properties: { direction: "in", num: "2",
                                          kind: "async" } }],
      kind: "active",
    },
  ],
};

describe("ViewDescriptor", () => {
  it("should build from FPP model", () => {
    const nodes: { [key: string]: INode } = {
      ins_1: {
        id: "ins_1",
        modelID: "ins_1",
        type: NodeType.Instance,
        properties: { key1: "val1", key2: "val2" },
      },
      ins_1_p1: {
        id: "ins_1_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "out", kind: "async" },
      },
      ins_1_p2: {
        id: "ins_1_p2",
        modelID: "p2",
        type: NodeType.Port,
        properties: { direction: "out", kind: "sync" },
      },
      ins_2: {
        id: "ins_2",
        modelID: "ins_2",
        type: NodeType.Instance,
        properties: { key1: "val1" },
      },
      ins_2_p1: {
        id: "ins_2_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "in", num: "2", kind: "async" },
      },
      comp_1: {
        id: "comp_1",
        modelID: "comp_1",
        type: NodeType.component,
        properties: {},
      },
      comp_1_p1: {
        id: "comp_1_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "out", kind: "async" },
      },
      comp_1_p2: {
        id: "comp_1_p2",
        modelID: "p2",
        type: NodeType.Port,
        properties: { direction: "out", kind: "sync" },
      },
      comp_2: {
        id: "comp_2",
        modelID: "comp_2",
        type: NodeType.component,
        properties: {},
      },
      comp_2_p1: {
        id: "comp_2_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "in", kind: "async", num: "2" },
      },
    };
    const edges: { [key: string]: IEdge } = {
      "ins_1-ins_1_p1": {
        id: "ins_1-ins_1_p1",
        modelID: "",
        type: EdgeType.Instance2Port,
        from: nodes.ins_1,
        to: nodes.ins_1_p1,
      },
      "ins_1-ins_1_p2": {
        id: "ins_1-ins_1_p2",
        modelID: "",
        type: EdgeType.Instance2Port,
        from: nodes.ins_1,
        to: nodes.ins_1_p2,
      },
      "ins_2_p1-ins_2": {
        id: "ins_2_p1-ins_2",
        modelID: "",
        type: EdgeType.Instance2Port,
        from: nodes.ins_2_p1,
        to: nodes.ins_2,
      },
      "ins_1_p1-ins_2_p1": {
        id: "ins_1_p1-ins_2_p1",
        modelID: "",
        type: EdgeType.Port2Port,
        from: nodes.ins_1_p1,
        to: nodes.ins_2_p1,
      },
      "ins_1_p2-ins_2_p1": {
        id: "ins_1_p2-ins_2_p1",
        modelID: "",
        type: EdgeType.Port2Port,
        from: nodes.ins_1_p2,
        to: nodes.ins_2_p1,
      },
      "comp_1-comp_1_p1": {
        id: "comp_1-comp_1_p1",
        modelID: "",
        type: EdgeType.Component2Port,
        from: nodes.comp_1,
        to: nodes.comp_1_p1,
      },
      "comp_1-comp_1_p2": {
        id: "comp_1-comp_1_p2",
        modelID: "",
        type: EdgeType.Component2Port,
        from: nodes.comp_1,
        to: nodes.comp_1_p2,
      },
      "comp_2_p1-comp_2": {
        id: "comp_2_p1-comp_2",
        modelID: "",
        type: EdgeType.Component2Port,
        from: nodes.comp_2_p1,
        to: nodes.comp_2,
      },
    };

    const graph: IGraph = { nodes, edges };

    Object.keys(edges).forEach((key) => {
      expect(key)
        .to.equal(edges[key].id)
        .to.equal(edges[key].from.id + "-" + edges[key].to.id);
    });

    expect(ViewDescriptor.buildFrom(mockModel)).to.deep.equal({
      descriptor: {},
      graph,
    });
  });

  it("should parse cytoscape json to IStyles", () => {
    const json: ICytoscapeJSON = {
      style: [
        {
          selector: ".fprime-instance",
          style: {
            height: 100,
            width: 100,
          },
        },
        {
          selector: "#ins_1",
          style: {
            "background-color": "red",
          },
        },
        {
          selector: "#ins_1",
          style: {
            width: 200,
            height: 200,
          },
        },
      ],
      elements: {
        nodes: [
          {
            data: { id: "ins_1" },
            classes: NodeType.Instance,
            position: { x: 50, y: 50 },
          },
          {
            data: { id: "ins_2" },
            classes: NodeType.Instance,
            position: { x: 200, y: 200 },
          },
          {
            data: { id: "ins_1_p1" },
            classes: NodeType.Port,
            position: { x: 60, y: 60 },
          },
          {
            data: { id: "ins_2_p1" },
            classes: NodeType.Port,
            position: { x: 210, y: 210 },
          },
        ],
        edges: [
          {
            data: { id: "ins_1-ins_1_p1", source: "ins_1", target: "ins_1_p1" },
            classes: EdgeType.Instance2Port,
          },
          {
            data: { id: "ins_2_p1-ins_2", source: "ins_2_p1", target: "ins_2" },
            classes: EdgeType.Instance2Port,
          },
          {
            data: {
              id: "ins_1_p1-ins_2_p1",
              source: "ins_1_p1",
              target: "ins_2_p1",
            },
            classes: EdgeType.Port2Port,
          },
        ],
      },
    };

    const defStyle: IStyle[] = [
      {
        selector: ".fprime-instance",
        style: {
          height: 100,
          width: 100,
        },
      },
    ];

    const style: { [id: string]: IStyle } = {
      "#ins_1": {
        selector: "#ins_1",
        style: {
          "width": 200,
          "height": 200,
          "background-color": "red",
          "x": 50,
          "y": 50,
        },
      },
      "#ins_2": {
        selector: "#ins_2",
        style: { x: 200, y: 200 },
      },
      "#ins_1_p1": {
        selector: "#ins_1_p1",
        style: { x: 60, y: 60 },
      },
      "#ins_2_p1": {
        selector: "#ins_2_p1",
        style: { x: 210, y: 210 },
      },
    };

    expect(ViewDescriptor.parseStyleFrom(json, defStyle)).to.deep.equal(style);
  });

  it("should generate cytoscape json", () => {
    // When read from file, the value field is always string.
    const style: { [id: string]: IStyle } = {
      ".fprime-instance": {
        selector: ".fprime-instance",
        style: {
          height: "100",
          width: "100",
        },
      },
      "#ins_1": {
        selector: "#ins_1",
        style: {
          "width": "200",
          "height": "200",
          "background-color": "red",
          "x": 50,
          "y": 50,
        },
      },
      "#ins_2": {
        selector: "#ins_2",
        style: { x: 200, y: 200 },
      },
      "#ins_1_p1": {
        selector: "#ins_1_p1",
        style: { x: 60, y: 60 },
      },
      "#ins_2_p1": {
        selector: "#ins_2_p1",
        style: { x: 210, y: 210 },
      },
      "#comp_1": {
        selector: "#comp_1",
        style: { x: 300, y: 300 },
      },
      "#comp_1_p1": {
        selector: "#comp_1_p1",
        style: { x: 310, y: 310 },
      },
      "#comp_1_p2": {
        selector: "#comp_1_p2",
        style: { x: 330, y: 330 },
      },
    };

    const nodes: { [key: string]: INode } = {
      ins_1: {
        id: "ins_1",
        modelID: "ins_1",
        type: NodeType.Instance,
        properties: {},
      },
      ins_1_p1: {
        id: "ins_1_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "out", kind: "async" },
      },
      ins_2: {
        id: "ins_2",
        modelID: "ins_2",
        type: NodeType.Instance,
        properties: {},
      },
      ins_2_p1: {
        id: "ins_2_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "in", kind: "sync" },
      },
      comp_1: {
        id: "comp_1",
        modelID: "comp_1",
        type: NodeType.component,
        properties: {},
      },
      comp_1_p1: {
        id: "comp_1_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "in", kind: "async" },
      },
      comp_1_p2: {
        id: "comp_1_p2",
        modelID: "p2",
        type: NodeType.Port,
        properties: { direction: "out", kind: "async" },
      },
    };

    const edges: { [key: string]: IEdge } = {
      "ins_1-ins_1_p1": {
        id: "ins_1-ins_1_p1",
        from: nodes.ins_1,
        to: nodes.ins_1_p1,
        modelID: "",
        type: EdgeType.Instance2Port,
      },
      "ins_2_p1-ins_2": {
        id: "ins_2_p1-ins_2",
        from: nodes.ins_2_p1,
        to: nodes.ins_2,
        modelID: "",
        type: EdgeType.Instance2Port,
      },
      "ins_1_p1-ins_2_p1": {
        id: "ins_1_p1-ins_2_p1",
        from: nodes.ins_1_p1,
        to: nodes.ins_2_p1,
        modelID: "",
        type: EdgeType.Port2Port,
      },
      "comp_1_p1-comp_1": {
        id: "comp_1_p1-comp_1",
        from: nodes.comp_1_p1,
        to: nodes.comp_1,
        modelID: "",
        type: EdgeType.Component2Port,
      },
      "comp_1-comp_1_p2": {
        id: "comp_1-comp_1_p2",
        from: nodes.comp_1,
        to: nodes.comp_1_p2,
        modelID: "",
        type: EdgeType.Component2Port,
      },
    };

    const graph: IGraph = { nodes, edges };

    Object.keys(edges).forEach((key) => {
      expect(key)
        .to.equal(edges[key].id)
        .to.equal(edges[key].from.id + "-" + edges[key].to.id);
    });

    const json: ICytoscapeJSON = {
      style: [
        {
          selector: ".fprime-instance",
          style: {
            height: "100",
            width: "100",
          },
        },
        {
          selector: "#ins_1",
          style: {
            "width": "200",
            "height": "200",
            "background-color": "red",
          },
        },
      ],
      elements: {
        nodes: [
          {
            data: {
              id: "ins_1",
              direction: undefined,
              img: undefined,
              kind: undefined,
              properties: {},
              label: "ins_1",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Instance,
            position: { x: 50, y: 50 },
          },
          {
            data: {
              id: "ins_1_p1",
              direction: "out",
              img: "static/ports/up.png",
              kind: "async",
              properties: { direction: "out", kind: "async" },
              label: "p1",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Port + " fprime-port-async fprime-port-out",
            position: { x: 60, y: 60 },
          },
          {
            data: {
              id: "ins_2",
              direction: undefined,
              img: undefined,
              kind: undefined,
              properties: {},
              label: "ins_2",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Instance,
            position: { x: 200, y: 200 },
          },
          {
            data: {
              id: "ins_2_p1",
              direction: "in",
              img: "static/ports/up.png",
              kind: "sync",
              properties: { direction: "in", kind: "sync" },
              label: "p1",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Port + " fprime-port-sync fprime-port-in",
            position: { x: 210, y: 210 },
          },
          {
            data: {
              id: "comp_1",
              direction: undefined,
              img: undefined,
              kind: undefined,
              properties: {},
              label: "comp_1",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.component,
            position: { x: 300, y: 300 },
          },
          {
            data: {
              id: "comp_1_p1",
              direction: "in",
              img: "static/ports/up.png",
              kind: "async",
              properties: { direction: "in", kind: "async" },
              label: "p1",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Port + " fprime-port-async fprime-port-in",
            position: { x: 310, y: 310 },
          },
          {
            data: {
              id: "comp_1_p2",
              direction: "out",
              img: "static/ports/up.png",
              kind: "async",
              properties: { direction: "out", kind: "async" },
              label: "p2",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Port + " fprime-port-async fprime-port-out",
            position: { x: 330, y: 330 },
          },
        ],
        edges: [
          {
            data: {
              id: "ins_1-ins_1_p1",
              source: "ins_1",
              target: "ins_1_p1",
            },
            classes: EdgeType.Instance2Port,
          },
          {
            data: {
              id: "ins_2_p1-ins_2",
              source: "ins_2_p1",
              target: "ins_2",
            },
            classes: EdgeType.Instance2Port,
          },
          {
            data: {
              id: "ins_1_p1-ins_2_p1",
              source: "ins_1_p1",
              target: "ins_2_p1",
            },
            classes: EdgeType.Port2Port,
          },
          {
            data: {
              id: "comp_1_p1-comp_1",
              source: "comp_1_p1",
              target: "comp_1",
            },
            classes: EdgeType.Component2Port,
          },
          {
            data: {
              id: "comp_1-comp_1_p2",
              source: "comp_1",
              target: "comp_1_p2",
            },
            classes: EdgeType.Component2Port,
          },
        ],
      },
    };

    const view = new ViewDescriptor();
    (view as any).descriptor = style;
    (view as any).graph = graph;
    expect(view.generateCytoscapeJSON()).to.deep.equal({
      needLayout: false,
      elesHasPosition: ["ins_1", "ins_1_p1", "ins_2", "ins_2_p1", "comp_1",
        "comp_1_p1", "comp_1_p2"],
      elesNoPosition: [],
      descriptor: json,
    });
  });

  it("should return needLayout = true if missing x/y", () => {
    // When read from file, the value field is always string.
    const style: { [id: string]: IStyle } = {
      ".fprime-instance": {
        selector: ".fprime-instance",
        style: {
          height: "100",
          width: "100",
        },
      },
      "#ins_1": {
        selector: "#ins_1",
        style: {
          "width": "200",
          "height": "200",
          "background-color": "red",
        },
      },
      "#ins_2": {
        selector: "#ins_2",
        style: { x: 200, y: 200 },
      },
      "#ins_1_p1": {
        selector: "#ins_1_p1",
        style: { x: 60, y: 60 },
      },
    };

    const nodes: { [key: string]: INode } = {
      ins_1: {
        id: "ins_1",
        modelID: "ins_1",
        type: NodeType.Instance,
        properties: {},
      },
      ins_1_p1: {
        id: "ins_1_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "out", kind: "async" },
      },
      ins_2: {
        id: "ins_2",
        modelID: "ins_2",
        type: NodeType.Instance,
        properties: {},
      },
      ins_2_p1: {
        id: "ins_2_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "in", kind: "sync" },
      },
    };

    const edges: { [key: string]: IEdge } = {
      "ins_1-ins_1_p1": {
        id: "ins_1-ins_1_p1",
        from: nodes.ins_1,
        to: nodes.ins_1_p1,
        modelID: "",
        type: EdgeType.Instance2Port,
      },
      "ins_2_p1-ins_2": {
        id: "ins_2_p1-ins_2",
        from: nodes.ins_2_p1,
        to: nodes.ins_2,
        modelID: "",
        type: EdgeType.Instance2Port,
      },
      "ins_1_p1-ins_2_p1": {
        id: "ins_1_p1-ins_2_p1",
        from: nodes.ins_1_p1,
        to: nodes.ins_2_p1,
        modelID: "",
        type: EdgeType.Port2Port,
      },
    };

    const graph: IGraph = { nodes, edges };

    Object.keys(edges).forEach((key) => {
      expect(key)
        .to.equal(edges[key].id)
        .to.equal(edges[key].from.id + "-" + edges[key].to.id);
    });

    const json: ICytoscapeJSON = {
      style: [
        {
          selector: ".fprime-instance",
          style: {
            height: "100",
            width: "100",
          },
        },
        {
          selector: "#ins_1",
          style: {
            "width": "200",
            "height": "200",
            "background-color": "red",
          },
        },
      ],
      elements: {
        nodes: [
          {
            data: {
              id: "ins_1",
              direction: undefined,
              img: undefined,
              kind: undefined,
              properties: {},
              label: "ins_1",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Instance,
          },
          {
            data: {
              id: "ins_1_p1",
              direction: "out",
              img: "static/ports/up.png",
              kind: "async",
              properties: { direction: "out", kind: "async" },
              label: "p1",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Port + " fprime-port-async fprime-port-out",
            position: { x: 60, y: 60 },
          },
          {
            data: {
              id: "ins_2",
              direction: undefined,
              img: undefined,
              kind: undefined,
              properties: {},
              label: "ins_2",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Instance,
            position: { x: 200, y: 200 },
          },
          {
            data: {
              id: "ins_2_p1",
              direction: "in",
              img: "static/ports/up.png",
              kind: "sync",
              properties: { direction: "in", kind: "sync" },
              label: "p1",
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: NodeType.Port + " fprime-port-sync fprime-port-in",
          },
        ],
        edges: [
          {
            data: {
              id: "ins_1-ins_1_p1",
              source: "ins_1",
              target: "ins_1_p1",
            },
            classes: EdgeType.Instance2Port,
          },
          {
            data: {
              id: "ins_2_p1-ins_2",
              source: "ins_2_p1",
              target: "ins_2",
            },
            classes: EdgeType.Instance2Port,
          },
          {
            data: {
              id: "ins_1_p1-ins_2_p1",
              source: "ins_1_p1",
              target: "ins_2_p1",
            },
            classes: EdgeType.Port2Port,
          },
        ],
      },
    };

    const view = new ViewDescriptor();
    (view as any).descriptor = style;
    (view as any).graph = graph;
    expect(view.generateCytoscapeJSON()).to.deep.equal({
      needLayout: true,
      elesHasPosition: ["ins_1_p1", "ins_2"],
      elesNoPosition: ["ins_1", "ins_2_p1"],
      descriptor: json,
    });
  });

  it("should return simple graph", () => {
    const nodes: { [key: string]: INode } = {
      ins_1: {
        id: "ins_1",
        modelID: "ins_1",
        type: NodeType.Instance,
        properties: {},
      },
      ins_1_p1: {
        id: "ins_1_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "out", kind: "async" },
      },
      ins_2: {
        id: "ins_2",
        modelID: "ins_2",
        type: NodeType.Instance,
        properties: {},
      },
      ins_2_p1: {
        id: "ins_2_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: { direction: "out", kind: "sync" },
      },
      comp_1: {
        id: "comp_1",
        modelID: "comp_1",
        type: NodeType.component,
        properties: {},
      },
      comp_1_p1: {
        id: "comp_1_p1",
        modelID: "p1",
        type: NodeType.Port,
        properties: {},
      },
    };

    const edges: { [key: string]: IEdge } = {
      "ins_1-ins_1_p1": {
        id: "ins_1-ins_1_p1",
        from: nodes.ins_1,
        to: nodes.ins_1_p1,
        modelID: "",
        type: EdgeType.Instance2Port,
      },
      "ins_2_p1-ins_2": {
        id: "ins_2_p1-ins_2",
        from: nodes.ins_2_p1,
        to: nodes.ins_2,
        modelID: "",
        type: EdgeType.Instance2Port,
      },
      "ins_1_p1-ins_2_p1": {
        id: "ins_1_p1-ins_2_p1",
        from: nodes.ins_1_p1,
        to: nodes.ins_2_p1,
        modelID: "",
        type: EdgeType.Port2Port,
      },
      "comp_1-comp_1_p1": {
        id: "comp_1-comp_1_p1",
        from: nodes.comp_1,
        to: nodes.comp_1_p1,
        modelID: "",
        type: EdgeType.Component2Port,
      },
    };

    const graph: IGraph = { nodes, edges };

    Object.keys(edges).forEach((key) => {
      expect(key)
        .to.equal(edges[key].id)
        .to.equal(edges[key].from.id + "-" + edges[key].to.id);
    });

    const simpleGraph = {
      "#ins_1": ["#ins_1_p1"],
      "#ins_2": ["#ins_2_p1"],
      "#comp_1": ["#comp_1_p1"],
    };

    const view = new ViewDescriptor();
    (view as any).graph = graph;
    expect(view.getSimpleGraph()).to.deep.equal(simpleGraph);
  });
});
