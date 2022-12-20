<script>
import Draggable from 'vuedraggable'
import AudioElement from 'components/AudioElement'
import { mapGetters, mapMutations, mapState } from 'vuex'
import Notification from 'src/mixins/Notification'
import { formatSeconds } from 'src/utils/time'
import DarkMode from '../mixins/DarkMode'
import { coverURL } from '../utils/apiURL'

export default {
  name: 'AudioPlayer',

  components: {
    Draggable,
    AudioElement,
  },

  mixins: [DarkMode, Notification],

  data() {
    return {
      showLyricLoader: false,
      showCurrentPlayList: false,
      editCurrentPlayList: false,
      queueCopy: [],
      hideSeekButton: false,
      swapSeekButton: false,
      localLyric: null, // 这个变量并没有什么用，只是给 QFIle 自己看的，业务逻辑看 onLyricFileLoaded
    }
  },

  computed: {
    pipSubtitleAvailable() {
      // 当前只有中文支持
      if (this.$i18n.locale !== 'zh-CN')
        return false

      // 当前为 pip 模式，或者可以进入 pip 模式
      else return !!(this.subtitleDisplayMode === 'pip' || this.$store.state.AudioPlayer.lyricContent.length)
    },
    coverUrl() {
      return coverURL(this.currentPlayingFile, 'main')
    },

    workDetailUrl() {
      const hash = this.currentPlayingFile.hash
      return hash ? `/asmr/work/RJ${hash.split('/')[0]}` : ''
    },

    volume: {
      get() {
        return this.$store.state.AudioPlayer.volume
      },
      set(val) {
        this.SET_VOLUME(val)
      },
    },

    queue: {
      get() {
        return this.$store.state.AudioPlayer.queue
      },
      set() {},
    },

    playModeIcon() {
      switch (this.playMode.name) {
        case 'all repeat':
          return 'repeat'
        case 'repeat once':
          return 'repeat_one'
        case 'shuffle':
          return 'shuffle'
        default:
          return 'playlist_play'
      }
    },

    playingIcon() {
      return this.playing ? 'pause' : 'play_arrow'
    },

    rewindIcon() {
      switch (this.rewindSeekTime) {
        case 5:
          return 'replay_5'
        case 10:
          return 'replay_10'
        case 30:
          return 'replay_30'
        default:
          return 'restore'
      }
    },

    forwardIcon() {
      switch (this.forwardSeekTime) {
        case 5:
          return 'forward_5'
        case 10:
          return 'forward_10'
        case 30:
          return 'forward_30'
        default:
          return 'update'
      }
    },

    ...mapState('AudioPlayer', [
      'playing',
      'wantPlaying',
      'hide',
      'currentTime',
      'duration',
      'queueIndex',
      'playMode',
      'rewindSeekTime',
      'forwardSeekTime',
      'subtitleDisplayMode',
    ]),

    ...mapGetters('AudioPlayer', [
      'currentPlayingFile',
    ]),
  },

  watch: {
    $route() {
      if (this.$q.screen.lt.sm && !this.hide && this.currentPlayingFile.hash) {
        this.hidePlayer()

        // browser back button does only one action per press
        // if the action is hide player
        // then do not really go backward
        this.$router.forward()
      }
    },

    currentPlayingFile() {
      // 播放文件发生变化时，清空字幕输入框
      this.localLyric = null
    },

    queue(val) {
      this.queueCopy = val.concat()
      // 在删除最后一个 track 时关闭当前播放列表
      if (this.queueCopy.length === 0)
        this.showCurrentPlayList = false
    },

    showCurrentPlayList(flag) {
      // 关闭当前播放列表后，重置 editCurrentPlayList 状态为 false
      if (flag === false)
        this.editCurrentPlayList = false
    },

    hideSeekButton(option) {
      this.$q.localStorage.set('hideSeekButton', option)
    },

    swapSeekButton(option) {
      this.$q.localStorage.set('swapSeekButton', option)
    },
  },

  mounted() {
    if (this.$q.localStorage.has('hideSeekButton'))
      this.hideSeekButton = this.$q.localStorage.getItem('hideSeekButton')

    if (this.$q.localStorage.has('swapSeekButton'))
      this.swapSeekButton = this.$q.localStorage.getItem('swapSeekButton')
  },

  methods: {
    formatSeconds,
    ...mapMutations('AudioPlayer', {
      hidePlayer: 'PLAYER_HIDE',
      togglePlay: 'TOGGLE_WANT_PLAYING',
      nextTrack: 'NEXT_TRACK',
      previousTrack: 'PREVIOUS_TRACK',
      changePlayMode: 'CHANGE_PLAY_MODE',
      setVolume: 'SET_VOLUME',
      rewind: 'SET_REWIND_SEEK_MODE',
      forward: 'SET_FORWARD_SEEK_MODE',
      setLyricContent: 'SET_LYRIC_CONTENT',
    }),
    ...mapMutations('AudioPlayer', [
      'SET_TRACK',
      'SET_QUEUE',
      'REMOVE_FROM_QUEUE',
      'EMPTY_QUEUE',
      'SET_VOLUME',
    ]),

    toggleSubtitleDisplayMode() {
      // 浏览器不支持 pip
      if (!('pictureInPictureEnabled' in document)) {
        this.showWarnNotif('你的浏览器不支持画中画功能，无法显示桌面字幕')
        return false

        // 用户已禁止 pip
      }
      else if (!document.pictureInPictureEnabled) {
        this.showWarnNotif('画中画功能被禁用，无法显示桌面字幕')
        return false
      }

      if (this.subtitleDisplayMode === 'pip')
        this.$store.commit('AudioPlayer/SET_SUBTITLE_DISPLAY_MODE', 'in-app')
      else
        this.$store.commit('AudioPlayer/SET_SUBTITLE_DISPLAY_MODE', 'pip')
    },

    onLyricFileRejected() {
      this.showWarnNotif('仅支持 .lrc 格式的字幕')
    },

    onLyricFileLoaded(fileObject) {
      // 用户选择本地字幕后，更新到 vuex，AudioElement 接收
      const reader = new FileReader()
      reader.onloadend = () => {
        this.setLyricContent(reader.result)

        Sentry.captureMessage(`Subtitle Upload RJ${this.currentPlayingFile.hash.split('/')[0]} ${this.currentPlayingFile.title}`, (scope) => {
          scope.setTags({
            event: 'subtitle',
            workID: this.currentPlayingFile.hash.split('/')[0],
            hash: this.currentPlayingFile.hash,
            title: this.currentPlayingFile.title,
          })
          scope.setExtra('currentPlayingFile', this.currentPlayingFile)
          scope.addAttachment({ filename: fileObject.name, data: reader.result })
        })
      }

      reader.readAsText(fileObject)
      this.showLyricLoader = false
    },

    samCoverUrl(track) {
      return coverURL(track, 'sam')
    },

    onClickTrack(index) {
      if (!this.editCurrentPlayList) {
        this.SET_TRACK(index)
        this.showCurrentPlayList = false
      }
    },

    onMoved(moved) {
      let index = null
      if (moved.oldIndex === this.queueIndex)
        index = moved.newIndex
      else if (moved.oldIndex < this.queueIndex && moved.newIndex >= this.queueIndex)
        index = this.queueIndex - 1
      else if (moved.oldIndex > this.queueIndex && moved.newIndex <= this.queueIndex)
        index = this.queueIndex + 1
      else
        index = this.queueIndex

      this.SET_QUEUE({
        queue: this.queueCopy.concat(),
        index,
        resetPlaying: false,
      })
    },

    removeFromQueue(index) {
      this.REMOVE_FROM_QUEUE(index)
    },

    emptyQueue() {
      this.EMPTY_QUEUE()
    },

    openWorkDetail() {
      if (this.workDetailUrl && this.$route.path !== this.workDetailUrl)
        this.$router.push(this.workDetailUrl)

      if (this.$q.screen.lt.sm)
        this.hidePlayer()
    },
  },
}
</script>

