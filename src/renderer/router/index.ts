import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  routes: [
    {
      component: require("@/components/WelcomeView").default,
      name: "welcome-view",
      path: "/",
    },
    {
      component: require("@/components/InspireView").default,
      name: "inspire",
      path: "/inspire",
    },
    {
      path: "*",
      redirect: "/",
    },
  ],
});
