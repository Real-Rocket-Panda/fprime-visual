<template>
  <div>
    <v-btn small icon :style="{color: colors.hex}" @click="changeColor">
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
import CyManager from "@/store/CyManager";

export default Vue.extend({
  components: { 'chrome-picker': Chrome },
  data() {
    return {
      colors: { hex: "#000000" },
      show: false,
    }
  },
  methods: {
    /**
     * If user selects some elements, then click to open the picker, choose
     * a color, and click the button again to close and apply the color.
     */
    changeColor() {
      // The picker is open, apply the color
      if (this.show === true) {
        CyManager.setColor(CyManager.getGrabbed(), this.colors.hex);
      }
      // Picker is closed, select a color
      else {
        const eles = CyManager.getGrabbed();
        if (eles.length > 0) {
          this.colors = { hex: eles.style("background-color") };
        }
      }
      // Switch the panel
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

