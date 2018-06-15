
import { Cy_Util } from "./cyUtil";
import { EventObject } from "cytoscape";
class CyManager {
    private cy: any;
    private cy_util: Cy_Util;
    private graph: any;

    constructor() {
        this.cy = null;
        this.cy_util = new Cy_Util(null);
        this.graph = null;
    }

    public setCy(cy: any) {
        this.cy = cy;
        this.cy_util = new Cy_Util(this.cy);
    }

    public getGraph(): any {
        return this.graph;
    }
    public setGraph(graph: any): void {
        this.graph = graph;
        // TODO: Move this logic to view descriptor
        for (const comp of Object.keys(this.graph)) {
            this.cy.$(comp).data("ports", this.graph[comp]);
            this.graph[comp].forEach((port: any) => {
                this.cy.$(port).data("component", comp);
            });
        }
    }

    /**
     * return the collection of elements that are currently selected by user
     */
    public getGrabbed(): any {
        return this.cy.$(":selected");
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
     * assign the width and height to a collection of elements
     * @param eles collection of elements (implicitly of the same type)
     * @param width the value of width to be set
     * @param height the value of height to be set
     */
    public setSize(eles: any, width: number, height: number): void {
        this.cy.batch(() => {
            eles.array.forEach((node: any) => {
                node.style({
                    width: width,
                    height: height,
                });
                if (node.is(".fprime-instance")) {
                    this.cy_util.portMoveBackComp(node,
                        ...this.graph["#" + node.id()]
                            .map((port: any) => (this.cy.$(port))));
                }
            });
        });
    }


    /**
     * Enable the plugin nodeResize.
     * Drag-to-resize only applies to the components.
     * further options refer to:
     * https://github.com/iVis-at-Bilkent/cytoscape.js-node-resize
     */
    public resize(): void {
        this.cy.nodeResize({
            isNoControlsMode: (node: any) => {
                return !node.is(".fprime-instance");
            },
        });
        this.cy.on("noderesize.resizeend", (e: any, type: any, node: any) => {
            /* type param includes:
            topleft, topcenter, topright, centerright,
            bottomright, bottomcenter, bottomleft, centerleft
            */
            this.cy_util.portMoveBackComp(node,
                ...this.graph["#" + node.id()]
                    .map((port: any) => (this.cy.$(port))));
        });
    }

    /**
     * reutrn the json descriptor that the view manager needs
     */
    public returnDescriptor(): any {
        return {
            style: this.cy.style().json(),
            elements: {
                nodes: (this.cy.nodes() as any[])
                    .map((n) => n.json()),
                edges: (this.cy.edges() as any[])
                    .map((e) => e.json()),
            },
        };
    }

    public applyAutoLayout(): void {
        this.cy.batch(() => {
            const layout: any = this.cy.layout({
                name: "cose-bilkent",
                nodeRepulsion: 1000000,
                animate: "end",
                animationEasing: "ease-out",
                animationDuration: 0,
                stop: () => {
                    this.stickPort();
                    this.movebackPort();
                },
            });
            layout.options.eles = this.cy.elements();
            layout.run();
        });
    }

    public defaultLayout(): void {
        this.cy.batch(() => {
            const layout: any = this.cy.layout({
                name: "preset",
                stop: () => {
                    this.stickPort();
                    this.movebackPort();
                },
            });
            layout.run();
        });
    }

    /**
     * set up the rule for all the nodes that if clicked, then selected
     */
    public clickThenSelect(): void {
        // this.cy.nodes().on("mousedown", (e: any) => {
        //     e.target.select();
        // });
    }


    private stickPort(): void {
        for (const comp of Object.keys(this.graph)) {
            this.cy_util.portMoveWizComp(this.cy.$(comp),
                this.graph[comp].join(","));
        }

        this.cy.nodes(".fprime-port").on("drag", (evt: EventObject) => {
            const portIns = evt.target;
            const compIns = this.cy.$(evt.target.data("component"));
            this.cy_util.positionInBox(
                portIns.position(),
                this.cy_util.generateBox(
                    compIns.boundingBox(),
                    portIns.width(),
                    portIns.height()));

            this.cy_util.positionOutBox(
                portIns.position(),
                compIns.boundingBox());
        });
    }

    private movebackPort(): void {
        for (const comp of Object.keys(this.graph)) {
            this.cy_util.portMoveBackComp(
                this.cy.$(comp),
                ...this.graph[comp].map((k: any) => this.cy.$(k)),
            );
        }
    }
}

export default new CyManager();
