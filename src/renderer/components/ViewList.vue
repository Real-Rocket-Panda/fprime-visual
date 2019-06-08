<template>
  <v-navigation-drawer 
    value="true"
    stateless
  >
    <v-list>
      <v-list-group
        v-for="(viewtype, typeid) in items"
        :key="typeid"
        no-action
        sub-group
      >
        <template v-slot:activator>
          <v-list-tile>
            <v-list-tile-title>{{viewtype.name}}</v-list-tile-title>
            <v-list-tile-action>
              <v-icon
              @click.stop="addNewItem(viewtype.name)"
              >add</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </template>

        <v-list-tile 
          v-for="(viewitem, viewid) in viewtype.children" 
          :key="viewid" 
          :to="viewitem.route"
          @contextmenu="show(viewitem.name, viewtype.name, $event)"
        >
          <v-list-tile-title v-text="viewitem.name"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
    </v-list>
    <!-- right click menu -->
    <v-menu
      v-model="menu.showMenu"
      :position-x="menu.x"
      :position-y="menu.y"
      absolute
      offset-y
      flat="true"
     >
      <v-list>
        <v-list-tile
          v-for="(menuitem, menuid) in menuitems"
          :key="menuid"
          @click="clickMenuItem(menuitem.title)"
        >
          <v-list-tile-title>{{ menuitem.title }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
    <!-- dialog when instantiate -->
    <v-dialog v-model="instance_dialog.showDialog" scrollable max-width="300px">
      <v-card>
        <v-card-title>Select Component to instantiate</v-card-title>
          <v-divider></v-divider>
          <v-card-text style="height: 300px;">
            <v-radio-group v-model="instance_dialog.selected" column>
              <v-radio 
                v-for = "compitem in componentsItems"
                :key="compitem.id"
                :label="compitem.name"
                :value="compitem.name"
              >
              </v-radio>
            </v-radio-group>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="blue darken-1" flat @click="resetDialog()">Cancel</v-btn>
            <v-btn color="blue darken-1" flat 
            @click="
              instance_dialog.showDialog = false; 
              instance_dialog.clicked = true;
              addNewItem('InstanceCentric View', instance_dialog.selected);
            "
            >OK</v-btn>
          </v-card-actions>
        </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script lang='ts'>
import Vue from "vue";
import View from "@/store/view";
import { Route } from "vue-router/types/router";
import { IViewListItem } from "../../fprime/ViewManagement/ViewManager";
import { ViewType } from "../../fprime/FPPModelManagement/FPPModelManager";

export default Vue.extend({
  name: "view-list",
  data() {
    return { 
      instance_dialog: {
        showDialog: false,
        clicked: false,
        selected: '',
      },
      menu: {
        showMenu: false,
        x: 0,
        y: 0,
        clickedName: "",
        clickedType: "",
      },
      menuitems: [
        { title: 'add' },
        { title: 'delete' }
      ],
      viewlist: View.state.views 
      };
  },
  computed: {
    items() {
      return View.GetViewList();
    },
    componentsItems: function() {
      var components = this.items.find(function(items) {
        return items.name === ViewType.Component;
      })
      return components == undefined ? null : components.children;
    }
  },
  watch: {
    '$route'(to: Route) {
      if (to.params.viewName) {
        View.LoadViewByName(to.params.viewName);
      }
    }
  },
  methods: {
    show (viewitem: string, viewtype: string, e : any) {
      this.menu.showMenu = false
      this.menu.x = e.clientX
      this.menu.y = e.clientY
      this.menu.clickedName = viewitem
      this.menu.clickedType = viewtype
      this.$nextTick(() => {
        this.menu.showMenu = true
      })
    },
    clickMenuItem(menuitem: string) {
      if (menuitem === 'add') {
        View.addNewItem(this.menu.clickedType)
      } else if (menuitem === 'delete') {
        View.removeItem(this.menu.clickedName, this.menu.clickedType)
        // Remove tab
        this.$root.$emit('closeTab', this.menu.clickedName)
      }
    },
    addNewItem(itemType: string, compName?: string) {
      var newitem: IViewListItem;
      if (compName && compName.length > 0) {
        newitem = View.addNewItem(itemType, compName);
      } else if(itemType === ViewType.InstanceCentric) {
        // open dialog
        this.instance_dialog.showDialog = true;
        return;
      } else {
        newitem = View.addNewItem(itemType);
      }
      if(newitem) {
        // open the tab
        View.LoadViewByName(newitem.name);
        const newRoute: string = View.GetViewRoute(newitem);
        this.$router.push(newRoute);
      }
      this.resetDialog();
    },
    resetDialog() {
      this.instance_dialog.showDialog = false;
      this.instance_dialog.clicked = false;
      this.instance_dialog.selected = '';
    }
  },
});
</script>

<style>
.v-list__group__header .v-list__group__header__append-icon,
.v-list__group__header .v-list__group__header__prepend-icon {
  padding: 0 8px;
}
.v-list__group__header .v-list__group__header__prepend-icon {
  min-width: 0px;
}

.v-list__tile__action {
  min-width: 0px;
}

.v-list__group__items--no-action .v-list__tile {
  padding-left: 40px;
}
</style>
