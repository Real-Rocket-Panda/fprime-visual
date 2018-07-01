import { expect } from "chai";
import * as path from "path";
import ConfigManager from "fprime/ConfigManagement/ConfigManager";

declare var __static: string;

const __project = "./test/Ref";

const configJSON = {
  Analyzers: [
    {
      Name: "AcmeRuleChecker",
      Path: path.resolve(__static, "acme-checker.jar"),
      OutputFilePath: path.resolve(__static, "acme_output"),
      Type: "",
    },
  ],
  FPPCompilerPath: path.resolve(__static, "fppcompiler"),
  FPPCompilerParameters: "",
  FPPCompilerOutputPath: path.resolve(__static, "fpp_output"),
  DefaultStyleFilePath: "",
  ViewStyleFileFolder: "",
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

const projectJSON = {
  Analyzers: [
    {
      Name: "AcmeRuleChecker",
      Path: path.resolve(__static, "acme-checker.jar"),
      OutputFilePath: path.resolve(__static, "acme_output"),
      Type: "",
    },
  ],
  FPPCompilerPath: path.resolve(__project, "fast_compiler"),
  FPPCompilerParameters: "",
  FPPCompilerOutputPath: path.resolve(__project, "model.xml"),
  DefaultStyleFilePath: path.resolve(__project, "mystyle.css"),
  ViewStyleFileFolder: "",
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
    expect(configManager.Config).to.deep.equal(configJSON);
  });

  it("should return system config if the project path is not set", () => {
    configManager.loadConfig();
    expect(configManager.Config).to.deep.equal(configJSON);
  });

  it("should return system config if the project config doesn't exist", () => {
    configManager.ProjectPath = "./invalid/path";
    configManager.loadConfig();
    expect(configManager.Config).to.deep.equal(configJSON);
  });

  it("should return project config merged from system config", () => {
    configManager.ProjectPath = __project;
    configManager.loadConfig();
    expect(configManager.Config).to.deep.equal(projectJSON);
  });
});
