import { IFPPModel } from "../FPPModelManagement/FPPModelManager";
import { IStyle } from "../StyleManagement/StyleManager";

/**
 * The node types of the nodes in the graph. These are used as the classes in
 * html tags.
 */
export enum NodeType {
  Instance = "fprime-instance",
  Port = "fprime-port",
  component = "fprime-component",
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
  Component2Port = "instance-component",
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
 */
export interface IGraph {
  nodes: { [id: string]: INode };
  edges: { [id: string]: IEdge };
}

/**
 * We're using cytoscape as our front-end engine.
 * See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/cytoscape/index.d.ts#L154
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
  public static buildFrom(model: IFPPModel): ViewDescriptor {
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

    model.components.forEach((i) => {
      // Covert all the instances to a node in the graph
      view.graph.nodes[i.name] = {
        id: i.name,
        modelID: "",
        type: NodeType.component,
      };

      // Covert all the ports to a node in the graph
      // The name of the port has the format: <instance id>_<port id>
      Object.keys(i.ports).forEach((p) => {
        const pname = i.name + "_" + (i.ports as any)[p];
        view.graph.nodes[pname] = {
          id: pname,
          modelID: "",
          type: NodeType.Port,
        };

        // Add a virtual edge from instance to the port.
        // The edge has the format: <instance id>-<instance id>_<port id>
        const vedge = i.name + "-" + pname;
        view.graph.edges[vedge] = {
          id: vedge,
          modelID: "",
          type: EdgeType.Instance2Port,
          from: view.graph.nodes[i.name],
          to: view.graph.nodes[pname],
        };
      });
    });

    // Convert all the connections to edges in the graph
    // The edge has the format: <from instance id>_<from port id>-
    //  <to instance id>_<to instance id>
    model.connections.forEach((t) => {
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
   * @param json The cytoscapre json object.
   */
  public static parseStyleFrom(json: ICytoscapeJSON): { [id: string]: IStyle } {
    const styles: { [id: string]: IStyle } = {};
    json.style.forEach((s) => {
      styles[s.selector] = s;
    });
    // The main different between IStyle from cytoscape json style is the place
    // to store x/y information. In cytoscape, x/y is stored in nodes; in our
    // case we have to store it in style itself.
    json.elements.nodes.forEach((n) => {
      const id = "#" + n.data.id;
      if (styles[id]) {
        styles[id].style.x = n.position!.x;
        styles[id].style.y = n.position!.y;
      } else {
        styles[id] = {
          selector: "#" + n.data.id,
          style: { x: n.position!.x, y: n.position!.y },
        };
      }
    });
    return styles;
  }

  private descriptor: { [id: string]: IStyle };
  private graph: IGraph;

  public get Descriptor() {
    return this.descriptor;
  }

  public set Descriptor(desc: { [id: string]: IStyle }) {
    this.descriptor = desc;
  }

  /**
   * Return an array of IStyle from the view descriptor for saving purpose.
   */
  public get CSSStyles() {
    return Object.keys(this.descriptor).map((key) => this.descriptor[key]);
  }

  public set CSSStyles(styles: IStyle[]) {
    const descriptor: { [id: string]: IStyle } = {};
    styles.forEach((s) => {
      descriptor[s.selector] = s;
    });
    this.descriptor = descriptor;
  }

  constructor() {
    this.descriptor = {};
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
    const descriptor = this.descriptor;
    const graph = this.graph;

    // Copy the style from descriptor to cytoscape style filed
    const styles = Object.keys(descriptor)
      .map((key) => {
        const s = (Object as any).assign({}, descriptor[key].style);
        delete s.x;
        delete s.y;
        return { selector: descriptor[key].selector, style: s };
      });

    // Add node and edge information to the JSON
    let needLayout = false;
    // All the nodes
    const nodes =
      Object.keys(graph.nodes)
        .map((id) => graph.nodes[id])
        .map((n) => {
          const i = { data: { id: n.id }, classes: n.type } as any;
          const s = descriptor["#" + n.id];
          if (s && s.style.x && s.style.y) {
            i.position = { x: s.style.x, y: s.style.y };
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
   * Get a simple graph object with format
   * {
   *    [instance id]: [[port id]...]
   * }
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
