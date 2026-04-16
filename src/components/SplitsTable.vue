<script setup>
import { formatClock, formatDistance } from '../utils.js'

defineProps({
  splits: { type: Array, required: true },
  unit: { type: String, required: true },
})
</script>

<template>
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-rose-100 text-xs uppercase tracking-wide text-slate-500">
        <th class="py-2 text-left font-semibold">Distance</th>
        <th class="py-2 text-right font-semibold">Elapsed time</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="split in splits"
        :key="split.distance"
        class="border-b border-rose-50 last:border-0"
      >
        <td class="py-2 text-slate-600">{{ formatDistance(split.distance) }} {{ unit }}</td>
        <td class="py-2 text-right font-mono font-medium text-slate-900">
          {{ formatClock(split.elapsedSeconds) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
