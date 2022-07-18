<template>
  <div class="q-ma-md " style="">
    <q-breadcrumbs gutter="xs" v-if="path.length">
      <q-breadcrumbs-el   >
        <q-btn no-caps flat dense size="md" icon="folder" style="height: 30px;" @click="path = []">ROOT</q-btn>
      </q-breadcrumbs-el>

      <q-breadcrumbs-el v-for="(folderName, index) in path"  :key="index"  class="cursor-pointer" >
        <q-btn no-caps flat dense size="md" icon="folder" style="height: 30px;" @click="onClickBreadcrumb(index)">{{folderName}}</q-btn>
      </q-breadcrumbs-el>
    </q-breadcrumbs>

    <q-card>
      <q-list separator>
        <q-item
          clickable
          v-ripple
          v-for="(item, index) in fatherFolder"
          :key="index"
          :active="item.type === 'audio' && currentPlayingFile.hash === item.hash"
          active-class="text-white bg-teal"
          @click="onClickItem(item)"
          class="non-selectable"
        >
          <q-item-section avatar>
            <q-icon size="34px" v-if="item.type === 'folder'" color="amber" name="folder" />
            <q-icon size="34px" v-else-if="item.type === 'text'" color="info" name="description" />
            <q-icon size="34px" v-else-if="item.type === 'image'" color="orange" name="photo" />
            <q-icon size="34px" v-else-if="item.type === 'other'" color="info" name="description" />
            <q-btn v-else round dense color="primary" :icon="playIcon(item.hash)" @click="onClickPlayButton(item.hash)" />
          </q-item-section>

          <q-item-section>
            <q-item-label lines="2">{{ item.title }}</q-item-label>
            <q-item-label v-if="item.children" caption lines="1">{{ `${item.children.length} 项目` }}</q-item-label>
            <q-item-label v-if="item.duration" caption lines="1">{{ formatSeconds(item.duration) }}</q-item-label>
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
              <q-item clickable @click="addToQueue(item)" v-if="item.type === 'audio'">
                <q-item-section>添加到播放列表</q-item-section>
              </q-item>

              <q-item clickable @click="playNext(item)" v-if="item.type === 'audio'">
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

<script>
import {mapGetters, mapState} from 'vuex'
import {mediaDownloadURL, mediaStreamURL} from "src/utils/apiURL";
import {formatSeconds} from "src/utils/time";

export default {
  name: 'WorkTree',

  data() {
    return {
      path: []
    }
  },

  props: {
    tree: {
      type: Array,
      required: true,
    },
  },

  watch: {
    tree () {
      this.initPath()
      this.prefetchAudioUrls()
    }
  },

  computed: {
    ...mapState('AudioPlayer', ['qualityBehavior']),
    fatherFolder () {
      let fatherFolder = this.tree.concat()
      this.path.forEach(folderName => {
        fatherFolder = fatherFolder.find(item => item.type === 'folder' && item.title === folderName).children
      })

      return fatherFolder
    },

    queue () {
      const queue = []
      this.fatherFolder.forEach(item => {
        if (item.type === 'audio') {
          queue.push(item)
        }
      })

      return queue
    },

    ...mapState('AudioPlayer', [
      'playing'
    ]),

    ...mapGetters('AudioPlayer', [
      'currentPlayingFile'
    ])
  },

  methods: {
    formatSeconds,
    playIcon (hash) {
      return this.playing && this.currentPlayingFile.hash === hash ? "pause" : "play_arrow"
    },

    initPath () {
      const initialPath = []
      let fatherFolder = this.tree.concat()
      while (fatherFolder.length === 1) {
        if (fatherFolder[0].type === 'audio') {
          break
        }
        initialPath.push(fatherFolder[0].title)
        fatherFolder = fatherFolder[0].children
      }
      this.path = initialPath
    },

    onClickBreadcrumb (index) {
      this.path = this.path.slice(0, index+1)
    },

    onClickItem (item) {
      if (item.type === 'folder') {
        this.path.push(item.title);
      } else if (item.type === 'text' || item.type === 'image') {
        this.openFile(item);
      } else if (item.type === 'other') {
        this.download(item);
      } else if (this.currentPlayingFile.hash !== item.hash) {
        this.$store.commit('AudioPlayer/SET_QUEUE', {
          queue: this.queue.concat(),
          index: this.queue.findIndex(file => file.hash === item.hash),
          resetPlaying: true
        })
      }
    },

    onClickPlayButton (hash) {
      if (this.currentPlayingFile.hash === hash) {
        this.$store.commit('AudioPlayer/TOGGLE_WANT_PLAYING')
      } else {
        this.$store.commit('AudioPlayer/SET_QUEUE', {
          queue: this.queue.concat(),
          index: this.queue.findIndex(file => file.hash === hash),
          resetPlaying: true
        })
      }
    },

    addToQueue (file) {
      this.$store.commit('AudioPlayer/ADD_TO_QUEUE', file)
    },

    playNext (file) {
      this.$store.commit('AudioPlayer/PLAY_NEXT', file)
    },

    download (file) {
      const token = this.$q.localStorage.getItem('jwt-token') || '';
      // Fallback to old API for an old backend
      const url = file.mediaDownloadUrl ? `${file.mediaDownloadUrl}?token=${token}` : mediaDownloadURL(file.hash, token);
      const link = document.createElement('a');
      link.href = url;
      link.target="_blank";
      link.click();
    },

    openFile (file) {
      const token = this.$q.localStorage.getItem('jwt-token') || '';
      // Fallback to old API for an old backend
      const url = file.mediaStreamUrl ? `${file.mediaStreamUrl}?token=${token}` : mediaStreamURL(file.hash, token);
      const link = document.createElement('a');
      link.href = url;
      link.target="_blank";
      link.click();
    },

    /*
      从 this.tree 及其 children 递归获取所有 audio
     */
    getFiles(tree) {
      const files = []
      tree.forEach(item => {
        if (item.type === 'audio') {
          files.push(item)
        } else if (item.type === 'folder') {
          files.push(...this.getFiles(item.children))
        }
      })
      return files
    },

    prefetchAudioUrls () {
      // ua prerender 不要预加载
      if (window.navigator.userAgent.startsWith('special-ua-for-prerender-')) {
        return
      }

      // 由于 mp3 m4a 文件进入 cdn 缓存之前加载延迟很高（约 1-2s）
      // 因此在进入页面时就通知 workers 对所有音频文件进行缓存预热，
      // 使其进入 cloudflare workers 缓存
      const files = this.getFiles(this.tree)

      files.forEach(file => {
        // 按照音质偏好筛选 url
        let url
        if (this.qualityBehavior === "fluentFirst" && file.streamLowQualityUrl) {
          url = file.streamLowQualityUrl
        } else {
          url = file.mediaStreamUrl
        }
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
    }
  }
}
</script>
