<template>
  <q-page padding>
    <div class="fit row wrap justify-between items-start q-px-sm">
      <div class="col-lg-3 col-sm-12 col-xs-12">
          <q-btn-toggle
            v-model="mode"
            @input="changeMode"
            spread
            no-caps
            rounded
            toggle-color="primary"
            :color="color"
            class="text-bold"
            :text-color="textColor"
            :options="[
              {label: $t('favourites.myReview'), value: 'review'},
              {label: $t('favourites.myProgress'), value: 'progress'},
              {label: $t('favourites.folder'), value: 'folder'}
            ]"
          />
      </div>
      <div class="col-auto gt-sm row">
        <q-select
          dense rounded outlined
          v-model="sortBy"
          :options="sortOptions"
          :bg-color="color"
          class="q-mx-sm"
          :option-label="option => $t(option.label)"
        />
        <q-btn
          :disable="sortButtonDisabled"
          dense
          rounded
          :color="color"
          :text-color="textColor"
          v-show="!sortButtonDisabled"
          :icon="direction? 'arrow_downward' : 'arrow_upward'"
          @click="switchSortMode"
        />
      </div>

    </div>
    <div class="q-pt-md q-px-sm">
      <q-btn-toggle
        v-if="mode === 'progress'"
        v-model="progressFilter"
        @input="changeProgressFilter"
        toggle-color="primary"
        color="white"
        text-color="black"
        rounded
        :options="[
          {label: $t('common.progressEnum.marked'), value: 'marked'},
          {label: $t('common.progressEnum.listening'), value: 'listening'},
          {label: $t('common.progressEnum.listened'), value: 'listened'},
          {label: $t('common.progressEnum.replay'), value: 'replay'},
          {label: $t('common.progressEnum.postponed'), value: 'postponed'}
        ]"
        :option-label="option => $t(option.label)"
      />
    </div>

    <div class="q-pt-md">
      <div class="q-px-sm q-py-md">
        <q-infinite-scroll @load="onLoad" :offset="500" :disable="stopLoad" ref="scroll" v-if="mode !=='folder'">
          <div class="row justify-center text-grey" v-if="works.length === 0">{{$t('favourites.favouriteEmptyTips')}}</div>
          <q-list bordered separator :class="!$q.dark.isActive ? 'shadow-2' : ''" v-if="works.length">
             <FavListItem v-for="work in works" :key="work.id" :workid="work.id" :metadata="work" @reset="reset()" :mode="mode"></FavListItem>
          </q-list>
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </q-infinite-scroll>

        <div v-else class="row justify-center text-grey">{{$t('common.comingSoon')}}</div>
      </div>
    </div>
  </q-page>
</template>

<script>
import FavListItem from 'components/FavListItem'
import NotifyMixin from '../mixins/Notification.js'
import DarkMode from '../mixins/DarkMode'

export default {
  name: 'Favourites',

  mixins: [NotifyMixin, DarkMode],

  components: {
    FavListItem
  },

  props: {
    route: {
      type: String,
      default: 'review'
    },
    progress: {
      type: String,
      default: 'marked'
    }
  },

  computed: {
    direction () {
      return this.sortMode === 'desc'
    },

    sortButtonDisabled () {
      return this.sortBy.order === 'allage' || this.sortBy.order === 'nsfw'
    }
  },

  data() {
    return {
      mode: 'review',
      progressFilter: 'marked',
      works: [],
      stopLoad: false,
      pagination: { currentPage:0, pageSize:12, totalCount:0 },
      sortMode: 'desc',
      sortBy: {
          label: 'favourites.sortOptions.markedTime',
          order: 'updated_at'
        },
      sortOptions: [
        {
          label: 'favourites.sortOptions.markedTime',
          order: 'updated_at'
        },
        {
          label: 'favourites.sortOptions.rating',
          order: 'userRating'
        },
        {
          label: 'favourites.sortOptions.releaseDate',
          order: 'release'
        },
        {
          label: 'favourites.sortOptions.reviewCount',
          order: 'review_count'
        },
        {
          label: 'favourites.sortOptions.dlCount',
          order: 'dl_count'
        },
        {
          label: 'favourites.sortOptions.sfw',
          order: 'allage'
        },
        {
          label: 'favourites.sortOptions.nsfw',
          order: 'nsfw'
        }
      ]
    }
  },

  head() {
    return {
      title: 'Favourites',
      titleTemplate: '%s - ASMR Online',
      meta: [
        { name: "robot", content: "noindex" }
      ]
    }
  },

  created() {
    this.mode = this.route;
    this.progressFilter = this.progress;
  },

  mounted() {
    if (localStorage.sortByFavourites) {
      try {
        this.sortBy = JSON.parse(localStorage.sortByFavourites);
      } catch {
        localStorage.removeItem('sortByFavourites');
      }
    }
  },

  watch: {
    sortBy(newSortOptionSetting) {
      localStorage.sortByFavourites = JSON.stringify(newSortOptionSetting);
      this.reset();
    },

    sortMode() {
      this.reset();
    },

    // Browser back and forth
    route() {
      this.mode = this.route;
      this.reset();
    },
    progress() {
      this.progressFilter = this.progress;
      this.reset();
    }
  },

  methods: {
    // Split two-way binding
    changeMode(newMode) {
      this.$router.push(`/favourites/${newMode}`);
      this.reset();
    },

    // Split two-way binding
    changeProgressFilter(newFilter) {
      this.$router.push(`/favourites/progress/${newFilter}`);
      this.reset();
    },

    switchSortMode() {
      if(this.sortMode ==='desc') {
        this.sortMode = 'asc'
      } else {
        this.sortMode = 'desc'
      }
    },

    onLoad (index, done) {
      this.requestWorksQueue()
        .then(() => done())
    },

    reset () {
      // Freeze the scroller first
      this.stopLoad = true
      this.pagination = { currentPage:0, pageSize:12, totalCount:0 }
      // Manually fetch first page content before enable scroller
      // Note: the internal API of the infinite scroller does not work well
      this.requestWorksQueue()
        .then(() => {
          this.stopLoad = false
        })
    },

    requestWorksQueue () {
      const params = {
        order: this.sortBy.order,
        sort: this.sortMode,
        page: this.pagination.currentPage + 1 || 1
      }

      if (this.sortBy.order === 'allage') {
        params.order = 'nsfw'
        params.sort = 'asc'
      }

      if (this.sortBy.order === 'nsfw') {
        params.order = 'nsfw'
        params.sort = 'desc'
      }

      if (this.mode === 'progress') {
        params.filter = this.progressFilter;
      }

      return this.$axios.get('/api/review', { params })
        .then((response) => {
          const works = response.data.works
          this.works = (params.page === 1) ? works.concat() : this.works.concat(works)
          this.pagination = response.data.pagination

          if (this.works.length >= this.pagination.totalCount) {
            this.stopLoad = true
          }
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
          this.stopLoad = true
        })
    },
  }
}
</script>
