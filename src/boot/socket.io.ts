import { boot } from 'quasar/wrappers'
import VueSocketIO from 'vue-3-socket.io'

export default boot(({ app }) => {
  app.use(new VueSocketIO({
    debug: false,
    connection: '',
    options: {
      // @ts-expect-error is work
      autoConnect: false,
      query: {
        auth_token: '',
      },
    },
  }))
})
