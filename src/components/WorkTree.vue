<script>
import { mapState } from 'pinia'
import { mediaDownloadURL, mediaStreamURL } from 'src/utils/url'
import { formatSeconds } from 'src/utils/time'
import { useAudioPlayerStore } from 'src/stores/audio-player'

export default {
  name: 'WorkTree',

  props: {
    tree: {
      type: Array,
      required: true,
    },
    metadata: {
      type: Object,
      required: true,
    },
  },

  setup() {
    return {
      audioPlayerStore: useAudioPlayerStore(),
    }
  },

  data() {
    return {
      // path: []
    }
  },

  computed: {
    path: {
      get() {
        return this.$route.query.path ? JSON.parse(this.$route.query.path) : this.getInitialPath()
      },
      set(path) {
        this.$router.push({
          name: this.$route.name,
          query: { path: JSON.stringify(path) },
          hash: '#work-tree',
        })
      },
    },

    ...mapState(useAudioPlayerStore, [
      'qualityBehavior',
      'playing',
      'currentPlayingFile',
    ]),

    currentFolder() {
      if (!this.tree.length)
        return []
      let fatherFolder = this.tree.concat()
      this.path.forEach((folderName) => {
        fatherFolder = fatherFolder.find(item => item.type === 'folder' && item.title === folderName).children
      })

      return fatherFolder
    },

    queue() {
      const queue = []
      this.currentFolder.forEach((item) => {
        if (item.type === 'audio')
          queue.push(item)
      })

      return queue
    },
  },

  watch: {
    tree() {
      this.prefetchAudioUrls()
    },
  },

  methods: {
    formatSeconds,
    playIcon(hash) {
      return (this.playing && this.currentPlayingFile.hash) === hash ? 'pause' : 'play_arrow'
    },

    getInitialPath() {
      const initialPath = []
      let fatherFolder = this.tree.concat()
      while (fatherFolder.length === 1) {
        if (fatherFolder[0].type === 'audio')
          break

        initialPath.push(fatherFolder[0].title)
        fatherFolder = fatherFolder[0].children
      }
      // this.path = initialPath
      return initialPath
    },

    onClickBreadcrumb(index) {
      this.path = this.path.slice(0, index + 1)
    },

    onClickItem(item) {
      if (item.type === 'folder') {
        this.path = [...this.path, item.title]
      }
      else if (item.type === 'text' || item.type === 'image') {
        this.openFile(item)
      }
      else if (item.type === 'other') {
        this.download(item)
      }
      else if (this.currentPlayingFile.hash !== item.hash) {
        this.audioPlayerStore.SET_QUEUE({
          queue: this.queue.concat(),
          index: this.queue.findIndex(file => file.hash === item.hash),
          resetPlaying: true,
        })
        this.audioPlayerStore.SET_METADATA(this.metadata)
      }
    },

    onClickPlayButton(hash) {
      if (this.currentPlayingFile.hash === hash) {
        this.audioPlayerStore.TOGGLE_WANT_PLAYING()
      }
      else {
        this.audioPlayerStore.SET_QUEUE({
          queue: this.queue.concat(),
          index: this.queue.findIndex(file => file.hash === hash),
          resetPlaying: true,
        })
      }
    },

    addToQueue(file) {
      this.audioPlayerStore.ADD_TO_QUEUE(file)
    },

    playNext(file) {
      this.audioPlayerStore.PLAY_NEXT(file)
    },

    download(file) {
      const token = this.$q.localStorage.getItem('jwt-token') || ''
      // Fallback to old API for an old backend
      const url = file.mediaDownloadUrl ? `${file.mediaDownloadUrl}?token=${token}` : mediaDownloadURL(file.hash, token)
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.click()
    },

    openFile(file) {
      const token = this.$q.localStorage.getItem('jwt-token') || ''
      // Fallback to old API for an old backend
      const url = file.mediaStreamUrl ? `${file.mediaStreamUrl}?token=${token}` : mediaStreamURL(file.hash, token)
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.click()
    },

    /*
      从 this.tree 及其 children 递归获取所有 audio
     */
    getFiles(tree) {
      const files = []
      tree.forEach((item) => {
        if (item.type === 'audio')
          files.push(item)
        else if (item.type === 'folder')
          files.push(...this.getFiles(item.children))
      })
      return files
    },

    prefetchAudioUrls() {
      // ua prerender 不要预加载
      if (window.navigator.userAgent.startsWith('special-ua-for-prerender-'))
        return

      // 由于 mp3 m4a 文件进入 cdn 缓存之前加载延迟很高（约 1-2s）
      // 因此在进入页面时就通知 workers 对所有音频文件进行缓存预热，
      // 使其进入 cloudflare workers 缓存
      const files = this.getFiles(this.tree)

      files.forEach((file) => {
        // 按照音质偏好筛选 url
        let url
        if (this.qualityBehavior === 'fluentFirst' && file.streamLowQualityUrl)
          url = file.streamLowQualityUrl
        else
          url = file.mediaStreamUrl

        // const audio = new Audio()
        // audio.src = url
        // audio.preload = 'auto'
        // audio.load()

        // 注意：此功能依靠 preflight 实现
        // 跨域请求时，通常为 OPTIONS + {你自己的 method} 一共两个请求
        // 为了降低 workers 费用，workers 接到 preflight OPTIONS 请求就会开始缓存文件
        // 但是返回的 cors 中不包含 access-control-allow-methods
        // 这样第二个请求就不会发出，能节约一些成本
        this.$axios.options(url, {}).catch(() => {})
      })
    },
  },
}
</script>

