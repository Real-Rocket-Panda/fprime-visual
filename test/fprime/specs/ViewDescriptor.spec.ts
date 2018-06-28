import { expect } from "chai";
import { IFPPModel } from "fprime/FPPModelManagement/FPPModelManager";
import { IFPPInstance } from "fprime/FPPModelManagement/FPPModelManager";
import ViewDescriptor, { IGraph } from "fprime/ViewManagement/ViewDescriptor";
import { NodeType, EdgeType } from "fprime/ViewManagement/ViewDescriptor";
import { ICytoscapeJSON } from "fprime/ViewManagement/ViewDescriptor";
import { IStyle } from "fprime/StyleManagement/StyleManager";

const ins1: IFPPInstance = {
  id: "ins_1",
  model_id: 1,
  ports: { p1: "p1", p2: "p2" },
  properties: { key1: "val1", key2: "val2" },
};

const ins2: IFPPInstance = {
  id: "ins_2",
  model_id: 2,
  ports: { p1: "p1" },
  properties: { key1: "val1" },
};

const mockModel: IFPPModel = {
  instances: [ins1, ins2],
  connections: [
    { from: { inst: ins1, port: "p1" }, to: { inst: ins2, port: "p1" } },
    { from: { inst: ins1, port: "p2" }, to: { inst: ins2, port: "p1" } },
  ],
  components: [
    {
      name: "comp_1",
      namespace: "ref",
      ports: ["p1", "p2"],
    },
    {
      name: "comp_2",
      namespace: "ref",
      ports: ["p1"],
    },
  ],
};

