<template>
  <div style="height:100%;">
    <cytoscape
      style="height:100%;"
      :key="name"
      :config="config"
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
import { Cy_Init } from "./cyInit";
import { Route } from "vue-router/types/router";

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
      let cy_init = new Cy_Init(cy,
        fprimes.viewManager.getSimpleGraphFor(this.name));
      cy_init.afterCreate();

      // (window as any).$ = jquery;
      (window as any).jQuery = jquery;
      (window as any).$ = jquery;

      cy.edgeBendEditing();
    }
  },
  data() {
    return {
      initialized: false,
    };
  },
  computed: {
    name: function() {
      return this.$route.params.viewName;
    },
    config: function() {
      return fprimes.viewManager.render(this.name);
    }
  },
  beforeUpdate() {
    (this as any).$cytoscape.reset();
  },
  beforeRouteEnter(to: Route, from: Route, next: any){
    if(this != undefined){
      fprimes.viewManager.updateViewDescriptorFor(this.name, (this as any).$cy_init.returnDescriptor());
    }
    next();
  }
});
</script>
