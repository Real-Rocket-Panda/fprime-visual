import * as child from "node-exec-promise";
import IConfig from "../Common/Config";
import CompilerConverter from "./CompilerConverter";
import { Promise } from "es6-promise";
import * as path from "path";

declare var __static: string;

export default class DataImporter {
  private compilerConverter: CompilerConverter = new CompilerConverter();

  public invokeCompiler(config: IConfig): Promise<any> {
    const compiler = new Promise<{
      stdout: string, stderr: string;
    }>((resolve, reject) => {
      child.exec(path.resolve(__static, config.FPPCompilerPath) + " " +
        config.FPPCompilerParameters).then(resolve).catch(reject);
    });
    return this.compilerConverter.convert(compiler, config);
  }
}
