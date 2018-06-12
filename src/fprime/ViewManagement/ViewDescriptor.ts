import { IMockModel } from "../FPPModelManagement/FPPModelManager";

/**
 * The interface of the node style.
 * id is the element ID of the node in the graph.
 * style is a map of css style attributes.
 * x?, y? are optional numbers of the element's postion.
 */
export interface INodeStyle {
  id: string;
  style: { [key: string]: any };
  x?: number;
  y?: number;
}

/**
 * The interface of the edge style.
 * id is the element ID of the edge in the graph.
 * style is a map of css style attributes.
 */
export interface IEdgeStyle {
  id: string;
  style: { [key: string]: any };
}

/**
 * The interface of the style descriptor. It contains all the style information
 * of the elements in the graph. nodes is a map of all the style information
 * of the nodes, edges is a map for the edges in the graph. The key of the map
 * is the element ID of each element.
 */
export interface IStyleDescriptor {
  nodes: { [id: string]: INodeStyle };
  edges: { [id: string]: IEdgeStyle };
}

/**
 * The node types of the nodes in the graph. These are used as the classes in
 * html tags.
 */
export enum NodeType {
  Instance = "fprime-instance",
  Port = "fprime-port",
}

/**
 * The interface of the node in the graph.
 * id is the element ID in html.
 * modelID is the ID of the corresponding model data.
 * type is the type of the node, see NodeType.
 */
export interface INode {
  id: string;
  modelID: string;
  type: NodeType;
}

/**
 * The edge types of the edges in the graph.
 * Port2Port is the edge from port to port.
 * Instance2Port is a special connection from component to ports. This is used
 * only during the rendering phase based on our auto-layout strategy. This
 * type of edges should be invisible in the final diagram.
 */
export enum EdgeType {
  Port2Port = "port-port",
  Instance2Port = "instance-port",
}

/**
 * The interface of the edge in the graph.
 * id is the element ID of the edge.
 * modelID is the ID of the corresponding model data.
 * type is the type of the edge, see EdgeType.
 * from is the starting node of this edge.
 * to is the ending node of this edge.
 */
export interface IEdge {
  id: string;
  modelID: string;
  type: EdgeType;
  from: INode;
  to: INode;
}

/**
 * The interface of the graph containing all the hierachical information of the
 * diagram. nodes is a map of all the nodes. edges is a map of all the edges
 * including the special edges from component to port. The key of the map is the
 * elementID.
 * 
 */
export interface IGraph {
  nodes: { [id: string]: INode };
  edges: { [id: string]: IEdge };
}

/**
 * The definition of the view descriptor.
 */
export default class ViewDescriptor {

  /**
   * Build the view descriptor from the given model data.
   * @param model The mocked model data
   */
  public static buildFrom(model: IMockModel): ViewDescriptor {
    const view = new ViewDescriptor();

    model.instances.forEach((i) => {
      view.graph.nodes[i.id] = {
        id: i.id,
        modelID: "",
        type: NodeType.Instance,
      };

      Object.keys(i.ports).forEach((p) => {
        const pname = i.id + "_" + (i.ports as any)[p];
        view.graph.nodes[pname] = {
          id: pname,
          modelID: "",
          type: NodeType.Port,
        };

        const vedge = i.id + "-" + pname;
        view.graph.edges[vedge] = {
          id: vedge,
          modelID: "",
          type: EdgeType.Instance2Port,
          from: view.graph.nodes[i.id],
          to: view.graph.nodes[pname],
        };
      });
    });

    model.topologies.forEach((t) => {
      const from = `${t.from.inst.id}_${t.from.port}`;
      const to = `${t.to.inst.id}_${t.to.port}`;
      const edge = from + "-" + to;
      view.graph.edges[edge] = {
        id: edge,
        modelID: "",
        type: EdgeType.Port2Port,
        from: view.graph.nodes[from],
        to: view.graph.nodes[to],
      };
    });

    return view;
  }

  public styleDescriptor: IStyleDescriptor;
  public graph: IGraph;

  constructor() {
    this.styleDescriptor = { nodes: {}, edges: {} };
    this.graph = { nodes: {}, edges: {} };
  }

  public getSimpleGraph(): { [key: string]: string[] } {
    const graph: { [key: string]: string[] } = {};
    Object
      .keys(this.graph.edges)
      .map((key) => this.graph.edges[key])
      .filter((e) => e.type === EdgeType.Instance2Port)
      .forEach((e) => {
        const from = "#" + e.from.id;
        const to = `#${e.to.id}`;
        if (!graph[from]) {
          graph[from] = [to];
        } else {
          graph[from].push(to);
        }
      });
    return graph;
  }

}
