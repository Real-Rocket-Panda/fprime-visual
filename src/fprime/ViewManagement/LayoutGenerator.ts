import IConfig from "../Common/Config";

export interface IAlgorithmList {
  selected: string;
  algorithms: string[];
}

export default class LayoutGenerator {

  /**
   * Return the list of all the layout algorithms in the config.
   * @param config The project config
   */
  public getAutoLayoutList(config: IConfig): IAlgorithmList {
    return {
      selected: config.AutoLayout.find((a) => a.Default)!.Name,
      algorithms: config.AutoLayout.map((a) => a.Name),
    };
  }

  /**
   * return the default config for the auto-layout algorithm
   */
  public getDefaultAutoLayoutConfig(config: IConfig): { [key: string]: any } {
    let defaultLayout: { [key: string]: any } = {};
    config.AutoLayout.forEach((i) => {
      if (i.Default === true) {
        defaultLayout = i;
        return;
      }
    });
    return defaultLayout;
  }

  /**
   * return the config for the auto-layout algorithm by given name
   */
  public getAutoLayoutConfigByName(config: IConfig, name: string): {
    [key: string]: any,
  } {
    let layout: { [key: string]: any } = {};
    config.AutoLayout.forEach((i) => {
      if (i.Name === name) {
        layout = i;
        return;
      }
    });
    return layout;
  }
}
