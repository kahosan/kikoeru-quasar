import { boot } from 'quasar/wrappers'
import { sync } from 'vuex-router-sync'

export default boot(({ store, router }) => {
  sync(store, router)
})
