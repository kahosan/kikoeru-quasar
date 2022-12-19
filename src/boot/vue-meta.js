import { boot } from 'quasar/wrappers';
import { createMetaManager } from "vue-meta";

// we tell Vue to use our Vue package:
export default boot(({ app }) => {
  app.use(createMetaManager())
})