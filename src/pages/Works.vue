<script>
import WorkCard from 'components/WorkCard'
import WorkListItem from 'components/WorkListItem'
import TagI18N from 'src/mixins/tag-i18n'
import { mapState } from 'pinia'
import Language from 'components/Language'
import { formatProductID } from 'src/utils/format-id'
import { useUserStore } from 'src/stores/user'
import DarkMode from '../mixins/dark-mode'
import NotifyMixin from '../mixins/notification'

export default {
  name: 'Works',

  components: {
    WorkCard,
    WorkListItem,
    Language,
  },

  mixins: [NotifyMixin, DarkMode, TagI18N],

  data() {
    return {
      lastUrlBeforeDeactivate: '',
      lastPageBeforeDeactivate: +this.$route.query.page || 1,
      active: false,
      displayMode: window.navigator.userAgent.startsWith('special-ua-for-prerender-') ? 'thumbnail' : 'detail',
      showLabel: true,
      detailMode: false,
      stopLoad: false,
      loading: true,
      works: [],
      pageTitle: '',
      // page: 1,
      pagination: { currentPage: 0, pageSize: 12, totalCount: 0 },
      seed: 7, // random sort
      subtitleOnly: false,
      previousUrl: '',
      sortOption: {
        label: 'works.releaseDesc',
        order: 'release',
        sort: 'desc',
      },
    }
  },

  head() {
    const url = process.env.URL + this.$router.resolve({
      name: 'works',
      query: { ...this.$route.query, page: this.page },
    }).href

    // landing page
    if (JSON.stringify({ ...this.$route.query, page: this.page }) === JSON.stringify({ page: 1 })) {
      return {
        title: 'ASMR Online',
        link: [{ rel: 'canonical', href: process.env.URL }],
        meta: [
          { name: 'description', content: 'Listen ASMR Online For Free! 免费在线 ASMR 同人音声' },
          { name: 'keywords', content: 'ASMR, ASMR Online, 在线音声, 同人音声, Doujin ASMR, Japanese ASMR' },
          { property: 'og:site_name', content: 'ASMR Online' },
          { property: 'og:type', content: 'website' },
          { property: 'og:url', content: process.env.URL },
          { property: 'og:title', content: `${this.pageTitle} - ASMR Online` },
          { property: 'og:image', content: this.metaCover },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:image:src', content: this.metaCover },
        ],
      }
    }

    return {
      title: this.pageTitle,
      titleTemplate: '%s - ASMR Online',
      link: [{ rel: 'canonical', href: url }],
      meta: [
        { property: 'og:site_name', content: 'ASMR Online' },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: `${this.pageTitle} - ASMR Online` },
        { property: 'og:description', content: this.description },
        { property: 'og:image', content: this.metaCover },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image:src', content: this.metaCover },
        { name: 'description', content: this.description, vmid: 'description' },
        // { name: "robot", content: "noindex" }
      ],
    }
  },

  computed: {
    ...mapState(useUserStore, {
      userName: 'name',
    }),

    description() {
      const content = `${this.works.map?.(work => `${formatProductID(work.id, 'RJ')} ${work.title}`).join('\n\n')}\n...`
      return `Listen Online For FREE!\n\n${content}`
    },

    metaCover() {
      return this.works?.[0]?.mainCoverUrl
    },

    maxPage() {
      return Math.ceil(this.pagination.totalCount / this.pagination.pageSize)
    },

    page: {
      set(page) {
        this.lastPageBeforeDeactivate = page
        this.$router.push({
          name: this.$route.name,
          query: { ...this.$route.query, page },
        })
      },
      get() {
        // 如果在列表界面，直接返回当前 page
        // 脱离列表界面（例如进入作品详情）时，返回最后一次获取到的 page
        return Number.parseInt(this.$route.query.page) || (this.active ? 1 : this.lastPageBeforeDeactivate)
      },
    },

    // TODO 把查询参数调整为 type=vas&id=1&page=1
    // 以便于统合 query 发生变更时的逻辑
    // type/id changed -> refreshTitle + requestWorksQueue
    // page changed -> requestWorksQueue
    url() {
      const query = this.$route.query
      if (query.circleId)
        return `/api/circles/${this.$route.query.circleId}/works`
      else if (query.tagId)
        return `/api/tags/${this.$route.query.tagId}/works`
      else if (query.vaId)
        return `/api/vas/${this.$route.query.vaId}/works`
      else if (query.keyword)
        return `/api/search/${query.keyword}`
      else
        return '/api/works'
    },

    options() {
      return [
        {
          label: 'works.releaseDesc',
          order: 'release',
          sort: 'desc',
        },
        {
          label: 'works.ratingDesc',
          order: 'rating',
          sort: 'desc',
        },
        {
          label: 'works.releaseAsc',
          order: 'release',
          sort: 'asc',
        },
        {
          label: 'works.dlCountDesc',
          order: 'dl_count',
          sort: 'desc',
        },
        {
          label: 'works.priceAsc',
          order: 'price',
          sort: 'asc',
        },
        {
          label: 'works.priceDesc',
          order: 'price',
          sort: 'desc',
        },
        {
          label: 'works.rateAverage2dpDesc',
          order: 'rate_average_2dp',
          sort: 'desc',
        },
        {
          label: 'works.reviewCountDesc',
          order: 'review_count',
          sort: 'desc',
        },
        {
          label: 'works.idDesc',
          order: 'id',
          sort: 'desc',
        },
        {
          label: 'works.idAsc',
          order: 'id',
          sort: 'asc',
        },
        {
          label: 'works.sfwOnly',
          order: 'nsfw',
          sort: 'asc',
        },
        {
          label: 'works.random',
          order: 'random',
          sort: 'desc',
        },
      ]
    },
  },

  watch: {
    $route: {
      handler(to) {
        if (to.name === 'work')
          this.active = false
      },
    },

    url() {
      // 当用户一直在 works 界面时，api url 的变动由此处处理
      if (this.active) {
        this.lastUrlBeforeDeactivate = this.url
        this.reset()
      }
    },

    sortOption(newSortOptionSetting, oldSortOptionSetting) {
      console.info(`Sort option changed! old: ${JSON.stringify(oldSortOptionSetting)}, new: ${JSON.stringify(newSortOptionSetting)}`)
      if (JSON.stringify(oldSortOptionSetting) !== JSON.stringify(newSortOptionSetting)) {
        localStorage.sortOption = JSON.stringify(newSortOptionSetting)
        this.seed = Math.floor(Math.random() * 100)
        this.reset()
      }
    },

    subtitleOnly() {
      this.reset()
    },

    showLabel(newLabelSetting) {
      localStorage.showLabel = newLabelSetting
    },

    listMode(newListModeSetting) {
      localStorage.listMode = newListModeSetting
    },

    detailMode(newModeSetting) {
      localStorage.detailMode = newModeSetting
    },

    page() {
      document.getElementById('gotop')?.click()
      if (this.active)
        this.requestWorksQueue()
    },
  },

  created() {
    this.refreshPageTitle()
    this.seed = Math.floor(Math.random() * 100)
  },

  mounted() {
    if (localStorage.sortOption) {
      try {
        const storageSortOption = JSON.parse(localStorage.sortOption)
        // 通过 order + sort 来确定排序选项，而不是 label，以便应对后期修改 label 的情况
        this.sortOption = this.options.find(option =>
          storageSortOption.order === option.order && storageSortOption.sort === option.sort)
      }
      catch {
        localStorage.removeItem('sortOption')
      }
    }
    if (localStorage.displayMode)
      this.displayMode = localStorage.displayMode

    this.requestWorksQueue()
    this.skipNextReset = true
    this.lastPageBeforeDeactivate = this.page
  },

  // keep-alive hooks
  // <keep-alive /> is set in MainLayout
  activated() {
    this.stopLoad = false

    // 用户从作品详情页返回时，有此处判定是否需要刷新api
    // 当用户返回时的 url 与离开时的 url 不同，
    // 证明用户在作品详情页点击了某些跳转（tag，group etc.)，需要刷新作品列表
    if (this.lastUrlBeforeDeactivate !== this.url) {
      this.lastUrlBeforeDeactivate = this.url
      this.reset()
    }

    // 进入 works 页面后，判定移交给 watch.url
    this.active = true
  },

  deactivated() {
    this.stopLoad = true

    // 注销 watch.url 的判定权限
    this.active = false
  },

  methods: {
    requestWorksQueue() {
      this.loading = true
      this.works = {}
      const params = {
        order: this.sortOption.order,
        sort: this.sortOption.sort,
        // page: this.pagination.currentPage + 1 || 1,
        page: this.page,
        seed: this.seed,
        subtitle: this.subtitleOnly ? 1 : 0,
        ...this.$route.query,
      }

      return this.$axios.get(this.url, { params })
        .then((response) => {
          this.loading = false
          const works = response.data.works
          // this.works = (params.page === 1) ? works.concat() : this.works.concat(works)
          this.works = works.concat()
          this.pagination = response.data.pagination

          if (this.works.length >= this.pagination.totalCount)
            this.stopLoad = true
        })
        .catch((error) => {
          this.loading = false
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            if (error.response.status !== 401)
              this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
          }
          else {
            this.showErrNotif(error.message || error)
          }
          this.stopLoad = true
        })
    },

    refreshPageTitle() {
      if (this.$route.query.circleId || this.$route.query.tagId || this.$route.query.vaId) {
        let url = ''
        let restrict = ''
        if (this.$route.query.circleId) {
          restrict = 'circles'
          url = `/api/${restrict}/${this.$route.query.circleId}`
        }
        else if (this.$route.query.tagId) {
          restrict = 'tags'
          url = `/api/${restrict}/${this.$route.query.tagId}`
        }
        else {
          restrict = 'vas'
          url = `/api/${restrict}/${this.$route.query.vaId}`
        }

        this.$axios.get(url)
          .then((response) => {
            const name = this.getLocaleTagName(response.data)
            let pageTitle

            switch (restrict) {
              case 'tags':
                pageTitle = 'Works tagged with '
                break
              case 'vas':
                pageTitle = 'Works voiced by '
                break
              case 'circles':
                pageTitle = 'Works by '
                break
            }
            pageTitle += name || ''

            this.pageTitle = pageTitle
          })
          .catch((error) => {
            if (error.response) {
              // 请求已发出，但服务器响应的状态码不在 2xx 范围内
              if (error.response.status !== 401)
                this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
            }
            else {
              this.showErrNotif(error.message || error)
            }
          })
      }
      else if (this.$route.query.keyword) {
        this.pageTitle = `Search by ${this.$route.query.keyword}`
      }
      else {
        this.pageTitle = 'All works'
      }
    },

    reset() {
      if (this.skipNextReset) {
        this.skipNextReset = false
        return
      }
      // 当用户浏览完全不同的 works 时会触发本方法
      // 比如：不同标签，社团...
      // 不包含：翻页，keep-alive 返回，
      this.stopLoad = false
      this.refreshPageTitle()
      this.pagination = { currentPage: 0, pageSize: 12, totalCount: 0 }

      // TODO 此处逻辑需要通过重写 query 规则进行优化
      if (this.page === 1) {
        // 当 page === 1 时，由本方法调用 requestWorksQueue
        this.requestWorksQueue()
      }
      else {
        // 否则通过设定 page = 1，触发 this.page 的 watcher，间接调用 requestWorksQueue
        this.page = 1
      }
    },
  },
}
</script>

