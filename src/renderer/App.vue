<template>
  <div id="app">
    <v-app>
      <!-- app top toolbar -->
      <v-toolbar app fixed clipped-left flat height="40px"
        :style="{zIndex: 1000}"
      >
        <v-toolbar-title class="mr-3">FPrime Visual</v-toolbar-title>
        <v-btn icon>
          <v-icon>play_circle_filled</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>refresh</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>insert_chart</v-icon>
        </v-btn>
        <color-picker></color-picker>
      </v-toolbar>
      
      <v-navigation-drawer app fixed permanent clipped
        width="225" id="view-list-nav"
      >
        <view-list></view-list>
      </v-navigation-drawer>
      
      <!-- app main content -->
      <v-content id="view-main-content">
        <router-view :height="25"></router-view>
        <message-panel :offset="24"></message-panel>
      </v-content>

      <!-- app footer -->
      <message-footer :height="24"></message-footer>
    </v-app>
  </div>
</template>
Í
<script lang='ts'>
import Vue from "vue";
import ViewList from "./components/ViewList.vue";
import ViewTabs from "./components/ViewTabs.vue";
import MessageFooter from "./components/MessageFooter.vue";
import MessagePanel from "./components/MessagePanel.vue";
import ColorPicker from "./components/ColorPicker.vue";

export default Vue.extend({
  name: "fprime-visual",
  components: { ViewList, ViewTabs, MessageFooter, MessagePanel, ColorPicker },
  mounted() {
    let resizing = false;
    let counter = 0;
    const drawer = document.getElementById("view-list-nav")!;
    const border = drawer.lastElementChild!;
    const content = document.getElementById("view-main-content")!;
    border.addEventListener("mousedown", function(e: Event) {
      e.preventDefault();
      e.stopPropagation();
      resizing = true;
      counter = 0;
    });
    document.addEventListener("mousemove", function(e: MouseEvent) {
      if (resizing) {
        if (counter === 0) {
          const width = e.x >= 200 ? e.x : 200;
          drawer.style.width = width + "px";
          content.style.paddingLeft = width + "px";
          counter = 5;
        } else {
          counter--;
        }
      }
    });
    document.addEventListener("mouseup", function(e: MouseEvent) {
      if (resizing) {
        const width = e.x >= 200 ? e.x : 200;
        drawer.style.width = width + "px";
        content.style.paddingLeft = width + "px";

        resizing = false;
      }
    });
  }
});
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons");
/* Global CSS */
#view-list-nav {
  min-width: 200px;
}

#view-list-nav > .navigation-drawer__border {
  cursor: ew-resize;
  width: 2px;
  background-color: rgba(150,150,150,0.12);
}
</style>
