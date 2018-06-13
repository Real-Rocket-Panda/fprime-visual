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
 * We're using cytoscape as our front-end engine.
 * See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/
 *  master/types/cytoscape/index.d.ts#L154
 */
export interface ICytoscapeJSON {
  style: Array<{ selector: string, style: { [key: string]: any } }>;
  elements: {
    nodes: Array<{
      data: { id: string },
      classes: string,
      position?: { x: number, y: number },
    }>,
    edges: Array<{
      data: { id: string, source: string, target: string },
      classes: string,
    }>,
  };
}

/**
 * The definition of the view descriptor.
 */
export default class ViewDescriptor {

  /**
   * Build the graph of a view descriptor from the given model data.
   * @param model The mocked model data
   */
  public static buildFrom(model: IMockModel): ViewDescriptor {
    const view = new ViewDescriptor();

    // For all the instances in a model
    model.instances.forEach((i) => {
      // Covert all the instances to a node in the graph
      view.graph.nodes[i.id] = {
        id: i.id,
        modelID: "",
        type: NodeType.Instance,
      };

      // Covert all the ports to a node in the graph
      // The name of the port has the format: <instance id>_<port id>
      Object.keys(i.ports).forEach((p) => {
        const pname = i.id + "_" + (i.ports as any)[p];
        view.graph.nodes[pname] = {
          id: pname,
          modelID: "",
          type: NodeType.Port,
        };

        // Add a virtual edge from instance to the port.
        // The edge has the format: <instance id>-<instance id>_<port id>
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

    // Convert all the connections to edges in the graph
    // The edge has the format: <from instance id>_<from port id>-
    //  <to instance id>_<to instance id>
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

  /**
   * Parse the style information from a cytoscape JSON format to an
   * IStyleDescriptor instance.
   * @param descriptor 
   */
  public static parseStyleFrom(descriptor: ICytoscapeJSON): IStyleDescriptor {
    const style: IStyleDescriptor = { nodes: {}, edges: {} };
    // Convert all the style to INodeStyle and IEdgeStyle
    descriptor.style.forEach((s) => {
      // Only parse the elements with id.
      if (s.selector[0] !== "#") {
        return;
      }
      const id = s.selector.substr(1);
      // Having '-' in the middle should be an edge.
      if (id.indexOf("-") !== -1) {
        style.edges[id] = { id, style: s.style };
      } else { // Otherwise, it's a node
        style.nodes[id] = { id, style: s.style };
      }
    });
    // Covert the x/y info in elements to INodeStyle
    descriptor.elements.nodes.forEach((n) => {
      style.nodes[n.data.id].x = n.position!.x;
      style.nodes[n.data.id].y = n.position!.y;
    });
    return style;
  }

  public styleDescriptor: IStyleDescriptor;
  public graph: IGraph;

  constructor() {
    this.styleDescriptor = { nodes: {}, edges: {} };
    this.graph = { nodes: {}, edges: {} };
  }

  /**
   * Convert a view descriptor to the render JSON format. Right now, we use
   * cytoscape as our front-end renderer.
   */
  public generateCytoscapeJSON(): {
    needLayout: boolean,
    descriptor: ICytoscapeJSON,
  } {
    const styleDescriptor = this.styleDescriptor;
    const graph = this.graph;

    // Add style information to the JSON
    // The style for each individual node (components or ports)
    const nodeStyles =
      Object.keys(styleDescriptor.nodes)
        .map((id) => styleDescriptor.nodes[id])
        .map((n) => {
          return {
            selector: "#" + n.id,
            style: n.style,
          };
        });
    // The style for each individual edge.
    const edgeStyles =
      Object.keys(styleDescriptor.edges)
        .map((id) => styleDescriptor.edges[id])
        .map((e) => {
          return {
            selector: "#" + e.id,
            style: e.style,
          };
        });
    // Combine the two styles
    const styles = nodeStyles.concat(edgeStyles);

    // Add node and edge information to the JSON
    let needLayout = false;
    // All the nodes
    const nodes =
      Object.keys(graph.nodes)
        .map((id) => graph.nodes[id])
        .map((n) => {
          const i = { data: { id: n.id }, classes: n.type } as any;
          const style = styleDescriptor.nodes[n.id];
          if (style && style.x && style.y) {
            i.position = { x: style.x!, y: style.y! };
          } else {
            // If any of the node does not have the x/y info, we should set
            // needlayout to true to ask the UI render to layout the diagram.
            needLayout = true;
          }
          return i;
        });

    // All edges
    const edges =
      Object.keys(graph.edges)
        .map((id) => graph.edges[id])
        .map((e) => {
          return {
            data: { id: e.id, source: e.from.id, target: e.to.id },
            classes: e.type,
          };
        });

    return {
      needLayout,
      descriptor: {
        style: styles,
        elements: { nodes, edges },
      },
    };
  }

  /**
   * 
   */
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
