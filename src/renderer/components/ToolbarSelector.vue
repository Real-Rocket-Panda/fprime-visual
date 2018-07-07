<template>
  <v-flex sm2 class="fprime-toolbar-selector">
    <v-overflow-btn
      :items="optionList.selections"
      v-model="optionList.selected"
      hide-details
      hide-selected
      dense
      @change="onChangeOrNone"
    ></v-overflow-btn>
  </v-flex>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: ["optionList", "onChange"],
  methods: {
    onChangeOrNone() {
      if (this.onChange) {
        this.onChange();
      }
    }
  }
});
</script>

<style>
#fprime-header-toolbar .v-select__slot {
  height: 40px;
  font-size: 12px;
}

#fprime-header-toolbar label {
  font-size: 12px;
}

#fprime-header-toolbar .v-overflow-btn {
  height: 40px;
}

.fprime-toolbar-selector {
  max-width: 175px !important;
}

.fprime-toolbar-selector input {
  height: 0;
  margin: 0;
  padding: 0;
}

.fprime-toolbar-selector .v-select__selection.v-select__selection--comma {
  white-space: nowrap;
  overflow: hidden;
}
</style>
