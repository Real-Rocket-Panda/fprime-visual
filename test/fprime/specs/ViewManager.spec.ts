import { expect } from "chai";
import ViewManager from "fprime/ViewManagement/ViewManager";
import { ICytoscapeJSON, NodeType } from "fprime/ViewManagement/ViewDescriptor";

describe("ViewManager render", () => {
  let viewManager: ViewManager;
  before(() => {
    viewManager = new ViewManager();
  });

  it("should return {} when name is empty", () => {
    expect(viewManager.render("")).to.equal(null);
  });

  it("should return {} if name not in view list", () => {
    expect(viewManager.render("not a view")).to.equal(null);
  });

  it("should return { needLayout: true } when a view is" +
    "rendered the first time", () => {
      viewManager.build().then(() => {
        expect(viewManager.render("REFLogger")!.needLayout).to.equal(true);
      });
    });

  it("should return the same descriptor for a same view", () => {
    // First time
    const view1 = viewManager.render("REFLogger");
    const view2 = viewManager.render("REFLogger");
    expect(view1).to.deep.equal(view2);
  });
});

describe("ViewManager updateViewDescriptor", () => {
  let viewManager: ViewManager;
  const json: ICytoscapeJSON = {
    style: [
      { selector: "#c1", style: {} },
    ],
    elements: {
      nodes: [
        {
          data: { id: "c1" },
          classes: NodeType.Instance,
          position: { x: 100, y: 100 },
        },
      ],
      edges: [],
    },
  };

  before(() => {
    viewManager = new ViewManager();
  });

  it("should do nothing when the view is not in the list", () => {
    expect(() => viewManager.updateViewDescriptorFor("not a view", json))
      .not.to.throw();
  });

  it("should do nothing when the view has not rendered", () => {
    expect(() => viewManager.updateViewDescriptorFor("REFLogger", json))
      .not.to.throw();
  });

  it("should update the cytoscape json", () => {
    viewManager.build().then(() => {
      viewManager.render("REFLogger");
      viewManager.updateViewDescriptorFor("REFLogger", json);
      expect(viewManager.render("REFLogger")!.descriptor).to.deep.equal(json);
    });
  });

  it("should return { needLayout: false } when the view is updated", () => {
    viewManager.render("REFLogger");
    viewManager.updateViewDescriptorFor("REFLogger", json);
    expect(viewManager.render("REFLogger")!.needLayout).to.equal(false);
  });
});

describe("ViewManager getSimpleGraph", () => {
  let viewManager: ViewManager;
  // const graph = {
  //   "#c1": ["#c1_p1", "#c1_p2"],
  //   "#c2": ["#c2_p1"],
  //   "#c3": ["#c3_p1", "#c3_p2"],
  //   "#c4": ["#c4_p1"],
  // };

  before(() => {
    viewManager = new ViewManager();
  });

  it("should return {} when the view is not in the list", () => {
    expect(viewManager.getSimpleGraphFor("not a view")).to.eql({});
  });

  it("should return {} when the view has not rendered", () => {
    expect(viewManager.getSimpleGraphFor("REFLogger")).to.eql({});
  });

  // it("should return graph for mock REFLogger", () => {
  //   viewManager.render("REFLogger");
  //   expect(viewManager.getSimpleGraphFor("REFLogger")).to.eql(graph);
  // });

});
