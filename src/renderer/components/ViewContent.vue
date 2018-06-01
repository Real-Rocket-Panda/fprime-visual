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
      edgeBendEditing( cy, jquery ); // register extension
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

      // edge-bend-editing
      let options: any = {
            // this function specifies the positions of bend points
            bendPositionsFunction: function(ele: any) {
              return ele.data('bendPointPositions');
            },
            // whether to initilize bend points on creation of this extension automatically
            initBendPointsAutomatically: true,
            // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
            undoable: false,
            // the size of bend shape is obtained by multipling width of edge with this parameter
            bendShapeSizeFactor: 6,
            // whether to start the plugin in the enabled state
            enabled: true,
            // title of add bend point menu item (User may need to adjust width of menu items according to length of this option)
            //addBendMenuItemTitle: "Add Bend Point",
            // title of remove bend point menu item (User may need to adjust width of menu items according to length of this option)
            //removeBendMenuItemTitle: "Remove Bend Point"
          };
      let instance: any = cy.edgeBendEditing( options );
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
