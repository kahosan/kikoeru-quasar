<template>
  <div>
    <!-- 播放器 -->
    <q-slide-transition>
      <q-card square v-show="currentPlayingFile.hash && !hide" class="fixed-bottom-right audio-player" :class="classTextColor" @mousewheel.prevent @touchmove.prevent>
        <!-- 音声封面 -->
        <div class="bg-dark row items-center albumart">
          <q-img contain transition="fade" :src="coverUrl" :ratio="4/3" />
          <q-btn dense round size="md" :color="color" :text-color="textColor" icon="keyboard_arrow_down" @click="toggleHide()" class="absolute-top-left q-ma-sm" />
          <q-btn dense round size="md" :color="color" :text-color="textColor" icon="more_vert" class="absolute-top-right q-ma-sm">
            <q-menu anchor="bottom right" self="top right">
              <q-item clickable v-ripple @click="hideSeekButton = !hideSeekButton">
                <q-item-section avatar>
                  <q-icon :name="hideSeekButton ? 'check_box' : 'check_box_outline_blank'" />
                </q-item-section>

                <q-item-section>
                  隐藏封面按钮
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="swapSeekButton = !swapSeekButton">
                <q-item-section avatar>
                  <q-icon :name="swapSeekButton ? 'check_box' : 'check_box_outline_blank'" />
                </q-item-section>
                <q-item-section>
                  交换进度按钮与切换按钮
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="openWorkDetail()" v-close-popup>
                <q-item-section avatar>
                  <q-icon name="link" />
                </q-item-section>
                <q-item-section>
                  打开作品详情
                </q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="() => {this.showLyricLoader = true}" v-close-popup>
                <q-item-section avatar>
                  <q-icon name="subtitles" />
                </q-item-section>
                <q-item-section>
                  加载本地字幕
                </q-item-section>
              </q-item>
            </q-menu>
          </q-btn>
          <div class="row absolute q-pl-md q-pr-md col-12 justify-between">
            <q-btn v-if="!hideSeekButton" round size="lg" :color="color" :text-color="textColor" style="opacity: 0.8" @click="swapSeekButton ? previousTrack() : rewind(true)" :icon="swapSeekButton ? 'skip_previous': rewindIcon" />
            <q-btn v-if="!hideSeekButton" round size="lg" :color="color" :text-color="textColor" style="opacity: 0.8" @click="swapSeekButton ? nextTrack() : forward(true)" :icon="swapSeekButton ? 'skip_next' : forwardIcon" />
          </div>
        </div>

        <!-- 进度条控件 -->
        <div class="row items-center q-mx-sm q-my-sm" style="height: 40px">
          <div class="col-auto">{{ formatSeconds(currentTime) }}</div>
          <AudioElement class="col" />
          <div class="col-auto">{{ formatSeconds(duration) }}</div>
        </div>

        <!-- Place holder for iOS -->
        <div style="height: 5px" v-if="$q.platform.is.ios" />

        <q-item style="height: 55px; padding: 0px 15px;" class="text-center non-selectable">
          <q-item-section>
            <q-item-label lines="2" class="text-bold">{{ currentPlayingFile.title }}</q-item-label>
            <q-item-label caption lines="1">{{ currentPlayingFile.workTitle }}</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Place holder for iOS -->
        <div  style="height: 10px" v-if="$q.platform.is.ios" />

        <!-- 播放按钮控件 -->
        <div class="row justify-around" style="height: 65px">
          <q-btn flat dense size="md" icon="queue_music" @click="showCurrentPlayList = !showCurrentPlayList" style="width: 55px" class="col-auto" />
          <q-btn flat dense size="lg" :icon="swapSeekButton ? rewindIcon : 'skip_previous'" @click="swapSeekButton ? rewind(true) : previousTrack()" style="width: 55px" class="col-auto" />
          <q-btn flat dense size="28px" :icon="playingIcon" @click="togglePlay()" style="width: 65px" class="col-auto" />
          <q-btn flat dense size="lg" :icon="swapSeekButton ? forwardIcon : 'skip_next'" @click="swapSeekButton ? forward(true) : nextTrack()" style="width: 55px" class="col-auto" />
          <q-btn flat dense size="md" :icon="playModeIcon" @click="changePlayMode()" style="width: 55px" class="col-auto" />
        </div>

        <!-- 音量控件 -->
        <!-- HTML5 volume in iOS is read-only -->
        <div class="row items-center q-mx-lg" style="height: 50px" v-if="!$q.platform.is.ios">
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

    <!-- 加载本地字幕-->
    <q-dialog v-model="showLyricLoader">
      <q-card class="upload-subtitle">
          <q-file filled v-model="localLyric" @rejected="onLyricFileRejected" @input="onLyricFileLoaded" label="选择 LRC 字幕文件" accept=".lrc">
            <template v-slot:prepend>
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
          <q-btn dense round size="md" icon="edit" color="primary" @click="editCurrentPlayList = !editCurrentPlayList" style="height: 35px; width: 35px;" class="col-auto" />
          <q-btn dense round size="md" icon="save" color="teal" style="height: 35px; width: 35px;" class="col-auto q-mx-sm" />
          <q-space />
          <q-btn dense round size="md" icon="delete_forever" color="red" @click="emptyQueue()" style="height: 35px; width: 35px;" class="col-auto" />
        </div>

        <q-separator />

        <!-- 音频文件列表 -->
        <q-list style="max-height: 450px" class="scroll">
          <draggable
            handle=".handle"
            v-model="queueCopy"
            @change="val => onMoved(val.moved)"
            v-if="showCurrentPlayList"
          >
            <q-item
              clickable
              v-ripple
              v-for="(track, index) in queueCopy"
              :key="index"
              :active="queueIndex === index"
              active-class="text-white bg-teal"
              class="non-selectable"
              style="height: 48px; padding: 0px 10px;"
              @click="onClickTrack(index)"
            >
              <q-item-section side v-show="editCurrentPlayList">
                <q-icon name="clear" :color="queueIndex === index ? 'white' : 'red'" @click="removeFromQueue(index)" />
              </q-item-section>

              <q-item-section avatar>
                <q-img transition="fade" :src="samCoverUrl(track)" style="height: 38px; width: 38px" class="rounded-borders" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">{{ track.title }}</q-item-label>
                <q-item-label caption lines="1">{{ track.workTitle }}</q-item-label>
              </q-item-section>

              <q-item-section side class="handle" v-show="editCurrentPlayList">
                <q-icon name="reorder" :color="queueIndex === index ? 'white' : 'dark'" />
              </q-item-section>
            </q-item>
          </draggable>
        </q-list>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
