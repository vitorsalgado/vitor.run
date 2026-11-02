<script setup lang="ts">
import { useData } from 'vitepress'
import PostActions from './PostActions.vue'

const { frontmatter, params, page } = useData()
</script>

<template>
  <div
    v-if="params?.slug || ['about/index.md', 'contact/index.md'].includes(page.relativePath)"
    :class="{ 'post-header': params?.slug }"
  >
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span aria-hidden="true">/</span>
      <a v-if="params?.slug" href="/blog/">Blog</a
      ><span v-if="params?.slug" aria-hidden="true">/</span>
      <span aria-current="page">{{ params?.slug ? 'Post' : frontmatter.title }}</span>
    </nav>
    <template v-if="params?.slug">
      <p v-if="frontmatter.draft" class="draft-badge">Draft · Not published</p>
      <h1>{{ frontmatter.title }}</h1>
      <p class="post-description">{{ frontmatter.description }}</p>
      <div class="post-details">
        <time :datetime="frontmatter.date">{{
          new Date(frontmatter.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          })
        }}</time>
        <span aria-hidden="true">·</span><span>{{ frontmatter.language.toUpperCase() }}</span>
        <span aria-hidden="true">·</span><span>{{ frontmatter.readTimeMinutes }} min read</span>
        <template v-if="!frontmatter.draft"
          ><span aria-hidden="true">·</span><PostActions
        /></template>
      </div>
    </template>
  </div>
</template>
