import Vue from "vue";
import Router from "vue-router";
import ViewTabs from "@/components/ViewTabs.vue";
import ViewContent from "@/components/ViewContent.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      component: ViewTabs,
      path: "/view/:viewType/:viewName",
      children: [
        { path: "edit", component: ViewContent },
      ],
    },
    // {
    //   component: ViewTabs,
    //   path: "/view/:viewType/:viewName/:action",
    // },
    {
      component: ViewTabs,
      path: "/view",
    },
  ],
});
