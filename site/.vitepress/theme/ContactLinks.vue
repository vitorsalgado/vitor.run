<script setup lang="ts">
import { Mail, ExternalLink } from '@lucide/vue'
import { SITE, contactLinks } from '../../../src/lib/site.ts'
</script>

<template>
  <ul class="contact-links">
    <li>
      <a :href="`mailto:${SITE.email}`" :aria-label="`Email: ${SITE.email}`">
        <Mail :size="20" aria-hidden="true" />{{ SITE.email }}
      </a>
    </li>
    <li v-for="link in contactLinks" :key="link.label">
      <a
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`${link.label} (opens in new tab)`"
      >
        <ExternalLink :size="20" aria-hidden="true" />{{ link.label }}
      </a>
    </li>
  </ul>
</template>
