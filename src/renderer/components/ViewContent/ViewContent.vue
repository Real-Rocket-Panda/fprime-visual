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
import CyManager from "./CyManager";

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
      CyManager.CyManager.setCy(cy);
      CyManager.CyManager.setGraph(
        fprimes.viewManager.getSimpleGraphFor(this.name)
      );

      if (this.needLayout) CyManager.CyManager.applyAutoLayout();
      else CyManager.CyManager.defaultLayout();

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
    config: function() {
      return fprimes.viewManager.render(this.name)!.descriptor;
    },
    needLayout: function() {
      return fprimes.viewManager.render(this.name)!.needLayout;
    }
  },
  beforeUpdate() {
    (this as any).$cytoscape.reset();
  },
  // beforeRouteEnter(to: Route, from: Route, next: any){
  //   if(this != undefined){
  //     fprimes.viewManager.updateViewDescriptorFor(this.name, (this as any).$cy_init.returnDescriptor());
  //   }
  //   next();
  // }
  watch: {
    $route: function() {
      fprimes.viewManager.updateViewDescriptorFor(
        this.name,
        CyManager.CyManager.returnDescriptor()
      );
    }
  }
});
</script>
