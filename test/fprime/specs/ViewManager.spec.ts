import { expect } from "chai";
import ViewManager from "fprime/ViewManagement/ViewManager";

describe("render", () => {
  const viewManager = new ViewManager();
  it("should return {} when name is empty", () => {
    expect(viewManager.render("")).to.deep.equal({});
  });
});
