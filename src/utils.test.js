import { describe, expect, it } from 'vitest'
import {
  KM_PER_MILE,
  distanceToKilometers,
  distanceToMiles,
  formatClock,
  parseClockToSeconds,
  parseNonNegativeNumber,
  parsePaceToSeconds,
  parsePositiveNumber,
} from './utils.js'

describe('parsePositiveNumber', () => {
  it('returns null for empty string', () => {
    expect(parsePositiveNumber('')).toBeNull()
  })

  it('returns null for null / undefined', () => {
    expect(parsePositiveNumber(null)).toBeNull()
    expect(parsePositiveNumber(undefined)).toBeNull()
  })

  it('returns null for zero', () => {
    expect(parsePositiveNumber('0')).toBeNull()
  })

  it('returns null for negative', () => {
    expect(parsePositiveNumber('-5')).toBeNull()
  })

  it('returns null for non-numeric strings', () => {
    expect(parsePositiveNumber('abc')).toBeNull()
    expect(parsePositiveNumber('1e999')).toBeNull()
  })

  it('returns the parsed number for valid positive values', () => {
    expect(parsePositiveNumber('10')).toBe(10)
    expect(parsePositiveNumber('42.195')).toBeCloseTo(42.195)
    expect(parsePositiveNumber(5)).toBe(5)
  })
})

describe('parseNonNegativeNumber', () => {
  it('returns 0 for empty / null / undefined', () => {
    expect(parseNonNegativeNumber('')).toBe(0)
    expect(parseNonNegativeNumber(null)).toBe(0)
    expect(parseNonNegativeNumber(undefined)).toBe(0)
  })

  it('returns 0 for negative numbers', () => {
    expect(parseNonNegativeNumber('-3')).toBe(0)
  })

  it('returns the parsed value for valid non-negative numbers', () => {
    expect(parseNonNegativeNumber('0')).toBe(0)
    expect(parseNonNegativeNumber('30')).toBe(30)
  })
})

describe('parseClockToSeconds', () => {
  it('returns null when all fields are empty', () => {
    expect(parseClockToSeconds('', '', '')).toBeNull()
    expect(parseClockToSeconds(null, null, null)).toBeNull()
  })

  it('returns null when total is zero', () => {
    expect(parseClockToSeconds('0', '0', '0')).toBeNull()
  })

  it('converts hours + minutes + seconds correctly', () => {
    expect(parseClockToSeconds('1', '30', '45')).toBe(3600 + 30 * 60 + 45)
  })

  it('works with only minutes', () => {
    expect(parseClockToSeconds('', '50', '')).toBe(50 * 60)
  })

  it('works with only seconds', () => {
    expect(parseClockToSeconds('', '', '45')).toBe(45)
  })

  it('works with hours only', () => {
    expect(parseClockToSeconds('2', '', '')).toBe(7200)
  })
})

describe('parsePaceToSeconds', () => {
  it('returns null when both fields are empty', () => {
    expect(parsePaceToSeconds('', '')).toBeNull()
  })

  it('returns null when total is zero', () => {
    expect(parsePaceToSeconds('0', '0')).toBeNull()
  })

  it('converts minutes + seconds correctly', () => {
    expect(parsePaceToSeconds('5', '30')).toBe(5 * 60 + 30)
  })

  it('works with only minutes', () => {
    expect(parsePaceToSeconds('4', '')).toBe(240)
  })
})

describe('distanceToKilometers', () => {
  it('passes through km unchanged', () => {
    expect(distanceToKilometers(10, 'km')).toBe(10)
  })

  it('converts miles to km', () => {
    expect(distanceToKilometers(1, 'mi')).toBeCloseTo(KM_PER_MILE)
    expect(distanceToKilometers(26.2188, 'mi')).toBeCloseTo(42.195, 1)
  })
})

describe('distanceToMiles', () => {
  it('passes through miles unchanged', () => {
    expect(distanceToMiles(10, 'mi')).toBe(10)
  })

  it('converts km to miles', () => {
    expect(distanceToMiles(KM_PER_MILE, 'km')).toBeCloseTo(1)
    expect(distanceToMiles(42.195, 'km')).toBeCloseTo(26.2188, 1)
  })
})

describe('formatClock', () => {
  it('returns "--" for non-finite values', () => {
    expect(formatClock(Infinity)).toBe('--')
    expect(formatClock(NaN)).toBe('--')
  })

  it('formats sub-minute durations as m:ss', () => {
    expect(formatClock(45)).toBe('0:45')
  })

  it('formats minutes and seconds as m:ss', () => {
    expect(formatClock(5 * 60 + 30)).toBe('5:30')
  })

  it('pads seconds to 2 digits', () => {
    expect(formatClock(60 + 5)).toBe('1:05')
  })

  it('formats hours:minutes:seconds as h:mm:ss', () => {
    expect(formatClock(3600 + 30 * 60 + 45)).toBe('1:30:45')
  })

  it('pads minutes and seconds in h:mm:ss format', () => {
    expect(formatClock(3600 + 60 + 5)).toBe('1:01:05')
  })

  it('rounds to nearest second', () => {
    expect(formatClock(90.6)).toBe('1:31')
  })
})
