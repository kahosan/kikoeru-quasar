const mutations = {
  SET_QUALITY_BEHAVIOR(state: any, payload: any) {
    state.qualityBehavior = payload
  },

  TOGGLE_HIDE(state: any) {
    state.hide = !state.hide
  },

  PLAYER_HIDE(state: any) {
    state.hide = true
  },

  PLAYER_SHOW(state: any) {
    state.hide = false
  },

  // 进入 WorkDetail 页面后提前加载 AudioPlayer，否则 ios 无法自动播放
  LOAD_PLAYER(state: any) {
    state.shouldLoadPlayer = true
  },

  WANT_PLAY(state: any) {
    state.playingControlSignal = 'wantPlay'
  },
  WANT_PAUSE(state: any) {
    state.playingControlSignal = 'wantPause'
  },
  CONSUME_PLAYING_CONTROL_SIGNAL(state: any) {
    state.playingControlSignal = 'nothing'
  },
  TOGGLE_WANT_PLAYING(state: any) {
    if (state.playing)
      state.playingControlSignal = 'wantPause'
    else
      state.playingControlSignal = 'wantPlay'
  },

  // 这里控制的是播放器实际的播放状态
  ON_PLAY(state: any) {
    state.playing = true
  },
  ON_PAUSE(state: any) {
    state.playing = false
  },

  SET_METADATA(state: any, metadata: any) {
    state.metadata = metadata
  },

  // Play a specific file from the queue.
  SET_TRACK: (state: any, index: any) => {
    if (index >= state.queue.length || index < 0)
      return // Invalid index, bail.

    state.playingControlSignal = 'wantPlay'
    state.queueIndex = index
  },
  NEXT_TRACK: (state: any) => {
    if (state.queueIndex < state.queue.length - 1) {
      // Go to next track only if it exists.
      state.playingControlSignal = 'wantPlay'
      state.queueIndex += 1
    }
  },
  PREVIOUS_TRACK: (state: any) => {
    if (state.queueIndex > 0) {
      // Go to previous track only if it exists.
      state.playingControlSignal = 'wantPlay'
      state.queueIndex -= 1
    }
  },

  SET_QUEUE(state: any, payload: any) {
    state.queue = payload.queue
    state.queueIndex = payload.index

    if (payload.resetPlaying)
      state.playingControlSignal = 'wantPlay'
  },
  EMPTY_QUEUE: (state: any) => {
    state.playingControlSignal = 'wantPause'

    state.queue = []
    state.queueIndex = 0
  },
  ADD_TO_QUEUE: (state: any, file: any) => {
    state.queue.push(file)
  },
  REMOVE_FROM_QUEUE: (state: any, index: any) => {
    state.queue.splice(index, 1)

    if (index === state.queueIndex) {
      state.playingControlSignal = 'wantPause'

      state.queueIndex = 0
    }
    else if (index < state.queueIndex) {
      state.queueIndex -= 1
    }
  },

  SET_DURATION(state: any, second: any) {
    state.duration = second
  },

  SET_CURRENT_TIME(state: any, second: any) {
    state.currentTime = second
  },

  // Add a file after the current playing item in the queue.
  PLAY_NEXT: (state: any, file: any) => {
    state.queue.splice(state.queueIndex + 1, 0, file)
  },

  CHANGE_PLAY_MODE: (state: any) => {
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
    ]
    const index = (state.playMode.id >= playModes.length - 1) ? 0 : (state.playMode.id + 1)

    state.playMode = playModes[index]
  },

  TOGGLE_MUTED: (state: any) => {
    state.muted = !state.muted
  },

  SET_VOLUME: (state: any, val: any) => {
    if (val < 0 || val > 1)
      return

    state.volume = val
  },
  SET_REWIND_SEEK_TIME: (state: any, value: any) => {
    state.rewindSeekTime = value
  },
  SET_FORWARD_SEEK_TIME: (state: any, value: any) => {
    state.forwardSeekTime = value
  },
  SET_REWIND_SEEK_MODE: (state: any, value: any) => {
    state.rewindSeekMode = value
  },
  SET_FORWARD_SEEK_MODE: (state: any, value: any) => {
    state.forwardSeekMode = value
  },
  SET_CURRENT_LYRIC: (state: any, line: any) => {
    state.currentLyric = line
  },
  SET_SLEEP_TIMER: (state: any, time: any) => {
    state.sleepTime = time
    state.sleepMode = true
  },

  CLEAR_SLEEP_MODE: (state: any) => {
    state.sleepTime = null
    state.sleepMode = false
  },

  SET_LYRIC_CONTENT: (state: any, lyricFile: any) => {
    state.lyricContent = lyricFile
  },

  SET_SUBTITLE_DISPLAY_MODE: (state: any, mode: any) => {
    if (['in-app', 'pip'].includes(mode))
      state.subtitleDisplayMode = mode
    else
      state.subtitleDisplayMode = 'in-app'
  },
}

export default mutations