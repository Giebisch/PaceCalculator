<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  KM_PER_MILE,
  SPLIT_CHECKPOINTS_KM,
  SPLIT_CHECKPOINTS_MI,
  distancePresets,
  distanceToKilometers,
  distanceToMiles,
  formatClock,
  formatDistance,
  formatEditableNumber,
  formatSpeed,
  getPaceCheer,
  getTimeCheer,
  parseClockToSeconds,
  parsePaceToSeconds,
  parsePositiveNumber,
} from './utils.js'
import CheerCard from './components/CheerCard.vue'
import ResultCard from './components/ResultCard.vue'
import SplitsTable from './components/SplitsTable.vue'

const activeTab = ref('time')

function getModeFromUrl() {
  if (typeof window === 'undefined') {
    return 'time'
  }

  const mode = new URLSearchParams(window.location.search).get('mode')

  return mode === 'pace' ? 'pace' : 'time'
}

function syncModeToUrl(mode) {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  url.searchParams.set('mode', mode)
  window.history.replaceState({}, '', url)
}

function handlePopState() {
  activeTab.value = getModeFromUrl()
}

onMounted(() => {
  activeTab.value = getModeFromUrl()
  syncModeToUrl(activeTab.value)
  window.addEventListener('popstate', handlePopState)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState)
})

watch(activeTab, (mode) => {
  syncModeToUrl(mode)
})

const fromTime = reactive({
  distance: '10',
  distanceUnit: 'km',
  hours: '0',
  minutes: '50',
  seconds: '0',
})

const fromPace = reactive({
  distance: '10',
  distanceUnit: 'km',
  paceUnit: 'km',
  paceMinutes: '5',
  paceSeconds: '0',
})

function setDistance(form, value) {
  form.distance = value
}

function switchDistanceUnit(form, nextUnit) {
  if (form.distanceUnit === nextUnit) {
    return
  }

  const distance = parsePositiveNumber(form.distance)

  if (distance) {
    const distanceInKm = distanceToKilometers(distance, form.distanceUnit)
    form.distance = formatEditableNumber(
      nextUnit === 'km' ? distanceInKm : distanceInKm / KM_PER_MILE,
    )
  }

  form.distanceUnit = nextUnit
}

function setPaceFromSeconds(totalSeconds) {
  const rounded = Math.max(1, Math.round(totalSeconds))
  fromPace.paceMinutes = String(Math.floor(rounded / 60))
  fromPace.paceSeconds = String(rounded % 60)
}

function switchPaceUnit(nextUnit) {
  if (fromPace.paceUnit === nextUnit) {
    return
  }

  const paceInSeconds = parsePaceToSeconds(
    fromPace.paceMinutes,
    fromPace.paceSeconds,
  )

  if (paceInSeconds) {
    const convertedSeconds =
      nextUnit === 'km'
        ? fromPace.paceUnit === 'km'
          ? paceInSeconds
          : paceInSeconds / KM_PER_MILE
        : fromPace.paceUnit === 'mi'
          ? paceInSeconds
          : paceInSeconds * KM_PER_MILE

    setPaceFromSeconds(convertedSeconds)
  }

  fromPace.paceUnit = nextUnit
}

const timeToPace = computed(() => {
  const distance = parsePositiveNumber(fromTime.distance)
  const totalSeconds = parseClockToSeconds(
    fromTime.hours,
    fromTime.minutes,
    fromTime.seconds,
  )

  if (!distance || !totalSeconds) {
    return null
  }

  const distanceKm = distanceToKilometers(distance, fromTime.distanceUnit)
  const distanceMiles = distanceToMiles(distance, fromTime.distanceUnit)

  return {
    distanceKm,
    distanceMiles,
    pacePerKm: totalSeconds / distanceKm,
    pacePerMile: totalSeconds / distanceMiles,
    speedKmh: distanceKm / (totalSeconds / 3600),
    speedMph: distanceMiles / (totalSeconds / 3600),
  }
})

