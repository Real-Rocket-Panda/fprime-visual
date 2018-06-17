import { expect } from "chai";
import ViewDescriptor from "fprime/ViewManagement/ViewDescriptor";
import { ICytoscapeJSON } from "fprime/ViewManagement/ViewDescriptor";
import { IStyleDescriptor } from "fprime/ViewManagement/ViewDescriptor";
import { NodeType, EdgeType } from "fprime/ViewManagement/ViewDescriptor";

describe("ViewDescriptor parseStyleFrom descriptor", () => {
  const json: ICytoscapeJSON = {
    style: [
      { selector: "#c1", style: { color: "red" } },
    ],
    elements: {
      nodes: [
        {
          data: { id: "c1" },
          classes: NodeType.Instance,
          position: { x: 100, y: 100 },
        },
        {
          data: { id: "c2" },
          classes: NodeType.Instance,
          position: { x: 200, y: 200 },
        },
        {
          data: { id: "c1_p1" },
          classes: NodeType.Port,
          position: { x: 100, y: 120 },
        },
        {
          data: { id: "c2_p1" },
          classes: NodeType.Port,
          position: { x: 220, y: 200 },
        },
      ],
      edges: [
        {
          data: { id: "c1_p1-c2_p1", source: "c1_p1", target: "c2_p1" },
          classes: EdgeType.Port2Port,
        },
      ],
    },
  };
  const style: IStyleDescriptor = {
    nodes: {
      c1: { id: "c1", style: { color: "red" }, x: 100, y: 100 },
      c2: { id: "c2", style: {}, x: 200, y: 200 },
      c1_p1: { id: "c1_p1", style: {}, x: 100, y: 120 },
      c2_p1: { id: "c2_p1", style: {}, x: 220, y: 200 },
    },
    edges: {},
  };

  it("should not fail", () => {
    expect(() => ViewDescriptor.parseStyleFrom(json)).to.not.throw();
  });

  it("should success", () => {
    expect(ViewDescriptor.parseStyleFrom(json)).to.eql(style);
  });

});
