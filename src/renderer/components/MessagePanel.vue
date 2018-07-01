<template>
  <div
    class="message-panel"
    :class="{ 'message-panel-active': show }"
    :style="{ bottom: offset + 'px' }"
  >
    <v-tabs :height="25" v-model="curtab">
      <v-tab
        ripple
        id="msg-output-tab"
        :key="output"
        @click="outputPanel"
      >
          <span class="ml-3 mr-3" style="text-transform: none;">Output</span>
      </v-tab>
      <v-tab
        ripple
        id="msg-analysis-tab"
        :key="analysis"
        @click="analysisPanel"
      >
          <span class="ml-3 mr-3" style="text-transform: none;">Analysis</span>
      </v-tab>
      <v-tab-item :key="output">
        <p>{{ compilerOutput }}</p>
      </v-tab-item>
      <v-tab-item :key="analysis">
        <p>This is the analysis panel</p>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import panel, { PanelName } from "@/store/panel";

export default Vue.extend({
  props: ["offset"],
  name: "message-panel",
  methods: {
    outputPanel() {
      this.state.curPanel = PanelName.Output;
    },
    analysisPanel() {
      this.state.curPanel = PanelName.Analysis;
    }
  },
  data() {
    return {
      state: panel.state,
      curtab: 1,
      output: PanelName.Output,
      analysis: PanelName.Analysis,
    };
  },
  computed: {
    show(): boolean {
      return this.state.show;
    },
    compilerOutput(): string {
      return this.state.compilerOutput.content;
    }
  }
});
</script>

<style>
.message-panel {
  display: none;
  height: 250px;
  width: 100%;
  position: fixed;
  box-shadow: 0px -0.5px 1px #bdbdbd;
  background-color: white;
}

.message-panel-active {
  display: block;
  z-index: 1000;
}

.message-panel .v-tabs__content {
  transition: none;
  margin: 8px;
  white-space: pre-wrap;
}

.message-panel .v-tabs__content p {
  overflow: scroll;
  max-height: 220px;
}
</style>
