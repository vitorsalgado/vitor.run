<script setup lang="ts">
import { computed } from 'vue'
import { CodeXml, FileText, Landmark, MapPin } from '@lucide/vue'
import { getPostIconName } from '../../../src/lib/post-icon-names.ts'

const props = defineProps<{ tag?: string }>()
const icons = { Code2: CodeXml, FileText, Landmark, MapPin }
const icon = computed(() => {
  return icons[getPostIconName(props.tag)]
})
</script>

<template>
  <component :is="icon" class="post-icon" :size="20" :stroke-width="1.5" aria-hidden="true" />
</template>
