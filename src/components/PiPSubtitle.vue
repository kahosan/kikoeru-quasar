<script>
export default {
  name: 'PiPSubtitle',
  props: {
  },
  data() {
    return {
      canvas: null,
      video: null,
      pipWindow: null,
      currentPiPStatus: false,
    }
  },
  computed: {
  },
  watch: {
    /**
     * 用户按了播放器的暂停
     * 字幕也同时暂停
     */
    '$store.state.AudioPlayer.playing': function (playing) {
      // 只有 pip 显示时才跟随播放状态
      if (!this.currentPiPStatus)
        return
      if (playing)
        this.video.play()
      else if (!playing)
        this.video.pause()
    },

    /**
     * 用户调整桌面字幕开关时
     * @param subtitleDisplayMode
     */
    '$store.state.AudioPlayer.subtitleDisplayMode': function (subtitleDisplayMode) {
      if (subtitleDisplayMode === 'pip' && !this.currentPiPStatus)
        this.show()
      else if (subtitleDisplayMode !== 'pip' && this.currentPiPStatus)
        this.hide()
    },

    /**
     * 当前字幕更新时
     * @param text
     */
    '$store.state.AudioPlayer.currentLyric': function (text) {
      this.setSubtitle(text)
      this.video.srcObject.getTracks().forEach(track => track.requestFrame())
    },
  },
  mounted() {
    this.canvas = document.querySelector('#canvas')
    this.video = document.querySelector('#video')

    // 用户按了字幕的暂停，播放器也同时暂停
    this.video.addEventListener('pause', () => {
      this.$store.commit('AudioPlayer/WANT_PAUSE')
    }, true)

    this.video.addEventListener('play', () => {
      this.$store.commit('AudioPlayer/WANT_PLAY')
    }, true)

    // 设置默认 canvas 画布大小
    this.canvas.width = 2 * window.innerWidth
    this.canvas.height = this.canvas.width / 20 * 3

    // 手动绘制第一句字幕
    this.setSubtitle('')

    // 播放
    this.video.srcObject = this.canvas.captureStream(0)

    // pip 启动成功
    addEventListener('enterpictureinpicture', (event) => {
      this.currentPiPStatus = true
      this.$store.commit('AudioPlayer/SET_SUBTITLE_DISPLAY_MODE', 'pip')

      this.pipWindow = event.pictureInPictureWindow
      this.pipWindow.onresize = this.onPipWindowResize.bind(this)
      this.onPipWindowResize()
    }, false)

    // 用户主动关闭 pip
    addEventListener('leavepictureinpicture', () => {
      this.currentPiPStatus = false
      this.$store.commit('AudioPlayer/SET_SUBTITLE_DISPLAY_MODE', 'in-app')
      this.pipWindow.onresize = null
    }, false)
  },
  methods: {
    onPipWindowResize() {
      this.canvas.width = 2 * this.pipWindow.width
      this.canvas.height = 2 * this.pipWindow.height
      this.setSubtitle(this.$store.state.AudioPlayer.currentLyric)
      this.video.srcObject.getTracks().forEach(track => track.requestFrame())
    },

    /**
     * 启动 pip
     */
    show() {
      if (this.currentPiPStatus)
        return

      // iOS 15.3 必须先播放，再启动 PiP
      this.video.play()

      // 优先使用新版 api
      if (typeof this.video.requestPictureInPicture === 'function') {
        this.video.requestPictureInPicture().catch((e) => {
          this.video.pause()
          this.$store.commit('AudioPlayer/SET_SUBTITLE_DISPLAY_MODE', 'in-app')
          Sentry.captureException(e)
        })

      // 旧版 iOS 专用 api
      }
      else if ('webkitSetPresentationMode' in this.video && typeof this.video.webkitSetPresentationMode === 'function') {
        this.video.webkitSetPresentationMode('picture-in-picture')
      }
    },

    /**
     * 关闭 pip
     */
    hide() {
      if (!this.currentPiPStatus)
        return

      this.video.pause()

      if (typeof document.exitPictureInPicture === 'function')
        document.exitPictureInPicture()

      else if ('webkitSetPresentationMode' in this.video && typeof this.video.webkitSetPresentationMode === 'function')
        this.video.webkitSetPresentationMode('inline')
    },

    /**
     * 渲染字幕
     * @param text
     */
    setSubtitle(text) {
      text = text.trim()

      const canvas = this.canvas
      const ctx = canvas.getContext('2d')

      // 计算字幕字体大小
      const fontSize = this.canvas.width / 20 // 一行显示 20 个字, 实际 18 个字换行，剩下俩字留白

      // キャンバスをクリアする
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 背景を白色にする
      ctx.fillStyle = 'rgb(255, 255, 255)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // ctx.fillStyle = "rgb(0, 0, 0)";
      // ctx.fillRect(0, 0, 30, canvas.height);

      ctx.font = `bold ${fontSize}px "-apple-system", "BlinkMacSystemFont", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`
      ctx.fillStyle = 'rgb(0, 0, 0)'

      // 单行绘制
      if (text.length <= 18) {
        const textWidth = ctx.measureText(text).width
        const mergeX = (canvas.width - textWidth) / 2
        // const mergeY = canvas.height - fontSize
        const mergeY = (canvas.height - fontSize) / 2.2 + fontSize

        ctx.fillText(text, mergeX, mergeY)
        // console.log(mergeX, mergeY)
      }
      else {
        // 先画第一行
        let textWidth = ctx.measureText(text.slice(0, 19)).width
        let mergeX = (canvas.width - textWidth) / 2
        let mergeY = (canvas.height - fontSize) / 1.6
        ctx.fillText(text.slice(0, 19), mergeX, mergeY)

        // 再画第二行
        textWidth = ctx.measureText(text.slice(19)).width
        mergeX = (canvas.width - textWidth) / 2
        mergeY += fontSize + 0.15 * fontSize
        ctx.fillText(text.slice(19), mergeX, mergeY)
      }
    },
  },
}
</script>

<template>
  <!-- safari 必须让视频显示至少1像素，否则画中画黑屏 -->
  <div style="width: 1px; height: 1px; overflow: hidden; top: 0; left: 0; position: absolute">
    <canvas id="canvas" style="display: none" />
    <video id="video" style="display: inline;" muted playsinline />
  </div>
</template>

<style scoped>

</style>
