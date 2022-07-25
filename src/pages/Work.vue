<template>
  <div>
    <WorkDetails :metadata="metadata" @reset="requestData()" />
    <!-- <WorkQueue :queue="tracks" :editable="false" /> -->
    <WorkTree :tree="tree" :editable="false" />
  </div>
</template>

<script>
import WorkDetails from 'components/WorkDetails'
import TagI18N from "src/mixins/TagI18N";
// import WorkQueue from 'components/WorkQueue'
import WorkTree from 'components/WorkTree'
import NotifyMixin from '../mixins/Notification.js'

export default {
  name: 'Work',

  mixins: [NotifyMixin, TagI18N],

  components: {
    WorkDetails,
    // WorkQueue,
    WorkTree
  },

  data () {
    return {
      workid: this.$route.params.id,
      metadata: {
        id: parseInt(this.$route.params.id),
        circle: {},
        vas: [],
        tags: [],
      },
      tree: []
    }
  },

  metaInfo () {
    return {
      title: this.pageTitle,
      meta: [
        { property: "og:site_name", content: "ASMR Online" },
        { property: "og:url", content: `https://www.asmr.one/work/${this.rjCode}` },
        { property: "og:type", content: "website" },
        { property: "og:title", content: `${this.ogTitle}` },
        { property: "og:description", content: this.ogDesc },
        { property: "og:image", content: this.metadata.mainCoverUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image:src", content: this.metadata.mainCoverUrl },
        { name: "description", content: this.searchDesc, vmid: "description"}
      ]
    }
  },

  computed: {
    rjCode() {
      return `RJ${(`000000${this.metadata.id}`).slice(-6)}`
    },
    ogTitle() {
      return `${this.metadata.title} - ASMR Online`;
    },
    ogDesc() {
      return  `🆔 RJ Code: ${this.rjCode}
⭕ Circle: ${this.metadata.circle.name}
🎙️ Actors: ${this.metadata.vas.map(v => v.name).join(', ')}
🏷️ Tags(jp): ${this.metadata.tags.map(v => this.getLocaleTagName(v, 'ja-jp')).join(', ')}
🏷️ Tags(en): ${this.metadata.tags.map(v => this.getLocaleTagName(v, 'en-us')).join(', ')}
📅 Release: ${this.metadata.release}
💰 DLSite Price: ${this.metadata.price} ￥
📦 DLSite Sales: ${this.metadata.dl_count}
Listen Online For FREE!
${this.metadata.nsfw ? '🔞 NSFW' : '🟢 SFW'}`;
    },
    pageTitle() {
      return `${this.rjCode} ${this.metadata.title} - ASMR Online`;
    },
    searchDesc() {
      // 把文件展示出来
      let desc = ''
      this.getFiles(this.tree).forEach((file) => {
        desc += `${file.title}    \n`
      })
      return desc
    }
  },

  watch: {
    $route (to) {
      this.workid = to.params.id;
      this.requestData();
    }
  },

  created () {
    this.requestData()
  },

  methods: {
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
    requestData () {
      this.$axios.get(`/api/work/${this.workid}`)
        .then(response => {
          this.metadata = response.data
        })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          } else {
            this.showErrNotif(error.message || error)
          }
        })

      this.$axios.get(`/api/tracks/${this.workid}`)
        .then(response => {
          this.tree = response.data
        })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          } else {
            this.showErrNotif(error.message || error)
          }
        })
    },
  }
}
</script>
