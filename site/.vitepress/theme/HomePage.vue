<script setup lang="ts">
import avatar from '../../../src/assets/avatar.jpeg'
import { socialLinks } from '../../../src/lib/social'
</script>

<template>
  <section class="home-page">
    <img :src="avatar" alt="Vitor Hugo Salgado" width="160" height="160" fetchpriority="high" />
    <h1>Vitor Hugo Salgado</h1>
    <p class="home-introduction">
      Software Engineer<br />
      From São Paulo, Brasil 🇧🇷, currently living in Berlin, Germany 🇩🇪
    </p>
    <p class="home-quote">We are what we do, especially what we do to change what we are.</p>
    <nav aria-label="Social links">
      <a v-for="link in socialLinks" :key="link.platform" :href="link.href"
        target="_blank" rel="noopener noreferrer" :aria-label="`${link.label} (opens in new tab)`">
        {{ link.label }}
      </a>
    </nav>
  </section>
</template>
