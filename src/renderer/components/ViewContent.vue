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
      const render = fprime.viewManager.render(this.viewName)!;
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
      if(droptype === ViewType.PortType) {
      var res = fprime.viewManager.addPortToComponent(dropname, this.viewName);
      if(res) this.updateContent(this.viewName);
      } else if (droptype === ViewType.InstanceCentric) {
        fprime.viewManager.addInstanceToTopo(dropname, this.viewName);
      }
    },
    allowDrop(event: any) {
      event.preventDefault();
    },
    updateContent(name: string) {
      const render = fprime.viewManager.rerender(name);
        CyManager.startUpdate(this.viewName, render);
        CyManager.endUpdate();
    }
  },
  mounted() {
    this.viewName = this.$route.params.viewName;
    CyManager.init(document.getElementById("cytoscape")!);
    this.updateCytoscape();
    // mount updateContent calling from viewlist 
    this.$root.$on('updateContent', (name: string) => {
      this.updateContent(name);
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
