<template>
  <div>
    <cytoscape style="height:500px;" :config="config" :afterCreated="afterCreated" :preConfig="preConfig"></cytoscape>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { GetViewByName } from "@/store";
import coseBilkent from "cytoscape-cose-bilkent";
import automove from "cytoscape-automove";
import fprimes from "fprime";
import jquery from "jquery";
import edgeBendEditing from "cytoscape-edge-bend-editing";
import {Cy_Util} from "@/components/cyUtil";
import {graph} from "@/components/mockGraph";

import $ from "jquery";

export default Vue.extend({
  methods: {
    preConfig(cy: any) {
      cy.use(coseBilkent); 
      cy.use(automove);
      edgeBendEditing( cy, jquery ); // register extension
    },
    afterCreated(cy: any) {
      let cy_util = new Cy_Util(cy);


      for(const comp of Object.keys(graph)){
        cy_util.portMoveWizComp(cy.$(comp), graph[comp].join(","));
        cy_util.portStick2Comp(cy.$(comp), ...graph[comp].map((k) => cy.$(k)));
      }

      //(window as any).$ = jquery;
      (window as any).jQuery = $;
      (window as any).$ = $;
      let instance: any = cy.edgeBendEditing();
    },
  },
  computed: {
    item(): string {
      return GetViewByName(this.$route.params.viewName).diagram;
    }
  },
  data () {
    return {
      config: fprimes.config,
    };
  } 
})
</script>
