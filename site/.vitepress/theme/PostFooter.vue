<script setup lang="ts">
import { useData } from 'vitepress'
import DisqusComments from './DisqusComments.vue'

const { frontmatter, params } = useData()
</script>

<template>
  <footer v-if="params?.slug" class="post-footer">
    <nav v-if="frontmatter.tags.length" class="tag-list" aria-label="Post tags">
      <a v-for="tag in frontmatter.tags" :key="tag" :href="`/tags/${encodeURIComponent(tag)}/`">{{ tag }}</a>
    </nav>
    <DisqusComments :key="params.slug" :identifier="String(params.slug)"
      :title="frontmatter.title" :language="frontmatter.language" />
  </footer>
</template>
