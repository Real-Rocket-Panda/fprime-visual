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
            @click.stop.prevent="closeTabConfirm"
          >
            <v-icon :data-id="i.name" style="font-size: 15px">close</v-icon>
          </v-btn>
      </v-tab>
    </v-tabs>
    <router-view :offset="height"></router-view>

    <v-dialog v-model="saveDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="title">
          Do you want to save the changes you made to {{ nameToClose }}?
        </v-card-title>
        <v-card-text>
          Your changes will be lost if you don't save them.
        </v-card-text>
        <v-card-actions>
          <v-btn flat @click.native="dontSave">Don't Save</v-btn>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="cancelClose">Cancel</v-btn>
          <v-btn flat @click.native="saveAndClose">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Event } from "electron";
import View from "@/store/view";
import CyManager from "@/store/CyManager";
import fprime from "fprime";

export default Vue.extend({
  props: ["height"],
  name: "view-tabs",
  methods: {
    getViewRoute(item: any): string {
      return View.GetViewRoute(item);
    },
    closeTabConfirm(event: Event) {
      const clsbtn = (event.target as Element);
      this.nameToClose = clsbtn!.getAttribute("data-id")!;
      if (!this.nameToClose) {
        return;
      }
      let isChanged: boolean;
      if (this.$route.params.viewName === this.nameToClose) {
        isChanged = fprime.viewManager.isViewChanged(this.nameToClose,
          CyManager.getDescriptor());
      } else {
        isChanged = fprime.viewManager.isViewChanged(this.nameToClose);
      }
      if (isChanged) {
        this.saveDialog = true;
      } else {
        this.closeTab(this.nameToClose);
      }
    },
    dontSave() {
      this.saveDialog = false
      this.closeTab(this.nameToClose);
    },
    cancelClose() {
      this.saveDialog = false
    },
    saveAndClose() {
      this.saveDialog = false
      if (this.$route.params.viewName === this.nameToClose) {
        fprime.viewManager.saveViewDescriptorFor(this.nameToClose,
          CyManager.getDescriptor());  
      } else {
        fprime.viewManager.saveViewDescriptorFor(this.nameToClose);
      }
      this.closeTab(this.nameToClose);
    },
    /**
     * User clicks the close button to close a tab. The cases:
     *  1. User closes the current tab, should switch to the tab before it.
     *  2. User closes the tab other than the current. Just close it.
     */
    closeTab(viewName: string) {
      let idx = View.CloseViewByName(viewName);
      if (this.items.length === 0) {
        this.$router.replace("/");
      } else if (viewName === this.$route.params.viewName) {
        idx = --idx > 0 ? idx : 0;
        this.$router.replace(this.getViewRoute(this.items[idx]));
      }
    },
  },
  // This is for closing tabs from ViewList
  mounted: function () {
    this.$root.$on('closeTab', (name: string) => {
      this.closeTab(name);
    });
  },
  updated() {
    if (this.$route.params.viewName) {
      setTimeout(() => {
        CyManager.endUpdate();
      }, 100);
    }
  },
  data() {
    return {
      items: View.state.opened,
      saveDialog: false,
      nameToClose: "",
    };
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

.v-overlay.v-overlay--active,
.v-dialog__content.v-dialog__content--active {
  z-index: 1100 !important;
}

.v-overlay.v-overlay--active {
  display: block;
}

.v-overlay {
  display: none;
}
</style>

