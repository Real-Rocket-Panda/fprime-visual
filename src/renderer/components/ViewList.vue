<template>
  <vue-tree-navigation
    :items="items"
    :defaultOpenLevel="1"
    style="width:100%"
  />
</template>

<script lang='ts'>
import Vue from "vue";
import View from "@/store/view";
import { Route } from "vue-router/types/router";

export default Vue.extend({
  name: "view-list",
  computed: {
    items() {
      return View.GetViewList();
    },
  },
  watch: {
    '$route'(to: Route) {
      if (to.params.viewName) {
        View.LoadViewByName(to.params.viewName);
      }
    }
  },
  mounted() {
    const pars = document.getElementsByClassName("NavigationLevel__parent");
    for (let i = 0; i < pars.length; i++) {
      const par = pars[i];
      const item = par.lastElementChild!;
      item.addEventListener("click", function() {
        const toggle = item.previousElementSibling!;
        if (!toggle.classList.contains("NavigationToggle--closed")) {
          item.previousElementSibling!.dispatchEvent(new Event("click"));
        }
      });
    }
  }
});
</script>

<style>
.NavigationLevel__children > li:hover,
.NavigationLevel__parent:hover {
  color: #757575;
}

.TreeNavigation {
  user-select: none;
}

.NavigationItem > a {
  color: inherit;
  text-decoration: inherit;
  display: inline-block;
}

span.NavigationItem {
  padding-top: 3px;
  padding-bottom: 3px;
}

</style>
