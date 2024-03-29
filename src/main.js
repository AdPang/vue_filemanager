import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'
import 'default-passive-events'

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://192.168.1.7:5006/api/'

// axios.interceptors.response.use(
//   function(response){
//     return response.data
//   },
//   function(error){
//     if(error.response){
//       if(error.response.status === 401){
//         this.$message.error('登陆过期请重新登录！')
//         setToken('')
//         router.push({
//           name: 'login'
//         })
//       }
//     }
//     return Promise.reject(error.response)
//   }
// )

axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
