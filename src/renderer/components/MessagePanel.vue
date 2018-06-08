<template>
  <div
    class="message-panel"
    :class="{ 'message-panel-active': show }"
    :style="{ bottom: offset + 'px' }"
  >
    <v-tabs :height="25">
      <v-tab
        ripple
        id="msg-output-tab"
        @click="outputPanel"
      >
          <span class="ml-3 mr-3" style="text-transform: none;">Output</span>
      </v-tab>
      <v-tab
        ripple
        id="msg-analysis-tab"
        @click="analysisPanel"
      >
          <span class="ml-3 mr-3" style="text-transform: none;">Analysis</span>
      </v-tab>
    </v-tabs>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Panel from "@/store/panel";
import { PanelName } from "@/store/panel";

export default Vue.extend({
  props: ["offset"],
  name: "message-panel",
  methods: {
    outputPanel() {
      this.state.curPanel = PanelName.Output;
    },
    analysisPanel() {
      this.state.curPanel = PanelName.Analysis;
    },
  },
  computed: {
    show(): boolean { return this.state.show; },
  },
  data() {
    return { state: Panel.state };
  },
});
</script>

<style>
.message-panel {
  display: none;
  height: 200px;
  width: 100%;
  position: fixed;
  box-shadow: 0px -0.5px 1px #BDBDBD;
  background-color: white;
}

.message-panel-active {
  display: block;
  z-index: 1000;
}
</style>
