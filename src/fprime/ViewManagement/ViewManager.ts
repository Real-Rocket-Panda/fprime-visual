import ViewDescriptor, { ICytoscapeJSON, IRenderJSON } from "./ViewDescriptor";
import StyleManager from "../StyleManagement/StyleManager";
import FPPModelManager from "../FPPModelManagement/FPPModelManager";
import ConfigManager from "../ConfigManagement/ConfigManager";
import LayoutGenerator from "./LayoutGenerator";
import AnalyzerManager from "../StyleManagement/AnalyzerManager";
import { IStyle } from "../DataImport/StyleConverter";

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

  private configManager: ConfigManager = new ConfigManager();

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
   * The layout gennerator where to manage the layout algorithm with
   * related Parameters.
   */
  private layoutGenerator: LayoutGenerator = new LayoutGenerator();

  /**
   * The list of the available auto layout algorithms in the config.
   */
  private layoutAlgorithms: { selected: string, selections: string[] } =
    { selected: "", selections: [] };

  public get LayoutAlgorithms() {
    return this.layoutAlgorithms;
  }

  /**
   * The analyzer manager to manage all the analyzers and their results.
   */
  private analyzerManager: AnalyzerManager = new AnalyzerManager();

  /**
   * The available model analyzers in the config.
   */
  private analyzers: { selected: string, selections: string[] } =
    { selected: "", selections: [] };

  public get Analyzers() {
    return this.analyzers;
  }

  /**
   * The view list of the current project.
   */
  private viewList: IViewList = {
    [ViewType.Function]: [],
    [ViewType.InstanceCentric]: [],
    [ViewType.Component]: [],
  };

  public get ViewList(): IViewList {
    return this.viewList;
  }

  /**
   * The output message to show on the output panel.
   */
  private outputMessage = { compile: "", analysis: "" };

  public get OutputMessage() {
    return this.outputMessage;
  }

  public appendOutput(v: string) {
    this.outputMessage.compile += v + "\n";
  }

  /**
   * Build the current FPrime project and get the view list.
   * @param dir The folder path of a project.
   */
  public async build(dir: string) {
    try {
      // Cleanup the views
      this.cleanup();
      // Set the project path
      this.configManager.ProjectPath = dir;
      // Load the project config.
      this.configManager.loadConfig();

      // Initialize the layoutGenerator
      const layouts = this.layoutGenerator.getAutoLayoutList(
        this.configManager.Config);
      this.layoutAlgorithms.selected = layouts.selected;
      this.layoutAlgorithms.selections = layouts.algorithms;

      // TODO: Load the available model analyzers
      const analyzers = this.analyzerManager.getAnalyzerList(
        this.configManager.Config);
      this.analyzers.selected = analyzers.length > 0 ? analyzers[0] : "";
      this.analyzers.selections = analyzers;

      // Load the default style from the config
      this.styleManager.loadDefaultStyles(
        this.configManager.Config.DefaultStyleFilePath);

      // Load the FPP model
      const data = await this.modelManager.loadModel(this.configManager.Config);
      this.outputMessage.compile = data.output + "\n";
      this.generateViewList(data.viewlist);
    } catch (err) {
      this.outputMessage.compile = err + "\n";
    }
  }

  /**
   * Rebuild the project with the current path.
   */
  public rebuild() {
    return this.build(this.configManager.ProjectPath);
  }

  /**
   * Refresh the style information of all the views. This is useful when the
   * user changes the style file and want to reload the view without build the
   * entire project again.
   */
  public refresh(viewName: string) {
    // Delete the in-memory style information, this would cause losing all
    // the unsaved changes.
    delete this.viewDescriptors[viewName];
    delete this.cytoscapeJSONs[viewName];
    // Load the default style from the config
    this.styleManager.loadDefaultStyles(
      this.configManager.Config.DefaultStyleFilePath);
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
  public render(viewName: string,
                forceLayout: boolean = false): IRenderJSON | null {
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
      return {
        needLayout: forceLayout,
        elesHasPosition: this.cytoscapeJSONs[viewName]
          .elements.nodes.map((i) => i.data.id),
        // If the cytoscape JSON exists, it is returned by render layer,
        // thus all the nodes should have postion.
        elesNoPosition: [],
        descriptor: this.cytoscapeJSONs[viewName],
      };
    }
    // If not, generate the corresponding view descriptor first, and then
    // generate the corresponding Cytoscape JSON from the view descriptor.
    const viewDescriptor = this.generateViewDescriptorFor(viewName);
    this.viewDescriptors[viewName] = viewDescriptor;
    // Convert the view descriptor to the render JSON (cytoscape format)
    const json = this.generateRenderJSONFrom(viewDescriptor);
    // Set the forceLayout layout flag
    json.needLayout = json.needLayout || forceLayout;
    return json;
  }

  /**
   * Get a simple graph of the view. See, ViewDescriptor.getSimpleGraph()
   * @param viewName The name of the view.
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
   * @param viewName The name of the view to update
   * @param descriptor The cytoscape json object to update
   */
  public updateViewDescriptorFor(viewName: string, json: ICytoscapeJSON) {
    // If the view descriptor does not exist, the view has not rendered.
    // Ignore the case.
    if (!this.viewDescriptors[viewName]) {
      return;
    }
    this.cytoscapeJSONs[viewName] = json;
    // Parse the style information in cytoscape json,
    // write it back to the view descriptor
    const viewDescriptor = this.viewDescriptors[viewName];
    viewDescriptor.Descriptor = ViewDescriptor.parseStyleFrom(json);
  }

  /**
   * Save the given view to a style file. The function should receive the
   * recent cytoscape json obejct, update the in-memory view descriptor,
   * and then write the view descriptor to the file.
   * @param viewName The name of the view to save.
   * @param descriptor The current cytoscape json object.
   */
  public saveViewDescriptorFor(viewName: string, descriptor: ICytoscapeJSON) {
    if (!this.viewDescriptors[viewName]) {
      return;
    }
    // Update the view descriptor first
    this.updateViewDescriptorFor(viewName, descriptor);
    const styles = this.viewDescriptors[viewName].CSSStyles;
    this.styleManager.saveStyleFor(viewName, styles, this.configManager);
  }

  /**
   * Return the current selected layout config
   */
  public getCurrentAutoLayoutConfig(): { [key: string]: any } {
    return this.layoutGenerator.getAutoLayoutConfigByName(
      this.configManager.Config, this.layoutAlgorithms.selected,
    );
  }

  /**
   * Invoke the current selected model analyzer and read its output.
   */
  public async invokeCurrentAnalyzer() {
    try {
      const re = await this.analyzerManager.loadAnalysisInfo(
        this.analyzers.selected, this.configManager.Config);
      this.outputMessage.analysis = re.output + "\n";
    } catch (e) {
      this.outputMessage.analysis = "fail to call the analyzer,\n" + e;
    }
  }

  /**
   * Return the analysis info of the current selected mode analyzer.
   */
  public getCurrentAnalyzerResult(): IStyle[] {
    return this.analyzerManager.getAnalysisResultFor(this.analyzers.selected,
      this.configManager.Config);
  }

  /**
   * Clean up the memeory
   */
  private cleanup() {
    Object.keys(this.viewDescriptors).forEach((key) => {
      delete this.viewDescriptors[key];
    });
    Object.keys(this.cytoscapeJSONs).forEach((key) => {
      delete this.cytoscapeJSONs[key];
    });
  }

  /**
   * Generate the list of all the views in the current project grouped into
   * view types.
   */
  private generateViewList(viewList: { [k: string]: string[] }) {
    this.viewList[ViewType.Function] = viewList.topologies
      .map((e: string) => {
        return { name: e, type: ViewType.Function };
      });
    this.viewList[ViewType.InstanceCentric] = viewList.instances
      .map((e: string) => {
        return { name: e, type: ViewType.InstanceCentric };
      });
    this.viewList[ViewType.Component] = viewList.components
      .map((e: string) => {
        return { name: e, type: ViewType.Component };
      });
  }

  /**
   * Generate the view descriptor for the given view name. This method should
   * query the FPP model data from the model manager for the given view. Then,
   * it should call ViewDescriptor.build method to create a view descriptor
   * instance from the FPP model data.
   * @param viewName The name of the view which should be in the view list.
   */
  private generateViewDescriptorFor(viewName: string): ViewDescriptor {
    const view = Object.keys(this.viewList)
      .map((key) => this.viewList[key])
      .reduce((x, y) => x.concat(y))
      .filter((x) => x.name === viewName)[0];
    const model = this.modelManager.query(view.name, view.type);
    // Generate the graph part of the view descriptor
    const descriptor = ViewDescriptor.buildFrom(model);
    // Load the styledescriptor part of the view descriptor from file
    const styles = this.styleManager.loadStyleFor(viewName, this.configManager);
    descriptor.CSSStyles = styles;
    return descriptor;
  }

  /**
   * Convert a view descriptor to the render JSON format. Right now, we use
   * cytoscape as our front-end renderer.
   * @param viewDescriptor The view descriptor to convert.
   */
  private generateRenderJSONFrom(viewDescriptor: ViewDescriptor): IRenderJSON {
    const json = viewDescriptor.generateCytoscapeJSON();
    // Merge the default styles with all the other styles.
    json.descriptor.style = this.styleManager.mergeStyle(
      this.styleManager.DefaultStyle, json.descriptor.style);
    return json;
  }

}
