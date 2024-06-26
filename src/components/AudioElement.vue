<script>
import Lyric from 'lrc-file-parser'
import { mapActions, mapState } from 'pinia'
import { useAudioPlayerStore } from 'src/stores/audio-player'
import VuePlyr from 'vue-plyr'
import NotifyMixin from '../mixins/notification'
import 'vue-plyr/dist/vue-plyr.css'

/**
 * 点击 音频文件后， wantPlaying = true，触发 watch(wantPlaying)，但是 duration = 0，什么都不会发生
 * 然后触发 watch(source)，调用player.media.load()，加载完成后调用 canPlay 开始播放
 */
export default {
  name: 'AudioElement',

  components: {
    VuePlyr,
  },

  mixins: [NotifyMixin],

  setup() {
    return {
      audioPlayerStore: useAudioPlayerStore(),
    }
  },

  data() {
    return {
      lrcObj: null,
      lrcAvailable: false,
    }
  },

  computed: {
    player() {
      return this.$refs.plyr.player
    },

    source() {
      // 从 LocalStorage 中读取 token
      const token = this.$q.localStorage.getItem('jwt-token') || ''
      const source = (this.qualityBehavior === 'fluentFirst' && this.currentPlayingFile.streamLowQualityUrl)
        ? this.currentPlayingFile.streamLowQualityUrl
        : this.currentPlayingFile.mediaStreamUrl
      return source ? `${source}?token=${token}` : ''
    },

    ...mapState(useAudioPlayerStore, [
      'playing',
      'playingControlSignal',
      'queue',
      'queueIndex',
      'playMode',
      'muted',
      'volume',
      'sleepTime',
      'sleepMode',
      'rewindSeekTime',
      'forwardSeekTime',
      'rewindSeekMode',
      'forwardSeekMode',
      'lyricContent',
      'metadata',
      'qualityBehavior',
      'currentPlayingFile',
    ]),
  },

  watch: {
    // reference this.findLrcFromRemote() AudioPlayer.localLyric()
    lyricContent(lyricContent) {
      console.info('LRC file loaded')
      this.lrcObj.setLyric(lyricContent)
      if (lyricContent) {
        this.lrcAvailable = true
        this.setLrcPlayStatus(this.playing)
      }
      else {
        this.lrcAvailable = false
        this.SET_CURRENT_LYRIC('')
      }
    },

    playingControlSignal(flag) {
      if (this.player.duration) {
        // 缓冲至可播放状态
        console.info('playingControlSignal: ', flag)
        if (flag === 'wantPlay') {
          this.player.play()
          this.CONSUME_PLAYING_CONTROL_SIGNAL()
        }
        else if (flag === 'wantPause') {
          this.player.pause()
          this.CONSUME_PLAYING_CONTROL_SIGNAL()
        }
      }
      else {
        this.CONSUME_PLAYING_CONTROL_SIGNAL()
      }
    },

    // watch source -> media.load() -> canPlay -> player.play()
    source(url) {
      if (url) {
        console.info('source changed')
        // 加载新音频/视频文件
        this.player.media.load()
        this.findLrcFromRemote()
      }
    },

    muted(flag) {
      // 切换静音状态
      this.player.muted = flag
    },

    volume(val) {
      // 屏蔽非法数值
      if (val < 0 || val > 1)
        return

      // 调节音量
      this.player.volume = val
    },
    rewindSeekMode(rewind) {
      if (rewind) {
        this.player.rewind(this.rewindSeekTime)
        this.SET_REWIND_SEEK_MODE(false)
        this.setLrcPlayStatus(true)
      }
    },
    forwardSeekMode(forward) {
      if (forward) {
        this.player.forward(this.forwardSeekTime)
        this.SET_FORWARD_SEEK_MODE(false)
        this.setLrcPlayStatus(true)
      }
    },
  },

  mounted() {
    // 初始化音量
    this.SET_VOLUME(this.player.volume)
    this.initLrcObj()
    if (this.source)
      this.findLrcFromRemote()

    addEventListener('enterpictureinpicture', () => {
      this.setMediaSessionActionHandler()
      this.updateMediaMetadata()
      this.updatePositionState()
    }, false)

    addEventListener('leavepictureinpicture', () => {
      this.setMediaSessionActionHandler()
      this.updateMediaMetadata()
      this.updatePositionState()
    }, false)
  },

  methods: {
    /**
     * 当 外部暂停（线控暂停、软件切换）、用户控制暂停、seek 时会触发本事件
     * 特别注意：在一些安卓浏览器上，seek 时会触发 onPause，随后会自动恢复播放
     */
    onPause() {
      console.info('onPause')
      this.setLrcPlayStatus(false)
      this.ON_PAUSE()
    },
    /**
     * 当播放器真正开始播放时会触发本事件
     */
    onPlaying() {
      console.info('onPlaying')
      this.setLrcPlayStatus(true)
      this.ON_PLAY()
    },
    /**
     * 当播放器缓冲区空，被迫暂停加载时会触发本事件
     */
    onWaiting() {
      console.info('onWaiting')
      this.setLrcPlayStatus(false)
      this.ON_PLAY()
    },
    ...mapActions(useAudioPlayerStore, [
      'SET_DURATION',
      'SET_CURRENT_TIME',

      'WANT_PAUSE',
      'WANT_PLAY',
      'CONSUME_PLAYING_CONTROL_SIGNAL',

      'ON_PAUSE',
      'ON_PLAY',

      'SET_TRACK',
      'NEXT_TRACK',
      'SET_CURRENT_LYRIC',
      'SET_VOLUME',
      'CLEAR_SLEEP_MODE',
      'SET_REWIND_SEEK_MODE',
      'SET_FORWARD_SEEK_MODE',
      'SET_LYRIC_CONTENT',
    ]),

    onCanplay() {
      console.info('onCanPlay')

      // 缓冲至可播放状态时触发 (只有缓冲至可播放状态, 才能获取媒体文件的播放时长)
      this.SET_DURATION(this.player.duration)

      // 播放
      if (this.player?.currentTime !== this.player.duration)
        this.player.play()

      this.setMediaSessionActionHandler()
      this.updateMediaMetadata()
      this.updatePositionState()
    },

    onTimeupdate() {
      // 安卓必须要靠这种方式才能在后台更新字幕，用于 pip
      if (this.playing && this.audioPlayerStore.subtitleDisplayMode === 'pip')
        this.setLrcPlayStatus(true)

      // 当目前的播放位置已更改时触发
      this.SET_CURRENT_TIME(this.player.currentTime)
      if (this.sleepMode && this.sleepTime) {
        const currentTime = new Date()
        const currentHourStr = currentTime.getHours().toString().padStart(2, '0')
        const currentMinuteStr = currentTime.getMinutes().toString().padStart(2, '0')
        const sleepHourStr = this.sleepTime.match(/\d+/g)[0]
        const sleepMinuteStr = this.sleepTime.match(/\d+/g)[1]
        if (currentHourStr === sleepHourStr && currentMinuteStr === sleepMinuteStr) {
          this.WANT_PAUSE()
          this.CLEAR_SLEEP_MODE()
          // Persist sleep mode settings
          this.$q.sessionStorage.set('sleepTime', null)
          this.$q.sessionStorage.set('sleepMode', false)
        }
      }
    },

    onEnded() {
      console.info('onEnded')
      // 当前文件播放结束时触发
      switch (this.playMode.name) {
        case 'all repeat':
          // 循环播放
          if (this.queueIndex === this.queue.length - 1)
            this.SET_TRACK(0)
          else
            this.NEXT_TRACK()

          break
        case 'repeat once':
          // 单曲循环
          if (this.player) {
            this.player.currentTime = 0
            this.WANT_PLAY()
          }
          break
        case 'shuffle': {
          // 随机播放
          const index = Math.floor(Math.random() * this.queue.length)
          this.SET_TRACK(index)
          if (index === this.queueIndex && this.player)
            this.player.currentTime = 0

          break
        }
        default:
          // 顺序播放
          if (this.queueIndex === this.queue.length - 1)
            this.WANT_PAUSE()
          else
            this.NEXT_TRACK()
      }
    },

    setLrcPlayStatus(playStatus) {
      if (this.lrcAvailable) {
        if (playStatus)
          this.lrcObj.play(this.player.currentTime * 1000)
        else
          this.lrcObj.pause()
      }
    },

    initLrcObj() {
      this.lrcObj = new Lyric({
        onPlay: (line, text) => {
          this.SET_CURRENT_LYRIC(text)
        },
      })
    },

    findLrcFromRemote() {
      this.lrcAvailable = false

      const token = this.$q.localStorage.getItem('jwt-token') || ''
      const fileHash = this.queue[this.queueIndex].hash
      const url = `/api/media/check-lrc/${fileHash}?token=${token}`

      this.$axios.get(url)
        .then((response) => {
          if (response.data.result) {
            // 有lrc歌词文件
            console.info('读入歌词')
            const lrcUrl = `/api/media/stream/${response.data.hash}?token=${token}`
            this.$axios.get(lrcUrl)
              .then((response) => {
                console.info('歌词读入成功')
                this.SET_LYRIC_CONTENT(response.data)
              })
          }
          else {
            // 无歌词文件
            this.SET_LYRIC_CONTENT('')
          }
        })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            if (error.response.status !== 401)
              this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          }
          else {
            this.showErrNotif(error.message || error)
          }
        })
    },

    updatePositionState() {
      console.info('updatePositionState')
      if (!('mediaSession' in navigator))
        return
      if (!('setPositionState' in navigator.mediaSession))
        return

      const duration = this.player.duration
      const currentTime = this.player.currentTime
      navigator.mediaSession.setPositionState({
        duration: Math.max(0, duration || 0),
        playbackRate: 1,
        position: Math.max(0, Math.min(duration || 0, currentTime || 0)),
      })
    },

    updateMediaMetadata() {
      console.info('updateMediaMetadata')
      if (!('mediaSession' in navigator))
        return
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.currentPlayingFile.title,
        album: this.metadata.title,
        artist: `RJ${this.metadata.id}`,
        // TODO blur image
        // artwork: [
        // { src: coverURL(this.metadata, 'sam'), type: 'image/png' },
        // ]
      })
    },

    setMediaSessionActionHandler() {
      console.info('setMediaSessionActionHandler')
      if (!('mediaSession' in navigator))
        return
      navigator.mediaSession.setActionHandler('play', () => this.audioPlayerStore.WANT_PLAY())
      navigator.mediaSession.setActionHandler('pause', () => this.audioPlayerStore.WANT_PAUSE())
      navigator.mediaSession.setActionHandler('seekto', (event) => {
        if (event.fastSeek && ('fastSeek' in this.player)) {
          this.player.fastSeek(event.seekTime)
          return
        }
        if (this.player)
          this.player.currentTime = event.seekTime
      })
      navigator.mediaSession.setActionHandler('nexttrack', () => this.audioPlayerStore.NEXT_TRACK())
      navigator.mediaSession.setActionHandler('previoustrack', () => this.audioPlayerStore.PREVIOUS_TRACK())
      navigator.mediaSession.setActionHandler('seekforward', () => this.audioPlayerStore.SET_FORWARD_SEEK_MODE(this.audioPlayerStore.forwardSeekTime))
      navigator.mediaSession.setActionHandler('seekbackward', () => this.audioPlayerStore.SET_REWIND_SEEK_MODE(this.audioPlayerStore.rewindSeekTime))
    },
  },
}
</script>

<template>
  <div>
    <VuePlyr
      ref="plyr"
      :emit="['canplay', 'timeupdate', 'ended', 'seeked', 'playing', 'waiting', 'pause', 'stalled', 'loadedmetadata']"
      :options="{ controls: ['progress'] }"
      @canplay="onCanplay()"
      @timeupdate="onTimeupdate()"
      @ended="onEnded()"
      @playing="onPlaying()"
      @waiting="onWaiting()"
      @pause="onPause()"
    >
      <audio crossorigin="anonymous">
        <source v-if="source" :src="source">
      </audio>
    </VuePlyr>
  </div>
</template>

<style>
.plyr--audio .plyr__controls {
  background: inherit !important;
}
</style>
