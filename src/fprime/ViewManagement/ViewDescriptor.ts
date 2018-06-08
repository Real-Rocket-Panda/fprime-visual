/**
 * 
 */
export interface INodeStyle {
  id: string;
  x: number;
  y: number;
  style: { [key: string]: any };
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
  nodes: INodeStyle[];
  edges: IEdgeStyle[];
}

/**
 * 
 */
export interface INode {
  id: string;
  modelID: string;
}

/**
 * 
 */
export interface IEdge {
  id: string;
  modelID: string;
  from: INode;
  to: INode;
}

/**
 * 
 */
export interface IGraph {
  nodes: INode[];
  edges: IEdge[];
}

/**
 * 
 */
export default class ViewDescriptor {

  private styleDescriptor: IStyleDescriptor | null = null;
  private graph: IGraph | null = null;

  public get StyleDescriptor() {
    return this.styleDescriptor;
  }

  public get Graph() {
    return this.graph;
  }

  // public static BuildFrom(model)

}
