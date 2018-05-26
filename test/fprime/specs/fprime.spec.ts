import { expect } from "chai";
import m from "fprime";

describe("Greetings", () => {
  it("should return greeting message", () => {
    expect(m.hello).to.eq("Greetings! Electron + Vue + Typescript");
  });
});
