import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import ViewManager from "fprime/ViewManagement/ViewManager";
import { ICytoscapeJSON } from "fprime/ViewManagement/ViewDescriptor";
import { NodeType, EdgeType } from "fprime/ViewManagement/ViewDescriptor";

const __project = "./test/Ref1";
const viewName = "Ref.REFLogger";

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
        data: { id: "ins_1" },
        classes: NodeType.Instance,
        position: { x: 50, y: 50 },
      },
      {
        data: { id: "ins_1_p1" },
        classes: NodeType.Port,
        position: { x: 60, y: 60 },
      },
      {
        data: { id: "ins_2" },
        classes: NodeType.Instance,
        position: { x: 200, y: 200 },
      },
      {
        data: { id: "ins_2_p1" },
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

describe("ViewManager build", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it("should print error message when the project not exists", async () => {
    await viewManager.build("invalid_project");
    expect(viewManager.OutputMessage.compile)
      .to.equal("Error: invalid project path\n");
  });

  it("should print compile message", async () => {
    await viewManager.build(__project);
    expect(viewManager.OutputMessage.compile).to.equal(
      "\nsystem default compiler...\n\nCovert representation xml...\n" +
      "Generate view list...\n");
  });

  it("should print error message when rebuild a non-exist project",
     async () => {
    await viewManager.rebuild();
    expect(viewManager.OutputMessage.compile)
      .to.equal("Error: invalid project path\n");
  });
});

describe("ViewManager render", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it("should return null when name is empty", () => {
    expect(viewManager.render("")).to.equal(null);
  });

  it("should return null if name not in view list", () => {
    expect(viewManager.render("invalid_view")).to.equal(null);
  });

  it("should return null if the project is not built", () => {
    expect(viewManager.render(viewName)).to.equal(null);
  });

  it("should return needLayout = true when a view is first rendered",
     async () => {
    await viewManager.build(__project);
    expect(viewManager.render(viewName)!.needLayout).to.equal(true);
  });
});

describe("ViewManager updateViewDescriptor", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it("should do nothing when the view is not in the list", async () => {
    await viewManager.build(__project);
    expect(() => viewManager.updateViewDescriptorFor("invalid_view", json))
      .not.to.throw();
  });

  it("should do nothing when the view has not rendered", async () => {
    await viewManager.build(__project);
    expect(() => viewManager.updateViewDescriptorFor(viewName, json))
      .not.to.throw();
  });

  it("should update the cytoscape json", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    viewManager.updateViewDescriptorFor(viewName, json);
    expect(viewManager.render(viewName)).to.deep.equal({
      needLayout: false,
      elesHasPosition: ["ins_1", "ins_1_p1", "ins_2", "ins_2_p1"],
      elesNoPosition: [],
      descriptor: json,
    });
  });

  it("should clean up stored descriptors", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    viewManager.updateViewDescriptorFor(viewName, json);
    (viewManager as any).cleanup();
    expect((viewManager as any).viewDescriptors).to.deep.equal({});
    expect((viewManager as any).cytoscapeJSONs).to.deep.equal({});
  });
});

describe("ViewManager getSimpleGraph", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it("should return {} when the view is not in the list", async () => {
    await viewManager.build(__project);
    expect(viewManager.getSimpleGraphFor("invalid_view")).to.eql({});
  });

  it("should return {} when the view has not rendered", async () => {
    await viewManager.build(__project);
    expect(viewManager.getSimpleGraphFor(viewName)).to.eql({});
  });

  it("should return graph for mock REFLogger", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    expect(viewManager.getSimpleGraphFor(viewName)).to.eql({
      "#Ref_SG1": ["#Ref_SG1_logTextOut", "#Ref_SG1_logOut"],
      "#Ref_SG2": ["#Ref_SG2_logTextOut", "#Ref_SG2_logOut"],
      "#Ref_SG3": ["#Ref_SG3_logTextOut", "#Ref_SG3_logOut"],
      "#Ref_SG4": ["#Ref_SG4_logTextOut", "#Ref_SG4_logOut"],
      "#Ref_SG5": ["#Ref_SG5_logTextOut", "#Ref_SG5_logOut"],
      "#Ref_eventLogger": [
        "#Ref_eventLogger_LogRecv",
        "#Ref_eventLogger_LogText",
      ],
      "#Ref_textLogger": ["#Ref_textLogger_TextLogger"],
    });
  });
});

describe("ViewManager saveStyle", () => {
  let viewManager: ViewManager;
  beforeEach(() => {
    viewManager = new ViewManager();
  });

  it("should save style", async () => {
    await viewManager.build(__project);
    viewManager.render(viewName);
    viewManager.saveViewDescriptorFor(viewName, json);
    const p = path.resolve(__project, "styles/Ref.REFLogger_style.css");
    expect(fs.existsSync(p)).to.equal(true);
  });
});
