<template>
  <div class="q-mx-md">
    <audio
      ref="audio"
      crossorigin="anonymous"
      @canplay="onCanplay()"
      @timeupdate="onTimeupdate()"
      @ended="onEnded()"
      @seeked="onSeeked()"
      @playing="onPlaying()"
      @waiting="onWaiting()"
      @pause="onPause()"
    >
      <source v-if="source" :src="source"/>
    </audio>
    <q-slider
      label
      :value="this.currentTime"
      :min="0"
      :max="this.duration"
      :step="0.001"
      :label-value="formatSeconds(seekValue || this.currentTime)"
      @input="updateSeekValue"
      @change="doSeek"
    />
<!--
滑动时， 通过 sliderValue 显示目标时间
滑动结束后，通过 doSeek 对 player 进行操作-->
  </div>
</template>

<script>
import Lyric from 'lrc-file-parser'
import {mapState, mapGetters, mapMutations} from 'vuex'
import NotifyMixin from '../mixins/Notification.js'
import {mediaStreamURL} from "src/utils/apiURL";


/**
 * 点击 音频文件后， playing = true，触发 watch(playing)，但是 duration = 0，什么都不会发生
 * 然后触发 watch(source)，调用player.media.load()，加载完成后调用 canPlay 开始播放
 */
