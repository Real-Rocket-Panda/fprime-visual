import Vue from 'vue'
import WelcomeView from '@/components/WelcomeView.vue'
import { expect } from 'chai'

describe('WelcomeView.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: h => h(WelcomeView)
    }).$mount();

    expect(vm.$el.querySelector('.title')!.textContent).to.contain('Welcome to the Electron-vue + Vuetify template.');
  });
});