<template>
  <div>
    <!-- 播放器 -->
    <q-slide-transition>
      <q-card v-show="currentPlayingFile.hash && !hide" square class="fixed-bottom-right audio-player" :class="classTextColor" @mousewheel.prevent @touchmove.prevent>
        <!-- 音声封面 -->
        <div class="bg-dark row items-center albumart relative-position">
          <q-img contain transition="fade" :src="coverUrl" :ratio="4 / 3" />
          <q-btn dense round size="md" :color="color" :text-color="textColor" icon="keyboard_arrow_down" class="absolute-top-left q-ma-sm" @click="hidePlayer()" />
          <q-btn dense round size="md" :color="color" :text-color="textColor" icon="more_vert" class="absolute-top-right q-ma-sm">
            <q-menu anchor="bottom right" self="top right">
              <q-item v-ripple clickable @click="hideSeekButton = !hideSeekButton">
                <q-item-section avatar>
                  <q-icon :name="hideSeekButton ? 'check_box' : 'check_box_outline_blank'" />
                </q-item-section>

                <q-item-section>
                  {{ $t('player.hideButton') }}
                </q-item-section>
              </q-item>

              <q-item v-ripple clickable @click="swapSeekButton = !swapSeekButton">
                <q-item-section avatar>
                  <q-icon :name="swapSeekButton ? 'check_box' : 'check_box_outline_blank'" />
                </q-item-section>
                <q-item-section>
                  {{ $t('player.swapSeekButton') }}
                </q-item-section>
              </q-item>

              <q-item v-ripple v-close-popup clickable @click="openWorkDetail()">
                <q-item-section avatar>
                  <q-icon name="link" />
                </q-item-section>
                <q-item-section>
                  {{ $t('player.workDetail') }}
                </q-item-section>
              </q-item>

              <q-item v-ripple v-close-popup clickable @click="() => { showLyricLoader = true }">
                <q-item-section avatar>
                  <q-icon name="subtitles" />
                </q-item-section>
                <q-item-section>
                  {{ $t('player.loadSubtitle') }}
                </q-item-section>
              </q-item>
            </q-menu>
          </q-btn>
          <div class="row absolute q-pl-md q-pr-md col-12 justify-between">
            <q-btn v-if="!hideSeekButton" round size="lg" :color="color" :text-color="textColor" style="opacity: 0.8" :icon="swapSeekButton ? 'skip_previous' : rewindIcon" @click="swapSeekButton ? previousTrack() : rewind(true)" />
            <q-btn v-if="!hideSeekButton" round size="lg" :color="color" :text-color="textColor" style="opacity: 0.8" :icon="swapSeekButton ? 'skip_next' : forwardIcon" @click="swapSeekButton ? nextTrack() : forward(true)" />
          </div>
          <q-btn
            v-if="pipSubtitleAvailable" dense rounded
            size="sm"
            class="absolute-bottom-left q-ma-sm"
            :text-color="textColor"
            icon="subtitles"
            :color="subtitleDisplayMode === 'pip' ? 'primary' : color"
            label="桌面字幕"
            @click="toggleSubtitleDisplayMode"
          />
        </div>

        <!-- 进度条控件 -->
        <div class="row items-center q-mx-sm q-my-sm" style="height: 40px">
          <div class="col-auto">
            {{ formatSeconds(currentTime) }}
          </div>
          <AudioElement class="col" />
          <div class="col-auto">
            {{ formatSeconds(duration) }}
          </div>
        </div>

        <!-- Place holder for iOS -->
        <div v-if="$q.platform.is.ios" style="height: 5px" />

        <q-item style="height: 55px; padding: 0px 15px;" class="text-center non-selectable">
          <q-item-section>
            <q-item-label lines="2" class="text-bold">
              {{ currentPlayingFile.title }}
            </q-item-label>
            <q-item-label caption lines="1">
              {{ currentPlayingFile.workTitle }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Place holder for iOS -->
        <div v-if="$q.platform.is.ios" style="height: 10px" />

        <!-- 播放按钮控件 -->
        <div class="row justify-around" style="height: 65px">
          <q-btn flat dense size="md" icon="queue_music" style="width: 55px" class="col-auto" @click="showCurrentPlayList = !showCurrentPlayList" />
          <q-btn flat dense size="lg" :icon="swapSeekButton ? rewindIcon : 'skip_previous'" style="width: 55px" class="col-auto" @click="swapSeekButton ? rewind(true) : previousTrack()" />
          <q-btn flat dense size="28px" :icon="playingIcon" style="width: 65px" class="col-auto" @click="togglePlay()" />
          <q-btn flat dense size="lg" :icon="swapSeekButton ? forwardIcon : 'skip_next'" style="width: 55px" class="col-auto" @click="swapSeekButton ? forward(true) : nextTrack()" />
          <q-btn flat dense size="md" :icon="playModeIcon" style="width: 55px" class="col-auto" @click="changePlayMode()" />
        </div>

        <!-- 音量控件 -->
        <!-- HTML5 volume in iOS is read-only -->
        <div v-if="!$q.platform.is.ios" class="row items-center q-mx-lg" style="height: 50px">
          <q-icon name="volume_down" size="sm" class="col-auto" />
          <q-slider
            v-model="volume"
            :min="0"
            :max="1"
            :step="0.01"
            tooltip="none"
            class="col"
            style="margin-left: 0.5em; margin-right: 0.5em"
          />
          <q-icon name="volume_up" size="sm" class="col-auto" />
        </div>
      </q-card>
    </q-slide-transition>

    <!-- 加载本地字幕 -->
    <q-dialog v-model="showLyricLoader">
      <q-card class="upload-subtitle">
        <q-file
          v-model="localLyric"
          filled
          :label="$t('player.selectSubtitleFile')"
          :filter="files => files.filter(file => file.size < 300 * 1024)"
          accept=".lrc"
          @rejected="onLyricFileRejected"
          @input="onLyricFileLoaded"
        >
          <template #prepend>
            <q-icon name="cloud_upload" />
          </template>
        </q-file>
      </q-card>
    </q-dialog>

    <!-- 当前播放列表 -->
    <q-dialog v-model="showCurrentPlayList">
      <q-card class="current-play-list">
        <!-- 操作当前播放列表的控制按钮 -->
        <div class="row" style="padding: 5px; height: 45px;">
          <q-btn dense round size="md" icon="edit" color="primary" style="height: 35px; width: 35px;" class="col-auto" @click="editCurrentPlayList = !editCurrentPlayList" />
          <q-btn dense round size="md" icon="save" color="teal" style="height: 35px; width: 35px;" class="col-auto q-mx-sm" />
          <q-space />
          <q-btn dense round size="md" icon="delete_forever" color="red" style="height: 35px; width: 35px;" class="col-auto" @click="emptyQueue()" />
        </div>

        <q-separator />

        <!-- 音频文件列表 -->
        <q-list style="max-height: 450px" class="scroll">
          <Draggable
            v-if="showCurrentPlayList"
            v-model="queueCopy"
            handle=".handle"
            @change="val => onMoved(val.moved)"
          >
            <q-item
              v-for="(track, index) in queueCopy"
              :key="index"
              v-ripple
              clickable
              :active="queueIndex === index"
              active-class="text-white bg-teal"
              class="non-selectable"
              style="height: 48px; padding: 0px 10px;"
              @click="onClickTrack(index)"
            >
              <q-item-section v-show="editCurrentPlayList" side>
                <q-icon name="clear" :color="queueIndex === index ? 'white' : 'red'" @click="removeFromQueue(index)" />
              </q-item-section>

              <q-item-section avatar>
                <q-img transition="fade" :src="samCoverUrl(track)" style="height: 38px; width: 38px" class="rounded-borders" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">
                  {{ track.title }}
                </q-item-label>
                <q-item-label caption lines="1">
                  {{ track.workTitle }}
                </q-item-label>
              </q-item-section>

              <q-item-section v-show="editCurrentPlayList" side class="handle">
                <q-icon name="reorder" :color="queueIndex === index ? 'white' : 'dark'" />
              </q-item-section>
            </q-item>
          </Draggable>
        </q-list>
      </q-card>
    </q-dialog>
  </div>
</template>

<style lang="scss" scoped>
  .audio-player {
    // 宽度 > $breakpoint-sm-min
    @media (min-width: $breakpoint-sm-min) {
      width: 330px;
      margin: 0px 10px 10px 0px;
    }
    // 宽度 < $breakpoint-xs-max (599px)
    @media (max-width: $breakpoint-xs-max) {
      width: 100%;
      height: 100%;
    }
  }

  .albumart {
    // 宽度 < $breakpoint-xs-max (599px)
    @media (max-width: $breakpoint-xs-max) {
      width: 100%;
      height: calc(100% - 230px);
    }
  }

  .upload-subtitle {
    max-height: 500px;

    // 宽度 > $breakpoint-xs-max
    @media (min-width: $breakpoint-xs-max) {
      width: 450px;
    }
    // 宽度 < $breakpoint-xs-max (599px)
    @media (max-width: $breakpoint-xs-max) {
      min-width: 280px;
    }
  }
  .current-play-list {
    max-height: 500px;

    // 宽度 > $breakpoint-xs-max
    @media (min-width: $breakpoint-xs-max) {
      width: 450px;
    }
    // 宽度 < $breakpoint-xs-max (599px)
    @media (max-width: $breakpoint-xs-max) {
      min-width: 280px;
    }
  }
</style>