const paceToTime = computed(() => {
  const distance = parsePositiveNumber(fromPace.distance)
  const paceInSeconds = parsePaceToSeconds(
    fromPace.paceMinutes,
    fromPace.paceSeconds,
  )

  if (!distance || !paceInSeconds) {
    return null
  }

  const distanceKm = distanceToKilometers(distance, fromPace.distanceUnit)
  const distanceMiles = distanceToMiles(distance, fromPace.distanceUnit)
  const paceUnits = fromPace.paceUnit === 'km' ? distanceKm : distanceMiles
  const totalSeconds = paceUnits * paceInSeconds

  return {
    distanceKm,
    distanceMiles,
    totalSeconds,
    pacePerKm: totalSeconds / distanceKm,
    pacePerMile: totalSeconds / distanceMiles,
    speedKmh: distanceKm / (totalSeconds / 3600),
    speedMph: distanceMiles / (totalSeconds / 3600),
  }
})

const timeCheer = computed(() => getTimeCheer(timeToPace.value))
const paceCheer = computed(() => getPaceCheer(paceToTime.value))

// Error feedback: only show when the user has partially filled in values
const timeInputError = computed(() => {
  const dist = parsePositiveNumber(fromTime.distance)
  const secs = parseClockToSeconds(fromTime.hours, fromTime.minutes, fromTime.seconds)
  if (!dist && !secs) return null
  if (!dist) return 'Enter a distance greater than zero.'
  if (!secs) return 'Enter a time greater than zero.'
  return null
})

const paceInputError = computed(() => {
  const dist = parsePositiveNumber(fromPace.distance)
  const secs = parsePaceToSeconds(fromPace.paceMinutes, fromPace.paceSeconds)
  if (!dist && !secs) return null
  if (!dist) return 'Enter a distance greater than zero.'
  if (!secs) return 'Enter a pace greater than zero.'
  return null
})

// Splits table
const timeToPaceSplits = computed(() => {
  const r = timeToPace.value
  if (!r) return null
  const checkpoints =
    fromTime.distanceUnit === 'km'
      ? SPLIT_CHECKPOINTS_KM.filter((d) => d <= r.distanceKm + 0.01)
      : SPLIT_CHECKPOINTS_MI.filter((d) => d <= r.distanceMiles + 0.01)
  return checkpoints.map((d) => ({
    distance: d,
    elapsedSeconds: d * (fromTime.distanceUnit === 'km' ? r.pacePerKm : r.pacePerMile),
  }))
})

const paceToTimeSplits = computed(() => {
  const r = paceToTime.value
  if (!r) return null
  const checkpoints =
    fromPace.distanceUnit === 'km'
      ? SPLIT_CHECKPOINTS_KM.filter((d) => d <= r.distanceKm + 0.01)
      : SPLIT_CHECKPOINTS_MI.filter((d) => d <= r.distanceMiles + 0.01)
  return checkpoints.map((d) => ({
    distance: d,
    elapsedSeconds: d * (fromPace.distanceUnit === 'km' ? r.pacePerKm : r.pacePerMile),
  }))
})
</script>