<template>
  <div>
    <div class="text-h5 text-weight-regular q-ma-md flex">
      {{ pageTitle }}
      <span v-show="pagination.totalCount">
        ({{ pagination.totalCount }})
      </span>
      <q-space />
      <Language class="col-auto" />
    </div>

    <div :class="`row justify-center ${displayMode === 'list' ? 'list' : 'q-mx-md'}`">
      <!--      <q-infinite-scroll @load="onLoad" :offset="250" :disable="stopLoad" style="max-width: 1680px;" class="col"> -->
      <q-page class="col">
        <!-- 不论是否有作品，都显示排序和浏览模式选项 -->
        <div class="row justify-between q-mb-md q-mr-sm">
          <!-- 排序选择框 -->
          <q-select
            v-model="sortOption" dense rounded outlined :bg-color="color" transition-show="scale"
            transition-hide="scale" :options="options" :option-label="option => $t(option.label)" :label="$t('works.sort')"
            class="col-auto"
          />

          <q-checkbox
            v-if="$i18n.locale === 'zh-CN'" v-model="subtitleOnly" :label="$t('common.translated')"
            class="row"
          />

          <!-- 切换显示模式按钮 -->
          <q-btn-toggle
            v-model="displayMode" dense spread rounded toggle-color="primary" color="white"
            text-color="primary" :options="[
              { icon: 'view_module', value: 'thumbnail' },
              { icon: 'view_column', value: 'detail' },
              { icon: 'list', value: 'list' },
            ]" style="width: 85px;" class="col-auto"
          />
        </div>

        <!-- 无缩略图的列表 -->
        <q-list v-if="displayMode === 'list'" bordered separator :class="!$q.dark.isActive ? 'shadow-2' : ''">
          <WorkListItem v-for="work in works" :id="work.id" :key="work.id" :metadata="work" :show-label="true" />
        </q-list>

        <!-- 缩略图或完整卡片 -->
        <div v-else class="row q-col-gutter-x-md q-col-gutter-y-lg">
          <div
            v-for="work in works"
            :id="work.id" :key="work.id"
            class="col-xs-12 col-sm-6 col-md-4" :class="displayMode === 'detail' ? 'col-lg-3 col-xl-2' : 'col-lg-2 col-xl-2'"
          >
            <WorkCard :metadata="work" :thumbnail-mode="displayMode === 'thumbnail'" class="fit" />
          </div>
        </div>

        <!-- 无更多作品时 stopLoad = true -->
        <div v-show="stopLoad && maxPage === 0" class="q-mt-lg q-mb-xl text-h6 text-bold text-center">
          END
        </div>

        <!-- loading -->
        <div v-show="loading" class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <!-- 分页 -->
        <div class="q-py-lg flex flex-center">
          <q-pagination
            v-model="page"
            :max="Math.ceil(pagination.totalCount / pagination.pageSize) || 10"
            :min="1"
            input
          />
        </div>

        <div v-show="userName === 'guest'" class="flex flex-center">
          {{ $t('works.guestLoginRateLimitTips') }}
        </div>
      </q-page>
    </div>
  </div>
</template>

<style lang="scss">
.list {

  // 宽度 >= $breakpoint-sm-min
  @media (min-width: $breakpoint-sm-min) {
    padding: 0px 20px;
  }
}

.work-card {

  // 宽度 > $breakpoint-xl-min
  @media (min-width: $breakpoint-md-min) {
    width: 560px;
  }
}
</style>
