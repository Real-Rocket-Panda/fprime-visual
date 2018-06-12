<template>
  <div>
    <v-btn icon :style="{color: colors.hex}" @click="show = !show">
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

var colors = { hex: '#000000' }

export default Vue.extend({
  components: { 'chrome-picker': Chrome },
  data() {
    return {
      colors,
      show: false,
    }
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

