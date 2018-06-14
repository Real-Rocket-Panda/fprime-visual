<template>
  <div style="height:100%;">
    <cytoscape
      style="height:100%;"
      :key="name"
      :afterCreated="afterCreated"
      :preConfig="preConfig"
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

export default Vue.extend({
  methods: {
    preConfig(cy: any) {
      if (!this.initialized) {
        this.initialized = true;
        cy.use(coseBilkent);
        cy.use(automove);
        edgeBendEditing(cy, jquery); // register extension
      }
    },
    afterCreated(cy: any) {

      // cytoscape load view
      let view_json: any = fprimes.viewManager.render(this.name);
      cy.json(view_json.descriptor);

      CyManager.setCy(cy);
      CyManager.setGraph(
        fprimes.viewManager.getSimpleGraphFor(this.name)
      );

      if (view_json.needLayout) CyManager.applyAutoLayout();
      else CyManager.defaultLayout();

      // (window as any).$ = jquery;
      (window as any).jQuery = jquery;
      (window as any).$ = jquery;

      cy.edgeBendEditing();
    }
  },
  data() {
    return {
      initialized: false
    };
  },
  computed: {
    name: function() {
      return this.$route.params.viewName;
    },
  },
  beforeUpdate() {
    (this as any).$cytoscape.reset();
  },
  watch: {
    $route: function(_, from: Route) {
      fprimes.viewManager.updateViewDescriptorFor(
        from.params.viewName,
        CyManager.returnDescriptor()
      );
    }
  }
});
</script>
