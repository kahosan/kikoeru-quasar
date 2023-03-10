// we import the external package
import { createI18n } from 'vue-i18n'

// let's say we have a file in /src/i18n containing the language pack
import messages from 'src/i18n'

// detect default language
import { LocalStorage, Quasar } from 'quasar'
import { quasarLocaleToAvailableLocale } from 'src/utils/locale-map'
import { boot } from 'quasar/wrappers'

// we tell Vue to use our Vue package:

export default boot(({ app }) => {
  // Set i18n instance on app;
  // We inject it into root component by doing so;
  // new Vue({..., i18n: ... }).$mount(...)

  let userPreferredLocale = LocalStorage.getItem('userPreferredLang')
  if (window.navigator.userAgent.startsWith('special-ua-for-prerender-'))
    userPreferredLocale = 'ja'

  const i18n = createI18n({
    locale: userPreferredLocale || quasarLocaleToAvailableLocale(Quasar.lang.getLocale()),
    fallbackLocale: 'en',
    messages,
  })

  app.use(i18n)
})
