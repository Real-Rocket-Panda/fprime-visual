<template>
  <div>
    {{ item }}
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import View from "@/store/view";

export default Vue.extend({
  computed: {
    item(): string {
      return View.GetViewByName(this.$route.params.viewName).diagram;
    }
  }
})
</script>

