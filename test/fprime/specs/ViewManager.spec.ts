import { expect } from "chai";
import ViewManager from "../../../src/fprime/ViewManagement/ViewManager";

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

    expect(viewManager.render("Topology1")!.needLayout).to.equal(true);
  });

  it("should return { needLayout: false } when a view is" +
    "already rendered", () => {

    // First time
    viewManager.render("Topology1");
    // Second time
    expect(viewManager.render("Topology1")!.needLayout).to.equal(false);
  });

  it("should return the same descriptor for a same view", () => {
    // First time
    const view1 = viewManager.render("Topology1")!.descriptor;
    const view2 = viewManager.render("Topology1")!.descriptor;
    expect(view1).to.deep.equal(view2);
  });
});
