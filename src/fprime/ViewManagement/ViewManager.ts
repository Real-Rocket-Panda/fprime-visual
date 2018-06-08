import ViewDescriptor from "./ViewDescriptor";
import StyleManager from "../StyleManagement/StyleManager";
import FPPModelManager from "../FPPModelManagement/FPPModelManager";

export interface IViewList {
  [type: string]: IViewListItem[];
}

export interface IViewListItem {
  name: string;
  type: string;
}

export enum ViewType {
  Function = "Function View",
  InstanceCentric = "InstanceCentric View",
  Component = "Component View",
}

export default class ViewManager {

  /**
   * All the view descriptors of the views. In the current design, the view
   * descriptor should be generated as needed (call render).
   */
  private viewDescriptors: { [view: string]: ViewDescriptor } = {};

  /**
   * The style manager provide support for save/load style files for a view
   * and load the default appearance.
   */
  private styleManager: StyleManager;

  /**
   * The model manager where to get the model data of the current project.
   */
  private modelManager: FPPModelManager;

  /**
   * The view list of the current project.
   */
  private viewList: IViewList = {};

  public get ViewList(): IViewList {
    return this.viewList;
  }

  /**
   * Initialize all the fields.
   */
  constructor() {
    // TODO: This is wrong. The build method should be invoke based on UI
    // interactions. For now, we just mock the behavior.
    this.build();
  }

  /**
   * Build the current FPrime project and get the view list.
   */
  public build() {
    this.generateViewList();
  }

  /**
   * Render a specific view with its name. The name of the views should be
   * distinct in the project. The name should be in the view list. If the
   * view descriptor has not generated yet, generate the view descriptor
   * of the view.
   * @param viewName The name of the view to render.
   * @returns The render JSON object for rendering, the current system uses
   * cytoscape as the front-end rendering library.
   */
  public render(viewName: string): any {
    // Check if the name is in the view list
    const views =
      Object.keys(this.viewList)
        .map((key: string) => this.viewList[key])
        .reduce((x: IViewListItem[], y: IViewListItem[]) => x.concat(y))
        .map((x: IViewListItem) => x.name);
    // No such view
    if (views.indexOf(viewName) === -1) {
      return {};
    }
    // Return the view descriptor if already rendered.
    let viewDescriptor: ViewDescriptor;
    if (this.viewDescriptors[viewName]) {
      viewDescriptor = this.viewDescriptors[viewName];
    } else {
      // Generate the view descriptor for this view and add it to the map.
      try {
        viewDescriptor = this.generateViewDescriptorFor(viewName);
        this.viewDescriptors[viewName] = viewDescriptor;
      } catch (e) {
        // If the generation throws an exception, return an empty object.
        return {};
      }
    }
    // Convert the view descriptor to the render JSON (cytoscape format)
    return this.generateRenderJSONFrom(viewDescriptor);
  }

  /**
   * Generate the list of all the views in the current project grouped into
   * view types.
   */
  private generateViewList() {
    // TODO: Should generate from model manager, mock the implementation
    // for now.
    this.viewList = {
      [ViewType.Function]: [
        { name: "Topology1", type: ViewType.Function },
      ],
      [ViewType.InstanceCentric]: [
        { name: "Instance1", type: ViewType.InstanceCentric },
      ],
      [ViewType.Component]: [
        { name: "Component1", type: ViewType.Component },
      ],
    };
  }

  /**
   * Generate the view descriptor for the given view name. This method should
   * query the FPP model data from the model manager for the given view. Then,
   * it should call ViewDescriptor.build method to create a view descriptor
   * instance from the FPP model data.
   * @param viewName The name of the view which should be in the view list.
   */
  private generateViewDescriptorFor(viewName: string): ViewDescriptor {
    // TODO: Currently, we do not have the FPPModelManager. Thus, we mock three
    // view descriptors here.
    switch (viewName) {
      case "Topology1":
        return new ViewDescriptor();
      case "Instance1":
        return new ViewDescriptor();
      case "Component1":
        return new ViewDescriptor();
      default:
        throw new Error("Cannot generate view for: '" + viewName + "'");
    }
  }

  /**
   * Convert a view descriptor to the render JSON format. Right now, we use
   * cytoscape as our front-end renderer.
   * @param viewDescriptor The view descriptor to convert.
   */
  private generateRenderJSONFrom(viewDescriptor: ViewDescriptor): any {
    // TODO: Mock a cytoscape JSON format
    return {
      autounselectify: true,
      boxSelectionEnabled: false,
      layout: {
        name: "preset",
      },
      style: [
        {
          selector: "edge",
          style: {
            "line-color": "#9dbaea",
            "width": 2,
          },
        },
        {
          selector: ".Component",
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
          selector: ".Port",
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
      ],
      elements: {
        nodes: [
          {
            data: { id: "c1" },
            classes: "Component",
            position: { x: 0, y: 100 },
          },
          {
            data: { id: "c1_p1" },
            classes: "Port",
            position: { x: 60, y: 70 },
          },
          {
            data: { id: "c1_p2" },
            classes: "Port",
            position: { x: 60, y: 120 },
          },
          {
            data: { id: "c2" },
            classes: "Component",
            position: { x: 400, y: 240 },
          },
          {
            data: { id: "c2_p1" },
            classes: "Port",
            position: { x: 340, y: 240 },
          },
          {
            data: { id: "c3" },
            classes: "Component",
            position: { x: 0, y: 400 },
          },
          {
            data: { id: "c3_p1" },
            classes: "Port",
            position: { x: 60, y: 370 },
          },
          {
            data: { id: "c3_p2" },
            classes: "Port",
            position: { x: 60, y: 430 },
          },
        ],
        edges: [
          { data: { id: "e1", source: "c1_p1", target: "c2_p1" } },
          { data: { id: "e2", source: "c1_p2", target: "c3_p1" } },
          { data: { id: "e3", source: "c3_p2", target: "c2_p1" } },
        ],
      },
    };
  }

}
