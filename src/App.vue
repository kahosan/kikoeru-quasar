<script>
export default {
  name: 'App',
  data() {
    return {
      running: true,
    }
  },
  computed: {
    fontFamilyClass() {
      if (this.$i18n.locale === 'zh-CN')
        return 'zh-fonts'
      else
        return 'ja-fonts'
    },
  },
  created() {
    this.checkIsRunning()
    // 回收 index.template.html 的加载提示
    document.getElementById('js-loading').hidden = true
  },
  methods: {
    checkIsRunning() {
      this.$axios({
        method: 'get',
        url: '/api/health',
        timeout: 5000, // only wait for 2s
      }).then(() => {
        this.running = true
      }).catch(() => {
        this.running = false
        this.checkIsRunning()
      })
    },
  },
}
</script>

<template>
  <div id="q-app" :class="fontFamilyClass">
    <router-view v-if="running" />
    <div v-if="!running" class="text-center">
      <h3>无法连接服务器</h3>
      <h3>Network Error</h3>

      <h5>请检查你的网络设置</h5>
      <h5>Please check you network settings</h5>
    </div>
  </div>
</template>

<style>
.zh-fonts {
  font-family: -apple-system,
  BlinkMacSystemFont,
  Segoe UI,
  PingFang SC,
  Hiragino Sans GB,
  Microsoft YaHei,
  Helvetica Neue,
  Helvetica,
  Arial,
  sans-serif,
  Apple Color Emoji,
  Segoe UI Emoji,
  Segoe UI Symbol
  !important;
}
.ja-fonts {
  font-family: -apple-system,
  BlinkMacSystemFont,
  Noto Sans JP,
  Segoe UI,
  PingFang SC,
  Hiragino Sans GB,
  Microsoft YaHei,
  Helvetica Neue,
  Helvetica,
  Arial,
  sans-serif,
  Apple Color Emoji,
  Segoe UI Emoji,
  Segoe UI Symbol
  !important;
}
</style>
