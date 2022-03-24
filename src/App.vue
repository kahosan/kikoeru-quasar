<template>
  <div id="q-app">
    <router-view v-if="running"/>
    <div class="text-center" v-if="!running">
      <h3>无法连接服务器</h3>
      <h3>Network Error</h3>

      <h5>请检查你的网络设置</h5>
      <h5>Please check you network settings</h5>
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
