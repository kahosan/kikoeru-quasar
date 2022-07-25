const localeMap = {
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-CN',
  'zh-cn': 'zh-CN',
}

export function quasarLocaleToAvailableLocale(locale) {
  // 将 quasar 自动检测出来的 locale
  // 转换为 i18n 实际存在的 locale
  // 适用于 zh-TW -> zh-CN 之类的映射
  return localeMap[locale] || locale;
}

export function availableLocaleToTagLocale (availableLocal) {
  // 前端和后端的 locale 命名方法不一致
  // 通过这个方法，把前端 locale 映射为后端 locale
  switch (availableLocal) {
    case 'zh-CN':
      return 'zh-cn';
    case 'en':
      return 'en-us';
    case 'ja':
      return 'ja-jp';
    default:
      return availableLocal;
  }
}
