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
        timeout: 5000 // only wait for 2s
      }).then(() => {
        this.running = true;
      }).catch(() => {
        this.running = false;
        this.checkIsRunning();
      });
    },
  },
  created () {
    this.checkIsRunning();
    // 回收 index.template.html 的加载提示
    document.getElementById("js-loading").hidden = true;
  },
}
</script>
