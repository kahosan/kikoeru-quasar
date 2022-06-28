<template>
  <div>
    <div class="text-h5 text-weight-regular q-ma-md">
      {{ pageTitle }}
      <span v-show="pagination.totalCount">
        ({{ pagination.totalCount }})
      </span>
    </div>

    <div :class="`row justify-center ${displayMode === 'list' ? 'list' : 'q-mx-md'}`">
      <!--      <q-infinite-scroll @load="onLoad" :offset="250" :disable="stopLoad" style="max-width: 1680px;" class="col">-->
      <q-page class="col">
        <!-- 不论是否有作品，都显示排序和浏览模式选项 -->
        <div class="row justify-between q-mb-md q-mr-sm">
          <!-- 排序选择框 -->
          <q-select
            dense
            rounded
            outlined
            :bg-color="color"
            transition-show="scale"
            transition-hide="scale"
            v-model="sortOption"
            :options="options"
            :label="$t('works.sort')"
            class="col-auto"
          />

          <q-checkbox v-model="subtitleOnly" label="带字幕" class="row"></q-checkbox>

          <!-- 切换显示模式按钮 -->
          <q-btn-toggle
            dense
            spread
            rounded
            v-model="displayMode"
            toggle-color="primary"
            color="white"
            text-color="primary"
            :options="[
              { icon: 'view_module', value: 'thumbnail' },
              { icon: 'view_column', value: 'detail'},
              { icon: 'list', value: 'list' }
            ]"
            style="width: 85px;"
            class="col-auto"
          />

        </div>

        <!-- 无缩略图的列表 -->
        <q-list v-if="displayMode === 'list'" bordered separator class="shadow-2">
          <WorkListItem v-for="work in works" :key="work.id" :metadata="work" :showLabel=true />
        </q-list>

        <!-- 缩略图或完整卡片 -->
        <div v-else class="row q-col-gutter-x-md q-col-gutter-y-lg">
          <div class="col-xs-12 col-sm-6 col-md-4"
               :class="displayMode === 'detail' ? 'col-lg-3 col-xl-2': 'col-lg-2 col-xl-2'" v-for="work in works"
               :key="work.id">
            <WorkCard :metadata="work" :thumbnailMode="displayMode === 'thumbnail'" class="fit"/>
          </div>
        </div>

        <!-- 无更多作品时 stopLoad = true -->
        <div v-show="stopLoad && maxPage === 0" class="q-mt-lg q-mb-xl text-h6 text-bold text-center">END</div>

        <!-- loading -->
        <div class="row justify-center q-my-md" v-show="loading">
          <q-spinner-dots color="primary" size="40px"/>
        </div>

        <!-- 分页 -->
        <div class="q-py-lg flex flex-center">
<!--          <q-pagination-->
<!--            v-model="page"-->
<!--            :max="maxPage"-->
<!--            :max-pages="7"-->
<!--            :boundary-numbers="false"-->
<!--            v-show="maxPage"-->
<!--          />-->
          <Pagination
            show-quick-jumper
            :class="this.$q.dark.isActive ? 'dark' : ''"
            v-model="page"
            :pageSize="pagination.pageSize"
            :total="pagination.totalCount"
            />
        </div>

        <div class="flex flex-center" v-show="userName === 'guest'">{{$t('works.guestLoginRateLimitTips')}}</div>

      </q-page>
    </div>
  </div>
</template>

<script>
import WorkCard from 'components/WorkCard'
import WorkListItem from 'components/WorkListItem'
import NotifyMixin from '../mixins/Notification.js'
import {mapState} from "vuex";
import DarkMode from '../mixins/DarkMode'
import {Pagination} from 'ant-design-vue';
import 'ant-design-vue/lib/pagination/style/css';

