<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  primary: { type: Boolean, default: false },
  small: { type: Boolean, default: false },
})
</script>

<template>
  <div :class="['result-card', { 'result-card-primary': primary }]">
    <p class="result-label">{{ label }}</p>
    <p :class="['result-value', { 'text-2xl sm:text-3xl': small }]">{{ value }}</p>
  </div>
</template>
