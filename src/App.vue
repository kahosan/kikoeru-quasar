<template>
  <div id="q-app">
    <router-view v-if="running"/>
    <div class="text-center" v-if="!running">
      <h3>网站迁移中！</h3>
      <h3>WebSite upgrading!</h3>

      <h5>预计花费 1-2 小时完成</h5>
      <h5>It will take about 1-2 hours to complete</h5>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      running: true,
    }
  },
  methods: {
    checkIsRunning () {
      this.$axios({
        method: 'get',
        url: '/api/health',
        timeout: 2000 // only wait for 2s
      }).then(() => {
        this.running = true
      }).catch(() => {
        this.running = false
      })
    },
  },
  created () {
    this.checkIsRunning();
    setInterval(() => {
      if (!this.running) {
        this.checkIsRunning();
      }
    }, 2000);
  },
}
</script>
