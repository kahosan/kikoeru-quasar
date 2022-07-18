export default function () {
  return {
    hide: false,

    playingControlSignal: 'nothing',  // ['nothing', 'wantPlay', 'wantPause']

    playing: false, // 实际的播放状态 (true/false)
    currentTime: 0, // 单位: 秒
    duration: 0,
    source: "",
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
      name: "order"
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

    qualityBehavior: "fluentFirst", // "fluentFirst" or "qualityFirst"
  }
}