export default {
  name: 'AudioElement',

  mixins: [NotifyMixin],

  data() {
    return {
      lrcObj: null,
      lrcAvailable: false,
      player: {},
      seekValue: 0
    }
  },

  computed: {
    source() {
      // 从 LocalStorage 中读取 token
      const token = this.$q.localStorage.getItem('jwt-token') || ''
      // New API
      if (this.currentPlayingFile.mediaStreamUrl) {
        return `${this.currentPlayingFile.mediaStreamUrl}?token=${token}`
      } else if (this.currentPlayingFile.hash) {
        // Fallback to be compatible with old backend
        return mediaStreamURL(this.currentPlayingFile.hash, token);
      } else {
        // 这个情况会出现吗？
        return ""
      }
    },

    ...mapState('AudioPlayer', [
      'playing',
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
      'duration',
      'currentTime',
      'lyricContent'
    ]),

    ...mapGetters('AudioPlayer', [
      'currentPlayingFile'
    ])
  },

  watch: {
    // reference this.loadLrcFile() AudioPlayer.localLyric()
    lyricContent(lyricContent) {
      console.log('LRC file loaded')
      this.lrcObj.setLyric(lyricContent);
      if (lyricContent) {
        this.lrcAvailable = true;
        this.playLrc(this.playing)
      } else {
        this.lrcAvailable = false;
        this.SET_CURRENT_LYRIC('')
      }
    },

    playing(flag) {
      if (this.duration) {
        // 缓冲至可播放状态
        flag ? this.player.play() : this.player.pause()
      }
      // this.playLrc(flag);
    },

    // watch source -> media.load() -> canPlay -> player.play()
    source(url) {
      if (url) {
        // 加载新音频/视频文件
        this.player.load();
        this.loadLrcFile();
      }
    },

    muted(flag) {
      // 切换静音状态
      this.player.muted = flag
    },

    volume(val) {
      // 屏蔽非法数值
      if (val < 0 || val > 1) {
        return
      }

      // 调节音量
      this.player.volume = val
    },
    rewindSeekMode(rewind) {
      if (rewind) {
        this.player.currentTime = this.player.currentTime - this.rewindSeekTime
        this.SET_CURRENT_TIME(this.player.currentTime - this.rewindSeekTime)
        this.SET_REWIND_SEEK_MODE(false);
      }
    },
    forwardSeekMode(forward) {
      if (forward) {
        this.player.currentTime = this.player.currentTime + this.forwardSeekTime
        this.SET_CURRENT_TIME(this.player.currentTime)
        this.SET_FORWARD_SEEK_MODE(false);
      }
    }
  },

  methods: {
    formatSeconds (seconds) {
      let h = Math.floor(seconds / 3600) < 10
        ? '0' + Math.floor(seconds / 3600)
        : Math.floor(seconds / 3600)

      let m = Math.floor((seconds / 60 % 60)) < 10
        ? '0' + Math.floor((seconds / 60 % 60))
        : Math.floor((seconds / 60 % 60))

      let s = Math.floor((seconds % 60)) < 10
        ? '0' + Math.floor((seconds % 60))
        : Math.floor((seconds % 60))

      return h === "00"
        ? m + ":" + s
        : h + ":" + m + ":" + s
    },

    /**
     * 当 外部暂停（线控暂停、软件切换）、用户控制暂停、seek 时会触发本事件
     */
    onPause() {
      console.log('onPause')
      this.playLrc(false)
      this.PAUSE()
    },
    /**
     * 当播放器真正开始播放时会触发本事件
     */
    onPlaying() {
      console.log('onPlaying')
      this.playLrc(true)
      this.PLAY()
    },
    /**
     * 当播放器缓冲区空，被迫暂停加载时会触发本事件
     */
    onWaiting() {
      console.log('onWaiting')
      this.playLrc(false)
      this.PLAY()
    },
    ...mapMutations('AudioPlayer', [
      'SET_DURATION',
      'SET_CURRENT_TIME',
      'PAUSE',
      'PLAY',
      'SET_TRACK',
      'NEXT_TRACK',
      'SET_CURRENT_LYRIC',
      'SET_VOLUME',
      'CLEAR_SLEEP_MODE',
      'SET_REWIND_SEEK_MODE',
      'SET_FORWARD_SEEK_MODE',
      'SET_LYRIC_CONTENT'
    ]),

    onCanplay() {
      // 缓冲至可播放状态时触发 (只有缓冲至可播放状态, 才能获取媒体文件的播放时长)
      this.SET_DURATION(this.player.duration)

      // 播放
      if (this.playing && this.player.currentTime !== this.player.duration) {
        this.player.play()
      }
    },

    onTimeupdate() {
      // 当目前的播放位置已更改时触发
      this.SET_CURRENT_TIME(this.player.currentTime)
      if (this.sleepMode && this.sleepTime) {
        const currentTime = new Date()
        const currentHourStr = currentTime.getHours().toString().padStart(2, '0')
        const currentMinuteStr = currentTime.getMinutes().toString().padStart(2, '0')
        const sleepHourStr = this.sleepTime.match(/\d+/g)[0]
        const sleepMinuteStr = this.sleepTime.match(/\d+/g)[1]
        if (currentHourStr === sleepHourStr && currentMinuteStr === sleepMinuteStr) {
          this.PAUSE()
          this.CLEAR_SLEEP_MODE()
          // Persist sleep mode settings
          this.$q.sessionStorage.set('sleepTime', null)
          this.$q.sessionStorage.set('sleepMode', false)
        }
      }
    },

    onEnded() {
      // 当前文件播放结束时触发
      switch (this.playMode.name) {
        case "all repeat":
          // 循环播放
          if (this.queueIndex === this.queue.length - 1) {
            this.SET_TRACK(0)
          } else {
            this.NEXT_TRACK()
          }
          break
        case "repeat once":
          // 单曲循环
          this.player.currentTime = 0
          this.PLAY()
          break
        case "shuffle": {
          // 随机播放
          const index = Math.floor(Math.random() * this.queue.length)
          this.SET_TRACK(index)
          if (index === this.queueIndex) {
            this.player.currentTime = 0
          }
          break
        }
        default:
          // 顺序播放
          if (this.queueIndex === this.queue.length - 1) {
            this.PAUSE()
          } else {
            this.NEXT_TRACK()
          }
      }
    },

    onSeeked() {
      // if (this.lrcAvailable) {
      //   this.lrcObj.play(this.player.currentTime * 1000);
      //   if (!this.playing) {
      //     this.lrcObj.pause();
      //   }
      // }
    },

    doSeek() {
      // 按照用户决定的最终值跳转
      this.player.currentTime = this.seekValue
      this.SET_CURRENT_TIME(this.seekValue)
      // 重置 sliderValue 以便 label 显示实际播放时间
      this.seekValue = 0
    },

    updateSeekValue(value) {
      this.seekValue = value
    },

    playLrc(playStatus) {
      if (this.lrcAvailable) {
        if (playStatus) {
          this.lrcObj.play(this.player.currentTime * 1000);
        } else {
          this.lrcObj.pause();
        }
      }
    },

    initLrcObj() {
      this.lrcObj = new Lyric({
        onPlay: (line, text) => {
          this.SET_CURRENT_LYRIC(text);
        },
      })
    },

    loadLrcFile() {
      const token = this.$q.localStorage.getItem('jwt-token') || '';
      const fileHash = this.queue[this.queueIndex].hash;
      const url = `/api/media/check-lrc/${fileHash}?token=${token}`;

      this.$axios.get(url)
        .then((response) => {
          if (response.data.result) {
            // 有lrc歌词文件
            console.log('读入歌词');
            const lrcUrl = `/api/media/stream/${response.data.hash}?token=${token}`;
            this.$axios.get(lrcUrl)
              .then(response => {
                console.log('歌词读入成功');
                this.SET_LYRIC_CONTENT(response.data)
              });
          } else {
            // 无歌词文件
            this.SET_LYRIC_CONTENT('')
          }
        })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            if (error.response.status !== 401) {
              this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`);
            }
          } else {
            this.showErrNotif(error.message || error);
          }
        })
    },
  },

  mounted() {
    this.player = this.$refs.audio
    // 初始化音量
    this.SET_VOLUME(this.player.volume);
    this.initLrcObj();
    if (this.source) {
      this.loadLrcFile();
    }
  }
}
</script>

<style>
</style>
