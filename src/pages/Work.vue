<script>
import WorkDetails from 'components/WorkDetails'
import TagI18N from 'src/mixins/tag-i18n'
import WorkTree from 'components/WorkTree'
import { formatProductID } from 'src/utils/format-id'
import NotifyMixin from '../mixins/notification'

export default {
  name: 'Work',

  components: {
    WorkDetails,
    WorkTree,
  },

  mixins: [NotifyMixin, TagI18N],

  data() {
    return {
      metadata: {
        id: Number.parseInt(this.$route.params.id),
        circle: {},
        vas: [],
        tags: [],
        release: '',
      },
      tree: [],
    }
  },

  head() {
    const url = process.env.URL + this.$router.resolve({
      name: 'work',
      params: { id: formatProductID(this.metadata.id) },
    }).href

    return {
      title: this.pageTitle,
      link: [
        { rel: 'canonical', href: url },
      ],
      meta: [
        { property: 'og:site_name', content: 'ASMR Online' },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: `${this.ogTitle}` },
        { property: 'og:description', content: this.ogDesc },
        { property: 'og:image', content: this.metadata.mainCoverUrl },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image:src', content: this.metadata.mainCoverUrl },
        { name: 'description', content: this.ogDesc, vmid: 'description' },
      ],
    }
  },

  computed: {
    rjCode() {
      return formatProductID(this.metadata.id, 'RJ')
    },

    ogTitle() {
      return `${this.metadata.title} - ASMR Online`
    },

    ogDesc() {
      return this.metadata.circle.name
        ? `Listen Online For FREE!
🆔 RJ Code: ${this.rjCode}
⭕ Circle: ${this.metadata.circle.name}
🎙️ Actors: ${this.metadata.vas.map(v => v.name).join(', ')}
🏷️ Tags(jp): ${this.metadata.tags.map(v => this.getLocaleTagName(v, 'ja-jp')).join(', ')}
🏷️ Tags(en): ${this.metadata.tags.map(v => this.getLocaleTagName(v, 'en-us')).join(', ')}
📅 Release: ${this.metadata.release}
💰 DLSite Price: ${this.metadata.price}￥
📦 DLSite Sales: ${this.metadata.dl_count}
${this.metadata.nsfw ? '🔞 NSFW' : '🟢 SFW'}`
        : ''
    },

    pageTitle() {
      return `${this.rjCode} ${this.metadata.title || ''} - ASMR Online`
    },

    searchDesc() {
      // 把文件展示出来
      let desc = ''
      this.getFiles(this.tree).forEach((file) => {
        desc += `${file.title}    \n`
      })
      return desc
    },
  },

  // 升级 vue3 后，会先显示之前缓存的详细信息，然后再用请求的数据替换，这里是为了解决这个问题
  activated() {
    this.metadata = {
      id: Number.parseInt(this.$route.params.id),
      circle: {},
      vas: [],
      tags: [],
      release: '',
    }

    this.requestData(this.$route.params.id)
  },

  created() {
    this.requestData(this.$route.params.id)
  },

  methods: {
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
    requestData(workId) {
      this.$axios.get(`/api/work/${workId}`)
        .then((response) => {
          this.metadata = response.data
        })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          }
          else {
            this.showErrNotif(error.message || error)
          }
        })

      this.$axios.get(`/api/tracks/${workId}`)
        .then((response) => {
          this.tree = response.data
        })
        .catch((error) => {
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          }
          else {
            this.showErrNotif(error.message || error)
          }
        })
    },
  },
}
</script>

<template>
  <div v-if="metadata.circle.name">
    <WorkDetails :metadata="metadata" @reset="requestData()" />
    <!-- <WorkQueue :queue="tracks" :editable="false" /> -->
    <WorkTree :metadata="metadata" :tree="tree" :editable="false" class="q-pb-md" />
  </div>
</template>
