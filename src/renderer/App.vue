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
        <view-tabs></view-tabs>
      </v-content>

      <!-- app footer -->
      <v-footer app fixed height=25 style="min-height: 20px">
        <span class="ml-2 caption">&copy; 2017 Rocket Panda</span>
      </v-footer>
    </v-app>
  </div>
</template>
Í
<script lang='ts'>
import Vue from "vue";
import ViewList from "./components/ViewList.vue";
import ViewTabs from "./components/ViewTabs.vue";

export default Vue.extend({
  name: "fprime-visual",
  components: {ViewList, ViewTabs},
});
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons");
/* Global CSS */
</style>
