<template>
  <div style="height:100%;">
    <cytoscape style="height:100%;" :config="config" :afterCreated="afterCreated" :preConfig="preConfig"></cytoscape>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import coseBilkent from "cytoscape-cose-bilkent";
import automove from "cytoscape-automove";
import fprimes from "fprime";
import jquery from "jquery";
import edgeBendEditing from "cytoscape-edge-bend-editing";
import {Cy_Util} from "./cyUtil";
import {graph} from "./mockGraph";

export default Vue.extend({
  methods: {
    preConfig(cy: any) {
      cy.use(coseBilkent); 
      cy.use(automove);
      edgeBendEditing( cy, jquery ); // register extension
    },
    afterCreated(cy: any) {
      let cy_util = new Cy_Util(cy);
    cy.batch(function(){
        let layout: any = cy.layout({ 
          name: 'cose-bilkent', 
          nodeRepulsion: 1000,
          animate: 'end',
          animationEasing: 'ease-out',
          animationDuration: 0,
          stop: () => {
            for(const comp of Object.keys(graph)){
              cy_util.portMoveWizComp(cy.$(comp), graph[comp].join(","));
              cy_util.portStick2Comp(cy.$(comp), ...graph[comp].map((k) => cy.$(k)));
            }
            for(const comp of Object.keys(graph)){
              cy_util.portMoveBackComp(cy.$(comp), ...graph[comp].map((k) => cy.$(k)));
            }
          },
        });
        layout.options.eles = cy.elements();
        layout.run();
    });
      //(window as any).$ = jquery;
      (window as any).jQuery = jquery;
      (window as any).$ = jquery;
      // let instance: any = cy.edgeBendEditing();
      cy.edgeBendEditing();
    },
  },
  data () {
    return {
      config: fprimes.viewManager.render(this.$route.params.viewName),
    };
  } 
})
</script>
