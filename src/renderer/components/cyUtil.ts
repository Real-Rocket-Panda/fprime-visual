export class Cy_Util{
  private cy: any;

  constructor(cy: any) {
    this.cy = cy;
  }

  public portMoveWizComp(comp: any, ...ports: any[]): void {
    console.log(this.cy.$(...ports));
    this.cy.automove({
      nodesMatching: this.cy.$(...ports),
      reposition: "drag",
      dragWith: comp,
    });
  }

  public portStick2Comp(comp: any, ...ports: any[]): any[] {
    let rules: any[] = this.initPortStick2Comp(comp, ...ports);

    comp.on("mousedown", () => {
      rules.forEach((r) => {
        r.destroy();
      });
    });

    comp.on("mouseup", () => {rules = this.initPortStick2Comp(comp, ...ports)});

    return rules;
  }

  private initPortStick2Comp(comp: any, ...ports: any[]): any[] {
    const rules: any[] = new Array();
    ports.forEach((port) => {
      rules.push(
        this.cy.automove({
          nodesMatching: port,
          reposition: this.generateBox(comp, port),
          when: "matching",
        }));
    });

    return rules;
  }


  private generateBox(comp: any, port: any): any {
    const offset = 12;
    let x1: number = comp.boundingBox()["x1"] - port.width() + offset;
    let x2: number = comp.boundingBox()["x2"] + port.width() - offset;
    let y1: number = comp.boundingBox()["y1"] - port.height() + offset;
    let y2: number = comp.boundingBox()["y2"] + port.height() - offset;
    return {
      x1: x1,
      x2: x2,
      y1: y1,
      y2: y2
    };
  }

}
