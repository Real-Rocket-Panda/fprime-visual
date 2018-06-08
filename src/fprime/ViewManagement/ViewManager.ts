import ViewDescriptor, { NodeType, EdgeType } from "./ViewDescriptor";
import { INodeStyle, IEdgeStyle, INode, IEdge } from "./ViewDescriptor";
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
    const view = new ViewDescriptor();

    switch (viewName) {
      case "Topology1":
        view.graph.nodes = {
          c1: { id: "c1", modelID: "", type: NodeType.Component },
          c1_p1: { id: "c1_p1", modelID: "", type: NodeType.Port },
          c1_p2: { id: "c1_p2", modelID: "", type: NodeType.Port },
          c2: { id: "c2", modelID: "", type: NodeType.Component },
          c2_p1: { id: "c2_p1", modelID: "", type: NodeType.Port },
          c3: { id: "c3", modelID: "", type: NodeType.Component },
          c3_p1: { id: "c3_p1", modelID: "", type: NodeType.Port },
          c3_p2: { id: "c3_p2", modelID: "", type: NodeType.Port },
        };
        view.graph.edges = {
          "c1_p1-c2_p1": {
            id: "c1_p1-c2_p1",
            modelID: "",
            type: EdgeType.Port2Port,
            from: { id: "c1_p1", modelID: "", type: NodeType.Port },
            to: { id: "c2_p1", modelID: "", type: NodeType.Port },
          },
          "c1_p2-c3_p1": {
            id: "c1_p2-c3_p1",
            modelID: "",
            type: EdgeType.Port2Port,
            from: { id: "c1_p2", modelID: "", type: NodeType.Port },
            to: { id: "c3_p1", modelID: "", type: NodeType.Port },
          },
          "c3_p2-c2_p1": {
            id: "c3_p2-c2_p1",
            modelID: "",
            type: EdgeType.Port2Port,
            from: { id: "c3_p2", modelID: "", type: NodeType.Port },
            to: { id: "c2_p1", modelID: "", type: NodeType.Port },
          },
          "c1-c1_p1": {
            id: "c1-c1_p1",
            modelID: "",
            type: EdgeType.Component2Port,
            from: { id: "c1", modelID: "", type: NodeType.Component },
            to: { id: "c1_p1", modelID: "", type: NodeType.Port },
          },
          "c1-c1_p2": {
            id: "c1-c1_p2",
            modelID: "",
            type: EdgeType.Component2Port,
            from: view.graph.nodes.c1,
            to: view.graph.nodes.c1_p2,
          },
          "c2-c2_p1": {
            id: "c2-c2_p1",
            modelID: "",
            type: EdgeType.Component2Port,
            from: view.graph.nodes.c2,
            to: view.graph.nodes.c2_p1,
          },
          "c3-c3_p1": {
            id: "c3-c3_p1",
            modelID: "",
            type: EdgeType.Component2Port,
            from: view.graph.nodes.c3,
            to: view.graph.nodes.c3_p1,
          },
          "c3-c3_p2": {
            id: "c3-c3_p2",
            modelID: "",
            type: EdgeType.Component2Port,
            from: view.graph.nodes.c3,
            to: view.graph.nodes.c3_p2,
          },
        };
        break;

      case "Instance1":
        break;

      case "Component1":
        break;

      default:
        throw new Error("Cannot generate view for: '" + viewName + "'");
    }
    return view;
  }

  /**
   * Convert a view descriptor to the render JSON format. Right now, we use
   * cytoscape as our front-end renderer.
   * @param viewDescriptor The view descriptor to convert.
   */
  private generateRenderJSONFrom(viewDescriptor: ViewDescriptor): any {
    const styleDescriptor = viewDescriptor.styleDescriptor;
    const graph = viewDescriptor.graph;
    // The style for each individual node (components or ports)
    const nodeStyles =
      Object.keys(styleDescriptor.nodes)
        .map((id: string) => styleDescriptor.nodes[id])
        .map((n: INodeStyle) => {
          return {
            selector: "#" + n.id,
            style: n.style,
          };
        });
    // The style for each individual edge.
    const edgeStyles =
      Object.keys(styleDescriptor.edges)
        .map((id: string) => styleDescriptor.edges[id])
        .map((e: IEdgeStyle) => {
          return {
            selector: "#" + e.id,
            style: e.style,
          };
        });
    // Combine the default styles with all the other styles.
    const styles =
      this.styleManager.getDefaultStyles()
        .concat(nodeStyles)
        .concat(edgeStyles);
    // All the nodes
    const nodes =
      Object.keys(graph.nodes)
        .map((id: string) => graph.nodes[id])
        .map((n: INode) => {
          return {
            data: { id: n.id },
            classes: n.type,
            position: styleDescriptor.nodes[n.id] ? {
              x: styleDescriptor.nodes[n.id].x,
              y: styleDescriptor.nodes[n.id].y,
            } : undefined,
          };
        });
    // All edges
    const edges =
      Object.keys(graph.edges)
        .map((id: string) => graph.edges[id])
        .map((e: IEdge) => {
          return {
            data: { id: e.id, source: e.from.id, target: e.to.id },
            classes: e.type,
          };
        });
    return {
      style: styles,
      elements: { nodes, edges },
    };
  }

}
