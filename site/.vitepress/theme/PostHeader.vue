<script setup lang="ts">
import { useData } from 'vitepress'

const { frontmatter, params } = useData()
</script>

<template>
  <header v-if="params.slug" class="post-header">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span aria-hidden="true">/</span>
      <a href="/blog/">Blog</a><span aria-hidden="true">/</span>
      <span aria-current="page">Post</span>
    </nav>
    <h1>{{ frontmatter.title }}</h1>
    <p class="post-description">{{ frontmatter.description }}</p>
    <div class="post-details">
      <time :datetime="frontmatter.date">{{ new Date(frontmatter.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
      }) }}</time>
      <span aria-hidden="true">·</span><span>{{ frontmatter.language.toUpperCase() }}</span>
      <span aria-hidden="true">·</span><span>{{ frontmatter.readTimeMinutes }} min read</span>
    </div>
  </header>
</template>
