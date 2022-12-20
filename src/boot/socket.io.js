import { boot } from 'quasar/wrappers'
import VueSocketIO from 'vue-3-socket.io'

export default boot(({ app }) => {
  app.use(new VueSocketIO({
    debug: false,
    connection: '',
    options: {
      autoConnect: false,
      query: {
        auth_token: '',
      },
    },
  }))
})
