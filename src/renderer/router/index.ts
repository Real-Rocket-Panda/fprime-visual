import Vue from "vue";
import Router from "vue-router";
import ViewTabs from "@/components/ViewTabs.vue";
import ViewContent from "@/components/ViewContent/ViewContent.vue";

Vue.use(Router);

export default new Router({

  routes: [
    {
      path: "/",
      component: ViewTabs,
    },
    {
      path: "/view/:viewType/:viewName",
      component: ViewTabs,
      children: [
        {
          path: "edit",
          component: ViewContent,
        },
      ],
    },
   ],
});
