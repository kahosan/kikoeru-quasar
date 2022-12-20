<script>
export default {
  data() {
    return {
      lang: this.$i18n.locale,
      langOptions: [
        { value: 'en', label: 'English' },
        { value: 'zh-CN', label: '中文' },
        { value: 'ja', label: '日本語' },
      ],
    }
  },
  watch: {
    lang(lang) {
      this.$i18n.locale = lang
      this.$q.localStorage.set('userPreferredLang', lang)
    },
  },
}
</script>

<template>
  <q-select
    v-model="lang"
    :options="langOptions"
    label="Lang"
    dense
    borderless
    emit-value
    map-options
    options-dense
  />
</template>
