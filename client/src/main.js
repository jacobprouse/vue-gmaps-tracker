import Vue from 'vue'
import axios from 'axios'
import App from '@/components/App.vue'
import dotenv from 'dotenv'

axios.defaults.baseURL = process.env.VUE_APP_SERVER_ORIGIN
dotenv.config()

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')