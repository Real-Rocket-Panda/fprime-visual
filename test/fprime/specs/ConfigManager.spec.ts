import { expect } from "chai";
import * as path from "path";
import ConfigManager from "fprime/ConfigManagement/ConfigManager";

declare var __static: string;

const __project = "./test/Ref1";
const __invalid = "./invalid/path";

const unresolvedConfigJSON = {
  Analyzers: [
    {
      Name: "AcmeRuleChecker",
      Path: "${System}/mockChecker",
      Parameters: "${Project} ${Project}/acme_output",
      OutputFilePath: "./acme_output/acme_result.css",
      Type: "Rule Checker",
    },
  ],
  FPPCompilerPath: "${System}/fppcompiler",
  FPPCompilerParameters: "${Project} ${Project}/fpp_output",
  FPPCompilerOutputPath: "./fpp_output",
  DefaultStyleFilePath: "./style.css",
  ViewStyleFileFolder: "./styles",
  AutoLayout: [
    {
      Name: "cose-bilkent",
      Default: true,
      Parameters: {
        fit: true,
        padding: 10,
        animate: false,
      },
    },
  ],
};

const resolvedProjectJSON = {
  Analyzers: [
    {
      Name: "AcmeRuleChecker",
      Path:  path.resolve(__static, "mockChecker"),
      Parameters: `${path.resolve(__project)} ` +
        `${path.resolve(__project, "acme_output")}`,
      OutputFilePath: path.resolve(__project, "./acme_output/acme_result.css"),
      Type: "Rule Checker",
    },
  ],
  FPPCompilerPath: path.resolve(__static, "fppcompiler"),
  FPPCompilerParameters: `${path.resolve(__project)} ` +
    `${path.resolve(__project, "fpp_output")}`,
  FPPCompilerOutputPath: path.resolve(__project, "./fpp_output"),
  DefaultStyleFilePath: path.resolve(__project, "./mystyle.css"),
  ViewStyleFileFolder: path.resolve(__project, "./styles"),
  AutoLayout: [
    {
      Name: "cose-bilkent",
      Default: true,
      Parameters: {
        fit: true,
        padding: 10,
        animate: false,
      },
    },
  ],
};

describe("Config manager", () => {
  let configManager: ConfigManager;

  before(() => {
    configManager = new ConfigManager();
  });

  it("should return system config after initialized", () => {
    expect(configManager.Config).to.deep.equal(unresolvedConfigJSON);
  });

  it("should throw error if the project path is not set", () => {
    expect(() => configManager.loadConfig()).to.throw("invalid project path");
  });

  it("should return error if the project config doesn't exist", () => {
    configManager.ProjectPath = __invalid;
    expect(() => configManager.loadConfig()).to.throw("invalid project path");
  });

  it("should return project config merged from system config", () => {
    configManager.ProjectPath = __project;
    configManager.loadConfig();
    expect(configManager.Config).to.deep.equal(resolvedProjectJSON);
  });
});
