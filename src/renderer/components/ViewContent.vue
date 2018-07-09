<template>
  <div
    id="cytoscape"
    :style="{ maxHeight: parentHeight + 'px' }"
    v-resize="onResize"
  ></div>
</template>

<script lang="ts">
import Vue from "vue";
import fprime from "fprime";
import { Route } from "vue-router";
import CyManager from "@/store/CyManager";

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
      CyManager.startUpdate(this.viewName, render.needLayout,
        render.descriptor);
    }
  },
  mounted() {
    this.viewName = this.$route.params.viewName;
    CyManager.init(document.getElementById("cytoscape")!);
    this.updateCytoscape();
  },
  beforeDestroy() {
    // Save the current cytoscape json
    fprime.viewManager.updateViewDescriptorFor(
      this.viewName,
      CyManager.getDescriptor(),
    );
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
