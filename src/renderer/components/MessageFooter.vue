<template>
  <v-footer app fixed :height="height" style="min-height: 20px">
    <v-btn
      flat
      small
      class="msg-footer-btn"
      :style="{ height: height + 'px' }"
      id="show-panel-output"
      @click="showOutput"
    >
      Output
    </v-btn>
    <v-btn
      flat
      small
      class="msg-footer-btn"
      :style="{ height: height + 'px' }"
      id="show-panel-analysis"
      @click="showAnalysis"
    >
      Analysis
    </v-btn>
    <v-spacer></v-spacer>
    <span class="mr-2 caption">&copy; 2017 Rocket Panda</span>
  </v-footer>
</template>

<script lang="ts">
import Vue from "vue";
import Panel from "@/store/panel";

export default Vue.extend({
  props: ['height'],
  name: "message-footer",
  methods: {
    showOutput() {
      Panel.OutputPanel();
      document.getElementById("msg-output-tab")!.firstElementChild!
        .dispatchEvent(new Event("click"));
    },
    showAnalysis() {
      Panel.AnalysisPanel();
      document.getElementById("msg-analysis-tab")!.firstElementChild!
        .dispatchEvent(new Event("click"));
    }
  }
})
</script>

<style>
.msg-footer-btn {
  text-transform: none;
  margin: 0px;
}
</style>

