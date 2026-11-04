<script setup lang="ts">
import { ArrowUpRight, Blocks, Coffee, FileCode2 } from '@lucide/vue'

const projects = [
  {
    name: 'VLatte',
    icon: Coffee,
    category: 'Go · API testing',
    description:
      'Mock HTTP and gRPC services in Go tests, or run mock servers from YAML and JSON files with a standalone CLI.',
    highlights: 'Request matching · Fault injection · Recording & replay',
    links: [
      { label: 'Visit website', href: 'https://vlatte.dev/' },
      { label: 'GitHub', href: 'https://github.com/caffeine-projects/vlatte' },
    ],
  },
  {
    name: 'CaffeineJS',
    icon: Blocks,
    category: 'TypeScript · Backend framework',
    description:
      'A modular framework for server-side applications, built on standard ECMAScript decorators with end-to-end type safety.',
    highlights: 'Dependency injection · HTTP · Messaging',
    workInProgress: true,
    note: 'Under active development; APIs may change.',
    links: [{ label: 'Explore on GitHub', href: 'https://github.com/caffeinejs/caffeine' }],
  },
  {
    name: 'Puma4J',
    icon: FileCode2,
    category: 'Java & Kotlin · Test utilities',
    description:
      'Load and parse file resources in JUnit 5 tests with annotations. Keep test fixtures close to your tests and reduce setup code.',
    highlights: 'JSON & YAML · Custom parsing · Kotlin delegates',
    links: [{ label: 'View on GitHub', href: 'https://github.com/vitorsalgado/puma4j' }],
  },
]
</script>

<template>
  <main class="open-source-page">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span aria-hidden="true">/</span>
      <span aria-current="page">Open Source</span>
    </nav>
    <h1>Open Source</h1>
    <p class="open-source-introduction">
      I enjoy building tools that make software development a little easier. Here are a few of my
      open source projects.
    </p>

    <div class="open-source-projects">
      <article
        v-for="project in projects"
        :key="project.name"
        class="open-source-project"
        :aria-label="project.name"
      >
        <component
          :is="project.icon"
          class="open-source-icon"
          :size="24"
          :stroke-width="1.5"
          aria-hidden="true"
        />
        <div>
          <div class="open-source-title">
            <h2>{{ project.name }}</h2>
            <span v-if="project.workInProgress" class="open-source-wip">Work in progress</span>
          </div>
          <p class="open-source-category">{{ project.category }}</p>
          <p class="open-source-description">{{ project.description }}</p>
          <p class="open-source-highlights">{{ project.highlights }}</p>
          <p v-if="project.note" class="open-source-note">{{ project.note }}</p>
          <div class="open-source-actions">
            <a
              v-for="(link, index) in project.links"
              :key="link.href"
              :class="{ 'open-source-primary': index === 0 }"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`${project.name}: ${link.label} (opens in new tab)`"
            >
              {{ link.label }}<ArrowUpRight :size="14" aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>
