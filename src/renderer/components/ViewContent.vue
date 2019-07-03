<template>
  <div
    id="cytoscape"
    :style="{ maxHeight: parentHeight + 'px' }"
    v-resize="onResize"
    @dragover.prevent
    @drop="dropItem($event)"
  ></div>
</template>

<script lang="ts">
import Vue from "vue";
import fprime from "fprime";
import { Route } from "vue-router";
import CyManager from "@/store/CyManager";
import { ViewType } from "../../fprime/FPPModelManagement/FPPModelManager";
import view from "../store/view";
import { IRenderJSON } from "../../fprime/ViewManagement/ViewDescriptor";

export default Vue.extend({
  props: ["offset"],
  data() {
    return {
      parentHeight: 0,
      viewName: "",
    };
  },
  methods: {
    onResize() {
      // FIXME: 40 is the height of the header, 24 is the height of the footer
      // This part need refinement.
      this.parentHeight = window.innerHeight - 40 - 24 - this.offset;
    },
    updateCytoscape() {
      const render = fprime.viewManager.render(this.viewName, view.state.filterPort)!;
      if(render!=null)
        CyManager.startUpdate(this.viewName, render);
    },
    dropItem(event: any) {
      console.log("Drop");
      event.preventDefault();
      const data = event.dataTransfer.getData("text").split("&");
      console.log(data)
      let droptype: string = data[0];
      let dropname: string = data[1];
      console.log(droptype + " " + dropname + " " + this.viewName);
      var res = false;
      if(droptype === ViewType.PortType) {
        res = fprime.viewManager.addPortToComponent(dropname, this.viewName);
      } else if (droptype === ViewType.InstanceCentric) {
        res = fprime.viewManager.addInstanceToTopo(dropname, this.viewName);
      }
      if(res) this.updateContent(this.viewName);
    },
    allowDrop(event: any) {
      event.preventDefault();
    },
    updateContent(name: string, filterPorts?: boolean) {
      console.log("call update content, name: " + name + 
      " filterPorts: " + filterPorts);
      
      var render: IRenderJSON;
      if(filterPorts !== undefined) {
        render = fprime.viewManager.rerender(name, filterPorts);
      } else {
        render = fprime.viewManager.rerender(name, view.state.filterPort);
      }
        CyManager.startUpdate(this.viewName, render);
        CyManager.endUpdate();
    }
  },
  mounted() {
    this.viewName = this.$route.params.viewName;
    CyManager.init(document.getElementById("cytoscape")!);
    this.updateCytoscape();
    // mount updateContent calling from viewlist 
    this.$root.$on('updateContent', (name: string, filterPorts?: boolean) => {
      this.updateContent(name, filterPorts);
    });
  },
  beforeDestroy() {
    CyManager.destroy();
  },
  watch: {
    $route: function(to: Route, from: Route) {
      // Save the current cytoscape json
      fprime.viewManager.updateViewDescriptorFor(
        from.params.viewName,
        CyManager.getDescriptor(),
      );
      this.viewName = to.params.viewName;
      this.updateCytoscape();
    }
  }
});
</script>

<style>
#cytoscape {
  height: 100%;
  width: 100%;
}
</style>
