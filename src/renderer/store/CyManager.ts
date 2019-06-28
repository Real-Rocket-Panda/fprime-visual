import cytoscape, { EventObject } from "cytoscape";
import { NodeSingular, ElementDefinition, NodeCollection } from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import nodeResize from "rp-cytoscape-node-resize";
import dagre from "cytoscape-dagre";
import cola from "cytoscape-cola";
import klay from "cytoscape-klay";
import edgehandles from "cytoscape-edgehandles";
import konva from "konva";
import jquery from "jquery";
import automove from "rp-automove";
import { CyUtil } from "@/store/CyUtil";
import fprime from "fprime";
import Tippy from "tippy.js";
import popper from "cytoscape-popper";
import { IRenderJSON } from "fprime/ViewManagement/ViewDescriptor";
cytoscape.use(coseBilkent);
cytoscape.use(cola);
cytoscape.use( klay );
cytoscape.use(automove);
nodeResize(cytoscape, jquery, konva);
cytoscape.use(dagre);
cytoscape.use(popper);
cytoscape.use(edgehandles);

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
      this.tippyIns.forEach((t: any) => t.destroy());
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
  public startUpdate(viewName: string, render: IRenderJSON) {
    this.viewName = viewName;
    // Hide the viewport for usability concern
    this.container!.style.visibility = "hidden";
    // Cleanup the system
    this.cleanup();
    this.cy!.remove(this.cy!.elements());
    // Dump the new config data to cytoscape.
    try {
      this.cy!.json(render.descriptor);
    } catch (e) {
      this.cy!.remove(this.cy!.elements());
      fprime.viewManager.appendOutput(
        "Error: fail to render cytoscape graph,\n" + e);
      return;
    }
    // Resize the view port to get correct pan and zoom.
    this.cy!.resize();
    this.batch = () => {
      if (render.needLayout) {
        const layoutConfig = fprime.viewManager.getCurrentAutoLayoutConfig();
        let layoutOption = {
          name: layoutConfig.Name,
          stop: () => {
            this.placeAllPort();
            this.commonFuncEntries();
            this.cy!.fit(undefined, 10);
            // Show the viewport again
            this.container!.style.visibility = "visible";
          },
        };
        layoutOption = Object.assign(layoutOption,
          layoutConfig.Parameters);
        let collection = this.cy!.collection();
        if (render.elesHasPosition.length === 0 ||
          render.elesNoPosition.length === 0) {
          const plain: ElementDefinition[] = [];
          this.cy!.nodes(".fprime-instance")
            .forEach((node1: NodeSingular) => {
              collection = collection.add(node1);
              this.cy!.nodes(".fprime-instance")
                .forEach((node2: NodeSingular) => {
                  const intersect = (node1 as any).outgoers(".fprime-port")
                    .outgoers(".fprime-port").outgoers(".fprime-instance")
                    .intersection(node2);
                  if (intersect.length !== 0) {
                    plain.push({
                      group: "edges",
                      data: {
                        id: node1.id() + "-" + node2.id(),
                        source: node1.id(),
                        target: node2.id(),
                      },
                      classes: "component-component",
                    });
                  }
                });
            });
          collection = collection.add(this.cy!.add(plain));
          let layout: any = collection.layout(layoutOption);
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
          let nodes = "#" + render.elesHasPosition.join(",#");
          const bb = this.cy!.nodes(nodes).boundingBox(boundingBoxOpt);
          const newbb = { x1: 0, y1: 0, x2: 0, y2: 0 };
          if ((bb as any).w > (bb as any).h) {
            newbb.x1 = (bb as any).x1;
            newbb.x2 = (bb as any).x2;
            newbb.y1 = (bb as any).y2;
            newbb.y2 = (bb as any).y2 * 2;
          } else {
            newbb.x1 = (bb as any).x2;
            newbb.x2 = (bb as any).x2 * 2;
            newbb.y1 = (bb as any).y1;
            newbb.y2 = (bb as any).y2;
          }

          layoutOption = Object.assign({ boundingBox: newbb }, layoutOption);
          nodes = "#" + render.elesNoPosition.join(",#");
          this.cy!.nodes(nodes).layout(layoutOption).run();
        }
      } else {
        this.commonFuncEntries();
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
    if (this.cy) {
      eles.forEach((el: any) => {
        if (!el.hasClass("fprime-port")) {
          (this.cy!.style() as any)
            .selector("#" + el.id())
            .style({ "background-color": color });
        }
      });
      (this.cy.style() as any).update();
    }
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
        // Adjust port image and label location after change port relative loc.
        this.cyutil!.adjustCompAllPortsLook(node, ports);
      });
  }

  /**
   * Append the analysis style information to the elements. This should write
   * to the node instance directly without changing the overall style. In other
   * words, analysis style information should not be saved to view style.
   */
  public appendAnalysisStyle() {
    this.cy!.batch(() => {
      const styles = fprime.viewManager.getCurrentAnalyzerResult();
      styles.forEach((s) => {
        this.cy!.$(s.selector).style(s.style);
      });
    });
  }


  /**
   *  Entry of the common functions.
   *  Being called by CyManager when initiate the graph.
   */

  private commonFuncEntries(): void {
    this.removeInvisibleEdge();
    this.movebackAllPort();
    this.stickPort();
    this.appendAnalysisStyle();
    this.addTooltips();
    this.showComponentInfo();
    this.enableEgdeHandles();
    fprime.viewManager.updateViewDescriptorFor(this.viewName,
      this.getDescriptor());
  }

