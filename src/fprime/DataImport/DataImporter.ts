import * as child from "node-exec-promise";
import IConfig from "../Common/Config";
import CompilerConverter from "./CompilerConverter";
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
   * Invoke the compiler to get the std output and the representation file.
   * @param config The project configuration
   */
  public async invokeCompiler(config: IConfig): Promise<ICompilerResult> {
    const cmd = path.resolve(__static, config.FPPCompilerPath);
    const re = await child.exec(cmd + " " + config.FPPCompilerParameters);
    const output = re.stdout + re.stderr;
    const representation = await this.compilerConverter.convert(config);
    return { output, representation };
  }
}
