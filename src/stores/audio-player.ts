import { defineStore } from 'pinia'

interface AudioPlayerState {
  hide: boolean
  playingControlSignal: 'nothing' | 'wantPlay' | 'wantPause' // ['nothing', 'wantPlay', 'wantPause']
  playing: boolean // 实际的播放状态 (true/false)
  currentTime: number // 单位: 秒
  duration: number
  source: string
  queue: unknown[]
  queueIndex: number // which track in the queue is currently selected
  playMode: {
    id: number
    name: 'order' | 'all repeat' | 'repeat once' | 'shuffle'
  } // 顺序播放("order"), 循环播放("all repeat"), 单曲循环("repeat once") or 随机播放("shuffle")
  muted: boolean
  volume: number // 音量 (0.0-1.0)
  currentLyric: string
  sleepTime: null | number
  sleepMode: boolean
  rewindSeekTime: number
  forwardSeekTime: number
  rewindSeekMode: boolean
  forwardSeekMode: boolean
  lyricContent: string
  shouldLoadPlayer: boolean
  qualityBehavior: 'fluentFirst' | 'qualityFirst' // "fluentFirst" or "qualityFirst"
  metadata: object
  subtitleDisplayMode: 'in-app' | 'pip' // 'in-app' or 'pip'
}

export const useAudioPlayerStore = defineStore('audioPlayer', {
  state: (): AudioPlayerState => ({
    hide: false,

    playingControlSignal: 'nothing', // ['nothing', 'wantPlay', 'wantPause']

    playing: false, // 实际的播放状态 (true/false)
    currentTime: 0, // 单位: 秒
    duration: 0,
    source: '',
    queue: [
      // list of tracks. object format:
      /*
        hash: null, // unique identifier for the file
        title: null, // title to show in UI
        workTitle: null, // workTitle to show in UI
        mediaStreamUrl: null, // media custom stream url from backend
        mediaDownloadUrl: null // media custom download url from backend
       */
    ],
    queueIndex: 0, // which track in the queue is currently selected
    playMode: {
      id: 0,
      name: 'order',
    }, // 顺序播放("order"), 循环播放("all repeat"), 单曲循环("repeat once") or 随机播放("shuffle")
    muted: false,
    volume: 0, // 音量 (0.0-1.0)
    currentLyric: '',
    sleepTime: null,
    sleepMode: false,
    rewindSeekTime: 5,
    forwardSeekTime: 30,
    rewindSeekMode: false,
    forwardSeekMode: false,
    lyricContent: '',
    shouldLoadPlayer: false,

    qualityBehavior: 'fluentFirst', // "fluentFirst" or "qualityFirst"
    metadata: {},
    subtitleDisplayMode: 'in-app', // 'in-app' or 'pip'
  }),
  getters: {
    currentPlayingFile: (state: AudioPlayerState) => {
      return state.queue[state.queueIndex] || {
        hash: '',
        title: '',
        workTitle: '',
        mediaStreamUrl: '',
        mediaDownloadUrl: '',
        streamLowQualityUrl: '',
        samCoverUrl: '',
        thumbnailCoverUrl: '',
        mainCoverUrl: '',
      }
    },
  },
  actions: {
    SET_QUALITY_BEHAVIOR(payload: AudioPlayerState['qualityBehavior']) {
      this.qualityBehavior = payload
    },

    TOGGLE_HIDE() {
      this.hide = !this.hide
    },

    PLAYER_HIDE() {
      this.hide = true
    },

    PLAYER_SHOW() {
      this.hide = false
    },

    // 进入 WorkDetail 页面后提前加载 AudioPlayer，否则 ios 无法自动播放
    LOAD_PLAYER() {
      this.shouldLoadPlayer = true
    },

    WANT_PLAY() {
      this.playingControlSignal = 'wantPlay'
    },
    WANT_PAUSE() {
      this.playingControlSignal = 'wantPause'
    },
    CONSUME_PLAYING_CONTROL_SIGNAL() {
      this.playingControlSignal = 'nothing'
    },
    TOGGLE_WANT_PLAYING() {
      if (this.playing)
        this.playingControlSignal = 'wantPause'
      else
        this.playingControlSignal = 'wantPlay'
    },

    // 这里控制的是播放器实际的播放状态
    ON_PLAY() {
      this.playing = true
    },
    ON_PAUSE() {
      this.playing = false
    },

    SET_METADATA(metadata: object) {
      this.metadata = metadata
    },

    // Play a specific file from the queue.
    SET_TRACK(index: number) {
      if (index >= this.queue.length || index < 0)
        return // Invalid index, bail.

      this.playingControlSignal = 'wantPlay'
      this.queueIndex = index
    },
    NEXT_TRACK() {
      if (this.queueIndex < this.queue.length - 1) {
        // Go to next track only if it exists.
        this.playingControlSignal = 'wantPlay'
        this.queueIndex += 1
      }
    },
    PREVIOUS_TRACK() {
      if (this.queueIndex > 0) {
        // Go to previous track only if it exists.
        this.playingControlSignal = 'wantPlay'
        this.queueIndex -= 1
      }
    },

    SET_QUEUE(payload: any) {
      this.queue = payload.queue
      this.queueIndex = payload.index

      if (payload.resetPlaying)
        this.playingControlSignal = 'wantPlay'
    },
    EMPTY_QUEUE() {
      this.playingControlSignal = 'wantPause'

      this.queue = []
      this.queueIndex = 0
    },
    ADD_TO_QUEUE(file: unknown) {
      this.queue.push(file)
    },
    REMOVE_FROM_QUEUE(index: number) {
      this.queue.splice(index, 1)

      if (index === this.queueIndex) {
        this.playingControlSignal = 'wantPause'

        this.queueIndex = 0
      }
      else if (index < this.queueIndex) {
        this.queueIndex -= 1
      }
    },

    SET_DURATION(second: number) {
      this.duration = second
    },

    SET_CURRENT_TIME(second: number) {
      this.currentTime = second
    },

    // Add a file after the current playing item in the queue.
    PLAY_NEXT(file: unknown) {
      this.queue.splice(this.queueIndex + 1, 0, file)
    },

    CHANGE_PLAY_MODE() {
      const playModes = [
        {
          id: 0,
          name: 'order',
        },
        {
          id: 1,
          name: 'all repeat',
        },
        {
          id: 2,
          name: 'repeat once',
        },
        {
          id: 3,
          name: 'shuffle',
        },
      ] as const
      const index = (this.playMode.id >= playModes.length - 1) ? 0 : (this.playMode.id + 1)

      this.playMode = playModes[index]
    },

    TOGGLE_MUTED() {
      this.muted = !this.muted
    },

    SET_VOLUME(val: number) {
      if (val < 0 || val > 1)
        return

      this.volume = val
    },
    SET_REWIND_SEEK_TIME(value: number) {
      this.rewindSeekTime = value
    },
    SET_FORWARD_SEEK_TIME(value: number) {
      this.forwardSeekTime = value
    },
    SET_REWIND_SEEK_MODE(value: boolean) {
      this.rewindSeekMode = value
    },
    SET_FORWARD_SEEK_MODE(value: boolean) {
      this.forwardSeekMode = value
    },
    SET_CURRENT_LYRIC(line: string) {
      this.currentLyric = line
    },
    SET_SLEEP_TIMER(time: number) {
      this.sleepTime = time
      this.sleepMode = true
    },

    CLEAR_SLEEP_MODE() {
      this.sleepTime = null
      this.sleepMode = false
    },

    SET_LYRIC_CONTENT(lyricFile: string) {
      this.lyricContent = lyricFile
    },

    SET_SUBTITLE_DISPLAY_MODE(mode: AudioPlayerState['subtitleDisplayMode']) {
      if (['in-app', 'pip'].includes(mode))
        this.subtitleDisplayMode = mode
      else
        this.subtitleDisplayMode = 'in-app'
    },
  },
})
