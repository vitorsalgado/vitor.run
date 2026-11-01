<script setup lang="ts">
import { onMounted } from 'vue'
import { useData } from 'vitepress'
import { SITE } from '../../../src/lib/site'

const { theme } = useData()
onMounted(() => {
  if (!theme.value.production || !SITE.googleAnalyticsId || window.location.origin !== SITE.url) return
  if (document.getElementById('site-analytics')) return
  const target = window as Window & {
    dataLayer?: IArguments[]
    gtag?: (...args: unknown[]) => void
  }
  target.dataLayer ??= []
  target.gtag ??= function () { target.dataLayer!.push(arguments) }
  target.gtag('js', new Date())
  // GA4 owns initial and history page views.
  target.gtag('config', SITE.googleAnalyticsId)
  const script = document.createElement('script')
  script.id = 'site-analytics'
  script.src = `https://www.googletagmanager.com/gtag/js?id=${SITE.googleAnalyticsId}`
  script.async = true
  document.head.appendChild(script)
})
</script>

<template><span aria-hidden="true" /></template>
