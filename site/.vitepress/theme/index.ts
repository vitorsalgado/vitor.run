import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'
import BlogList from './BlogList.vue'
import HomePage from './HomePage.vue'
import PostHeader from './PostHeader.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'doc-before': () => h(PostHeader),
  }),
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('BlogList', BlogList)
  },
} satisfies Theme
