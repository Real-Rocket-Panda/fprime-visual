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
import CyManager from "@/store/CyManager";

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
      // If some elements are selected, then clicking on the button will set
      // the color of elemetns to the current color of picker.
      const eles = CyManager.getGrabbed();
      if (this.show == false && eles.length > 0) {
        CyManager.setColor(eles, this.colors.hex);
      } else {
        // Otherwise, open the picker
        this.show = !this.show;
      }
      
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

