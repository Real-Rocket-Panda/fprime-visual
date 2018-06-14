import ViewDescriptor, { ICytoscapeJSON } from "./ViewDescriptor";
import StyleManager from "../StyleManagement/StyleManager";
import FPPModelManager from "../FPPModelManagement/FPPModelManager";
import ConfigManager from "../ConfigManagement/ConfigManager";
import IConfig from "../Common/Config";

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
   * All the cytoscape JSONs that have generated from the corresponding view
   * descriptor. The render function should return the existing JSON to the
   * UI render.
   */
  private cytoscapeJSONs: { [view: string]: ICytoscapeJSON } = {};

  private configManager: ConfigManager;
  private config: IConfig;

  /**
   * The style manager provide support for save/load style files for a view
   * and load the default appearance.
   */
  private styleManager: StyleManager = new StyleManager();

  /**
   * The model manager where to get the model data of the current project.
   */
  private modelManager: FPPModelManager = new FPPModelManager();

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
    this.configManager = new ConfigManager();
    this.config = this.configManager.getConfig();
    // TODO: This is wrong. The build method should be invoke based on UI
    // interactions. For now, we just mock the behavior.
    this.build();
    this.modelManager.loadModel(this.config);
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
  public render(viewName: string): {
    needLayout: boolean,
    descriptor: ICytoscapeJSON,
  } | null {
    // Check if the name is in the view list
    const views =
      Object.keys(this.viewList)
        .map((key) => this.viewList[key])
        .reduce((x, y) => x.concat(y))
        .map((x) => x.name);
    // No such view
    if (views.indexOf(viewName) === -1) {
      return null;
    }
    // Find the Cytoscape JSON if already exists.
    if (this.cytoscapeJSONs[viewName]) {
      // TODO: should not use JSON.parse to do deep clone.
      return {
        needLayout: false,
        descriptor: JSON.parse(JSON.stringify(this.cytoscapeJSONs[viewName])),
      };
    }
    // If not, generate the corresponding view descriptor first, and then
    // generate the corresponding Cytoscape JSON from the view descriptor.
    const viewDescriptor = this.generateViewDescriptorFor(viewName);
    this.viewDescriptors[viewName] = viewDescriptor;
    // Convert the view descriptor to the render JSON (cytoscape format)
    return this.generateRenderJSONFrom(viewDescriptor);
  }

  /**
   * 
   * @param viewName 
   */
  public getSimpleGraphFor(viewName: string) {
    if (this.viewDescriptors[viewName]) {
      return this.viewDescriptors[viewName].getSimpleGraph();
    } else {
      return {};
    }
  }

  /**
   * The UI has updated the Cytoscape JSON and needs to store the change to the
   * view descriptor. This function should store the Cytoscape JSON in the 
   * cytoscapeJSONs map and convert the JSON back to the view descriptor.
   * @param viewName 
   * @param descriptor 
   */
  public updateViewDescriptorFor(
    viewName: string, descriptor: ICytoscapeJSON) {
    // If the view descriptor does not exist, the view has not rendered.
    // Ignore the case.
    if (!this.viewDescriptors[viewName]) {
      return;
    }
    // TODO: should not use JSON.parse to do deep clone.
    descriptor = JSON.parse(JSON.stringify(descriptor));
    // Parse the style information in cytoscape json,
    // write it back to the view descriptor
    const viewDescriptor = this.viewDescriptors[viewName];
    viewDescriptor.styleDescriptor = ViewDescriptor.parseStyleFrom(descriptor);
    // Regenerate a new cytoscape json, at this time all the nodes should
    // have position, so no need to auto layout. Thus, save the json to the
    // cytoscapeJSONs map for cachings.
    this.cytoscapeJSONs[viewName] = this.generateRenderJSONFrom(viewDescriptor)
      .descriptor;
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
    let model;
    switch (viewName) {
      case "Topology1":
        model = this.modelManager.getMockFunctionView2();
        break;

      case "Instance1":
        model = this.modelManager.getMockInstanceView1();
        break;

      case "Component1":
        model = this.modelManager.getMockComponentView1();
        break;

      default:
        throw new Error("Cannot generate view for: '" + viewName + "'");
    }
    return ViewDescriptor.buildFrom(model);
  }

  /**
   * Convert a view descriptor to the render JSON format. Right now, we use
   * cytoscape as our front-end renderer.
   * @param viewDescriptor The view descriptor to convert.
   */
  private generateRenderJSONFrom(viewDescriptor: ViewDescriptor): {
    needLayout: boolean,
    descriptor: ICytoscapeJSON,
  } {
    const json = viewDescriptor.generateCytoscapeJSON();
    // Combine the default styles with all the other styles.
    const defaultStyle = this.styleManager
      .getDefaultStyles(this.config.DefaultStyleFilePath);
    json.descriptor.style = defaultStyle.concat(json.descriptor.style);
    return json;
  }

}
