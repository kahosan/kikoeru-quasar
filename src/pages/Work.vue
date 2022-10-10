<template>
  <div>
    <WorkDetails :metadata="metadata" @reset="requestData()" />
    <!-- <WorkQueue :queue="tracks" :editable="false" /> -->
    <WorkTree :metadata="metadata" :tree="tree" :editable="false" class="q-pb-md"/>
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
    const url = process.env.URL + this.$router.resolve({
      name: 'work',
      params: { id: this.metadata.id.toString().padStart(6, '0') },
    }).href
    return {
      title: this.pageTitle,
      link: [
        { rel: 'canonical', href: url }
      ],
      meta: [
        { property: "og:site_name", content: "ASMR Online" },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:title", content: `${this.ogTitle}` },
        { property: "og:description", content: this.ogDesc },
        { property: "og:image", content: this.metadata.mainCoverUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image:src", content: this.metadata.mainCoverUrl },
        { name: "description", content: this.ogDesc, vmid: "description"}
      ]
    }
  },

  computed: {
    rjCode() {
      return 'RJ' + this.metadata.id.toString().padStart(6, '0')
    },
    ogTitle() {
      return `${this.metadata.title} - ASMR Online`;
    },
    ogDesc() {
      return  `Listen Online For FREE!
🆔 RJ Code: ${this.rjCode}
⭕ Circle: ${this.metadata.circle.name}
🎙️ Actors: ${this.metadata.vas.map(v => v.name).join(', ')}
🏷️ Tags(jp): ${this.metadata.tags.map(v => this.getLocaleTagName(v, 'ja-jp')).join(', ')}
🏷️ Tags(en): ${this.metadata.tags.map(v => this.getLocaleTagName(v, 'en-us')).join(', ')}
📅 Release: ${this.metadata.release}
💰 DLSite Price: ${this.metadata.price}￥
📦 DLSite Sales: ${this.metadata.dl_count}
${this.metadata.nsfw ? '🔞 NSFW' : '🟢 SFW'}`;
    },
    pageTitle() {
      return `${this.rjCode} ${this.metadata.title || ''} - ASMR Online`;
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
    '$route.params.id' (workID) {
      this.workid = workID;
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
      const staticWorkInfoCancelToken = this.$axios.CancelToken.source();

      // 这个接口有缓存，包含作品基础信息
      this.$axios.get(`/api/workInfo/${this.workid}`, {cancelToken: staticWorkInfoCancelToken.token})
        .then(response => {
          this.metadata = {
            ...this.metadata,
            ...response.data
          }
        })

      // 这个接口没缓存，包含当前用户对作品的评分和标记
      this.$axios.get(`/api/work/${this.workid}`)
        .then(response => {
          staticWorkInfoCancelToken.cancel()
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
  },
  beforeRouteEnter(to, from, next) {
    window.specifyBackTarget = {...from, hash: `#${to.params.id}`}
    next()
  },
}
</script>
