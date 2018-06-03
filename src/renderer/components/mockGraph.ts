export const graph: Igraph = {
            "#c1": ["#c1_p1", "#c1_p2"],
            "#c2": ["#c2_p1"],
            "#c3": ["#c3_p1", "#c3_p2"],
        };

interface Igraph {
    [key: string]: string[];
}
