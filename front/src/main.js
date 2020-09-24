import Vue from 'vue'
import App from './App.vue'

import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

import CryptoJS from "crypto-js"
window.CryptoJS = CryptoJS

import * as bytes from "@/utils/bytes"
window.bytes = bytes

Vue.config.productionTip = false

import File from "@/components/File"
Vue.component("File", File)

Vue.mixin({
  methods: {
    halt() {
      window.location.reload()
    },
  }
})

window.$app = new Vue({
  render: h => h(App),
}).$mount('#app')
