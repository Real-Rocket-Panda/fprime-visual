import * as css from "css";

export interface IStyle {
  selector: string;
  style: { [key: string]: any };
}

export default class StyleConverter {

  /**
   * Parse the style file into IStyle objects
   * @param f The content of the style file as a string.
   */
  public parseStyleFile(f: string): IStyle[] {
    const ast = css.parse(f);
    return this.getStyleFromCSS(ast);
  }

  /**
   * Coverter the style information to string value.
   * @param descriptor The IStyle objects
   */
  public stringify(descriptor: IStyle[]): string {
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
    return css.stringify(ast);
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
}
