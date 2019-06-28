import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.css";
import { sprintf } from "sprintf-js";

import App from "./App.vue";
import router from "./router";

Vue.use(Vuetify);

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

window.console.error = (message?: any, ...optionalParams: any[]) => {
  throw new Error(sprintf(message, ...optionalParams));
};
