import * as fs from "fs";
import IConfig from "../Common/Config";
import DataImporter, { IOutput } from "../DataImport/DataImporter";
import { IStyle } from "../DataImport/StyleConverter";

export default class AnalyzerManager {

  private dataImporter: DataImporter = new DataImporter();

  private analysisResults: { [key: string]: IStyle[] } = {};

  /**
   * Return the list of all the available anlayzers in the config
   * @param config The project config
   */
  public getAnalyzerList(config: IConfig): string[] {
    return config.Analyzers.map((i) => i.Name);
  }

  /**
   * Get the existing analysis result from memory cache or result files as
   * it in the config.
   * @param name The name of the analyzer
   * @param config The project config
   */
  public getAnalysisResultFor(name: string, config: IConfig): IStyle[] {
    if (name in this.analysisResults) {
      return this.analysisResults[name];
    }
    const options = config.Analyzers.find((i) => i.Name === name);
    if (options) {
      const styles = this.dataImporter.loadAnalysisResultFromFile(options);
      if (styles) {
        this.analysisResults[name] = styles;
        return styles;
      }
    }
    return [];
  }

  /**
   * Invoke the analyzer and return its output and result info.
   * @param name The name of the analyzer
   * @param config The project cnofig
   */
  public async loadAnalysisInfo(
      name: string, config: IConfig, output: IOutput): Promise<void> {
    const options = config.Analyzers.find((i) => i.Name === name);
    if (options) {
      const styles = await this.dataImporter.invokeAnalyzer(options, output);
      this.analysisResults[name] = styles;
    }
    throw new Error("invalid analyzer name");
  }

  /**
   * Cleanup the cached analysis results and all the generated analysis result
   * files. This is useful when rebuilding the project and need to clean up the
   * existing analysis result.
   * @param config The old project config
   */
  public cleanup(config: IConfig) {
    this.analysisResults = {};
    config.Analyzers.forEach((i) => {
      if (fs.existsSync(i.OutputFilePath)) {
        fs.unlinkSync(i.OutputFilePath);
      }
    });
  }
}
