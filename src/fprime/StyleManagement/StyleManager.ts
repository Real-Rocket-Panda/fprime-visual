import { NodeType } from "../ViewManagement/ViewDescriptor";
import css from "css";
import fs from "fs";
import path from "path";

export default class StyleManager {
  private static = "../../..";
  public getDefaultStyles(file: any): Array<{
      selector: string;
      style: { [key: string]: any }
    }> {
    const defaultStyleContent = fs.readFileSync(
      path.resolve(__dirname, this.static + file),
      "utf-8",
    );
    const ast = css.parse(defaultStyleContent);

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
