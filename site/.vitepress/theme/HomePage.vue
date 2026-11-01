<script setup lang="ts">
import avatar from '../../../src/assets/avatar.jpeg'
import { useData } from 'vitepress'
import { VPSocialLinks } from 'vitepress/theme-without-fonts'

const { theme } = useData()
</script>

<template>
  <main class="home-page">
    <img :src="avatar" alt="Vitor Hugo Salgado" width="160" height="160" fetchpriority="high" />
    <h1>Vitor Hugo Salgado</h1>
    <p class="home-introduction">
      Software Engineer<br />
      From São Paulo, Brasil 🇧🇷, currently living in Berlin, Germany 🇩🇪
    </p>
    <p class="home-quote">We are what we do, especially what we do to change what we are.</p>
    <nav aria-label="Social links">
      <VPSocialLinks :links="theme.socialLinks" />
    </nav>
  </main>
</template>
