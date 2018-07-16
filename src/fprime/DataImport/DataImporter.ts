import * as child from "child_process";
import * as fs from "fs";
import IConfig from "../Common/Config";
import CompilerConverter from "./CompilerConverter";
import StyleConverter, { IStyle } from "./StyleConverter";

export interface IOutput {
  appendOutput(v: string): void;
  appendAnalysisOutput(v: string): void;
}

interface IExecResult {
  stdout: string;
  stderr: string;
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
   * The default timeout.
   */
  private timeout: number = 5000;

  /**
   * Invoke the compiler to get the std output and the representation file.
   * @param config The project configuration
   */
  public async invokeCompiler(config: IConfig, output?: IOutput): Promise<any> {
    let cmd = config.FPPCompilerPath;
    // The actual compiler is a java program, thus we should use 'java -jar'
    // For convenience, we use scripts to simulate the behavior of a compiler.
    if (cmd.endsWith(".jar")) {
      cmd = "java -jar " + cmd;
    }
    cmd = cmd + " " + config.FPPCompilerParameters;
    // Create the output path before executing the compiler
    if (!fs.existsSync(config.FPPCompilerOutputPath)) {
      fs.mkdirSync(config.FPPCompilerOutputPath);
    }
    // Execute compiler command
    const re = await this.execWithTimeout(cmd, this.timeout);
    if (output) {
      output.appendOutput("\n" + re.stdout + re.stderr);
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
    let cmd = options.Path + " " + options.Parameters;
    // If the model analyzer is a java program, use 'java -jar'
    if (options.Path.endsWith(".jar")) {
      cmd = "java -jar " + cmd;
    }
    const re = await this.execWithTimeout(cmd, this.timeout);
    if (output) {
      output.appendAnalysisOutput("\n" + re.stdout + re.stderr);
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

  /**
   * Execute a command line command with timeout
   * @param cmd The command to execute
   * @param timeout The timeout in milliseconds.
   */
  private execWithTimeout(cmd: string, timeout: number): Promise<IExecResult> {
    return new Promise<IExecResult>((resolve, reject) => {
      const p = child.exec(cmd, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve({ stdout, stderr });
        }
      });
      // Setup timeout
      setTimeout(() => {
        p.kill();
        reject(new Error("The program ends with timeout"));
      }, timeout);
    });
  }
}