<template>
  <main class="relative overflow-hidden">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,_rgba(251,207,232,0.22),_transparent_48%)]"></div>

    <div class="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
      <header class="hero-panel">
        <div aria-hidden="true" class="hero-bloom hero-bloom-pink hidden sm:block"></div>
        <div aria-hidden="true" class="hero-bloom hero-bloom-sky hidden sm:block"></div>

        <div class="relative max-w-2xl">
          <p class="eyebrow">Running & Cycling Pace Calculator</p>
          <h1 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl lg:text-5xl">
            Calculate pace, distance, and finish time for running and cycling.
          </h1>
          <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base">
            Enter the values you know and instantly convert between distance, total time, and pace in kilometers or miles.
          </p>

          <div class="note-card hidden md:block">
            <p class="note-label">Little pep talk</p>
            <p class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              You do not need perfect splits to do something wonderful. Start kind and
              stay steady.
            </p>
          </div>
        </div>
      </header>

      <section class="panel flex-1">
        <div class="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:gap-4 sm:pb-5 md:flex-row md:items-end md:justify-between">
          <div class="max-w-2xl min-w-0">
            <p class="eyebrow">Pick your calculator mode</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {{ activeTab === 'time' ? 'Total time to pace' : 'Target pace to finish time' }}
            </h2>
            <p class="mt-1 text-sm leading-6 text-slate-600 sm:mt-2 sm:text-base">
              {{
                activeTab === 'time'
                  ? 'Know your finish goal? I will turn it into a pace you can follow with calm, happy confidence.'
                  : 'Know the pace you want to hold? I will translate it into a finish time that feels real and reachable.'
              }}
            </p>
          </div>

          <div class="tab-switch" role="tablist" aria-label="Calculator mode">
            <button
              :class="['tab-button', { 'tab-button-active': activeTab === 'time' }]"
              :aria-selected="activeTab === 'time'"
              role="tab"
              type="button"
              @click="activeTab = 'time'"
            >
              Time &rarr; Pace
            </button>
            <button
              :class="['tab-button', { 'tab-button-active': activeTab === 'pace' }]"
              :aria-selected="activeTab === 'pace'"
              role="tab"
              type="button"
              @click="activeTab = 'pace'"
            >
              Pace &rarr; Time
            </button>
          </div>
        </div>

        <!-- Time → Pace tab -->
        <article v-if="activeTab === 'time'" class="mt-6 flex flex-col gap-6" role="tabpanel">
          <div class="grid gap-5">
            <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label class="field">
                <span class="field-label">Distance</span>
                <input
                  v-model="fromTime.distance"
                  class="text-input"
                  type="number"
                  min="0"
                  step="0.01"
                  inputmode="decimal"
                  autocomplete="off"
                  placeholder="10"
                />
              </label>

              <div class="field sm:min-w-36">
                <span class="field-label">Unit</span>
                <div class="unit-switch">
                  <button
                    :class="['unit-button', { 'unit-button-active': fromTime.distanceUnit === 'km' }]"
                    type="button"
                    @click="switchDistanceUnit(fromTime, 'km')"
                  >
                    km
                  </button>
                  <button
                    :class="['unit-button', { 'unit-button-active': fromTime.distanceUnit === 'mi' }]"
                    type="button"
                    @click="switchDistanceUnit(fromTime, 'mi')"
                  >
                    mi
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p class="mb-2 text-sm text-slate-500">Popular distances</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="preset in distancePresets[fromTime.distanceUnit]"
                  :key="`time-${fromTime.distanceUnit}-${preset.label}`"
                  class="shortcut"
                  type="button"
                  @click="setDistance(fromTime, preset.value)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <label class="field">
                <span class="field-label">Hours</span>
                <input
                  v-model="fromTime.hours"
                  class="text-input"
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="0"
                />
              </label>

              <label class="field">
                <span class="field-label">Minutes</span>
                <input
                  v-model="fromTime.minutes"
                  class="text-input"
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="50"
                />
              </label>

              <label class="field">
                <span class="field-label">Seconds</span>
                <input
                  v-model="fromTime.seconds"
                  class="text-input"
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="0"
                />
              </label>
            </div>
          </div>

          <p v-if="timeInputError" class="text-sm text-rose-500" role="alert">
            {{ timeInputError }}
          </p>

          <div aria-live="polite" class="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Pace /km"
              :value="timeToPace ? `${formatClock(timeToPace.pacePerKm)} /km` : '--'"
              :primary="true"
            />
            <ResultCard
              label="Pace /mile"
              :value="timeToPace ? `${formatClock(timeToPace.pacePerMile)} /mi` : '--'"
            />
          </div>

          <div class="support-card text-sm leading-6 text-slate-600">
            <template v-if="timeToPace">
              {{ formatDistance(timeToPace.distanceKm) }} km ·
              {{ formatDistance(timeToPace.distanceMiles) }} mi ·
              {{ formatSpeed(timeToPace.speedKmh) }} km/h ·
              {{ formatSpeed(timeToPace.speedMph) }} mph
            </template>
            <template v-else>
              Enter a distance and total time greater than zero to see both pace values.
            </template>
          </div>

          <div v-if="timeToPaceSplits" class="support-card">
            <p class="note-label mb-3">Splits</p>
            <SplitsTable :splits="timeToPaceSplits" :unit="fromTime.distanceUnit" />
          </div>

          <CheerCard :title="timeCheer.title" :body="timeCheer.body" />
        </article>

        <!-- Pace → Time tab -->
        <article v-else class="mt-6 flex flex-col gap-6" role="tabpanel">
          <div class="grid gap-5">
            <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label class="field">
                <span class="field-label">Distance</span>
                <input
                  v-model="fromPace.distance"
                  class="text-input"
                  type="number"
                  min="0"
                  step="0.01"
                  inputmode="decimal"
                  autocomplete="off"
                  placeholder="10"
                />
              </label>

              <div class="field sm:min-w-36">
                <span class="field-label">Distance unit</span>
                <div class="unit-switch">
                  <button
                    :class="['unit-button', { 'unit-button-active': fromPace.distanceUnit === 'km' }]"
                    type="button"
                    @click="switchDistanceUnit(fromPace, 'km')"
                  >
                    km
                  </button>
                  <button
                    :class="['unit-button', { 'unit-button-active': fromPace.distanceUnit === 'mi' }]"
                    type="button"
                    @click="switchDistanceUnit(fromPace, 'mi')"
                  >
                    mi
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p class="mb-2 text-sm text-slate-500">Popular distances</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="preset in distancePresets[fromPace.distanceUnit]"
                  :key="`pace-${fromPace.distanceUnit}-${preset.label}`"
                  class="shortcut"
                  type="button"
                  @click="setDistance(fromPace, preset.value)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field">
                  <span class="field-label">Pace minutes</span>
                  <input
                    v-model="fromPace.paceMinutes"
                    class="text-input"
                    type="number"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="5"
                  />
                </label>

                <label class="field">
                  <span class="field-label">Pace seconds</span>
                  <input
                    v-model="fromPace.paceSeconds"
                    class="text-input"
                    type="number"
                    min="0"
                    step="1"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="0"
                  />
                </label>
              </div>

              <div class="field sm:min-w-36">
                <span class="field-label">Per</span>
                <div class="unit-switch">
                  <button
                    :class="['unit-button', { 'unit-button-active': fromPace.paceUnit === 'km' }]"
                    type="button"
                    @click="switchPaceUnit('km')"
                  >
                    /km
                  </button>
                  <button
                    :class="['unit-button', { 'unit-button-active': fromPace.paceUnit === 'mi' }]"
                    type="button"
                    @click="switchPaceUnit('mi')"
                  >
                    /mi
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p v-if="paceInputError" class="text-sm text-rose-500" role="alert">
            {{ paceInputError }}
          </p>

          <div aria-live="polite" class="grid gap-3 sm:grid-cols-2">
            <ResultCard
              label="Total time"
              :value="paceToTime ? formatClock(paceToTime.totalSeconds) : '--'"
              :primary="true"
              class="sm:col-span-2"
            />
            <ResultCard
              label="Equivalent /km"
              :value="paceToTime ? `${formatClock(paceToTime.pacePerKm)} /km` : '--'"
              :small="true"
            />
            <ResultCard
              label="Equivalent /mile"
              :value="paceToTime ? `${formatClock(paceToTime.pacePerMile)} /mi` : '--'"
              :small="true"
            />
          </div>

          <div class="support-card text-sm leading-6 text-slate-600">
            <template v-if="paceToTime">
              {{ formatDistance(paceToTime.distanceKm) }} km ·
              {{ formatDistance(paceToTime.distanceMiles) }} mi ·
              {{ formatSpeed(paceToTime.speedKmh) }} km/h ·
              {{ formatSpeed(paceToTime.speedMph) }} mph
            </template>
            <template v-else>
              Enter a distance and pace greater than zero to project the finish time.
            </template>
          </div>

          <div v-if="paceToTimeSplits" class="support-card">
            <p class="note-label mb-3">Splits</p>
            <SplitsTable :splits="paceToTimeSplits" :unit="fromPace.distanceUnit" />
          </div>

          <CheerCard :title="paceCheer.title" :body="paceCheer.body" />
        </article>
      </section>
    </div>
  </main>
</template>
