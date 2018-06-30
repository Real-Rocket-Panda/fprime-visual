<template>
  <v-flex md2 id="layout-selector">
    <v-overflow-btn
      :items="layouts.algorithms"
      v-model="layouts.selected"
      hide-details
      hide-selected
      dense
    ></v-overflow-btn>
  </v-flex>
</template>

<script lang="ts">
import Vue from "vue";
import fprime from "fprime";

export default Vue.extend({
  data() {
    return {
      layouts: fprime.viewManager.LayoutAlgorithms,
    };
  },
});
</script>

<style>
#fprime-header-toolbar .v-select__slot {
  height: 40px;
  font-size: 14px;
}

#fprime-header-toolbar label {
  font-size: 14px;
}

#fprime-header-toolbar .v-overflow-btn {
  height: 40px;
}

#layout-selector input {
  height: 0;
  margin: 0;
  padding: 0;
}

#layout-selector .v-select__selection.v-select__selection--comma {
  white-space: nowrap;
  overflow: hidden;
}
</style>