<template>
  <div id="work-tree" class="q-ma-md " style="">
    <q-breadcrumbs v-if="path.length" gutter="xs">
      <q-breadcrumbs-el>
        <q-btn no-caps flat dense size="md" icon="folder" style="height: 30px;" @click="path = []">
          ROOT
        </q-btn>
      </q-breadcrumbs-el>

      <q-breadcrumbs-el v-for="(folderName, index) in path" :key="index" class="cursor-pointer">
        <q-btn no-caps flat dense size="md" icon="folder" style="height: 30px;" @click="onClickBreadcrumb(index)">
          {{ folderName }}
        </q-btn>
      </q-breadcrumbs-el>
    </q-breadcrumbs>

    <q-card>
      <q-list separator>
        <q-item
          v-for="(item, index) in currentFolder"
          :key="index"
          v-ripple
          clickable
          :active="item.type === 'audio' && currentPlayingFile.hash === item.hash"
          active-class="text-white bg-teal"
          class="non-selectable"
          @click="onClickItem(item)"
        >
          <q-item-section avatar>
            <q-icon v-if="item.type === 'folder'" size="34px" color="amber" name="folder" />
            <q-icon v-else-if="item.type === 'text'" size="34px" color="info" name="description" />
            <q-icon v-else-if="item.type === 'image'" size="34px" color="orange" name="photo" />
            <q-icon v-else-if="item.type === 'other'" size="34px" color="info" name="description" />
            <q-btn v-else round dense color="primary" :icon="playIcon(item.hash)" @click="onClickPlayButton(item.hash)" />
          </q-item-section>

          <q-item-section>
            <q-item-label lines="2">
              {{ item.title }}
            </q-item-label>
            <q-item-label v-if="item.children" caption lines="1">
              {{ `${$tc('common.item', item.children.length)}` }}
            </q-item-label>
            <q-item-label v-if="item.duration" caption lines="1">
              {{ formatSeconds(item.duration) }}
            </q-item-label>
          </q-item-section>

          <!-- 上下文菜单 -->
          <q-menu
            v-if="item.type === 'audio' || item.type === 'text' || item.type === 'image' || item.type === 'other'"
            touch-position
            context-menu
            auto-close
            transition-show="jump-down"
            transition-hide="jump-up"
          >
            <q-list separator>
              <q-item v-if="item.type === 'audio'" clickable @click="addToQueue(item)">
                <q-item-section>添加到播放列表</q-item-section>
              </q-item>

              <q-item v-if="item.type === 'audio'" clickable @click="playNext(item)">
                <q-item-section>下一曲播放</q-item-section>
              </q-item>

              <q-item clickable @click="download(item)">
                <q-item-section>下载文件</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
    </q-card>
  </div>
</template>
