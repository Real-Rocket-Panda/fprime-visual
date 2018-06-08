export const graph: Igraph = {
    // "#c1": ["#c1_p1", "#c1_p2"],
    // "#c2": ["#c2_p1"],
    // "#c3": ["#c3_p1", "#c3_p2"],
    // "#c4": ["#c4_p1", "#c4_p2", "#c4_p3"],
    "#c1": ["#c1_p1", "#c1_p2"],
    "#c2": ["#c2_p1"],
    "#c3": ["#c3_p1", "#c3_p2"],
    "#c4": ["#c4_p1"],
};

interface Igraph {
[key: string]: string[];
}
