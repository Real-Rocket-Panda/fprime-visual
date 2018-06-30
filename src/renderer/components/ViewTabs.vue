<template>
  <div style="height:100%">
    <v-tabs
      :height="height"
      hide-slider
      show-arrows
    >
      <v-tab
        v-for="i in items"
        :key="i.id"
        ripple
        router
        :to="getViewRoute(i)"
        class="view-tab-item"
      >
          <span style="text-transform: none;">{{ i.name }}</span>
          <v-btn
            icon
            style="width:16px;height:16px"
            @click.stop.prevent="closeTab"
          >
            <v-icon :data-id="i.name" style="font-size: 15px">close</v-icon>
          </v-btn>
      </v-tab>
    </v-tabs>
    <router-view :offset="height"></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Event } from "electron";
import View from "@/store/view";
import CyManager from "@/store/CyManager";

export default Vue.extend({
  props: ["height"],
  name: "view-tabs",
  methods: {
    getViewRoute(item: any): string {
      return View.GetViewRoute(item);
    },
    /**
     * User clicks the close button to close a tab. The cases:
     *  1. User closes the current tab, should switch to the tab before it.
     *  2. User closes the tab other than the current. Just close it.
     */
    closeTab(event: Event) {
      let clsbtn = (event.target as Element);
      let viewName = clsbtn!.getAttribute("data-id")!;
      let idx = View.CloseViewByName(viewName);
      if (this.items.length === 0) {
        this.$router.replace("/");
      } else if (viewName === this.$route.params.viewName) {
        idx = --idx > 0 ? idx : 0;
        this.$router.replace(this.getViewRoute(this.items[idx]));
      }
    },
  },
  updated() {
    if (this.$route.params.viewName) {
      setTimeout(() => {
        CyManager.endUpdate();
      }, 100);
    }
  },
  data() {
    return { items: View.state.opened };
  }
});
</script>

<style>
.view-tab-item > .v-tabs__item {
  padding-left: 10px;
  padding-right: 0px;
}

.view-tab-item > .v-tabs__item--active {
  background-color: #E0E0E0;
}
</style>

