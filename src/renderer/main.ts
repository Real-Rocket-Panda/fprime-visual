import Vue from "vue";
import VueTreeNavigation from "vue-tree-navigation";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.css";

import App from "./App.vue";
import router from "./router";

Vue.use(Vuetify);
Vue.use(VueTreeNavigation);

if (!process.env.IS_WEB) {
  Vue.use(require("vue-electron"));
}
Vue.config.productionTip = false;

/* eslint-disable no-new */
const app = new Vue({
  components: { App },
  router,
  template: "<App/>",
});
app.$router.replace("/");
app.$mount("#app");
