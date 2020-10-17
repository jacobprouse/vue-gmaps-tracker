import Vue from 'vue'
import axios from 'axios'
import App from '@/components/App.vue'
import dotenv from 'dotenv'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCog,
  faGlobe,
  faMapMarkedAlt
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add([
  faCog,
  faGlobe,
  faMapMarkedAlt
])
Vue.component('fa-icon', FontAwesomeIcon)

axios.defaults.baseURL = process.env.VUE_APP_SERVER_ORIGIN
dotenv.config()

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