// import draggable from 'vuedraggable'
import AudioElement from 'components/AudioElement'
import { mapState, mapGetters, mapMutations } from 'vuex'
import {coverURL} from '../utils/apiURL';
import DarkMode from '../mixins/DarkMode'
import Notification from "src/mixins/Notification";
import {formatSeconds} from "src/utils/time";

export default {
  name: 'AudioPlayer',

  components: {
    draggable: () => import('vuedraggable'),
    AudioElement
  },

  mixins: [DarkMode, Notification],

  data () {
    return {
      showLyricLoader: false,
      showCurrentPlayList: false,
      editCurrentPlayList: false,
      queueCopy: [],
      hideSeekButton: false,
      swapSeekButton: false,
      localLyric: null,  // 这个变量并没有什么用，只是给 QFIle 自己看的，业务逻辑看 onLyricFileLoaded
    }
  },

  mounted () {
    if (this.$q.localStorage.has('hideSeekButton')) {
      this.hideSeekButton = this.$q.localStorage.getItem('hideSeekButton')
    }
    if (this.$q.localStorage.has('swapSeekButton')) {
      this.swapSeekButton = this.$q.localStorage.getItem('swapSeekButton')
    }
  },

  watch: {
    currentPlayingFile() {
      // 播放文件发生变化时，清空字幕输入框
      this.localLyric = null
    },

    queue (val) {
      this.queueCopy = val.concat()
      // 在删除最后一个 track 时关闭当前播放列表
      if (this.queueCopy.length === 0) {
        this.showCurrentPlayList = false
      }
    },

    showCurrentPlayList (flag) {
      // 关闭当前播放列表后，重置 editCurrentPlayList 状态为 false
      if (flag === false) {
        this.editCurrentPlayList = false
      }
    },

    hideSeekButton (option) {
      this.$q.localStorage.set('hideSeekButton', option)
    },

    swapSeekButton (option) {
      this.$q.localStorage.set('swapSeekButton', option)
    }
  },

  computed: {
    coverUrl () {
      return coverURL(this.currentPlayingFile, 'main')
    },

    workDetailUrl () {
      const hash = this.currentPlayingFile.hash
      return hash ? `/work/RJ${hash.split('/')[0]}` : ""
    },

    volume: {
      get () {
        return this.$store.state.AudioPlayer.volume
      },
      set (val) {
        this.SET_VOLUME(val)
      }
    },

    queue: {
      get () {
        return this.$store.state.AudioPlayer.queue
      },
      set () {}
    },

    playModeIcon () {
      switch (this.playMode.name) {
        case "all repeat":
          return "repeat"
        case "repeat once":
          return "repeat_one"
        case "shuffle":
          return "shuffle"
        default:
          return "playlist_play"
      }
    },

    playingIcon () {
      return this.playing ? "pause" : "play_arrow"
    },

    rewindIcon () {
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

    forwardIcon () {
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
      'forwardSeekTime'
    ]),

    ...mapGetters('AudioPlayer', [
      'currentPlayingFile'
    ])
  },

  methods: {
    formatSeconds,
    ...mapMutations('AudioPlayer', {
      toggleHide: 'TOGGLE_HIDE',
      togglePlay: 'TOGGLE_WANT_PLAYING',
      nextTrack: 'NEXT_TRACK',
      previousTrack: 'PREVIOUS_TRACK',
      changePlayMode: 'CHANGE_PLAY_MODE',
      setVolume: 'SET_VOLUME',
      rewind: 'SET_REWIND_SEEK_MODE',
      forward: 'SET_FORWARD_SEEK_MODE',
      setLyricContent: 'SET_LYRIC_CONTENT'
    }),
    ...mapMutations('AudioPlayer', [
      'SET_TRACK',
      'SET_QUEUE',
      'REMOVE_FROM_QUEUE',
      'EMPTY_QUEUE',
      'SET_VOLUME'
    ]),

    onLyricFileRejected() {
      this.showWarnNotif("仅支持 .lrc 格式的字幕")
    },

    onLyricFileLoaded (fileObject) {
      // 用户选择本地字幕后，更新到 vuex，AudioElement 接收
      let reader = new FileReader()
      reader.onloadend = () => {
        this.setLyricContent(reader.result);
      }
      reader.readAsText(fileObject)
      this.showLyricLoader = false
    },

    samCoverUrl (track) {
      return coverURL(track, 'sam')
    },

    onClickTrack (index) {
      if (!this.editCurrentPlayList) {
        this.SET_TRACK(index)
        this.showCurrentPlayList = false
      }
    },

    onMoved(moved) {
      let index = null
      if (moved.oldIndex === this.queueIndex) {
        index = moved.newIndex
      } else if (moved.oldIndex < this.queueIndex && moved.newIndex >= this.queueIndex) {
        index = this.queueIndex - 1
      } else if (moved.oldIndex > this.queueIndex && moved.newIndex <= this.queueIndex) {
        index = this.queueIndex + 1
      } else {
        index = this.queueIndex
      }

      this.SET_QUEUE({
        queue: this.queueCopy.concat(),
        index: index,
        resetPlaying: false
      })
    },

    removeFromQueue (index) {
      this.REMOVE_FROM_QUEUE(index)
    },

    emptyQueue () {
      this.EMPTY_QUEUE()
    },

    openWorkDetail () {
      if (this.workDetailUrl && this.$route.path !== this.workDetailUrl) {
        this.$router.push(this.workDetailUrl)
      }
      if (this.$q.screen.lt.sm) {
          this.toggleHide()
      }
    }
  }
}
</script>


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
