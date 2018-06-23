import { BoundingBox12, Position } from "cytoscape";

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

  public portMoveBackComp(comp: cytoscape.NodeCollection,
                          ports: cytoscape.NodeCollection): void {
    ports.forEach((port: cytoscape.NodeSingular) => {
      // get the edge from component to port
      const id: string = "#" + comp.id() + "-" + port.id();
      const edge: any = this.cy.edges(id);

      // get the posotion of intersection between bounding box and the edge
      const intersection: any = this.getEdgeBoxIntesection(
        edge.sourceEndpoint(),
        edge.targetEndpoint(),
        comp.boundingBox({ includeOverlays: false } as any));
      // resposition the port
      port.position(intersection);
    });
  }

  /**
   * Purpose:  Port moves with the component while dragging.
   * @param comp component object that the port belongs to
   * @param ports collection of the ports that connect to the component
   */
  public portMoveWizComp(comp: cytoscape.NodeCollection,
                         ports: cytoscape.NodeCollection): any {
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

  public generateBox(cb: BoundingBox12, pw: number, ph: number): any {
    // TODO: dynamic offset
    const offset = 12;
    const x1: number = cb.x1 - (pw / 2) + offset;
    const x2: number = cb.x2 + (pw / 2) - offset;
    const y1: number = cb.y1 - (ph / 2) + offset;
    const y2: number = cb.y2 + (ph / 2) - offset;
    return {
      x1,
      x2,
      y1,
      y2,
    };
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

    // type = 1: the target point is outside of the box.
    // type = -1: the target point is inside of the box.
    const type = (this.constrain(source.x, box.x1, box.x2) !== source.x &&
      this.constrain(source.y, box.y1, box.y2) !== source.y) ?
      -1 : 1;

    const wid = box.w; // wid of bounding box
    const high = box.h; // height of bounding box
    const ratioLine: number = Math.abs((target.y - source.y) /
      (target.x - source.x));
    const ratioBox: number = Math.abs((box.y2 - box.y1) /
      (box.x2 - box.x1));
    let xOff: number = 0;
    let yOff: number = 0;

    const signy = type * (target.y - source.y) /
      Math.abs(target.y - source.y);
    const signx = type * (target.x - source.x) /
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