/**
 * Remove the extra edges between components and components
 * (Only used for layout)
 */
  private removeInvisibleEdge(): void {
    this.cy!.edges(".component-component").remove();
  }

  /**
   * Place each port at the center of all the instances connected
   * (including the source)
   */
  private placeAllPort(): void {
    this.cy!.nodes(".fprime-port").forEach((p: NodeSingular) => {
      this.cyutil!.placePortCenter(p);
    });
  }

  private movebackAllPort(): void {
    interface IComp2Ports {
      comp: NodeCollection;
      ports: NodeCollection;
    }
    const simpleGraph = fprime.viewManager.getSimpleGraphFor(this.viewName);
    const arr: IComp2Ports[] = [];
    Object.keys(simpleGraph).forEach((c) => {
      const comp = this.cy!.nodes(c);
      const ports = this.cy!.nodes(simpleGraph[c].join(","));
      arr.push({ comp, ports });
    });
    arr.sort((c1, c2) => {
      return this.cyutil!.compDegree(c1.ports)
        - this.cyutil!.compDegree(c2.ports);
    });
    arr.reverse();
    arr.forEach((c2p: IComp2Ports) => {
      const comp = c2p.comp;
      const ports = c2p.ports;
      this.cyutil!.portMoveBackComp(comp, ports);
      // Adjust port image after change port relative loc.
      this.cyutil!.adjustCompAllPortsLook(comp, ports);
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
          (compIns as any).boundingBox(boundingBoxOpt),
        );

        this.cyutil!.positionOutBox(
          portIns.position(),
          (compIns as any).boundingBox(boundingBoxOpt));

        // Adjust port image and label location
        this.cyutil!.adjustPortImg(compIns, portIns);
        this.cyutil!.adjustPortLabel(compIns, portIns);
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
      this.cy!.nodes().filter((node) => {
        return Object.keys(node.data("properties")).length !== 0;
      })
        .map((node, _i, _nodes) => {
          const ref = (node as any).popperRef();
          const tippy = new Tippy(ref, { // tippy options:
            html: (() => {
              const content = document.createElement("div");
              content.innerHTML = this.constructHtml(node.data("properties"));
              return content;
            })(),
            trigger: "manual", // probably want manual mode
            sticky: false,
            duration: [100, 100],
          }).tooltips[0];

          tippy.active = false;

          node.on("mousemove", () => {
            tippy.active = true;
            setTimeout(() => {
              if (tippy.active) {
                tippy.show();
              }
            }, 500);
          });
          node.on("mouseout position", () => {
            tippy.hide();
            tippy.active = false;
          });
          this.cy!.on("pan zoom", () => {
            tippy.hide();
            tippy.active = false;
          });
          return tippy;
        });
  }

  private enableEgdeHandles() {
    if(this.cy) {
      // the default values of each option are outlined below:
      let defaults = {
        preview: true, // whether to show added edges preview before releasing selection
        hoverDelay: 150, // time spent hovering over a target node before it is considered selected
        handleNodes: 'node', // selector/filter function for whether edges can be made from a given node
        snap: false, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
        snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
        snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
        noEdgeEventsInDraw: false, // set events:no to edges during draws, prevents mouseouts on compounds
        disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
        handlePosition: function( node:  any ){
          return 'middle top'; // sets the position of the handle in the format of "X-AXIS Y-AXIS" such as "left top", "middle top"
        },
        handleInDrawMode: false, // whether to show the handle in draw mode
        edgeType: function( sourceNode:  any , targetNode:  any  ){
          // can return 'flat' for flat edges between nodes or 'node' for intermediate node between them
          // returning null/undefined means an edge can't be added between the two nodes
          return 'flat';
        },
        loopAllowed: function( node:  any  ){
          // for the specified node, return whether edges from itself to itself are allowed
          return false;
        },
        nodeLoopOffset: -50, // offset for edgeType: 'node' loops
        nodeParams: function( sourceNode:  any , targetNode:  any  ){
          // for edges between the specified source and target
          // return element object to be passed to cy.add() for intermediary node
          return {};
        },
        edgeParams: function( sourceNode:  any , targetNode:  any , i :  any ){
          // for edges between the specified source and target
          // return element object to be passed to cy.add() for edge
          // NB: i indicates edge index in case of edgeType: 'node'
          return {};
        },
        ghostEdgeParams: function(){
          // return element object to be passed to cy.add() for the ghost edge
          // (default classes are always added for you)
          return {};
        },
        show: function( sourceNode:  any  ){
          // fired when handle is shown
        },
        hide: function( sourceNode :  any ){
          // fired when the handle is hidden
        },
        start: function( sourceNode:  any  ){
          // fired when edgehandles interaction starts (drag on handle)
        },
        complete: function( sourceNode:  any , targetNode:  any , addedEles :  any ){
          // fired when edgehandles is done and elements are added
        },
        stop: function( sourceNode :  any ){
          // fired when edgehandles interaction is stopped (either complete with added edges or incomplete)
        },
        cancel: function( sourceNode:  any , cancelledTargets :  any ){
          // fired when edgehandles are cancelled (incomplete gesture)
        },
        hoverover: function( sourceNode:  any , targetNode:  any  ){
          // fired when a target is hovered
        },
        hoverout: function( sourceNode:  any , targetNode:  any  ){
          // fired when a target isn't hovered anymore
        },
        previewon: function( sourceNode:  any , targetNode:  any , previewEles:  any  ){
          // fired when preview is shown
        },
        previewoff: function( sourceNode:  any , targetNode:  any , previewEles:  any  ){
          // fired when preview is hidden
        },
        drawon: function(){
          // fired when draw mode enabled
        },
        drawoff: function(){
          // fired when draw mode disabled
        }
      };
      var eh = (this.cy! as any).edgehandles(defaults);
    }
  }

  /**
   * This is an empty function in order to be exposed to InfoPanel.vue
   * @param type
   * @param namespace
   */
  public cyShowComponentInfo(type: string, namespace: string, name: string, baseid: string):void{

  }

  /**
   * This function binds each node on the canvas with a click event so that
   * the info panel can show the information of the selected component.
   */
  public showComponentInfo(): void {
    this.cy!.nodes().filter((node) => {
      return Object.keys(node.data("properties")).length !== 0;
    })
        .map((node) => {
        node.on("click", () => {
          const name = node.data().id.split("_")[1];
          const info = node.data("properties");
          const type = info.type;
          const namespace = info.namespace;
          const baseid = info.base_id_window;
          this.cyShowComponentInfo(type, namespace, name, baseid);
          });
      });
  }

  public cyUpdateComponentInfo(compName: string, compNameSpace: string):void{

  }
  private constructHtml(data: any): string {
    let res = "";
    Object.keys(data).map((key) => {
      res = res + ("<big><b>" + key + "</b>" + ":" + data[key] + "<br></big>");
    });
    return res;
  }
}


export default new CyManager();
