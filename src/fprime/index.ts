export default {
  config: {
    autounselectify: true,
    boxSelectionEnabled: false,

    layout: {
      name: "cose-bilkent",
    },

    style: [
      {
        selector: "node",
        style: {
          "background-color": "#11479e",
          "content": "data(id)",
          "text-halign": "right",
          "text-opacity": 0.5,
          "text-valign": "center",
          "shape": "rectangle",
        },
      },

      {
        selector: "edge",
        style: {
          "curve-style": "bezier",
          "line-color": "#9dbaea",
          "target-arrow-color": "#9dbaea",
          "target-arrow-shape": "triangle",
          "width": 4,
        },
      },
    ],

    elements: {
      nodes: [
        { data: { id: "n0" } },
        { data: { id: "n1" } },
        { data: { id: "n2" } },
        { data: { id: "n3" } },
        { data: { id: "n4" } },
        { data: { id: "n5" } },
        { data: { id: "n6" } },
        { data: { id: "n7" } },
        { data: { id: "n8" } },
        { data: { id: "n9" } },
        { data: { id: "n10" } },
        { data: { id: "n11" } },
        { data: { id: "n12" } },
        { data: { id: "n13" } },
        { data: { id: "n14" } },
        { data: { id: "n15" } },
        { data: { id: "n16" } }
      ],
      edges: [
        { data: { source: "n0", target: "n1" } },
        { data: { source: "n1", target: "n2" } },
        { data: { source: "n1", target: "n3" } },
        { data: { source: "n4", target: "n5" } },
        { data: { source: "n4", target: "n6" } },
        { data: { source: "n6", target: "n7" } },
        { data: { source: "n6", target: "n8" } },
        { data: { source: "n8", target: "n9" } },
        { data: { source: "n8", target: "n10" } },
        { data: { source: "n11", target: "n12" } },
        { data: { source: "n12", target: "n13" } },
        { data: { source: "n13", target: "n14" } },
        { data: { source: "n13", target: "n15" } },
      ],
    },
  },
  hello: "Greetings! Electron + Vue + Typescript",
};
