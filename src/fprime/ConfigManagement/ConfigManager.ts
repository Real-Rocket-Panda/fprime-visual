import * as fs from "fs";
import * as path from "path";
import IConfig from "../Common/Config";

declare var __static: string;

export default class ConfigManager {

  private readonly needResolve: string[] = [
    "Analyzers", "Analyzers.Path", "Analyzers.OutputFilePath",
    "FPPCompilerPath", "FPPCompilerParameters", "FPPCompilerOutputPath",
    "DefaultStyleFilePath", "ViewStyleFileFolder",
  ];

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
      const pjConfig = JSON.parse(fs.readFileSync(dir, "utf-8"));
      // Merge the config
      Object.keys(pjConfig).forEach((key) => {
        if (pjConfig[key] instanceof Array) {
          (this.config as any)[key] = (this.config as any)[key]
            .concat(pjConfig[key]);
        } else {
          (this.config as any)[key] = pjConfig[key];
        }
      });
      // Resolve the path to absolute path
      this.resolvePath(this.config);
    } else {
      throw new Error("project path is invalid");
    }
  }

  /**
   * Resolve the path in the configuration file. It should replace ${System}
   * by __static path and replace ${Project} by projectPath
   * @param config The configuration json.
   */
  private resolvePath(obj: any, namespace: string = "") {
    Object.keys(obj).forEach((key) => {
      if (this.needResolve.indexOf(namespace + key) === -1) {
        return;
      }
      if (typeof obj[key] === "string" && obj[key]) {
        obj[key] = this.resolve(obj[key]);
      } else if (typeof obj[key] === "object") {
        if (obj[key] instanceof Array) {
          obj[key].forEach((i: any) => this.resolvePath(i, key + "."));
        } else {
          this.resolvePath(obj[key], key + ".");
        }
      }
    });
  }

  private resolve(p: string): string {
    if (p.includes("${System}")) {
      return p.replace(/\$\{System\}/g, path.resolve(__static));
    }
    if (p.includes("${Project}")) {
      return p.replace(/\$\{Project\}/g, path.resolve(this.projectPath));
    }
    return path.resolve(this.projectPath, p);
  }

}
