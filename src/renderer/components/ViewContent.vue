<template>
  <div>
    {{ item }}
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { GetViewByName } from "@/store";

export default Vue.extend({
  computed: {
    item(): string {
      return GetViewByName(this.$route.params.viewName).diagram;
    }
  }
})
</script>

