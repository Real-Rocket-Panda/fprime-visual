/**
 * 
 */
export interface INodeStyle {
  id: string;
  style: { [key: string]: any };
  x?: number;
  y?: number;
}

/**
 * 
 */
export interface IEdgeStyle {
  id: string;
  style: { [key: string]: any };
}

/**
 * 
 */
export interface IStyleDescriptor {
  nodes: { [id: string]: INodeStyle };
  edges: { [id: string]: IEdgeStyle };
}

export enum NodeType {
  Component = "fprime-component",
  Port = "fprime-port",
}

/**
 * 
 */
export interface INode {
  id: string;
  modelID: string;
  type: NodeType;
}

export enum EdgeType {
  Port2Port = "port-port",
  Component2Port = "component-port",
}

/**
 * 
 */
export interface IEdge {
  id: string;
  modelID: string;
  type: EdgeType;
  from: INode;
  to: INode;
}

/**
 * 
 */
export interface IGraph {
  nodes: { [id: string]: INode };
  edges: { [id: string]: IEdge };
}

/**
 * 
 */
export default class ViewDescriptor {

  public styleDescriptor: IStyleDescriptor;
  public graph: IGraph;

  constructor() {
    this.styleDescriptor = { nodes: {}, edges: {} };
    this.graph = { nodes: {}, edges: {} };
  }

  // public static BuildFrom(model)

}
