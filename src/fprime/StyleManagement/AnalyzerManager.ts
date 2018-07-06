import IConfig from "../Common/Config";
import DataImporter, { IAnalysisResult } from "../DataImport/DataImporter";

export default class AnalyzerManager {

  private dataImporter: DataImporter = new DataImporter();

  /**
   * Return the list of all the available anlayzers in the config
   * @param config The project config
   */
  public getAnalyzerList(config: IConfig): string[] {
    return config.Analyzers.map((i) => i.Name);
  }

  public async getAnalysisResultFor(
      name: string, config: IConfig): Promise<IAnalysisResult> {
    const options = config.Analyzers.find((i) => i.Name === name);
    if (options) {
      return this.dataImporter.invokeAnalyzer(options);
    }
    throw new Error("invalid analyzer name");
  }
}
