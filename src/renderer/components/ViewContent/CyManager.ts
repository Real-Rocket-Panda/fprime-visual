
import { Cy_Util } from "./cyUtil";
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

    public setGraph(graph: any): void {
        this.graph = graph;
    }

    /**
     * return the collection of elements that are currently selected by user
     */
    public getGrabbed(): any {
        return this.cy.$(":selected");
    }

    public setColor(eles: any, color: string): void {
        eles.style({ "background-color": color });
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
                nodeRepulsion: 1000,
                animate: "end",
                animationEasing: "ease-out",
                animationDuration: 0,
                stop: () => {
                    this.defaultLayout();
                },
            });
            layout.options.eles = this.cy.elements();
            layout.run();
        });
    }

    public defaultLayout(): void {
        this.stickPort();
        this.movebackPort();
    }

    public selectedChangeColor(): void {
        this.cy.elements().on("selected", (event: any) => {
            console.log(123);
        });
    }

    private stickPort(): void {
        for (const comp of Object.keys(this.graph)) {
            this.cy_util.portMoveWizComp(this.cy.$(comp),
                this.graph[comp].join(","));
            this.cy_util.portStick2Comp(
                this.cy.$(comp),
                ...this.graph[comp].map((k: any) => this.cy.$(k)),
            );
        }
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

export default {
    CyManager: new CyManager(),
};
