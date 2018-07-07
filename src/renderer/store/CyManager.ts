import cytoscape, { EventObject } from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import nodeResize from "rp-cytoscape-node-resize";
import dagre from "cytoscape-dagre";
import konva from "konva";
import jquery from "jquery";
import automove from "rp-automove";
import { CyUtil } from "@/store/CyUtil";
import fprime from "fprime";
import Tippy from "tippy.js";
import popper from "cytoscape-popper";

cytoscape.use(coseBilkent);
cytoscape.use(automove);
nodeResize(cytoscape, jquery, konva);
cytoscape.use(dagre);
cytoscape.use(popper);

const boundingBoxOpt = {
  includeOverlays: false,
  includeEdges: false,
  includeLabels: false,
  includeNodes: true,
};

class CyManager {

  /**
   * The cytoscape instance.
   */
  private cy?: cytoscape.Core;

  public get Cy() {
    return this.cy;
  }

  /**
   * The class for utils of cytoscape, including move ports back and
   * stick ports
   */
  private cyutil?: CyUtil;

  /**
   * The name of the current view.
   */
  private viewName: string = "";

  /**
   * The container html element <div id="cytoscape"></div>
   */
  private container?: HTMLElement;

  /**
   * The automove rules. Clean up the rules to release memory
   */
  private automoveRule?: any[];

  /**
   * The tooltip instances.
   * Clean up the the tooltip instances to release memory.
   */
  private tippyIns?: any[];

  /**
   * A function of all the operation of rendering a new view.
   */
  private batch: any;

  /**
   * Initialize the cytoscape container and cyutil.
   * @param container The container HTML element <div id="cytoscape"></div>
   */
  public init(container: HTMLElement) {
    this.container = container;
    this.cy = cytoscape({ container });
    this.cyutil = new CyUtil(this.cy);
    // Setup the resize function
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

    // Destroy tooltip instances
    if (this.tippyIns) {
      this.tippyIns.forEach((t: any) =>  t.destroy());
      this.tippyIns = undefined;
    }
  }

  /**
   * Start updating the cytoscape instance. This function will not really
   * execute the updation. See endUpdate
   * @param viewName The name of the view
   * @param needLayout Whether the view needs layout
   * @param config The config for cytoscape.
   */
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
        const layoutConfig = fprime.viewManager.getCurrentAutoLayoutConfig();
        let layoutOption = {
          name: layoutConfig.Name,
          stop: () => {
            this.stickPort();
            this.movebackAllPort();
            this.addTooltips();
            // Show the viewport again
            this.container!.style.visibility = "visible";
          },
        };
        layoutOption = Object.assign(layoutOption,
          layoutConfig.Parameters);

        let layout: any = this.cy!.layout(layoutOption);
        // If the layout is invalid, it should be undefined.
        if (layout) {
          layout.run();
          layout = undefined;
        } else {
          fprime.viewManager.appendOutput(
            `Error: the layout configuration ` +
            `'${layoutConfig.Name}' is invalid.`);
        }
      } else {
        this.stickPort();
        this.movebackAllPort();
        this.addTooltips();
        // Manually fit the viewport if the view does not need layout.
        this.cy!.fit(undefined, 10);
        // Show the viewport again
        this.container!.style.visibility = "visible";
      }
    };
  }

  /**
   * endUpdate will call the batch function where to execute the updating.
   */
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
    eles.forEach((el: any) => {
      (this.cy!.style() as any)
        .selector("#" + el.id())
        .style({ "background-color": color });
    });
    (this.cy!.style() as any).update();
  }

  /**
   * assign the width and height to a collection of elements
   * @param eles collection of elements (implicitly of the same type)
   * @param width the value of width to be set
   * @param height the value of height to be set
   */
  // public setSize(eles: NodeCollection, width: number, height: number): void {
  //   this.cy.batch(() => {
  //       eles.toArray().forEach((node: any) => {
  //           node.style({
  //               width,
  //               height,
  //           });
  //           if (node.is(".fprime-instance")) {
  //               this.cy_util.portMoveBackComp(node,
  //                   ...this.graph["#" + node.id()]
  //                       .map((port: any) => (this.cy.$(port))));
  //           }
  //       });
  //   });
  // }

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
        // Set the size style for this node
        (this.cy!.style() as any)
          .selector("#" + node.id())
          .style({ height: node.style("height") })
          .style({ width: node.style("width") });
        // type param includes:
        // topleft, topcenter, topright, centerright,
        // bottomright, bottomcenter, bottomleft, centerleft
        const simpleGraph = fprime.viewManager.getSimpleGraphFor(this.viewName);
        const ports = this.cy!.$(simpleGraph["#" + node.id()].join(","));
        this.cyutil!.portMoveBackComp(node, ports);
        // Adjust port image after change port relative loc.
        this.cyutil!.adjustCompsAllPortImg(node, ports);
      });
  }

  private movebackAllPort(): void {
    const simpleGraph = fprime.viewManager.getSimpleGraphFor(this.viewName);
    Object.keys(simpleGraph).forEach((c) => {
      const comp = this.cy!.$(c);
      const ports = this.cy!.$(simpleGraph[c].join(","));
      this.cyutil!.portMoveBackComp(comp, ports);
      // Adjust port image after change port relative loc.
      this.cyutil!.adjustCompsAllPortImg(comp, ports);
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
              (boundingBoxOpt as any),
            ) as cytoscape.BoundingBox12,
            portIns.width(),
            portIns.height(),
          ),
        );

        this.cyutil!.positionOutBox(
          portIns.position(),
          compIns.boundingBox(
            (boundingBoxOpt as any),
          ) as cytoscape.BoundingBox12);

        // Adjust port image
        this.cyutil!.adjustPortImg(compIns, portIns);
      });
    });
  }

  /**
   *  Bind tooltip with each of the node instances.
   *  Including both ports and components.
   *  Show when mouse move onto the node, hide when move out.
   */
  private addTooltips(): void {
    this.tippyIns =
      this.cy!.nodes().map((node, i, nodes) => {
        const ref = (node as any).popperRef();
        const tippy = new Tippy(ref, { // tippy options:
          html: (() => {
            const content = document.createElement("div");
            content.innerHTML = "Tippy content";
            return content;
          })(),
          trigger: "manual", // probably want manual mode
          sticky: false,
        }).tooltips[0];

        node.on("mousemove", () => tippy.show());
        node.on("mouseout", () => tippy.hide());
        return tippy;
      });
    }
}

export default new CyManager();
