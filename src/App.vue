<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const KM_PER_MILE = 1.609344

const distanceFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const speedFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

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

const distancePresets = {
  km: [
    { label: '5K', value: '5' },
    { label: '10K', value: '10' },
    { label: 'Half', value: '21.1' },
    { label: 'Marathon', value: '42.2' },
    { label: '100K', value: '100' },
  ],
  mi: [
    { label: '5 mi', value: '5' },
    { label: '10 mi', value: '10' },
    { label: 'Half', value: '13.1' },
    { label: 'Marathon', value: '26.2' },
    { label: '100 mi', value: '100' },
  ],
}

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

function parsePositiveNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

function parseNonNegativeNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return 0
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

function parseClockToSeconds(hours, minutes, seconds) {
  const hasValue = [hours, minutes, seconds].some(
    (value) => value !== '' && value !== null && value !== undefined,
  )

  if (!hasValue) {
    return null
  }

  const totalSeconds =
    parseNonNegativeNumber(hours) * 3600 +
    parseNonNegativeNumber(minutes) * 60 +
    parseNonNegativeNumber(seconds)

  return totalSeconds > 0 ? totalSeconds : null
}

function parsePaceToSeconds(minutes, seconds) {
  const hasValue = [minutes, seconds].some(
    (value) => value !== '' && value !== null && value !== undefined,
  )

  if (!hasValue) {
    return null
  }

  const totalSeconds =
    parseNonNegativeNumber(minutes) * 60 + parseNonNegativeNumber(seconds)

  return totalSeconds > 0 ? totalSeconds : null
}

function distanceToKilometers(distance, unit) {
  return unit === 'km' ? distance : distance * KM_PER_MILE
}

function distanceToMiles(distance, unit) {
  return unit === 'mi' ? distance : distance / KM_PER_MILE
}

function formatEditableNumber(value) {
  return String(Number(value.toFixed(2)))
}

function formatClock(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) {
    return '--'
  }

  const rounded = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const seconds = rounded % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatDistance(value) {
  return distanceFormatter.format(value)
}

function formatSpeed(value) {
  return speedFormatter.format(value)
}

function getTimeCheer(result) {
  if (!result) {
    return {
      title: 'A sweet little goal starts here',
      body: 'Add your distance and finish time, and I will turn them into a calm pace plan you can follow with confidence.',
    }
  }

  if (result.pacePerKm <= 240) {
    return {
      title: 'Fast feet, brave heart',
      body: 'That is a spicy goal pace. Start smooth, stay tall, and let the fast finish come to you.',
    }
  }

  if (result.pacePerKm <= 330) {
    return {
      title: 'Strong and sparkly',
      body: 'This sits in a really confident zone. Relax your shoulders, trust your rhythm, and collect each split one by one.',
    }
  }

  if (result.pacePerKm <= 420) {
    return {
      title: 'Steady and lovely',
      body: 'This is a sustainable groove. Gentle effort, tidy breathing, and patient pacing will carry you far.',
    }
  }

  return {
    title: 'Kind pace, big win',
    body: 'Easy miles absolutely count. Keep it comfy, keep it consistent, and enjoy building the finish you want.',
  }
}

function getPaceCheer(result) {
  if (!result) {
    return {
      title: 'Pick a pace that feels good',
      body: 'Enter your target pace and distance, and I will map out the finish time for your happy little goal.',
    }
  }

  if (result.totalSeconds <= 1800) {
    return {
      title: 'Quick, punchy, and fun',
      body: 'That is a short strong effort. Stay light on your feet and let your cadence do the work.',
    }
  }

  if (result.totalSeconds <= 3600) {
    return {
      title: 'Right in the sweet spot',
      body: 'This looks wonderfully doable. Settle in early, stay patient in the middle, and finish proud.',
    }
  }

  if (result.totalSeconds <= 7200) {
    return {
      title: 'Endurance cutie mode',
      body: 'Longer efforts love calm pacing. Sip, breathe, and keep stacking smooth little minutes.',
    }
  }

  return {
    title: 'Adventure pace, full heart',
    body: 'Big distances are just lots of small brave moments. Stay kind to yourself and keep moving forward.',
  }
}

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
              Time -> Pace
            </button>
            <button
              :class="['tab-button', { 'tab-button-active': activeTab === 'pace' }]"
              :aria-selected="activeTab === 'pace'"
              role="tab"
              type="button"
              @click="activeTab = 'pace'"
            >
              Pace -> Time
            </button>
          </div>
        </div>

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
                  placeholder="0"
                />
              </label>
            </div>
          </div>

          <div aria-live="polite" class="grid gap-3 sm:grid-cols-2">
            <div class="result-card result-card-primary">
              <p class="result-label">Pace /km</p>
              <p class="result-value">
                {{ timeToPace ? `${formatClock(timeToPace.pacePerKm)} /km` : '--' }}
              </p>
            </div>

            <div class="result-card">
              <p class="result-label">Pace /mile</p>
              <p class="result-value">
                {{ timeToPace ? `${formatClock(timeToPace.pacePerMile)} /mi` : '--' }}
              </p>
            </div>
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

          <div class="cheer-card">
            <p class="note-label">Cheer note</p>
            <h3 class="cheer-title">{{ timeCheer.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              {{ timeCheer.body }}
            </p>
          </div>
        </article>

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

          <div aria-live="polite" class="grid gap-3 sm:grid-cols-2">
            <div class="result-card result-card-primary sm:col-span-2">
              <p class="result-label">Total time</p>
              <p class="result-value">
                {{ paceToTime ? formatClock(paceToTime.totalSeconds) : '--' }}
              </p>
            </div>

            <div class="result-card">
              <p class="result-label">Equivalent /km</p>
              <p class="result-value text-2xl sm:text-3xl">
                {{ paceToTime ? `${formatClock(paceToTime.pacePerKm)} /km` : '--' }}
              </p>
            </div>

            <div class="result-card">
              <p class="result-label">Equivalent /mile</p>
              <p class="result-value text-2xl sm:text-3xl">
                {{ paceToTime ? `${formatClock(paceToTime.pacePerMile)} /mi` : '--' }}
              </p>
            </div>
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

          <div class="cheer-card">
            <p class="note-label">Cheer note</p>
            <h3 class="cheer-title">{{ paceCheer.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              {{ paceCheer.body }}
            </p>
          </div>
        </article>
      </section>
    </div>
  </main>
</template>
