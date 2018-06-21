import * as child from "node-exec-promise";
import IConfig from "../Common/Config";
import CompilerConverter from "./CompilerConverter";
import { Promise } from "es6-promise";
import * as path from "path";

declare var __static: string;

export interface ICompilerResult {
  output: string;
  /**
   * An xml object parsed from the representation xml.
   */
  representation: any;
}

export default class DataImporter {
  /**
   * 
   */
  private compilerConverter: CompilerConverter = new CompilerConverter();

  /**
   * 
   * @param config 
   */
  public invokeCompiler(config: IConfig): Promise<ICompilerResult> {
    const cmd = path.resolve(__static, config.FPPCompilerPath);
    const re = new Promise<{
      stdout: string;
      stderr: string;
    }>((resolve, reject) => {
      child
        .exec(cmd + " " + config.FPPCompilerParameters)
        .then(resolve)
        .catch(reject);
    });
    return re
      .then((std) => {
        const output = std.stdout + std.stderr;
        return this.compilerConverter
          .convert(config)
          .then((representation) => {
            return { output, representation };
          })
          .catch((err) => {
            throw new Error("fail to convert representation file\nCause: "
              + err);
          });
      })
      .catch((err) => {
        throw new Error("fail to invoke compiler\nCause: " + err);
      });
  }
}
