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
          @contextmenu="show($event)"
        >
          <v-list-tile-title v-text="viewitem.name"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
    </v-list>
    <v-menu
              v-model="showMenu"
              :position-x="x"
              :position-y="y"
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

export default Vue.extend({
  name: "view-list",
  data() {
    return { 
      showMenu: false,
      x: 0,
      y: 0,
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
    addNewItem(name: string) {
      alert("add new item to " + name);
    },
    show (e : any) {
      this.showMenu = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    clickMenuItem(name: string) {
      alert("click the menu item " + name);
    }
  },
  mounted() {
    // The following statements add click event listender to the root
    // navigation item of the view types (e.g., "Function View").
    // Clicking on those item should cause the list to toggle.
    const pars = document.getElementsByClassName("NavigationLevel__parent");
    for (let i = 0; i < pars.length; i++) {
      const par = pars[i];
      const item = par.lastElementChild!;
      item.addEventListener("click", function() {
        const toggle = item.previousElementSibling!;
        if (!toggle.classList.contains("NavigationToggle--closed")) {
          item.previousElementSibling!.dispatchEvent(new Event("click"));
        }
      });
    }
  }
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