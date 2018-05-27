<template>
  <vue-tree-navigation
    :items="items"
    :defaultOpenLevel="1"
    style="width:100%"
  />
</template>

<script lang='ts'>
import Vue from "vue";

export default Vue.extend({
  name: "view-list",
  data() {
    return {
      items: [
        {
          name: "Function Views",
          children: [{ name: "Topology1" }]
        },
        {
          name: "Component Views",
          children: [{ name: "Component1" }, { name: "Component2" }]
        },
        {
          name: "Instance Centric Views",
          children: [
            { name: "Instance1" },
            { name: "Instance2" },
            { name: "Instance3" }
          ]
        }
      ]
    };
  }
});
</script>

<style>
.NavigationLevel__children > li:hover,
.NavigationLevel__parent:hover {
  color: #757575;
}
</style>
