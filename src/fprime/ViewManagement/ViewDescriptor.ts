import { IFPPModel } from "../FPPModelManagement/FPPModelManager";
import { IStyle } from "../DataImport/StyleConverter";

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
  properties: { [key: string]: any };
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
  Component2Port = "component-port",
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
      data: { id: string, [key: string]: any },
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
 * The render object return to the render package. Except cytoscape json,
 * this object provide further information like needLayout.
 */
export interface IRenderJSON {
  needLayout: boolean;
  descriptor: ICytoscapeJSON;
  elesHasPosition: string[];
  elesNoPosition: string[];
}

function escapeDot(s: string): string {
  return s.replace(/\./g, "_");
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
    //console.log(model);
    
    const view = new ViewDescriptor();

    // For all the instances in a model
    model.instances.forEach((i) => {
      // Covert all the instances to a node in the graph
      // The mapping relation from IFPPInstance to INode is:
      //  id <- name by changing . to _
      //  modelID <- name
      const insID = escapeDot(i.name);
      view.graph.nodes[insID] = {
        id: insID,
        modelID: i.name,
        type: NodeType.Instance,
        properties: i.properties,
      };

      // Covert all the ports to a node in the graph
      // The name of the port has the format: <instance id>_<port id>
      Object.keys(i.ports).forEach((p) => {
        const portID = `${insID}_${i.ports[p].name}`;
        view.graph.nodes[portID] = {
          id: portID,
          // TODO: the model id for the instance ports.
          modelID: i.ports[p].name,
          type: NodeType.Port,
          properties: i.ports[p].properties,
        };

        // Add a virtual edge from instance to the port.
        // The edge has the format: <instance id>-<instance id>_<port id>
        if (i.ports[p].properties.direction === "in") {
          // in port, from port to instance
          const vedge = `${portID}-${insID}`;
          view.graph.edges[vedge] = {
            id: vedge,
            modelID: "",
            type: EdgeType.Instance2Port,
            from: view.graph.nodes[portID],
            to: view.graph.nodes[insID],
          };
        } else {
          // out port, from instance to port
          const vedge = `${insID}-${portID}`;
          view.graph.edges[vedge] = {
            id: vedge,
            modelID: "",
            type: EdgeType.Instance2Port,
            from: view.graph.nodes[insID],
            to: view.graph.nodes[portID],
          };
        }
      });
    });

    model.components.forEach((i) => {
      // Covert all the instances to a node in the graph
      const compID = escapeDot(i.name);
      view.graph.nodes[compID] = {
        id: compID,
        modelID: i.name,
        type: NodeType.component,
        properties: {},
      };

      // Covert all the ports to a node in the graph
      // The name of the port has the format: <instance id>_<port id>
      i.ports.forEach((p) => {
        const portID = `${compID}_${p.name}`;
        view.graph.nodes[portID] = {
          id: portID,
          modelID: p.name,
          type: NodeType.Port,
          properties: p.properties,
        };

        // Add a virtual edge from instance to the port.
        // The edge has the format: <instance id>-<instance id>_<port id>
        if (p.properties.direction === "in") {
          const vedge = `${portID}-${compID}`;
          view.graph.edges[vedge] = {
            id: vedge,
            modelID: "",
            type: EdgeType.Component2Port,
            from: view.graph.nodes[portID],
            to: view.graph.nodes[compID],
          };
        } else {
          const vedge = `${compID}-${portID}`;
          view.graph.edges[vedge] = {
            id: vedge,
            modelID: "",
            type: EdgeType.Component2Port,
            from: view.graph.nodes[compID],
            to: view.graph.nodes[portID],
          };
        }
      });
    });

    // Convert all the connections to edges in the graph
    // The edge has the format: <from instance id>_<from port id>-
    //  <to instance id>_<to instance id>
    model.connections.forEach((t) => {
      if(t.from.port && t.to) {
        const from = `${escapeDot(t.from.inst.name)}_${t.from.port.name}`;
        const to = `${escapeDot(t.to.inst.name)}_${t.to.port.name}`;
        const edge = `${from}-${to}`;
        view.graph.edges[edge] = {
          id: edge,
          modelID: "",
          type: EdgeType.Port2Port,
          from: view.graph.nodes[from],
          to: view.graph.nodes[to],
        };
      }
    });

    //console.dir(view);
    
    return view;
  }

  /**
   * Parse the style information from a cytoscape JSON format to an
   * IStyleDescriptor instance.
   * @param json The cytoscapre json object.
   */
  public static parseStyleFrom(json: ICytoscapeJSON,
                               def: IStyle[]): { [id: string]: IStyle } {
    const styles: { [id: string]: IStyle } = {};
    json.style
      // Skip style for core, this is generated by cytoscape, not sure its
      // meaning.
      .filter((s) => s.selector !== "core")
      // ignore the project default style
      .slice(def.length)
      .forEach((s) => {
        if (styles[s.selector]) {
          const olds = styles[s.selector];
          styles[s.selector] = {
            selector: s.selector,
            style: Object.assign(olds.style, s.style),
          };
        } else {
          styles[s.selector] = {
            selector: s.selector,
            style: Object.assign({}, s.style),
          };
        }
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
  public generateCytoscapeJSON(): IRenderJSON {
    const descriptor = this.descriptor;
    const graph = this.graph;
    const elesHasPosition: string[] = [];
    const elesNoPosition: string[] = [];

    // Copy the style from descriptor to cytoscape style filed
    const styles = Object.keys(descriptor)
      .map((key) => {
        const s = Object.assign({}, descriptor[key].style);
        delete s.x;
        delete s.y;
        return { selector: descriptor[key].selector, style: s };
      })
      .filter((s) => Object.keys(s.style).length > 0);

    // Add node and edge information to the JSON
    let needLayout = false;
    // All the nodes
    const nodes =
      Object.keys(graph.nodes)
        .map((id) => graph.nodes[id])
        .map((n) => {
          const i = {
            data: {
              id: n.id,
              img: (n.type === NodeType.Port) ?
                "static/ports/up.png" : undefined,
              kind: (n.type === NodeType.Port) ?
                n.properties.kind : undefined,
              direction: (n.type === NodeType.Port) ?
                n.properties.direction : undefined,
              properties: n.properties,
              label: this.generateNodeLable(n),
              label_hloc: "center",
              label_vloc: "center",
            },
            classes: this.generateNodeClasses(n),
          } as any;
          const s = descriptor["#" + n.id];
          if (s && s.style.x && s.style.y) {
            // The element has position information
            i.position = { x: s.style.x, y: s.style.y };
            elesHasPosition.push(n.id);
          } else {
            // If any of the node does not have the x/y info, we should set
            // needlayout to true to ask the UI render to layout the diagram.
            needLayout = true;
            elesNoPosition.push(n.id);
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
      elesHasPosition,
      elesNoPosition,
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
      .filter((e) => e.type === EdgeType.Instance2Port
        || e.type === EdgeType.Component2Port)
      .forEach((e) => {
        let from = "";
        let to = "";
        if (e.from.type === NodeType.Port) {
          to = `#${e.from.id}`;
          from = `#${e.to.id}`;
        } else {
          from = `#${e.from.id}`;
          to = `#${e.to.id}`;
        }
        if (!graph[from]) {
          graph[from] = [to];
        } else {
          graph[from].push(to);
        }
      });
    return graph;
  }

  /**
   * Generate the classes fields in cytoscape json of each node.
   * @param node The INode in view descriptor
   */
  private generateNodeClasses(node: INode): string {
    const prop = node.properties;
    switch (node.type) {
      case NodeType.Instance: {
        return [
          node.type,
          prop.type ? `fprime-component-${escapeDot(prop.type)}` : "",
        ].filter((i) => i !== "").join(" ");
      }

      case NodeType.Port: {
        return [
          node.type,
          prop.type ? `fprime-port-${escapeDot(prop.type)}` : "",
          prop.kind ? `fprime-port-${prop.kind}` : "",
          prop.direction ? `fprime-port-${prop.direction}` : "",
        ].filter((i) => i !== "").join(" ");
      }

      case NodeType.component: {
        return [
          node.type,
          prop.type ? `fprime-component-${node.id}` : "",
        ].filter((i) => i !== "").join(" ");
      }

      default:
        return "";
    }
  }

  /**
   * Generate the label of a node.
   * @param node The INode in view descriptor
   */
  private generateNodeLable(node: INode): string {
    switch (node.type) {
      case NodeType.Instance:
        return node.modelID;

      case NodeType.Port:
        return node.modelID;

      case NodeType.component:
        return node.modelID;

      default:
        return "";
    }
  }

}
