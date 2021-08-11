const getters = {
  currentPlayingFile: (state) => {
    return state.queue[state.queueIndex] || {
      hash: '',
      title: '',
      workTitle: '',
      mediaStreamUrl: '',
      mediaDownloadUrl: ''
    }
  }
}

export default getters
