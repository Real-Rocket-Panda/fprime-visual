<template>
  <div id="app">
    <v-app>
      <!-- app top toolbar -->
      <v-toolbar app fixed clipped-left flat height="40px">
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
      </v-toolbar>
      
      <v-navigation-drawer app fixed permanent clipped width="225">
        <view-list></view-list>
      </v-navigation-drawer>
      
      <!-- app main content -->
      <v-content>
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

export default Vue.extend({
  name: "fprime-visual",
  components: { ViewList, ViewTabs, MessageFooter, MessagePanel },
});
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons");
/* Global CSS */
</style>
