<template>
  <div style="height:100%;">
    <cytoscape
      style="height:100%;"
      :preConfig="initCytoscape"
    ></cytoscape>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import coseBilkent from "cytoscape-cose-bilkent";
import automove from "rp-automove";
import fprimes from "fprime";
import jquery from "jquery";
import edgeBendEditing from "cytoscape-edge-bend-editing";
import CyManager from "./CyManager";
import { Route } from "vue-router";
import nodeResize from "rp-cytoscape-node-resize";
import konva from "konva";

export default Vue.extend({
  methods: {
    initCytoscape(cy: any) {
      if (!CyManager.initialized) {
        CyManager.initialized = true;
        cy.use(coseBilkent);
        cy.use(automove);
        edgeBendEditing(cy, jquery); // register extension
        nodeResize( cy, jquery, konva ); // register extension
      }
    },
    updateCytoscape(cy: any) {
      // Update the config
      cy.json(this.config);

      CyManager.setCy(cy);
      CyManager.setLayoutConfig(fprimes.viewManager.getDefaultAutoLayoutConfig());
      CyManager.setGraph(fprimes.viewManager.getSimpleGraphFor(this.name));
      // Update layout
      if (this.render!.needLayout) {
        CyManager.applyAutoLayout();
      } else {
        CyManager.defaultLayout();
      }

      // use resize
      CyManager.resize();
    }
  },
  data() {
    const name = this.$route.params.viewName;
    const render = fprimes.viewManager.render(name);
    return {
      name,
      render,
      config: render!.descriptor,
    };
  },
  mounted() {
    (this as any).$cytoscape.instance.then((cy: any) => {
      // Set the config to cytoscape
      this.updateCytoscape(cy);
    });
  },
  beforeDestroy() {
    // Save the current cytoscape json
    fprimes.viewManager.updateViewDescriptorFor(this.name,
      CyManager.returnDescriptor());
    (this as any).$cytoscape.instance.then((cy: any) => {
      cy.destroy();
    });
  },
  watch: {
    $route: function(to: Route, from: Route) {
      // Save the current cytoscape json
      fprimes.viewManager.updateViewDescriptorFor(
        from.params.viewName,
        CyManager.returnDescriptor()
      );

      // update the cytoscape instance with the new config
      (this as any).$cytoscape.instance.then((cy: any) => {
        // Remove all the exisiting elements
        cy.remove(cy.elements());

        // Read the config for the in coming view
        this.name = to.params.viewName;
        this.render = fprimes.viewManager.render(this.name);
        this.config = this.render!.descriptor;
        // Set the config to cytoscape
        this.updateCytoscape(cy);
      });
    }
  },
});
</script>
