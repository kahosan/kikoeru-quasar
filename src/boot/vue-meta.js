import { boot } from 'quasar/wrappers'
import { VueHeadMixin, createHead } from '@unhead/vue'

// we tell Vue to use our Vue package:
export default boot(({ app }) => {
  app.mixin(VueHeadMixin)
  app.use(createHead())
})
