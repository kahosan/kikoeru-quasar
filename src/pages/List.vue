<script>
import TagI18N from 'src/mixins/TagI18N'
import NotifyMixin from '../mixins/Notification.js'

export default {
  name: 'List',

  mixins: [NotifyMixin, TagI18N],

  props: {
    restrict: {
      type: String,
    },
  },

  data() {
    return {
      items: [],
      keyword: '',
    }
  },

  head() {
    return {
      title: this.title,
      titleTemplate: '%s - ASMR Online',
    }
  },

  computed: {
    title() {
      return `All ${this.restrict}`
    },
    url() {
      return `/api/${this.restrict}/`
    },

    queryField() {
      switch (this.restrict) {
        case 'circles':
          return 'circleId'
        case 'tags':
          return 'tagId'
        case 'vas':
          return 'vaId'
        default:
          return 'circleId'
      }
    },

    filteredItems() {
      return this.items.filter(item => item.name.toLowerCase().includes(this.keyword.toLowerCase()))
    },
  },

  watch: {
    url() {
      this.requestList()
    },
  },

  created() {
    this.requestList()
  },

  methods: {
    requestList() {
      this.$axios.get(this.url)
        .then((response) => {
          this.items = response.data.concat()
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
    },
  },
}
</script>

<template>
  <div>
    <div class="text-h5 text-weight-regular q-ma-md">
      {{ title }}
    </div>

    <div class="row justify-center q-pb-xl q-pt-none">
      <div class="col-11">
        <q-input v-model="keyword" dense rounded outlined :placeholder="`Search for a ${restrict}...`" class="q-mb-md">
          <template #append>
            <q-icon v-if="keyword === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="keyword = ''" />
          </template>
        </q-input>

        <div class="row justify-center q-gutter-sm">
          <div v-for="item in (keyword ? filteredItems : items)" :key="item.id" class="col-auto">
            <q-btn
              no-caps rounded color="primary"
              :label="`${restrict === 'tags' ? getLocaleTagName(item) : item.name} (${item.count})`"
              :to="`/works?${queryField}=${item.id}`"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
