import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://10.203.70.215:5006/api/'

axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
