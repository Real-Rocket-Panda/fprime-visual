<template>
  <div style="height:100%;">
    <cytoscape style="height:100%;" :config="config" :preConfig="preConfig"></cytoscape>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import coseBilkent from "cytoscape-cose-bilkent";
import fprimes from "fprime";
import View from "@/store/view";

export default Vue.extend({
  methods: {
    preConfig(cytoscape: any) {
      cytoscape.use(coseBilkent);
    },
  },
  computed: {
    item(): string {
      return View.GetViewByName(this.$route.params.viewName).diagram;
    }
  },
  data () {
    return {
      config: fprimes.config,
    };
  } 
})
</script>

