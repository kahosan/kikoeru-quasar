<script>
import DarkMode from 'src/mixins/DarkMode'

export default {
  name: 'About',
  components: {},
  mixins: [DarkMode],
  data() {
    return {
      blog: process.env.BLOG_URL,
      mail: process.env.CONTACT_MAIL,
      links: [
        { name: '艾利浩斯图书馆', href: 'https://alhs.live/' },
        { name: '紳士の庭', href: 'https://gmgard.com/' },
        { name: '南+', href: 'https://www.south-plus.net/' },
        { name: '绅士仓库', href: 'https://cangku.io' },
        { name: 'ZodGame', href: 'https://zodgame.xyz/forum.php' },
        { name: '可穿戴科技', href: 'https://wt.tepis.me/' },
      ],
    }
  },

  head() {
    return {
      title: 'About - ASMR Online',
    }
  },
}
</script>

<template>
  <q-page padding>
    <h4 :class="classTextColor">
      Blog
    </h4>
    <q-btn type="a" :href="blog" target="__blank" icon-right="open_in_new" flat>
      ASMR Online Blog
    </q-btn>
    <h4 :class="classTextColor">
      友情链接
    </h4>
    <div v-for="link in links" :key="link.href" class="row">
      <q-btn type="a" :href="link.href" target="__blank" icon-right="open_in_new" flat>
        {{ link.name }}
      </q-btn>
    </div>

    <h4 id="dmca" :class="classTextColor">
      Contact / DMCA
    </h4>
    <p>Please contact {{ mail }}</p>

    <h4 id="contract" :class="classTextColor">
      联系我们
    </h4>
    <p>如果你有任何想法或建议，欢迎联系我们 {{ mail }}</p>
  </q-page>
</template>

<style scoped>
p, a {
  font-size: 18px;
}

h4 {
  margin-bottom: 8px;
}
</style>
