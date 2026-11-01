<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../../posts.data'
import PostIcon from './PostIcon.vue'

const props = defineProps<{ tag?: string }>()
const visiblePosts = computed(() => props.tag
  ? posts.filter((post) => post.tags.some((tag) => tag.toLowerCase() === props.tag))
  : posts)
const tags = [...new Set(posts.flatMap((post) => post.tags))].sort()
</script>

<template>
  <main class="blog-list">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span aria-hidden="true">/</span>
      <a v-if="tag" href="/blog/">Blog</a><span v-if="tag" aria-hidden="true">/</span>
      <span aria-current="page">{{ tag || 'Blog' }}</span>
    </nav>
    <h1>{{ tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : 'Blog' }}</h1>
    <ul class="post-list">
      <li v-for="post in visiblePosts" :key="post.slug">
        <time :datetime="post.date">{{ new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
        }) }}</time>
        <h2><a :href="`/blog/${post.slug}/`">{{ post.title }}</a></h2>
        <div class="post-details">
          <PostIcon :tag="post.tags[0]" /><span aria-hidden="true">·</span>
          <span>{{ post.language.toUpperCase() }}</span><span aria-hidden="true">·</span>
          <span>{{ post.readTimeMinutes }} min read</span><span aria-hidden="true">·</span>
          <a v-for="postTag in post.tags" :key="postTag"
            :href="`/tags/${encodeURIComponent(postTag.toLowerCase())}/`">{{ postTag }}</a>
        </div>
        <p>{{ post.description }}</p>
        <a class="read-article" :href="`/blog/${post.slug}/`">Read article <span aria-hidden="true">›</span></a>
      </li>
    </ul>
    <p v-if="!visiblePosts.length">{{ tag ? `No posts tagged with “${tag}”.` : 'No posts yet.' }}</p>
    <nav class="tag-list" aria-label="Post tags">
      <span>Tags</span>
      <a v-for="postTag in tags" :key="postTag"
        :href="`/tags/${encodeURIComponent(postTag.toLowerCase())}/`">{{ postTag }}</a>
    </nav>
  </main>
</template>
