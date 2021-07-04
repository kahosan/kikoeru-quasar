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
        <!-- 有作品显示时，显示排序和浏览模式选项 -->
        <div v-show="works.length" class="row justify-between q-mb-md q-mr-sm">
          <!-- 排序选择框 -->
          <q-select
            dense
            rounded
            outlined
            bg-color="white"
            transition-show="scale"
            transition-hide="scale"
            v-model="sortOption"
            :options="options"
            label="排序"
            class="col-auto"
          />

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
               :class="displayMode === 'detail' ? 'col-lg-3 col-xl-3': 'col-lg-2 col-xl-2'" v-for="work in works"
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
        <div class="q-pa-lg flex flex-center">
          <q-pagination
            v-model="page"
            :max="maxPage"
            :max-pages="7"
            :boundary-numbers="false"
            v-show="maxPage"
          />
        </div>

        <div class="flex flex-center" v-show="userName === 'guest'">小提示: 使用 guest 账号加载速度会受到限制，推荐注册属于自己的账号</div>

      </q-page>
    </div>
  </div>
</template>

<script>
import WorkCard from 'components/WorkCard'
import WorkListItem from 'components/WorkListItem'
import NotifyMixin from '../mixins/Notification.js'
import {mapState} from "vuex";

export default {
  name: 'Works',

  mixins: [NotifyMixin],

  components: {
    WorkCard,
    WorkListItem
  },

  data() {
    return {
      displayMode: 'detail',
      showLabel: true,
      detailMode: false,
      stopLoad: false,
      loading: true,
      works: [],
      pageTitle: '',
      page: 1,
      pagination: {currentPage: 0, pageSize: 12, totalCount: 0},
      seed: 7, // random sort
      sortOption: {
        label: '按照发售日期新到老的顺序',
        order: 'release',
        sort: 'desc'
      },
      options: [
        {
          label: '按照发售日期新到老的顺序',
          order: 'release',
          sort: 'desc'
        },
        {
          label: '按照我的评价排序',
          order: 'rating',
          sort: 'desc'
        },
        {
          label: '按照发售日期老到新的顺序',
          order: 'release',
          sort: 'asc'
        },
        {
          label: '按照售出数量多到少的顺序',
          order: 'dl_count',
          sort: 'desc'
        },
        {
          label: '按照价格便宜到贵的顺序',
          order: 'price',
          sort: 'asc'
        },
        {
          label: '按照价格贵到便宜的顺序',
          order: 'price',
          sort: 'desc'
        },
        {
          label: '按照评价高到低的顺序',
          order: 'rate_average_2dp',
          sort: 'desc'
        },
        {
          label: '按照评论多到少的顺序',
          order: 'review_count',
          sort: 'desc'
        },
        {
          label: '按照RJ号大到小的顺序',
          order: 'id',
          sort: 'desc'
        },
        {
          label: '按照RJ号小到大的顺序',
          order: 'id',
          sort: 'asc'
        },
        {
          label: '按照全年龄新作优先的顺序',
          order: 'nsfw',
          sort: 'asc'
        },
        {
          label: '随机排序',
          order: 'random',
          sort: 'desc'
        }
      ]
    }
  },

  created() {
    this.refreshPageTitle();
    this.seed = Math.floor(Math.random() * 100);
  },

  mounted() {
    if (localStorage.sortOption) {
      try {
        this.sortOption = JSON.parse(localStorage.sortOption);
      } catch {
        localStorage.removeItem('sortOption');
      }
    }
    if (localStorage.displayMode) {
      this.displayMode = localStorage.displayMode;
    }
    this.requestWorksQueue()
  },

  computed: {
    ...mapState('User', {
      userName: 'name'
    }),

    maxPage() {
      return Math.ceil(this.pagination.totalCount / this.pagination.pageSize);
    },

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
  },

  deactivated() {
    this.stopLoad = true
  },

  watch: {
    url() {
      this.reset()
    },

    sortOption(newSortOptionSetting, oldSortOptionSetting) {
      console.log(`Sort option changed! old: ${JSON.stringify(oldSortOptionSetting)}, new: ${JSON.stringify(newSortOptionSetting)}`)
      if (JSON.stringify(oldSortOptionSetting) !== JSON.stringify(newSortOptionSetting)) {
        localStorage.sortOption = JSON.stringify(newSortOptionSetting);
        this.seed = Math.floor(Math.random() * 100);
        this.reset();
      }
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
    }
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
        seed: this.seed
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
      this.stopLoad = false
      this.refreshPageTitle()
      this.pagination = {currentPage: 0, pageSize: 12, totalCount: 0}
      this.requestWorksQueue()
        .then(() => {
          // this.stopLoad = false
        })
    },
  }
}
</script>

<style lang="scss" scoped>
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
