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
    let layout = {} as any;
    const al = config.AutoLayout.find((a) => a.Default);
    if (al) {
      const params = {} as any;
      Object.keys(al.Parameters).forEach((key) => {
        params[key] = eval(al.Parameters[key]);
      });
      layout = {
        Name: al.Name,
        Default: al.Default,
        Parameters: params,
      };
    }
    return layout;
  }

  /**
   * return the config for the auto-layout algorithm by given name
   */
  public getAutoLayoutConfigByName(config: IConfig, name: string): {
    [key: string]: any,
  } {
    let layout = {} as any;
    const al = config.AutoLayout.find((a) => a.Name === name);
    if (al) {
      const params = {} as any;
      Object.keys(al.Parameters).forEach((key) => {
        params[key] = eval(al.Parameters[key]);
      });
      layout = {
        Name: al.Name,
        Default: al.Default,
        Parameters: params,
      };
    }
    return layout;
  }
}
