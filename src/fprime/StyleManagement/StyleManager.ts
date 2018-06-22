import * as css from "css";
import * as fs from "fs";
import * as path from "path";
import ConfigManager from "../ConfigManagement/ConfigManager";

declare var __static: string;

export interface IStyle {
  selector: string;
  style: { [key: string]: any };
}

export default class StyleManager {
  /**
   * The location of the system level default style css file.
   */
  private systemStylePath = path.resolve(__static, "default.css");

  /**
   * Load the project level style file from the path and merge it with the
   * system level default default style.
   * @param file The absolute path for the project style file.
   */
  public getDefaultStyles(file?: string): IStyle[] {
    const systemCSS = css.parse(fs.readFileSync(
      this.systemStylePath, "utf-8"));
    const systemStyle = this.getStyleFromCSS(systemCSS);
    // Read the project style file if any
    let projectCSS = null;
    if (file && fs.existsSync(file)) {
      projectCSS = css.parse(fs.readFileSync(file, "utf-8"));
    }
    const projectStyle = projectCSS ? this.getStyleFromCSS(projectCSS) : [];
    // Merge the projectStyle to the systemStyle
    projectStyle.forEach((ps: any) => {
      const selectors = systemStyle.filter((ss: any) =>
        ss.selector === ps.selector);
      if (selectors.length > 0) {
        selectors[0].style = (Object as any).assign(selectors[0].style,
          ps.style);
      }
    });
    return systemStyle;
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
    const rules = descriptor.map((s) => {
      return {
        type: "rule",
        selectors: s.selector.split(" "),
        declarations: Object.keys(s.style).map((key) => {
          return {
            type: "declaration",
            property: key,
            value: s.style[key],
          };
        }),
      };
    });
    const ast = { type: "stylesheet", stylesheet: { rules } };
    fs.writeFileSync(filepath, css.stringify(ast), "utf-8");
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
    const ast = css.parse(fs.readFileSync(filepath, "utf-8"));
    return this.getStyleFromCSS(ast);
  }

  /**
   * Get an array of IStyle from the given css ast.
   * @param ast The ast of the css file.
   */
  private getStyleFromCSS(ast: any): IStyle[] {
    return ast.stylesheet.rules.map((ele: any) => {
      const styles: { [key: string]: string } = {};
      ele.declarations.forEach((style: any) => {
        styles[style.property] = style.value;
      });
      return {
        selector: ele.selectors.join(),
        style: styles,
      };
    });
  }

  private generateFilePathForView(viewName: string, config: ConfigManager) {
    let filepath: string;
    let stylePath = config.Config.ViewStyleFileFolder;
    if (stylePath) {
      if (!fs.existsSync(config.Config.ViewStyleFileFolder)) {
        fs.mkdirSync(config.Config.ViewStyleFileFolder);
      }
      filepath = path.resolve(config.Config.ViewStyleFileFolder,
        `${viewName}_style.css`);
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
