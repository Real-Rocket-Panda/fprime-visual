<template>
  <div id="app">
    <v-app>
      <!-- app top toolbar -->
      <v-toolbar app fixed clipped-left flat height="40px"
        :style="{zIndex: 1000}" id="fprime-header-toolbar"
      >
        <v-toolbar-title class="mr-3">FPrime Visual</v-toolbar-title>
        <!-- open button -->
        <v-btn small icon @click="openProject">
          <v-icon>folder_open</v-icon>
        </v-btn>
        <!-- build button -->
        <v-dialog v-model="building" persistent max-width="40">
          <v-btn small icon @click="rebuild" slot="activator">
            <v-icon>play_circle_filled</v-icon>
          </v-btn>
          <v-card width="40" height="40" :style="{padding: '4px 4px'}">
            <v-progress-circular
              indeterminate
              color="primary">
            </v-progress-circular>
          </v-card>
        </v-dialog>
        <!-- save button -->
        <v-btn small icon @click="saveView">
          <v-icon>save</v-icon>
        </v-btn>

        <v-divider vertical></v-divider>
        
        <toolbar-selector :option-list="layoutAlgorithms"></toolbar-selector>
        <color-picker></color-picker>
        <v-btn small icon @click="refresh">
          <v-icon>refresh</v-icon>
        </v-btn>

        <v-divider vertical></v-divider>

        <!-- analysis button -->
        <toolbar-selector
          :option-list="analyzers"
          :on-change="loadAnalysisInfo"
        ></toolbar-selector>
        <v-dialog v-model="analyzing" persistent max-width="40">
          <v-btn small icon @click="invokeAnalyzer" slot="activator">
            <v-icon>insert_chart</v-icon>
          </v-btn>
          <v-card width="40" height="40" :style="{padding: '4px 4px'}">
            <v-progress-circular
              indeterminate
              color="primary">
            </v-progress-circular>
          </v-card>
        </v-dialog>

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
import ToolbarSelector from "./components/ToolbarSelector.vue";
import { remote } from "electron";
import fprime from "fprime";
import panel, { PanelName } from "@/store/panel";
import CyManager from "@/store/CyManager";
import view from "@/store/view";

export default Vue.extend({
  name: "fprime-visual",
  components: {
    ViewList,
    ViewTabs,
    MessageFooter,
    MessagePanel,
    ColorPicker,
    ToolbarSelector
  },
  data() {
    return {
      building: false,
      analyzing: false,
      layoutAlgorithms: fprime.viewManager.LayoutAlgorithms,
      analyzers: fprime.viewManager.Analyzers,
    };
  },
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
  },
  methods: {
    async openProject() {
      const dirs = remote.dialog.showOpenDialog({
        title: "Open a project",
        properties: ["openDirectory"]
      });
      if (dirs) {
        this.building = true;
        await fprime.viewManager.build(dirs[0]);
        // Close all the opening views
        view.CloseAll();
        this.$router.replace("/");
        this.showOutputPanel();
      }
    },
    async rebuild() {
      await fprime.viewManager.rebuild()
      this.showOutputPanel();
    },
    /**
     * Force refresh the current view. All the unsaved changes would be lost.
     */
    refresh() {
      const viewName = this.$route.params.viewName;
      if (viewName) {
        fprime.viewManager.refresh(viewName);
        const render = fprime.viewManager.render(viewName, true)!;
        CyManager.startUpdate(viewName, render.needLayout, render.descriptor);
        CyManager.endUpdate();
      }
    },
    saveView() {
      // TODO: seems not good :(
      fprime.viewManager.saveViewDescriptorFor(
        this.$route.params.viewName,
        CyManager.getDescriptor()
      );
    },
    showOutputPanel() {
      // Hide the progress animation
      this.building = false;
      // Show the output panel
      if (!panel.state.show || panel.state.curPanel !== PanelName.Output) {
        panel.showOutput();
      }
    },
    async invokeAnalyzer() {
      this.analyzing = true;
      await fprime.viewManager.invokeCurrentAnalyzer();
      this.analyzing = false;
      if (!panel.state.show || panel.state.curPanel !== PanelName.Analysis) {
        panel.showAnalysis();
      }
      this.loadAnalysisInfo();
    },
    loadAnalysisInfo() {
      const viewName = this.$route.params.viewName;
      if (!viewName) {
        return;
      }
      CyManager.startUpdate(viewName, false, CyManager.getDescriptor());
      CyManager.endUpdate();
    }
  }
});
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons");
/* Global CSS */
#view-list-nav {
  min-width: 200px;
}

#view-list-nav > .v-navigation-drawer__border {
  cursor: ew-resize;
  width: 2px;
  background-color: rgba(150, 150, 150, 0.12);
}

#fprime-header-toolbar .tooltip {
  height: 48px;
}
</style>
