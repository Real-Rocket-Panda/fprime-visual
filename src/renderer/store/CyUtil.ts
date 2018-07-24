import { BoundingBox12, Position, NodeSingular } from "cytoscape";
const boundingBoxOpt = {
  includeOverlays: false,
  includeEdges: true,
  includeLabels: false,
};
export class CyUtil {

  private cy: cytoscape.Core;

  constructor(cy: cytoscape.Core) {
    this.cy = cy;
  }

  /**
   * Adjust the location of port afer auto-layout. Move the port back to the
   * source of the edge that connects the port and the component.
   * @param comp: component object that the port belongs to
   * @param ports: collection of the ports that connect to the component
   */


  public portMoveBackComp(
    comp: cytoscape.NodeCollection,
    ports: cytoscape.NodeCollection,
  ): void {
    interface IEdge2Porints {
      [key: string]: any;
    }
    const edge2points: IEdge2Porints = {};
    ports.forEach((port: cytoscape.NodeSingular) => {
      let intersection: any;
      if (port.data().direction === "in") {
        // get the edge from component to port
        const id: string = "#" + port.id() + "-" + comp.id();
        const edge: any = this.cy.edges(id);
        // get the posotion of intersection between bounding box and the edge
        intersection = this.getEdgeBoxIntesection(
          // Should reverse the direction
          edge.target().position(),
          edge.source().position(),
          (comp as any).boundingBox(boundingBoxOpt));
      } else {
        // get the edge from component to port
        const id: string = "#" + comp.id() + "-" + port.id();
        const edge: any = this.cy.edges(id);
        // get the posotion of intersection between bounding box and the edge
        intersection = this.getEdgeBoxIntesection(
          edge.source().position(),
          edge.target().position(),
          (comp as any).boundingBox(boundingBoxOpt));
      }
      // resposition the port
      port.position(intersection);
      const edge2 = this.decideEdge(
        (comp as any).boundingBox(boundingBoxOpt),
        intersection);
      if (edge2 in edge2points) {
        edge2points[edge2].push(port);
      } else {
        edge2points[edge2] = [port];
      }
    });

    Object.keys(edge2points).forEach((edge: string) => {
      this.distributePositions(
        (comp as any).boundingBox(boundingBoxOpt),
        edge === "1" || edge === "3",
        edge2points[edge]);
    });
  }

  /**
   * Purpose:  Port moves with the component while dragging.
   * @param comp component object that the port belongs to
   * @param ports collection of the ports that connect to the component
   */
  public portMoveWizComp(
    comp: cytoscape.NodeCollection,
    ports: cytoscape.NodeCollection,
  ): any {
    return (this.cy as any).automove({
      nodesMatching: ports,
      reposition: "drag",
      dragWith: comp,
    });
  }

  public constrain(val: number, min: number, max: number): any {
    return val < min ? min : (val > max ? max : val);
  }

  public positionInBox(pos: Position, bb: BoundingBox12): void {
    pos.x = this.constrain(pos.x, bb.x1, bb.x2);
    pos.y = this.constrain(pos.y, bb.y1, bb.y2);
  }

  public Oconstrain(val: number, min: number, max: number): any {
    const mid = (min + max) / 2;
    if (val > min && val < max) {
      return val > mid ? max : min;
    }
    return val;
  }

  public positionOutBox(pos: Position, bb: BoundingBox12): void {
    const x = this.Oconstrain(pos.x, bb.x1, bb.x2);
    const y = this.Oconstrain(pos.y, bb.y1, bb.y2);

    if (x !== pos.x && y !== pos.y) {
      if (Math.abs(pos.x - x) < Math.abs(pos.y - y)) {
        pos.x = x;
      } else {
        pos.y = y;
      }
    }
  }

  public adjustCompAllPortsLook(
    comp: NodeSingular,
    ports: cytoscape.NodeCollection,
  ): void {
    ports.forEach((p) => {
      this.adjustPortImg(comp, p);
      this.adjustPortLabel(comp, p);
    });
  }

  public adjustPortImg(comp: NodeSingular, port: NodeSingular): void {
    const bb = (comp as any).boundingBox(boundingBoxOpt);
    const pos = port.position();
    const dir = port.data("direction") === "out" ? 1 : -1;
    const edge = this.decideEdge(bb, pos);
    const img = this.decideImgNum(edge, dir);
    switch (img) {
      case 1:
        port.data("img", "static/ports/up.png");
        break;
      case 2:
        port.data("img", "static/ports/right.png");
        break;
      case 3:
        port.data("img", "static/ports/down.png");
        break;
      case 4:
        port.data("img", "static/ports/left.png");
        break;
      default:
        port.data("img", "static/ports/up.png");
        break;
    }
  }


