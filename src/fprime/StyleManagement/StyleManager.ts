import * as css from "css";
import * as fs from "fs";
import * as path from "path";

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
   * Get an array of IStyle from the given css ast.
   * @param ast The ast of the css file.
   */
  private getStyleFromCSS(ast: any): IStyle[] {
    return ast.stylesheet.rules.map((ele: any) => {
      const styles: {[key: string]: string} = {};
      ele.declarations.forEach((style: any) => {
        styles[style.property] = style.value;
      });
      return {
        selector: ele.selectors.join(),
        style: styles,
      };
    });
  }

}
