<script setup>
defineProps({
  title: { type: String, required: true },
  body: { type: String, required: true },
})
</script>

<template>
  <div class="cheer-card">
    <p class="note-label">Cheer note</p>
    <h3 class="cheer-title">{{ title }}</h3>
    <p class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{{ body }}</p>
  </div>
</template>
