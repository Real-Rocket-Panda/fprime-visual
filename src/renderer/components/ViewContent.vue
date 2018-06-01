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

function generateBox(comp: any, port:any): any{
  let offset = 12;
  
  let x1: number = comp.boundingBox()['x1']-port.width()+offset;
  let x2: number = comp.boundingBox()['x2']+port.width()-offset;
  let y1: number = comp.boundingBox()['y1']-port.height()+offset;
  let y2: number = comp.boundingBox()['y2']+port.height()-offset;
  return {x1:x1, x2:x2, y1:y1, y2:y2};
}

function applyAttachRule(cy:any, comp:any, ...ports:any[]):Array<any>{
   let rules: Array<any> = new Array();
   ports.forEach(port => {
      rules.push( 
        cy.automove({
        nodesMatching: port,
        reposition: generateBox(comp, port),
        when: 'matching'
      })
    ); 
   });

  return rules;
}


export default Vue.extend({
  methods: {
    preConfig(cy: any) {
      cy.use(coseBilkent); 
      cy.use(automove);
    },
    afterCreated(cy: any) {
      cy.automove({
        nodesMatching: cy.$("#c1_p1 ,#c1_p2"),
        reposition: "drag",
        dragWith: cy.$("#c1")
      }); 
      cy.automove({
        nodesMatching: cy.$("#c2_p1"),
        reposition: "drag",
        dragWith: cy.$("#c2")
      });   


      //Apply port-attach-to-component rules to C2
      let rules = applyAttachRule(cy, cy.$("#c2"), cy.$("#c2_p1"));
      cy.$("#c2").on("mousedown", function(){
        rules.forEach(r => {
          r.destroy();
        });
      });
      cy.$("#c2").on("mouseup", function(){
        rules = applyAttachRule(cy, cy.$("#c2"),cy.$("#c2_p1"));
      });

      //Apply port-attach-to-component rules to C2
      let rules_ = applyAttachRule(cy, cy.$("#c1"), cy.$("#c1_p1"), cy.$("#c1_p2"));
      cy.$("#c1").on("mousedown", function(){
        rules_.forEach(r => {
          r.destroy();
        });
      });
      cy.$("#c1").on("mouseup", function(){
        rules_ = applyAttachRule(cy, cy.$("#c1"), cy.$("#c1_p1"), cy.$("#c1_p2"));
      });
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
