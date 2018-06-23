import cytoscape, { EventObject } from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import nodeResize from "cytoscape-node-resize";
import konva from "konva";
import jquery from "jquery";
import automove from "rp-automove";
import { CyUtil } from "@/store/CyUtil";
import fprime from "fprime";

cytoscape.use(coseBilkent);
cytoscape.use(automove);
nodeResize(cytoscape, jquery, konva);

class CyManager {

  /**
   * 
   */
  private cy?: cytoscape.Core;

  private cyutil?: CyUtil;

  private viewName: string = "";

  private container?: HTMLElement;

  private automoveRule?: any[];

  private batch: any;

  public get Cy() {
    return this.cy;
  }

  /**
   * 
   * @param container 
   */
  public init(container: HTMLElement) {
    this.container = container;
    this.cy = cytoscape({ container });
    this.cyutil = new CyUtil(this.cy);
    this.resize();
  }

  public destroy() {
    if (this.cy) {
      this.cleanup();
      // I don't know if this would really release the memory :(
      this.cy.destroy();
      this.cy = undefined;
      this.cyutil = undefined;
      this.container = undefined;
    }
  }

  public cleanup() {
    // Destrop automove rule instances
    if (this.automoveRule) {
      this.automoveRule!.forEach((r) => r.destroy());
      this.automoveRule = undefined;
    }
  }

  public startUpdate(viewName: string, needLayout: boolean, config: any) {
    this.viewName = viewName;
    // Hide the viewport for usability concern
    this.container!.style.visibility = "hidden";
    // Cleanup the system
    this.cleanup();
    // Dump the new config data to cytoscape.
    this.cy!.json(config);
    // Resize the view port to get correct pan and zoom.
    this.cy!.resize();
    this.batch = () => {
      if (needLayout) {
        let layout: any = this.cy!.layout({
          name: "cose-bilkent",
          nodeRepulsion: 1000000,
          nodeDimensionsIncludeLabels: true,
          fit: true,
          padding: 10,
          animate: false,
          randomize: true,
          tile: true,
          nodeOverlap: 4,
          stop: () => {
            this.stickPort();
            this.movebackPort();
            // Show the viewport again
            this.container!.style.visibility = "visible";
          },
        } as any);
        layout.run();
        layout = undefined;
      } else {
        this.stickPort();
        // Manually fit the viewport if the view does not need layout.
        this.cy!.fit(undefined, 10);
        // Show the viewport again
        this.container!.style.visibility = "visible";
      }
    };
  }

  public endUpdate() {
    if (this.batch) {
      this.cy!.batch(this.batch);
      this.batch = undefined;
    }
  }

  /**
   * reutrn the json descriptor that the view manager needs
   */
  public getDescriptor(): any {
    if (this.cy) {
      return {
        style: (this.cy!.style() as cytoscape.ElementStylesheet).json(),
        elements: {
          nodes: this.cy!.nodes().map((n) => n.json()),
          edges: this.cy!.edges().map((e) => e.json()),
        },
      };
    }
    return {};
  }

  /**
   * return the collection of elements that are currently selected
   * by user
   */
  public getGrabbed(): any {
    if (this.cy) {
      return this.cy!.$(":selected");
    }
    return [];
  }

  /**
   * set a collection of elements to be a certain color
   * @param eles collection of elements (implicitly of the same type)
   * @param color value of color to change
   */
  public setColor(eles: any, color: string): void {
    eles.style({ "background-color": color });
  }

  /**
   * Enable the plugin nodeResize.
   * Drag-to-resize only applies to the components.
   * further options refer to:
   * https://github.com/iVis-at-Bilkent/cytoscape.js-node-resize
   */
  public resize(): void {
    (this.cy! as any).nodeResize({
      isNoControlsMode: (node: any) => {
        return !node.is(".fprime-instance,.fprime-component");
      },
    });
    (this.cy! as any).on(
      "noderesize.resizeend",
      (_evt: EventObject, _type: any, node: any) => {
        /* type param includes:
        topleft, topcenter, topright, centerright,
        bottomright, bottomcenter, bottomleft, centerleft
        */
       const simpleGraph = fprime.viewManager.getSimpleGraphFor(this.viewName);
       this.cyutil!.portMoveBackComp(
         node,
         this.cy!.$(simpleGraph["#" + node.id()].join(",")),
       );
      });
  }

  private movebackPort(): void {
    const simpleGraph = fprime.viewManager.getSimpleGraphFor(this.viewName);
    Object.keys(simpleGraph).forEach((c) => {
      this.cyutil!.portMoveBackComp(
        this.cy!.$(c),
        this.cy!.$(simpleGraph[c].join(",")),
      );
    });
  }

  private stickPort(): void {
    const simpleGraph = fprime.viewManager.getSimpleGraphFor(this.viewName);
    this.automoveRule = Object.keys(simpleGraph).map((c) => {
      return this.cyutil!.portMoveWizComp(
        this.cy!.$(c),
        this.cy!.$(simpleGraph[c].join(",")),
      );
    });

    Object.keys(simpleGraph).forEach((c) => {
      this.cy!.$(simpleGraph[c].join(",")).on("drag", (e: EventObject) => {
        const portIns = e.target;
        const compIns = this.cy!.$(c);
        this.cyutil!.positionInBox(
          portIns.position(),
          this.cyutil!.generateBox(
            compIns.boundingBox(
              ({ includeOverlays: false } as any),
            ) as cytoscape.BoundingBox12,
            portIns.width(),
            portIns.height(),
          ),
        );

        this.cyutil!.positionOutBox(
          portIns.position(),
          compIns.boundingBox(
            ({ includeOverlays: false } as any),
          ) as cytoscape.BoundingBox12);

      });
    });
  }
}

export default new CyManager();
