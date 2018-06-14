<template>
  <div>
    <v-btn icon :style="{color: colors.hex}" @click="changeColor">
      <v-icon>format_color_fill</v-icon>
    </v-btn>
    <div id="chrome-color-picker" :class="{'color-picker-active': show}">
      <chrome-picker v-model="colors"></chrome-picker>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Chrome } from "vue-color";
import CyManager from "@/components/ViewContent/CyManager";

var colors = { hex: '#000000' }

export default Vue.extend({
  components: { 'chrome-picker': Chrome },
  data() {
    return {
      colors,
      show: false,
    }
  },
  methods: {
    changeColor() {
      // If the picker is not shown, just show the color picker
      // Otherwise, set the color
      if (this.show) {
        CyManager.setColor(CyManager.getGrabbed(), this.colors.hex);
      }
      this.show = !this.show;
    },
  }
});
</script>

<style>
#chrome-color-picker {
  position: fixed;
  display: none;
}

#chrome-color-picker.color-picker-active {
  display: block;
}
</style>

