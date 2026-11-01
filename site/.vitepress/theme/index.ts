import { h, onMounted, watch, watchPostEffect } from 'vue'
import { useData, type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import BlogList from './BlogList.vue'
import HomePage from './HomePage.vue'
import PostHeader from './PostHeader.vue'
import PostFooter from './PostFooter.vue'
import MobileMenuFocus from './MobileMenuFocus.vue'
import DraftPreviewBanner from './DraftPreviewBanner.vue'
import Analytics from './Analytics.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'layout-top': () => h(DraftPreviewBanner),
    'layout-bottom': () => h(Analytics),
    'doc-before': () => h(PostHeader),
    'doc-after': () => h(PostFooter),
    'nav-screen-content-after': () => h(MobileMenuFocus),
  }),
  setup() {
    const { frontmatter, site, page } = useData()
    // Runtime 404 data has no compiled head; keep it in VitePress's head lifecycle.
    watch(() => page.value.isNotFound, (missing) => {
      if (missing) frontmatter.value.head = [['meta', { name: 'robots', content: 'noindex, nofollow' }]]
    }, { immediate: true, flush: 'sync' })
    // VitePress 1 tracks site locales, while posts keep their existing language field.
    onMounted(() => watchPostEffect(() => {
      document.documentElement.lang = frontmatter.value.lang ?? site.value.lang
    }))
  },
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('BlogList', BlogList)
  },
} satisfies Theme
