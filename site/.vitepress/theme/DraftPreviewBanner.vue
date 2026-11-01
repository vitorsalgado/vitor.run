<script setup lang="ts">
import { useData } from 'vitepress'

const { theme } = useData()
</script>

<template>
  <aside v-if="theme.draftPreview" class="draft-preview-banner" role="status">
    Draft preview · Unpublished posts included
  </aside>
</template>
