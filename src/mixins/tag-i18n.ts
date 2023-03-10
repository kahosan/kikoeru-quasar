import { availableLocaleToTagLocale } from 'src/utils/locale-map'
import { defineComponent } from 'vue'

export default defineComponent({
  methods: {
    getLocaleTagName(tag: any, locale: null | string = null) {
      if (!locale)
        locale = this.$i18n.locale

      return tag?.i18n?.[availableLocaleToTagLocale(locale as any)]?.name || tag.name
    },
  },
})
