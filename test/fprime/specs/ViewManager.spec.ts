import { expect } from "chai";
import ViewManager from "../../../src/fprime/ViewManagement/ViewManager";

describe("render", () => {
  const viewManager = new ViewManager();
  it("should return {} when name is empty", () => {
    expect(viewManager.render("")).to.deep.equal({});
  });

  it("should return {} if name not in view list", () => {
    expect(viewManager.render("not a view")).to.deep.equal({});
  });

  it("should return the same view descriptor when given the same name", () => {
    expect(viewManager.render("Topology1")).to.deep
      .equal(viewManager.render("Topology1"));
  });
});
