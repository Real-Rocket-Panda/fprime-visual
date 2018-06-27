import * as fs from "fs";
import * as path from "path";
import IConfig from "../Common/Config";

declare var __static: string;

export default class ConfigManager {
  /**
   * The path of the current project. All the project related relative
   * paths should be resolved based this path.
   */
  private projectPath: string = "";

  public get ProjectPath() {
    return this.projectPath;
  }

  public set ProjectPath(dir: string) {
    this.projectPath = dir;
  }

  /**
   * The path of the system level configuration file. It includes the path
   * of the default FPP compiler and some default analyzers.
   */
  private systemConfigPath: string = path.resolve(__static, "config.json");

  private systemConfig: IConfig;

  /**
   * The current configuration of the project. This configuration should be
   * load from the config.json file in the project folder and merge with the
   * system level config.
   */
  private config: IConfig;

  public get Config(): IConfig {
    return this.config;
  }

  constructor() {
    this.systemConfig = JSON.parse(fs.readFileSync(
      this.systemConfigPath, "utf-8"));
    this.resolvePath(__static, this.systemConfig);
    // Make a copy of the system config
    this.config = Object.assign({}, this.systemConfig);
  }

  /**
   * Load the project config from a given absolute path. Then merge it with
   * the system config.
   */
  public loadConfig() {
    // Set to system default first
    this.config = Object.assign({}, this.systemConfig);
    // By default it search config with name config.json
    const dir = path.resolve(this.projectPath, "config.json");
    if (fs.existsSync(dir)) {
      const pjConfig = (JSON.parse(fs.readFileSync(dir, "utf-8")) as IConfig);
      // Resolve the path to absolute path
      this.resolvePath(this.projectPath, pjConfig);
      // Merge the config
      pjConfig.Analyzers = this.systemConfig.Analyzers
        .concat(pjConfig.Analyzers ? pjConfig.Analyzers : []);
      this.config = Object.assign(this.config, pjConfig);
    }
  }

  /**
   * Resolve the path in the configuration file from the base path.
   * @param base The base path to resolve.
   * @param config The configuration json.
   */
  private resolvePath(base: string, config: IConfig) {
    if (config.Analyzers) {
      config.Analyzers.forEach((a) => {
        a.Path = path.resolve(base, a.Path);
        a.OutputFilePath = path.resolve(base, a.OutputFilePath);
      });
    }
    if (config.DefaultStyleFilePath) {
      config.DefaultStyleFilePath = path.resolve(base,
        config.DefaultStyleFilePath);
    }
    if (config.FPPCompilerPath) {
      config.FPPCompilerPath = path.resolve(base, config.FPPCompilerPath);
    }
    if (config.FPPCompilerOutputPath) {
      config.FPPCompilerOutputPath = path.resolve(base,
        config.FPPCompilerOutputPath);
    }
  }

}
