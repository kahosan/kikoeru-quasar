<template>
  <div>
    <WorkDetails :metadata="metadata" @reset="requestData()" />
    <!-- <WorkQueue :queue="tracks" :editable="false" /> -->
    <WorkTree :tree="tree" :editable="false" />
  </div>
</template>

<script>
import WorkDetails from 'components/WorkDetails'
// import WorkQueue from 'components/WorkQueue'
import WorkTree from 'components/WorkTree'
import NotifyMixin from '../mixins/Notification.js'

export default {
  name: 'Work',

  mixins: [NotifyMixin],

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
        { property: "og:title", content: `${this.pageTitle}` },
        { property: "og:description", content: this.descriptor },
        { property: "og:image", content: this.metadata.mainCoverUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image:src", content: this.metadata.mainCoverUrl },
        { name: "description", content: this.descriptor, vmid: "description"}
      ]
    }
  },

  computed: {
    rjCode() {
      return `RJ${(`000000${this.metadata.id}`).slice(-6)}`
    },
    pageTitle() {
      return `${this.rjCode} ${this.metadata.title} - ASMR Online`;
    },
    descriptor() {
      return  `Listen Online For FREE!
🆔 RJ Code: ${this.rjCode}
💰 DLSite Price: ${this.metadata.price} JPY
📦 DLSite Sales: ${this.metadata.dl_count}
⭕ Circle: ${this.metadata.circle.name}
🎙️ Actors: ${this.metadata.vas.map(v => v.name).join(', ')}
🏷️ Tags: ${this.metadata.tags.map(v => v.name).join(', ')}
📅 Release: ${this.metadata.release}
${this.metadata.nsfw ? '🔞 NSFW' : '🟢 SFW'}`;
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
