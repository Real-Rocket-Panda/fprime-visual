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
        value="true"
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
  </v-navigation-drawer>
</template>

<script lang='ts'>
import Vue from "vue";
import View from "@/store/view";
import { Route } from "vue-router/types/router";
import ViewTabs from "ViewTabs.vue";

export default Vue.extend({
  name: "view-list",
  data() {
    return { 
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
    addNewItem(name: string) {
      View.addNewItem(name);
    },
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
