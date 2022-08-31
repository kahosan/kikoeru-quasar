import { sync } from 'vuex-router-sync'

export default ({ store, router }) => {
  sync(store, router)
}
