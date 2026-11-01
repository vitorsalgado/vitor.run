<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { Link, Share2 } from '@lucide/vue'
import { siteUrl } from '../../../src/lib/site'

const { frontmatter } = useData()
const share = ref<HTMLDetailsElement>()
const status = ref('')
const url = computed(() => siteUrl(`/blog/${frontmatter.value.slug}/`))
const linkedIn = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url.value)}`)
const x = computed(() => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url.value)}&text=${encodeURIComponent(frontmatter.value.title)}`)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(url.value)
    status.value = 'Link copied!'
  } catch {
    status.value = 'Could not copy the link. Use the share links or copy the page address.'
  }
}

function closeShare(event: PointerEvent) {
  if (share.value && !share.value.contains(event.target as Node)) share.value.open = false
}
function escapeShare() {
  if (!share.value?.open) return
  share.value.open = false
  share.value.querySelector('summary')?.focus()
}
watch(url, () => {
  status.value = ''
  if (share.value) share.value.open = false
})
onMounted(() => document.addEventListener('pointerdown', closeShare))
onUnmounted(() => document.removeEventListener('pointerdown', closeShare))
</script>

<template>
  <div class="post-actions">
    <button type="button" aria-label="Copy post link" title="Copy post link" @click="copyLink">
      <Link :size="18" aria-hidden="true" />
    </button>
    <details ref="share" class="post-share" @keydown.esc.prevent="escapeShare">
      <summary aria-label="Share post" title="Share post"><Share2 :size="18" aria-hidden="true" /></summary>
      <nav aria-label="Share options">
        <a :href="linkedIn" target="_blank" rel="noopener noreferrer" @click="share!.open = false">LinkedIn</a>
        <a :href="x" target="_blank" rel="noopener noreferrer" @click="share!.open = false">X</a>
      </nav>
    </details>
    <span class="post-action-status" role="status" aria-live="polite">{{ status }}</span>
  </div>
</template>
