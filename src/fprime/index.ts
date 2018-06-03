export default {
  container: document.getElementById('cy'),
  config: {
    autounselectify: true,
    boxSelectionEnabled: false,

    layout: {
      name: "preset",
    },

    style: [
      {
        selector: "edge",
        style: {
          //"segment-distances": [-70,50],
          //"segment-weights": [0.5,0.7],
          //"curve-style": "segments",
          "line-color": "#9dbaea",
          //"target-arrow-color": "#9dbaea",
          //"target-arrow-shape": "triangle",
          "width": 2,
        },
      },

      {
        selector:".Component",
        style: {
          "width": 100,
          "height": 140,
          "background-color": "#ffa073",
          "content": "data(id)",
          "text-halign": "center",
          "text-opacity": 0.5,
          "text-valign": "center",
          "shape": "rectangle",
        },
      },

      {
        selector: ".Port",
        style: {
          "width": 20,
          "height": 20,
          "background-color": "#62b0ff",
          "content": "data(id)",
          "text-halign": "center",
          "text-opacity": 0.5,
          "text-valign": "top",
          "shape": "rectangle",
        },
      },
    ],

    elements: {
      nodes: [
        { data: { id: "c1" },
          classes: "Component",
          position: { x: 0, y: 100} },

        { data: { id: "c1_p1"},
          classes: "Port",
          position: { x: 60, y: 70}},

        { data: { id: "c1_p2"},
          classes: "Port",
          position: { x: 60, y: 120}},

        { data: { id: "c2"},
          position: { x: 400, y: 240},
          classes: "Component"},

        { data: { id: "c2_p1"},
          classes: "Port",
          position: { x: 340, y: 240}},

        { data: { id: "c3" },
          classes: "Component",
          position: { x: 0, y: 400} },
        { data: { id: "c3_p1"},
          classes: "Port",
          position: { x: 60, y: 370}},

        { data: { id: "c3_p2"},
          classes: "Port",
          position: { x: 60, y: 430}},
      ],
      edges: [
        { data: { id: "e1", source: "c1_p1", target: "c2_p1" } },
        { data: { id: "e2", source: "c1_p2", target: "c3_p1" } },
        { data: { id: "e3", source: "c3_p2", target: "c2_p1" } }
      ],
    },
  },
  hello: "Greetings! Electron + Vue + Typescript",
};

