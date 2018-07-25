import * as fs from "fs";
import * as path from "path";
import ConfigManager from "../ConfigManagement/ConfigManager";
import StyleConverter, { IStyle } from "../DataImport/StyleConverter";

declare var __static: string;

export default class StyleManager {
  /**
   * The location of the system level default style css file.
   */
  private systemStylePath = path.resolve(__static, "default.css");

  /**
   * The converter that converts the style file to IStyle objects.
   */
  private styleConverter: StyleConverter = new StyleConverter();

  /**
   * The default styles for the current project
   */
  private defaultStyle: IStyle[] = [];

  public get DefaultStyle() {
    return this.defaultStyle;
  }

  /**
   * Load the project level style file from the path and merge it with the
   * system level default default style.
   * @param file The absolute path for the project style file.
   */
  public loadDefaultStyles(file?: string): void {
    const systemStyle = this.styleConverter.parseStyleFile(
      fs.readFileSync(this.systemStylePath, "utf-8"));
    // Read the project style file if any
    let projectStyle: IStyle[] = [];
    if (file && fs.existsSync(file)) {
      try {
        projectStyle = this.styleConverter.parseStyleFile(
          fs.readFileSync(file, "utf-8"));
      } catch (e) {
        throw new Error(`parsing default style file '${path.basename(file)}',\n`
          + e);
      }
    }
    // Concat the project style to the system style
    this.defaultStyle = systemStyle.concat(projectStyle);
  }

  /**
   * Save the view descriptor as a css file.
   * @param viewName The name of the view to store. The style file would have
   * the name <viewName>_style.css
   * @param descriptor An array of the style information of the view.
   * @param config The config manager.
   */
  public saveStyleFor(viewName: string, descriptor: IStyle[],
                      config: ConfigManager) {
    const filepath = this.generateFilePathForView(viewName, config);
    const value = this.styleConverter.stringify(descriptor);
    fs.writeFileSync(filepath, value, "utf-8");
  }

  /**
   * Load the style information as an array of IStyle.
   * @param viewName The name of the view to load. The style file would have
   * the name <viewName>_style.css
   * @param config The config manager.
   */
  public loadStyleFor(viewName: string, config: ConfigManager): IStyle[] {
    const filepath = this.generateFilePathForView(viewName, config);
    if (!fs.existsSync(filepath)) {
      return [];
    }
    return this.styleConverter.parseStyleFile(
      fs.readFileSync(filepath, "utf-8"));
  }

  /**
   * Delete the style file of a view.
   * @param viewName The name of the view
   * @param config The config manager
   */
  public deleteStyleFor(viewName: string, config: ConfigManager) {
    const filepath = this.generateFilePathForView(viewName, config);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  /**
   * Merge two styles into one. Merge won't change the value in x (the first
   * parameter).
   * @param x An array of IStyle to merge to.
   * @param y An array of IStyle to merge from.
   */
  public mergeStyle(x: IStyle[], y: IStyle[]): IStyle[] {
    // Clone x
    x = x.map((s) => {
      return {
        selector: s.selector,
        style: Object.assign({}, s.style),
      };
    });
    y.forEach((ys) => {
      const s = x.find((xs) => xs.selector === ys.selector);
      if (s) {
        s.style = Object.assign(s.style, ys.style);
      } else {
        x.push(ys);
      }
    });
    return x;
  }

  private generateFilePathForView(viewName: string, config: ConfigManager) {
    let filepath: string;
    let stylePath = config.Config.ViewStyleFileFolder;
    if (stylePath) {
      if (!fs.existsSync(stylePath)) {
        fs.mkdirSync(stylePath);
      }
      filepath = path.resolve(stylePath, `${viewName}_style.css`);
    } else {
      stylePath = path.resolve(config.ProjectPath, "styles");
      // If "ViewStyleFileFolder" field is not specified in the configuration
      // file, should use the default folder, that $PROJECT/styles
      if (!fs.existsSync(stylePath)) {
        fs.mkdirSync(stylePath);
      }
      filepath = path.resolve(config.ProjectPath,
        `styles/${viewName}_style.css`);
    }
    return filepath;
  }

}
