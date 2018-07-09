import { expect } from "chai";
import * as path from "path";
import ConfigManager from "fprime/ConfigManagement/ConfigManager";

declare var __static: string;

const __project = "./test/Ref";

const configJSON = {
  Analyzers: [
    {
      Name: "AcmeRuleChecker",
      Path: "${System}/acme-checker.jar",
      Parameters: "${Project} ${Project}/acme_output",
      OutputFilePath: "./acme_output/acme_result.css",
      Type: "Rule Checker",
    },
  ],
  FPPCompilerPath: "${System}/Parser.jar",
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
      Path: path.resolve(__static, "acme-checker.jar"),
      Parameters: `${path.resolve(__project)} ` +
      `${path.resolve(__project, "acme_output")}`,
      OutputFilePath: path.resolve(__project, "./acme_output/acme_result.css"),
      Type: "Rule Checker",
    },
    {
      Name: "MockAnalyzer",
      Path: path.resolve(__project, "./mockChecker"),
      Parameters: "",
      OutputFilePath: path.resolve(__project,
        "./mock_analyzer/mock_analysis.css"),
      Type: "Fake analyzer",
    },
  ],
  FPPCompilerPath: path.resolve(__project, "fast_compiler"),
  FPPCompilerParameters: `${path.resolve(__project)} ` +
    `${path.resolve(__project, "fpp_output")}`,
  FPPCompilerOutputPath: path.resolve(__project, "model.xml"),
  DefaultStyleFilePath: path.resolve(__project, "mystyle.css"),
  ViewStyleFileFolder: path.resolve(__project, "styles"),
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

  it("should return unresovled system config after initialized", () => {
    expect(configManager.Config).to.deep.equal(configJSON);
  });

  it("should throw error if the project path is not set", () => {
    expect(() => configManager.loadConfig())
      .to.throw("project path is invalid");
  });

  it("should throw error if the project config doesn't exist", () => {
    configManager.ProjectPath = "./invalid/path";
    expect(() => configManager.loadConfig())
      .to.throw("project path is invalid");
  });

  it("should return project config merged from system config", () => {
    configManager.ProjectPath = __project;
    configManager.loadConfig();
    expect(configManager.Config).to.deep.equal(resolvedProjectJSON);
  });
});
