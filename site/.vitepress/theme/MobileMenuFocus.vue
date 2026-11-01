<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

function closeOnEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  const toggle = document.querySelector<HTMLButtonElement>('[aria-controls="VPNavScreen"]')
  toggle?.click()
  toggle?.focus()
}

onMounted(() => {
  document.getElementById('VPNavScreen')?.querySelector<HTMLAnchorElement>('a')?.focus()
  document.addEventListener('keydown', closeOnEscape)
})
onUnmounted(() => document.removeEventListener('keydown', closeOnEscape))
</script>

<template><span aria-hidden="true" /></template>
