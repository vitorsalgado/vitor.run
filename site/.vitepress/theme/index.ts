import { h, onMounted, watch, watchPostEffect } from 'vue'
import { useData, type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import { TentTree } from '@lucide/vue'
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
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-title-before': () => {
        return [
          h(TentTree, {
            class: 'brand-icon',
            size: 24,
            strokeWidth: 1.5,
            'aria-hidden': true,
          }),
          h('span', { class: 'visually-hidden' }, 'Home'),
        ]
      },
      'layout-top': () => {
        return h(DraftPreviewBanner)
      },
      'layout-bottom': () => {
        return h(Analytics)
      },
      'doc-before': () => {
        return h(PostHeader)
      },
      'doc-after': () => {
        return h(PostFooter)
      },
      'nav-screen-content-after': () => {
        return h(MobileMenuFocus)
      },
    })
  },
  setup() {
    const { frontmatter, site, page } = useData()
    // Runtime 404 data has no compiled head; keep it in VitePress's head lifecycle.
    watch(
      () => {
        return page.value.isNotFound
      },
      (missing) => {
        if (missing)
          frontmatter.value.head = [['meta', { name: 'robots', content: 'noindex, nofollow' }]]
      },
      { immediate: true, flush: 'sync' },
    )
    // Posts keep their own language independently of the site's navigation locale.
    onMounted(() => {
      return watchPostEffect(() => {
        document.documentElement.lang = frontmatter.value.lang ?? site.value.lang
      })
    })
  },
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('BlogList', BlogList)
  },
} satisfies Theme
