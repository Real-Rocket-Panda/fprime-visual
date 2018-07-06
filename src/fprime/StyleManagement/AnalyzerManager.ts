import IConfig from "../Common/Config";

export default class AnalyzerManager {

  /**
   * Return the list of all the available anlayzers in the config
   * @param config The project config
   */
  public getAnalyzerList(config: IConfig): string[] {
    return config.Analyzers.map((i) => i.Name);
  }
}
