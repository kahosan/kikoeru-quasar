const localeMap = {
  // mapping Quasar.lang.getLocale()
  // to the available locales in i18n
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-CN',
  'zh-cn': 'zh-CN',
}

function mapLocale(locale) {
  return localeMap[locale] || locale;
}

export default mapLocale;
