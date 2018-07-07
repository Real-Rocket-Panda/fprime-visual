import * as child from "node-exec-promise";
import * as fs from "fs";
import * as path from "path";
import IConfig from "../Common/Config";
import CompilerConverter from "./CompilerConverter";
import StyleConverter, { IStyle } from "./StyleConverter";

declare var __static: string;

export interface ICompilerResult {
  output: string;
  /**
   * An xml object parsed from the representation xml.
   */
  representation: any;
}

export interface IAnalysisResult {
  output: string;
  styles: IStyle[];
}

export default class DataImporter {
  /**
   * The compiler converter that converts the representation file to xml object.
   */
  private compilerConverter: CompilerConverter = new CompilerConverter();

  /**
   * The style converter that converts the analysis file in css format
   * to IStyle objects.
   */
  private styleConverter: StyleConverter = new StyleConverter();

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

  /**
   * Invoke the target analyzer and read the analysis result from file.
   * @param options The analyzer config options
   */
  public async invokeAnalyzer(options: any): Promise<IAnalysisResult> {
    const cmd = options.Path + " " + options.Parameters;
    const re = await child.exec(cmd);
    const output = re.stdout + re.stderr;
    const styles = this.styleConverter.parseStyleFile(
      fs.readFileSync(options.OutputFilePath, "utf-8"));
    return { output, styles };
  }

  /**
   * Load the existing analysis results from file in the config.
   * @param options The analyzer config options
   */
  public loadAnalysisResultFromFile(options: any): IStyle[] {
    if (fs.existsSync(options.OutputFilePath)) {
      return this.styleConverter.parseStyleFile(
        fs.readFileSync(options.OutputFilePath, "utf-8"));
    }
    return [];
  }
}
