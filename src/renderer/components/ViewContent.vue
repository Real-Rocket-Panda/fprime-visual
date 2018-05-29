<template>
  <div>
    <cytoscape style="height:500px;" :config="config" :preConfig="preConfig"></cytoscape>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { GetViewByName } from "@/store";
import coseBilkent from "cytoscape-cose-bilkent";
import fprimes from "fprime";

export default Vue.extend({
  methods: {
    preConfig(cytoscape: any) {
      cytoscape.use(coseBilkent);
    },
  },
  computed: {
    item(): string {
      return GetViewByName(this.$route.params.viewName).diagram;
    }
  },
  data () {
    return {
      config: fprimes.config,
    };
  } 
})
</script>

