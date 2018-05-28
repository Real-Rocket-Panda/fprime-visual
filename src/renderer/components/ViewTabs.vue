<template>
  <div>
    <v-tabs :height="25">
      <v-tab
        v-for="i in items"
        :key="i.id"
        ripple
        router
        :to="getViewRoute(i)"
      >
          <span>{{ i.name }}</span>
          <v-btn
            icon
            style="width:16px;height:16px"
            @click.stop.prevent="closeTab"
          >
            <v-icon :data-id="i.name" style="font-size: 15px">close</v-icon>
          </v-btn>
      </v-tab>
    </v-tabs>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Event } from "electron";
import { IViewItem, opened, CloseViewByName, GetViewRoute } from "@/store";

export default Vue.extend({
  name: "view-tabs",
  methods: {
    getViewRoute(item: IViewItem): string {
      return GetViewRoute(item);
    },
    /**
     * User clicks the close button to close a tab. The cases:
     *  1. User closes the current tab, should switch to the tab before it.
     *  2. User closes the tab other than the current. Just close it.
     */
    closeTab(event: Event) {
      let viewName = (event.target as Element)
        .firstElementChild!.getAttribute("data-id")!;
      let idx = CloseViewByName(viewName);
      if (this.items.length === 0) {
        this.$router.replace("/view");
      } else if (viewName === this.$route.params.viewName) {
        idx = --idx > 0 ? idx : 0;
        this.$router.replace(this.getViewRoute(this.items[idx]));
      }
    },
  },
  data() {
    return { items: opened };
  }
});
</script>

<style>
</style>

