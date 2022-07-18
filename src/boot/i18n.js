import Vue from 'vue'
// we import the external package
import VueI18n from 'vue-i18n'

// let's say we have a file in /src/i18n containing the language pack
import messages from 'src/i18n'

// detect default language
import Quasar from 'quasar'
import { LocalStorage } from 'quasar'
import mapLocale from 'src/utils/localeMap'

// we tell Vue to use our Vue package:
Vue.use(VueI18n)

export default ({ app }) => {
  // Set i18n instance on app;
  // We inject it into root component by doing so;
  // new Vue({..., i18n: ... }).$mount(...)
  const lang = LocalStorage.getItem('userPreferredLang')
  app.i18n = new VueI18n({
    locale: lang || mapLocale(Quasar.lang.getLocale()),
    fallbackLocale: 'en',
    messages
  })
}