  public adjustPortLabel(comp: NodeSingular, port: NodeSingular): void {
    const bb = (comp as any).boundingBox(boundingBoxOpt);
    const pos = port.position();
    switch (this.decideEdge(bb, pos)) {
      case 1: // up
        port.data("label_vloc", "bottom");
        port.data("label_hloc", "center");
        break;
      case 2: // right
        port.data("label_vloc", "top");
        port.data("label_hloc", "center");
        break;
      case 3: // down
        port.data("label_vloc", "top");
        port.data("label_hloc", "center");
        break;
      case 4: // left
        port.data("label_vloc", "top");
        port.data("label_hloc", "center");
        break;
      default:
        port.data("label_vloc", "center");
        port.data("label_hloc", "center");
        break;
    }
  }

  private distributePositions(
    bb: BoundingBox12,
    horizontal: boolean,
    ports: NodeSingular[],
  ): void {
    const axis = horizontal ? "x" : "y";
    ports.sort((a: NodeSingular, b: NodeSingular) => {
      if (a.position(axis) > b.position(axis)) {
        return 1;
      } else {
        return 0;
      }
    });
    const base = horizontal ? bb.x1 : bb.y1;
    const distance = horizontal ? (bb.x2 - bb.x1) : (bb.y2 - bb.y1);
    const unitDis = distance / (ports.length + 1);
    for (let i = 0; i < ports.length; i++) {
      ports[i].position(axis, (i + 1) * unitDis + base);
    }
  }


  private decideEdge(bb: BoundingBox12, pos: Position): number {
    const float = 0.0001;
    if (pos.y <= bb.y1 + float) {
      return 1;  // up
    } else if (pos.x <= bb.x1 + float) {
      return 4; // right
    } else if (pos.x >= bb.x2 - float) {
      return 2; // down
    } else if (pos.y >= bb.y2 - float) {
      return 3; // top
    }
    return 0;
  }

  private decideImgNum(edge: number, direction = 1): number {
    let res: number;
    if (edge === 1) {
      if (direction === 1) {
        res = 1;
      } else {
        res = 3;
      }
    } else if (edge === 2) {
      if (direction === 1) {
        res = 2;
      } else {
        res = 4;
      }
    } else if (edge === 3) {
      if (direction === 1) {
        res = 3;
      } else {
        res = 1;
      }
    } else {
      if (direction === 1) {
        res = 4;
      } else {
        res = 2;
      }
    }
    return res;
  }


  /**
   * Calculate the position of intersection between a box and the
   * line whose source is the center of the box
   * @param source  position of source of the line {x:number, y:number}
   * @param target position of target of the line {x:number, y:number}
   * @param box bounding box {x1:number, x2:number, y1:number, y2:number}
   * @returns position of intersection {x:number, y:number}
   */
  private getEdgeBoxIntesection(source: any, target: any, box: any): any {
    if (source.x === target.x) { // no ratio. Vertical line.
      return target.y > source.y ?
        ({ x: target.x, y: box.y2 }) :
        ({ x: target.x, y: box.y1 });
    }
    if (source.y === target.y) {// ratio is 0. Horizontal line.
      return target.x > source.x ?
        ({ x: box.x2, y: target.y }) :
        ({ x: box.x1, y: target.y });
    }


    const wid = box.w; // wid of bounding box
    const high = box.h; // height of bounding box
    const ratioLine: number = Math.abs((target.y - source.y) /
      (target.x - source.x));
    const ratioBox: number = Math.abs((box.y2 - box.y1) /
      (box.x2 - box.x1));
    let xOff: number = 0;
    let yOff: number = 0;

    const signy = (target.y - source.y) /
      Math.abs(target.y - source.y);
    const signx = (target.x - source.x) /
      Math.abs(target.x - source.x);

    if (ratioLine < ratioBox) {  // left or right
      yOff += ratioLine * wid / 2;
      xOff += wid / 2;
    } else {  // up or down
      xOff += (high / 2) / ratioLine;
      yOff += high / 2;
    }

    return { x: source.x + signx * xOff, y: source.y + signy * yOff };
  }
}