describe("ViewDescriptor", () => {
  it("should build from FPP model", () => {
    const nodes = {
      ins_1: { id: "ins_1", modelID: "", type: NodeType.Instance },
      ins_1_p1: { id: "ins_1_p1", modelID: "", type: NodeType.Port },
      ins_1_p2: { id: "ins_1_p2", modelID: "", type: NodeType.Port },
      ins_2: { id: "ins_2", modelID: "", type: NodeType.Instance },
      ins_2_p1: { id: "ins_2_p1", modelID: "", type: NodeType.Port },
      comp_1: { id: "comp_1", modelID: "", type: NodeType.component },
      comp_1_p1: { id: "comp_1_p1", modelID: "", type: NodeType.Port },
      comp_1_p2: { id: "comp_1_p2", modelID: "", type: NodeType.Port },
      comp_2: { id: "comp_2", modelID: "", type: NodeType.component },
      comp_2_p1: { id: "comp_2_p1", modelID: "", type: NodeType.Port },
    };
    const edges = {
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
      "ins_2-ins_2_p1": {
        id: "ins_2-ins_2_p1",
        modelID: "",
        type: EdgeType.Instance2Port,
        from: nodes.ins_2,
        to: nodes.ins_2_p1,
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
      "comp_2-comp_2_p1": {
        id: "comp_2-comp_2_p1",
        modelID: "",
        type: EdgeType.Component2Port,
        from: nodes.comp_2,
        to: nodes.comp_2_p1,
      },
    };

    expect(ViewDescriptor.buildFrom(mockModel)).to.deep.equal({
      descriptor: {},
      graph: { nodes, edges },
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
            data: { id: "ins_2-ins_2_p1", source: "ins_2", target: "ins_2_p1" },
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
    const style: { [id: string]: IStyle } = {
      ".fprime-instance": {
        selector: ".fprime-instance",
        style: {
          height: 100,
          width: 100,
        },
      },
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

    expect(ViewDescriptor.parseStyleFrom(json)).to.deep.equal(style);
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
          "x": "50",
          "y": "50",
        },
      },
      "#ins_2": {
        selector: "#ins_2",
        style: { x: "200", y: "200" },
      },
      "#ins_1_p1": {
        selector: "#ins_1_p1",
        style: { x: "60", y: "60" },
      },
      "#ins_2_p1": {
        selector: "#ins_2_p1",
        style: { x: "210", y: "210" },
      },
    };

    const nodes = {
      ins_1: {
        id: "ins_1",
        modelID: "",
        type: NodeType.Instance,
      },
      ins_1_p1: {
        id: "ins_1_p1",
        modelID: "",
        type: NodeType.Port,
      },
      ins_2: {
        id: "ins_2",
        modelID: "",
        type: NodeType.Instance,
      },
      ins_2_p1: {
        id: "ins_2_p1",
        modelID: "",
        type: NodeType.Port,
      },
    };

    const graph: IGraph = {
      nodes,
      edges: {
        "ins_1-ins_1_p1": {
          id: "ins_1-ins_1_p1",
          from: nodes.ins_1,
          to: nodes.ins_1_p1,
          modelID: "",
          type: EdgeType.Instance2Port,
        },
        "ins_2-ins_2_p1": {
          id: "ins_2-ins_2_p1",
          from: nodes.ins_2,
          to: nodes.ins_2_p1,
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
      },
    };

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
              img: "\\static\\ports\\up.png",
              type: undefined,
            },
            classes: NodeType.Instance,
            position: { x: 50, y: 50 },
          },
          {
            data: {
              id: "ins_1_p1",
              direction: undefined,
              img: "\\static\\ports\\up.png",
              type: undefined,
            },
            classes: NodeType.Port,
            position: { x: 60, y: 60 },
          },
          {
            data: {
              id: "ins_2",
              direction: undefined,
              img: "\\static\\ports\\up.png",
              type: undefined,
            },
            classes: NodeType.Instance,
            position: { x: 200, y: 200 },
          },
          {
            data: {
              id: "ins_2_p1",
              direction: undefined,
              img: "\\static\\ports\\up.png",
              type: undefined,
            },
            classes: NodeType.Port,
            position: { x: 210, y: 210 },
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
              id: "ins_2-ins_2_p1",
              source: "ins_2",
              target: "ins_2_p1",
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
      needLayout: false,
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
        style: { x: "200", y: "200" },
      },
      "#ins_1_p1": {
        selector: "#ins_1_p1",
        style: { x: "60", y: "60" },
      },
    };

    const nodes = {
      ins_1: {
        id: "ins_1",
        modelID: "",
        type: NodeType.Instance,
      },
      ins_1_p1: {
        id: "ins_1_p1",
        modelID: "",
        type: NodeType.Port,
      },
      ins_2: {
        id: "ins_2",
        modelID: "",
        type: NodeType.Instance,
      },
      ins_2_p1: {
        id: "ins_2_p1",
        modelID: "",
        type: NodeType.Port,
      },
    };

    const graph: IGraph = {
      nodes,
      edges: {
        "ins_1-ins_1_p1": {
          id: "ins_1-ins_1_p1",
          from: nodes.ins_1,
          to: nodes.ins_1_p1,
          modelID: "",
          type: EdgeType.Instance2Port,
        },
        "ins_2-ins_2_p1": {
          id: "ins_2-ins_2_p1",
          from: nodes.ins_2,
          to: nodes.ins_2_p1,
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
      },
    };

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
              img: "\\static\\ports\\up.png",
              type: undefined,
            },
            classes: NodeType.Instance,
          },
          {
            data: {
              id: "ins_1_p1",
              direction: undefined,
              img: "\\static\\ports\\up.png",
              type: undefined,
            },
            classes: NodeType.Port,
            position: { x: 60, y: 60 },
          },
          {
            data: {
              id: "ins_2",
              direction: undefined,
              img: "\\static\\ports\\up.png",
              type: undefined,
            },
            classes: NodeType.Instance,
            position: { x: 200, y: 200 },
          },
          {
            data: {
              id: "ins_2_p1",
              direction: undefined,
              img: "\\static\\ports\\up.png",
              type: undefined,
            },
            classes: NodeType.Port,
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
              id: "ins_2-ins_2_p1",
              source: "ins_2",
              target: "ins_2_p1",
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
      descriptor: json,
    });
  });

  it("should return simple graph", () => {
    const nodes = {
      ins_1: {
        id: "ins_1",
        modelID: "",
        type: NodeType.Instance,
      },
      ins_1_p1: {
        id: "ins_1_p1",
        modelID: "",
        type: NodeType.Port,
      },
      ins_2: {
        id: "ins_2",
        modelID: "",
        type: NodeType.Instance,
      },
      ins_2_p1: {
        id: "ins_2_p1",
        modelID: "",
        type: NodeType.Port,
      },
    };

    const graph: IGraph = {
      nodes,
      edges: {
        "ins_1-ins_1_p1": {
          id: "ins_1-ins_1_p1",
          from: nodes.ins_1,
          to: nodes.ins_1_p1,
          modelID: "",
          type: EdgeType.Instance2Port,
        },
        "ins_2-ins_2_p1": {
          id: "ins_2-ins_2_p1",
          from: nodes.ins_2,
          to: nodes.ins_2_p1,
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
      },
    };

    const simpleGraph = {
      "#ins_1": ["#ins_1_p1"],
      "#ins_2": ["#ins_2_p1"],
    };

    const view = new ViewDescriptor();
    (view as any).graph = graph;
    expect(view.getSimpleGraph()).to.deep.equal(simpleGraph);
  });
});
