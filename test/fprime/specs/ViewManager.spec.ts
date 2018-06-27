import { expect } from "chai";
import * as fs from "fs";
import ViewManager from "fprime/ViewManagement/ViewManager";
import { ICytoscapeJSON } from "fprime/ViewManagement/ViewDescriptor";
import { NodeType, EdgeType } from "fprime/ViewManagement/ViewDescriptor";

const __project = "./test/Ref";
const viewName = "REFLogger";

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
    expect(viewManager.CompilerOutput.content).to.equal(
      "Error: fail to invoke compiler\n" +
      "Cause: Error: fail to convert representation file\n" +
      "Cause: Error: fail to read the representation file\n" +
      "Cause: Error: ENOENT: no such file or directory, open" +
      " '/Users/changjian/Desktop/FPrimeVisual/fprime-visual/" +
      "test/static/fpp_output'\n\n");
  });

  it("should print compile message", async () => {
    await viewManager.build(__project);
    expect(viewManager.CompilerOutput.content).to.equal(
      "user specified compiler...\nView list generated...\n\n\n");
  });

  it("should print error message when rebuild a non-exist project",
     async () => {
    await viewManager.rebuild();
    expect(viewManager.CompilerOutput.content).to.equal(
      "Error: fail to invoke compiler\n" +
      "Cause: Error: fail to convert representation file\n" +
      "Cause: Error: fail to read the representation file\n" +
      "Cause: Error: ENOENT: no such file or directory, open" +
      " '/Users/changjian/Desktop/FPrimeVisual/fprime-visual/" +
      "test/static/fpp_output'\n\n");
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
      "#SG1": ["#SG1_logTextOut", "#SG1_logOut"],
      "#SG2": ["#SG2_logTextOut", "#SG2_logOut"],
      "#SG3": ["#SG3_logTextOut", "#SG3_logOut"],
      "#SG4": ["#SG4_logTextOut", "#SG4_logOut"],
      "#SG5": ["#SG5_logTextOut", "#SG5_logOut"],
      "#eventLogger": ["#eventLogger_LogRecv", "#eventLogger_LogText"],
      "#textLogger": ["#textLogger_TextLogger"],
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
    expect(fs.existsSync("./test/Ref/styles/REFLogger_style.css"))
      .to.equal(true);
  });
});
