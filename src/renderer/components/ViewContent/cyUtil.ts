export class Cy_Util {
  private cy: any;

  constructor(cy: any) {
    this.cy = cy;
  }

  /**
   * Adjust the location of port afer auto-layout. Move the port back to the
   * source of the edge that connects the port and the component.
   * @param comp: component object that the port belongs to
   * @param ports: collection of the ports that connect to the component
   */

  public portMoveBackComp(comp: any, ...ports: any[]): void {
    ports.forEach((port) => {
      // get the edge from component to port
      const id: string = "#" + comp.id() + "-" + port.id();
      const edge: any = this.cy.edges(id);

      // get the posotion of intersection between bounding box and the edge
      const intersection: any = this.getEdgeBoxIntesection(
        edge.sourceEndpoint(),
        edge.targetEndpoint(),
        comp.boundingBox());
      // resposition the port
      port.position(intersection);
    });
  }

  /*
    Purpose:  Port moves with the component while dragging.
    Parameters: comp - component object that the port belongs to
                ports - collection of the ports that connect to the component
  */
  public portMoveWizComp(comp: any, ...ports: any[]): void {
    this.cy.automove({
      nodesMatching: this.cy.$(...ports),
      reposition: "drag",
      dragWith: comp,
    });
  }

  /*
    Purpose:  Destroy the rule that port stick to component during dragging.
              Re-apply the rule when the port is freed.
    Parameters: comp - component object that the port belongs to
                ports - collection of the ports that connect to the component
    Return: rule - the updated rule objects
  */
  public portStick2Comp(comp: any, ...ports: any[]): any[] {
    let rules: any[] = this.initPortStick2Comp(comp, ...ports);

    comp.on("grab", () => {
      rules.forEach((r) => {
        r.destroy();
      });
    });

    comp.on("free", () => {
      rules = this.initPortStick2Comp(comp, ...ports);
    });
    return rules;
  }

 /**
  *  Purpose:  Restrict the movement area of port during dragging.
  *            1. Cannot be separate with the component.
  *            2. Cannot enter inside of component.
  *  @param: comp: component object that the port belongs to
  *  @param  ports: collection of the ports that connect to the component
  */
  private initPortStick2Comp(comp: any, ...ports: any[]): any[] {
    const rules: any[] = new Array();
    ports.forEach((port) => {
      // Port not separate with the component
      rules.push(
        this.cy.automove({
          nodesMatching: port,
          reposition: {
            type: "inside", pos: this.generateBox(comp, port),
            when: "matching",
          },
        }));

      // Port cannot go inside of component
      rules.push(
        this.cy.automove({
          nodesMatching: port,
          reposition: {
            type: "outside", pos: comp.boundingBox(),
            when: "matching",
          },
        }));
    });
    return rules;
  }


  private generateBox(comp: any, port: any): any {
    // TODO: dynamic offset
    const offset = 10;
    const x1: number = comp.boundingBox().x1 - (port.width() / 2) + offset;
    const x2: number = comp.boundingBox().x2 + (port.width() / 2) - offset;
    const y1: number = comp.boundingBox().y1 - (port.height() / 2) + offset;
    const y2: number = comp.boundingBox().y2 + (port.height() / 2) - offset;
    return {
      x1: x1,
      x2: x2,
      y1: y1,
      y2: y2
    };
  }

  /*
    Purpose: Calculate the position of intersection between a box
              and the line whose source is the center of the box
    Parameters: source - position of source of the line {x:number, y:number}
                target - position of target of the line {x:number, y:number}
                box - bounding box {x1:number, x2:number, y1:number, y2:number}
    Return: position of intersection {x:number, y:number}
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

    const wid: number = box.x2 - box.x1; // wid of bounding box
    const high: number = box.y2 - box.y1; // height of bounding box
    const ratioLine: number = Math.abs((target.y - source.y) /
      (target.x - source.x));
    const ratioBox: number = Math.abs((box.x2 - box.x1) /
      (box.y2 - box.y1));
    let xOff: number = 0;
    let yOff: number = 0;

    const sign_y = (target.y - source.y) /
      Math.abs(target.y - source.y);
    const sign_x = (target.x - source.x) /
      Math.abs(target.x - source.x);
    if (ratioLine < ratioBox) {  // left or right
      yOff += ratioLine * wid / 2;
      xOff += yOff / ratioLine;
    } else {  // up or down
      xOff += (high / 2) / ratioLine;
      yOff += xOff * ratioLine;
    }

    return { x: source.x + sign_x * xOff, y: source.y + sign_y * yOff };
  }
}
