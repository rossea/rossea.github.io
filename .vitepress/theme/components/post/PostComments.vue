<script setup lang="ts">
import Giscus from '@giscus/vue'
</script>

<template>
  <Giscus
    id="announcements"
    repo="rossea/rossea.github.io"
    repoId="R_kgDOSVA59g"
    category="Announcements"
    categoryId="DIC_kwDOSVA59s4C8bHQ"
    mapping="pathname"
    theme="preferred_color_scheme"
    loading="lazy"
  />
</template>

<style scoped>
@reference '../../styles/index.css';

giscus-widget::part(iframe) {
  @apply mt-8;
}
</style>
