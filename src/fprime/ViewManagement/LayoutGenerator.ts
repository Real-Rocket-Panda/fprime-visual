import IConfig from "../Common/Config";

export default class LayoutGenerator {

  /**
   * return the default config for the auto-layout algorithm
   */
  public getDefaultAutoLayoutConfig(config: IConfig): {[key: string]: any} {
    let defaultLayout: {[key: string]: any} = {};
    console.log(config);
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
  public getAutoLayoutConfigByName(config: IConfig, name: string):
                                            {[key: string]: any} {
    let layout: {[key: string]: any} = {};
    config.AutoLayout.forEach((i) => {
        if (i.Name === name) {
            layout = i;
            return;
        }
    });
    return layout;
  }
}
