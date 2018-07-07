import * as child from "node-exec-promise";
import * as fs from "fs";
import * as path from "path";
import IConfig from "../Common/Config";
import CompilerConverter from "./CompilerConverter";
import StyleConverter, { IStyle } from "./StyleConverter";

declare var __static: string;

export interface IOutput {
  appendOutput(v: string): void;
  appendAnalysisOutput(v: string): void;
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
  public async invokeCompiler(config: IConfig, output?: IOutput): Promise<any> {
    let cmd = path.resolve(__static, config.FPPCompilerPath);
    // The actual compiler is a java program, thus we should use 'java -jar'
    // For convenience, we use scripts to simulate the behavior of a compiler.
    if (cmd.endsWith(".jar")) {
      cmd = "java -jar " + cmd;
    }
    // Execute compiler command
    const re = await child.exec(cmd + " " + config.FPPCompilerParameters);
    if (output) {
      output.appendOutput(re.stdout + re.stderr);
      // Covert the output file to xml object
      output.appendOutput("Covert representation xml...");
    }
    const representation = await this.compilerConverter.convert(config);
    return representation;
  }

  /**
   * Invoke the target analyzer and read the analysis result from file.
   * @param options The analyzer config options
   */
  public async invokeAnalyzer(options: any,
                              output?: IOutput): Promise<IStyle[]> {
    const cmd = options.Path + " " + options.Parameters;
    const re = await child.exec(cmd);
    if (output) {
      output.appendAnalysisOutput(re.stdout + re.stderr);
    }
    const styles = this.styleConverter.parseStyleFile(
      fs.readFileSync(options.OutputFilePath, "utf-8"));
    return styles;
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
