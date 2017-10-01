import Vue from 'vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
import BootStrap from './css/bootstrap.min.css'
import BootstrapJS from './js/bootstrap.min.js'
import userCSS from './css/style.css'
import outputGroup from './outputGroup.vue'

Vue.use(VueResource)
Vue.use(VueRouter)
const routes = [
  { path: '/', component: outputGroup }
]
const router = new VueRouter({
  routes: routes
})

let app = new Vue({
  router,
  el: '#app',
  data: {
    texts: []
  },
  methods: {
    passChange: function () {
      this.$emit('change')
    }
  }
})

window.APP = app
