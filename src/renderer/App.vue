<template>
    <div id="app">
        <v-app>
            <!-- app top toolbar -->
            <v-toolbar app fixed clipped-left flat height="40px"
                       :style="{zIndex: 1000}" id="fprime-header-toolbar"
            >
                <v-toolbar-title class="mr-3">FPrime Editor</v-toolbar-title>

                <!-- new project button -->
                <v-btn small icon @click="newProject">
                    <v-icon>create_new_folder</v-icon>
                </v-btn>

                <!-- open button -->
                <v-btn small icon @click="openProject">
                    <v-icon>folder_open</v-icon>
                </v-btn>

                <!-- build button -->
                <v-btn small icon @click="rebuild">
                    <v-icon>play_circle_filled</v-icon>
                </v-btn>

                <!-- save button -->
                <v-btn small icon @click="saveView">
                    <v-icon>color_lens</v-icon>
                </v-btn>

                <!-- write to file button -->
                <v-btn small icon @click="writeToFile">
                    <v-icon>save</v-icon>
                </v-btn>

                <!-- refresh button -->
                <v-btn small icon @click="refresh">
                    <v-icon>refresh</v-icon>
                </v-btn>

                <v-divider vertical></v-divider>

                <!-- analysis button -->
                <v-btn small icon @click="invokeAnalyzer">
                    <v-icon>insert_chart</v-icon>
                </v-btn>
                <toolbar-selector
                        :option-list="analyzers"
                        :on-change="loadAnalysisInfo"
                ></toolbar-selector>

                <v-divider vertical></v-divider>

                <toolbar-selector
                        :option-list="layoutAlgorithms"
                        :on-change="changeLayout"
                ></toolbar-selector>

                <!-- color picker -->
                <color-picker></color-picker>

            </v-toolbar>

            <v-dialog v-model="processBar" persistent max-width="40">
                <v-card width="40" height="40" :style="{padding: '4px 4px'}">
                    <v-progress-circular
                            indeterminate
                            color="primary">
                    </v-progress-circular>
                </v-card>
            </v-dialog>

            <v-navigation-drawer app fixed permanent clipped
                                 width="225" id="view-list-nav"
            >
                <view-list></view-list>
            </v-navigation-drawer>

            <!-- app main content -->
            <v-content id="view-main-content">
                <info-panel id="info-panel"></info-panel>
                <option-floats></option-floats>
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
    import InfoPanel from "./components/InfoPanel.vue";
    import OptionFloats from "./components/OptionFloats.vue";
    import {remote} from "electron";
    import fprime from "fprime";
    import panel, {PanelName} from "@/store/panel";
    import CyManager from "@/store/CyManager";
    import view from "@/store/view";

    export default Vue.extend({
        name: "fprime-editor",
        components: {
            ViewList,
            ViewTabs,
            MessageFooter,
            MessagePanel,
            ColorPicker,
            ToolbarSelector,
            InfoPanel,
            OptionFloats,
        },
        data() {
            return {
                processBar: false,
                layoutAlgorithms: fprime.viewManager.LayoutAlgorithms,
                analyzers: fprime.viewManager.Analyzers,
            };
        },
        /**
         * In mounted, add event listener to enable changing the size of the side
         * drawer.
         */
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
            /**
             * newProject should open a dialog to allow user select a project folder.
             */
            async newProject() {
                /* TODO : Should not actually read file */
                const dirs = remote.dialog.showOpenDialog({
                    title: "Open a project",
                    properties: ["openDirectory"]
                });
                if (dirs) {
                    this.processBar = true;
                    await fprime.viewManager.build(dirs[0]);
                    // Close all the opening views
                    view.CloseAll();
                    this.$router.replace("/");
                    this.showOutputPanel();
                }
            },
            /**
             * openProject should open a dialog to allow user select a project folder.
             */
            async openProject() {
                const dirs = remote.dialog.showOpenDialog({
                    title: "Open a project",
                    properties: ["openDirectory"]
                });
                if (dirs) {
                    this.processBar = true;
                    await fprime.viewManager.build(dirs[0]);
                    // Close all the opening views
                    view.CloseAll();
                    this.$router.replace("/");
                    this.showOutputPanel();
                }
            },
            /**
             * Rebuild the project simply call the build function with the same
             * project path.
             */
            async rebuild() {
                this.processBar = true;
                await fprime.viewManager.rebuild();
                this.showOutputPanel();
                // Refresh the current open view
                const viewName = this.$route.params.viewName;
                if (viewName) {
                    const render = fprime.viewManager.render(viewName, view.state.filterPort)!;
                    CyManager.startUpdate(viewName, render);
                    CyManager.endUpdate();
                }
            },
            /**
             * Refresh would delete the cached view descriptor, reload the default
             * style file, and reload the view from file if any. This would cause
             * losing all the unsaved changes. It is useful when the user changes the
             * style from file and want to reload the view.
             */
            refresh() {
                const viewName = this.$route.params.viewName;
                if (viewName) {
                    fprime.viewManager.refresh(viewName);
                    const render = fprime.viewManager.render(viewName, view.state.filterPort)!;
                    CyManager.startUpdate(viewName, render);
                    CyManager.endUpdate();
                }
            },
            /**
             * Save the view to file
             */
            saveView() {
                // TODO: seems not good :(
                fprime.viewManager.saveViewDescriptorFor(
                    this.$route.params.viewName,
                    CyManager.getDescriptor()
                );
            },
            /**
             * Write FPP model to file
             */
            writeToFile() {
                const dirs = remote.dialog.showOpenDialog({
                    title: "Open a project",
                    properties: ["openDirectory"]
                });
                fprime.viewManager.writeToFile(dirs[0]);
            },
            /**
             * When building the project, the output panel should be open after the
             * compilation is completed.
             */
            showOutputPanel() {
                // Hide the progress animation
                this.processBar = false;
                // Show the output panel
                if (!panel.state.show || panel.state.curPanel !== PanelName.Output) {
                    panel.showOutput();
                }
            },
            /**
             * Invoke the current selected compiler, and load its analysis result.
             */
            async invokeAnalyzer() {
                this.processBar = true;
                await fprime.viewManager.invokeCurrentAnalyzer();
                this.processBar = false;
                if (!panel.state.show || panel.state.curPanel !== PanelName.Analysis) {
                    panel.showAnalysis();
                }
                this.loadAnalysisInfo();
            },
            /**
             * Load the current selected analyzer's result.
             */
            loadAnalysisInfo() {
                const viewName = this.$route.params.viewName;
                if (!viewName) {
                    return;
                }
                CyManager.startUpdate(viewName, {
                    needLayout: false,
                    descriptor: CyManager.getDescriptor(),
                    elesHasPosition: [],
                    elesNoPosition: [],
                });
                CyManager.endUpdate();
            },
            /**
             * Apply the current selected layout algorithm to the current view. This
             * would reset the positions of all the elements.
             */
            changeLayout() {
                const viewName = this.$route.params.viewName;
                if (!viewName) {
                    return;
                }
                CyManager.startUpdate(viewName, {
                    needLayout: true,
                    descriptor: CyManager.getDescriptor(),
                    elesHasPosition: [],
                    elesNoPosition: [],
                });
                CyManager.endUpdate();
            },
        }
        this.loadAnalysisInfo();
      },
      /**
       * Load the current selected analyzer's result.
       */
      loadAnalysisInfo() {
        const viewName = this.$route.params.viewName;
        const viewType = this.$route.params.viewType;
        if (!viewName || !viewType) {
          return;
        }
        CyManager.startUpdate(viewName, {
          viewType: viewType,
          needLayout: false,
          descriptor: CyManager.getDescriptor(),
          elesHasPosition: [],
          elesNoPosition: [],
        });
        CyManager.endUpdate();
      },
      /**
       * Apply the current selected layout algorithm to the current view. This
       * would reset the positions of all the elements.
       */
      changeLayout() {
        const viewName = this.$route.params.viewName;
        const viewType = this.$route.params.viewType;
        if (!viewName || !viewType) {
          return;
        }
        CyManager.startUpdate(viewName, {
          viewType: viewType,
          needLayout: true,
          descriptor: CyManager.getDescriptor(),
          elesHasPosition: [],
          elesNoPosition: [],
        });
        CyManager.endUpdate();
      },
    }
  });

</script>

<style>
    @import url("https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons");
    /* Global CSS */
    #view-list-nav {
        min-width: 200px;
        height: 1px;
        margin: 0px;
    }

    #info-panel {
        position: absolute;
        right: 5px;
        top: 25px;
        min-width: 50px;
        width: 20%;
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
