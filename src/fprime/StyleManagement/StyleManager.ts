import { NodeType } from "../ViewManagement/ViewDescriptor";

export default class StyleManager {

  public getDefaultStyles(): Array<{
      selector: string;
      style: { [key: string]: any }
    }> {
    // TODO: Currently, we mock the result of the default styles.
    return [
      {
        selector: "edge",
        style: {
          "line-color": "#9dbaea",
          "width": 2,
        },
      },
      {
        selector: "." + NodeType.Instance,
        style: {
          "width": 100,
          "height": 140,
          "background-color": "#ffa073",
          "content": "data(id)",
          "text-halign": "center",
          "text-opacity": 0.5,
          "text-valign": "center",
          "shape": "rectangle",
        },
      },
      {
        selector: "." + NodeType.Port,
        style: {
          "width": 20,
          "height": 20,
          "background-color": "#62b0ff",
          "content": "data(id)",
          "text-halign": "center",
          "text-opacity": 0.5,
          "text-valign": "top",
          "shape": "rectangle",
        },
      },
    ];
  }

}
