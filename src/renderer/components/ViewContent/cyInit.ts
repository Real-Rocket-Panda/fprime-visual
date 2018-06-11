
import { Cy_Util } from "./cyUtil";

export class Cy_Init {
    private cy: any;
    private cy_util: Cy_Util;
    private graph: any;

    constructor(cy: any, graph: any) {
        this.cy = cy;
        this.cy_util = new Cy_Util(this.cy);
        this.graph = graph;
    }

    public setGraph(graph: any): void {
        this.graph = graph;
    }

    public afterCreate(): void {
        this.cy.batch(() => {
            const layout: any = this.cy.layout({
                name: "cose-bilkent",
                nodeRepulsion: 1000,
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
