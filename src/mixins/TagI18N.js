import {availableLocaleToTagLocale} from "src/utils/localeMap";

export default {
  methods: {
    getLocaleTagName(tag) {
      // tag?.i18n?.[availableLocaleToTagLocale(this.$i18n.locale)]?.name
      if (
        tag.i18n
        && tag.i18n[availableLocaleToTagLocale(this.$i18n.locale)]
        && tag.i18n[availableLocaleToTagLocale(this.$i18n.locale)].name
      ) {
        return tag.i18n[availableLocaleToTagLocale(this.$i18n.locale)].name
      }
      return tag.name
    }
  }
}
