export const KM_PER_MILE = 1.609344

export const distanceFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

export const speedFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export const distancePresets = {
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

// Standard checkpoint distances for the splits table
export const SPLIT_CHECKPOINTS_KM = [1, 2, 3, 4, 5, 8, 10, 15, 20, 21.0975, 25, 30, 35, 40, 42.195]
export const SPLIT_CHECKPOINTS_MI = [1, 2, 3, 4, 5, 6, 8, 10, 13.1094, 15, 20, 26.2188]

export function parsePositiveNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

export function parseNonNegativeNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return 0
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

export function parseClockToSeconds(hours, minutes, seconds) {
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

export function parsePaceToSeconds(minutes, seconds) {
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

export function distanceToKilometers(distance, unit) {
  return unit === 'km' ? distance : distance * KM_PER_MILE
}

export function distanceToMiles(distance, unit) {
  return unit === 'mi' ? distance : distance / KM_PER_MILE
}

export function formatEditableNumber(value) {
  return String(Number(value.toFixed(2)))
}

export function formatClock(totalSeconds) {
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

export function formatDistance(value) {
  return distanceFormatter.format(value)
}

export function formatSpeed(value) {
  return speedFormatter.format(value)
}

export function getTimeCheer(result) {
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

export function getPaceCheer(result) {
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
