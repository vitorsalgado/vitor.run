<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { SITE, siteUrl } from '../../../src/lib/site'

const props = defineProps<{ identifier: string; title: string; language: string }>()
const { isDark } = useData()
const enabled = ref(false)
const failed = ref(false)
type DisqusConfig = (this: {
  page: { identifier: string; url: string; title: string }
  language: string
}) => void
type DisqusWindow = Window & {
  disqus_config?: DisqusConfig
  DISQUS?: { reset: (options: { reload?: boolean; config?: DisqusConfig }) => void }
}

function loadThread() {
  if (!enabled.value) return
  const target = window as DisqusWindow
  const config: DisqusConfig = function () {
    this.page.identifier = props.identifier
    this.page.url = siteUrl(`/blog/${props.identifier}/`)
    this.page.title = Array.from(props.title).slice(0, 200).join('')
    this.language = props.language.replaceAll('-', '_')
  }
  target.disqus_config = config
  if (target.DISQUS) {
    target.DISQUS.reset({ reload: true, config })
  } else if (!document.getElementById('disqus-embed')) {
    const script = document.createElement('script')
    script.id = 'disqus-embed'
    script.src = `https://${SITE.disqusShortname}.disqus.com/embed.js`
    script.async = true
    script.onerror = () => {
      failed.value = true
      script.remove()
    }
    script.onload = () => {
      // The visitor may have navigated away while the vendor script was loading.
      if (!document.getElementById('disqus_thread')) target.DISQUS?.reset({ reload: false })
    }
    document.head.appendChild(script)
  }
}

onMounted(() => {
  // Keep previews from creating threads or sending visits to the live forum.
  enabled.value = Boolean(SITE.disqusShortname) && window.location.origin === SITE.url
  loadThread()
})
watch(isDark, async () => {
  await nextTick()
  loadThread()
}, { flush: 'post' })
onUnmounted(() => {
  enabled.value = false
  const target = window as DisqusWindow
  target.DISQUS?.reset({ reload: false })
})
</script>

<template>
  <section v-if="SITE.disqusShortname" class="post-comments" aria-label="Comments">
    <h2>Comments</h2>
    <div id="disqus_thread" />
    <p v-if="!enabled">Comments are available on the published website with JavaScript enabled.</p>
    <p v-if="failed" role="status">Comments could not be loaded. Please reload the page to try again.</p>
  </section>
</template>
