import { availableLocaleToTagLocale } from 'src/utils/localeMap'

export default {
  methods: {
    getLocaleTagName(tag, locale = null) {
      if (!locale)
        locale = this.$i18n.locale

      return tag?.i18n?.[availableLocaleToTagLocale(locale)]?.name || tag.name
    },
  },
}