export default {
  name: 'Works',

  mixins: [NotifyMixin, DarkMode],

  components: {
    WorkCard,
    WorkListItem,
    Pagination,
  },

  data() {
    return {
      lastQueryBeforeDeactivate: '',
      active: false,
      displayMode: 'detail',
      showLabel: true,
      detailMode: false,
      stopLoad: false,
      loading: true,
      works: [],
      pageTitle: '',
      // page: 1,
      pagination: {currentPage: 0, pageSize: 12, totalCount: 0},
      seed: 7, // random sort
      subtitleOnly: false,
      previousUrl: '',
      sortOption: {
        label: this.$t('works.new'),
        order: 'create_date',
        sort: 'desc'
      },
      options: [
        {
          label: this.$t('works.releaseDesc'),
          order: 'release',
          sort: 'desc'
        },
        {
          label: this.$t('works.new'),
          order: 'create_date',
          sort: 'desc'
        },
        {
          label: this.$t('works.ratingDesc'),
          order: 'rating',
          sort: 'desc'
        },
        {
          label: this.$t('works.releaseAsc'),
          order: 'release',
          sort: 'asc'
        },
        {
          label: this.$t('works.dlCountDesc'),
          order: 'dl_count',
          sort: 'desc'
        },
        {
          label: this.$t('works.priceAsc'),
          order: 'price',
          sort: 'asc'
        },
        {
          label: this.$t('works.priceDesc'),
          order: 'price',
          sort: 'desc'
        },
        {
          label: this.$t('works.rateAverage2dpDesc'),
          order: 'rate_average_2dp',
          sort: 'desc'
        },
        {
          label: this.$t('works.reviewCountDesc'),
          order: 'review_count',
          sort: 'desc'
        },
        {
          label: this.$t('works.idDesc'),
          order: 'id',
          sort: 'desc'
        },
        {
          label: this.$t('works.idAsc'),
          order: 'id',
          sort: 'asc'
        },
        {
          label: this.$t('works.sfwOnly'),
          order: 'nsfw',
          sort: 'asc'
        },
        {
          label: this.$t('works.random'),
          order: 'random',
          sort: 'desc'
        }
      ]
    }
  },

  metaInfo() {
    return {
      title: this.pageTitle,
      titleTemplate: "%s - ASMR Online"
    }
  },

  created() {
    this.refreshPageTitle();
    this.seed = Math.floor(Math.random() * 100);
  },

  mounted() {
    if (localStorage.sortOption) {
      try {
        let storageSortOption = JSON.parse(localStorage.sortOption);
        // 通过 order + sort 来确定排序选项，而不是 label，以便应对后期修改 label 的情况
        this.sortOption = this.options.find((option) =>
          storageSortOption.order === option.order && storageSortOption.sort === option.sort)
      } catch {
        localStorage.removeItem('sortOption');
      }
    }
    if (localStorage.displayMode) {
      this.displayMode = localStorage.displayMode;
    }
    this.requestWorksQueue()

    this.skipNextReset = true;
  },

  computed: {
    ...mapState('User', {
      userName: 'name'
    }),

    maxPage() {
      return Math.ceil(this.pagination.totalCount / this.pagination.pageSize);
    },

    page: {
      set(page) {
        this.$router.push({
          name: this.$route.name,
          query: { ...this.$route.query, page: page }
        })
      },
      get() {
        return this.$route.query.page ? parseInt(this.$route.query.page) : 1;
      }
    },

    // TODO 把查询参数调整为 type=vas&id=1&page=1
    // 以便于统合 query 发生变更时的逻辑
    // type/id changed -> refreshTitle + requestWorksQueue
    // page changed -> requestWorksQueue
    url() {
      const query = this.$route.query
      if (query.circleId) {
        return `/api/circles/${this.$route.query.circleId}/works`
      } else if (query.tagId) {
        return `/api/tags/${this.$route.query.tagId}/works`
      } else if (query.vaId) {
        return `/api/vas/${this.$route.query.vaId}/works`
      } else if (query.keyword) {
        return `/api/search/${query.keyword}`
      } else {
        return '/api/works'
      }
    }
  },

  // keep-alive hooks
  // <keep-alive /> is set in MainLayout
  activated() {
    this.stopLoad = false

    // 用户从作品详情页返回时，有此处判定是否需要刷新api
    // 当用户返回时的 url 与离开时的 url 不同，
    // 证明用户在作品详情页点击了某些跳转（tag，group etc.)，需要刷新作品列表
    if (JSON.stringify(this.lastQueryBeforeDeactivate) !== JSON.stringify(this.$route.query)) {
      this.lastQueryBeforeDeactivate = this.$route.query
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

  watch: {
    url() {
      // 当用户一直在 works 界面时，api url 的变动由此处处理
      if (this.active) {
        this.reset()
        this.lastQueryBeforeDeactivate = this.$route.query
      }
    },

    sortOption(newSortOptionSetting, oldSortOptionSetting) {
      console.log(`Sort option changed! old: ${JSON.stringify(oldSortOptionSetting)}, new: ${JSON.stringify(newSortOptionSetting)}`)
      if (JSON.stringify(oldSortOptionSetting) !== JSON.stringify(newSortOptionSetting)) {
        localStorage.sortOption = JSON.stringify(newSortOptionSetting);
        this.seed = Math.floor(Math.random() * 100);
        this.reset();
      }
    },

    subtitleOnly() {
      this.reset();
    },

    showLabel(newLabelSetting) {
      localStorage.showLabel = newLabelSetting;
    },

    listMode(newListModeSetting) {
      localStorage.listMode = newListModeSetting;
    },

    detailMode(newModeSetting) {
      localStorage.detailMode = newModeSetting;
    },

    page() {
      // TODO 回到顶部怎么才能更优雅一点？
      document.getElementById("gotop") ? document.getElementById("gotop").click() : false;
      this.requestWorksQueue();
    },
  },

  methods: {
    requestWorksQueue() {
      this.loading = true;
      this.works = {};
      const params = {
        order: this.sortOption.order,
        sort: this.sortOption.sort,
        // page: this.pagination.currentPage + 1 || 1,
        page: this.page,
        seed: this.seed,
        subtitle: this.subtitleOnly ? 1 : 0
      }

      return this.$axios.get(this.url, {params})
        .then((response) => {
          this.loading = false;
          const works = response.data.works
          // this.works = (params.page === 1) ? works.concat() : this.works.concat(works)
          this.works = works.concat();
          this.pagination = response.data.pagination

          if (this.works.length >= this.pagination.totalCount) {
            this.stopLoad = true
          }
        })
        .catch((error) => {
          this.loading = false;
          if (error.response) {
            // 请求已发出，但服务器响应的状态码不在 2xx 范围内
            if (error.response.status !== 401) {
              this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
            }
          } else {
            this.showErrNotif(error.message || error)
          }
          this.stopLoad = true
        })
    },

    refreshPageTitle() {
      if (this.$route.query.circleId || this.$route.query.tagId || this.$route.query.vaId) {
        let url = '', restrict = ''
        if (this.$route.query.circleId) {
          restrict = 'circles'
          url = `/api/${restrict}/${this.$route.query.circleId}`
        } else if (this.$route.query.tagId) {
          restrict = 'tags'
          url = `/api/${restrict}/${this.$route.query.tagId}`
        } else {
          restrict = 'vas'
          url = `/api/${restrict}/${this.$route.query.vaId}`
        }

        this.$axios.get(url)
          .then((response) => {
            const name = response.data.name
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
              if (error.response.status !== 401) {
                this.showErrNotif(error.response.data.error || `${error.response.status} ${error.response.statusText}`)
              }
            } else {
              this.showErrNotif(error.message || error)
            }
          })
      } else if (this.$route.query.keyword) {
        this.pageTitle = `Search by ${this.$route.query.keyword}`
      } else {
        this.pageTitle = 'All works'
      }
    },

    reset() {
      if (this.skipNextReset) {
        this.skipNextReset = false;
        return
      }
      // 当用户浏览完全不同的 works 时会触发本方法
      // 比如：不同标签，社团...
      // 不包含：翻页，keep-alive 返回，
      this.stopLoad = false
      this.refreshPageTitle()
      this.pagination = {currentPage: 0, pageSize: 12, totalCount: 0}

      // TODO 此处逻辑需要通过重写 query 规则进行优化
      if (this.page === 1) {
        // 当 page === 1 时，由本方法调用 requestWorksQueue
        this.requestWorksQueue()
      } else {
        // 否则通过设定 page = 1，触发 this.page 的 watcher，间接调用 requestWorksQueue
        this.page = 1
      }
    },
  }
}
</script>

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

.dark .ant-pagination-item-link,
.dark .ant-pagination-options-quick-jumper {
  color: #fff !important;
  background-color: transparent !important;
  border: none !important;
}

.dark .ant-pagination-item {
  //border: none !important;
  background-color: transparent !important;
}

.dark .ant-pagination-item a {
  color: #fff !important;
}

.dark .ant-pagination-item-ellipsis {
  color: #fff !important;
}

.dark .ant-pagination-options-quick-jumper input {
  background-color: transparent !important;
  color: white;
}

.ant-pagination-item ,
.ant-pagination-jump-next,
.ant-pagination-jump-prev,
.ant-pagination-next,
.ant-pagination-prev {
  @media (max-width: $breakpoint-xs-max) {
    // compact mode
    margin-top: 4px;
    margin-right: 4px;
    margin-bottom: 4px;
    //height: 28px;
    //line-height: 28px;
    //min-width: 28px;
    //border: none !important;
  }
}

body {
  // side effect of antd
  color: black !important;
}

body.body--dark {
  // side effect of antd
  color: #fff !important;
}

.ant-pagination-options {
  @media (max-width: 576px) {
    display: block !important;
    text-align: center !important;
    margin-top: 2px !important;
  }
}

</style>
