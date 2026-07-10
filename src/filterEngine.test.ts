import { describe, it, expect } from 'vitest'
import {
  computeResults,
  matchesSearch,
  matchesInsuranceTypes,
  matchesGrantStatuses,
  matchesSupportAmounts,
} from './filterEngine'
import type { ProgramRecord } from './types'

function makeProgram(overrides: Partial<ProgramRecord> = {}): ProgramRecord {
  return {
    id: 'test-program',
    foundationName: 'Test Foundation',
    programName: 'Test Program',
    description: 'A test program for unit tests.',
    status: 'Open',
    lastUpdated: null,
    diseaseIndications: ['depression'],
    insuranceTypes: ['medicare'],
    grantAmount: 5000,
    applyUrl: '',
    programUrl: '',
    foundationUrl: '',
    contactEmail: '',
    contactPhone: '',
    metadata: [],
    ...overrides,
  }
}

const emptyFilters = () => ({
  insuranceTypes: new Set<string>(),
  grantStatuses: new Set<string>(),
  supportAmounts: new Set<string>(),
})

// ── matchesSearch ────────────────────────────────────────────────────────────

describe('matchesSearch', () => {
  const p = makeProgram({ foundationName: 'Acme Foundation', programName: 'Hope Grant', description: 'For patients with depression', diseaseIndications: ['major depressive disorder'] })

  it('returns true for empty query', () => {
    expect(matchesSearch(p, '')).toBe(true)
  })

  it('returns true for single-char query (under threshold)', () => {
    expect(matchesSearch(p, 'A')).toBe(true)
  })

  it('matches foundation name', () => {
    expect(matchesSearch(p, 'acme')).toBe(true)
  })

  it('matches program name', () => {
    expect(matchesSearch(p, 'hope')).toBe(true)
  })

  it('matches description', () => {
    expect(matchesSearch(p, 'patients')).toBe(true)
  })

  it('matches disease indication', () => {
    expect(matchesSearch(p, 'depressive')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(matchesSearch(p, 'ACME')).toBe(true)
  })

  it('returns false for non-matching query', () => {
    expect(matchesSearch(p, 'xyz123')).toBe(false)
  })
})

// ── matchesInsuranceTypes ────────────────────────────────────────────────────

describe('matchesInsuranceTypes', () => {
  const p = makeProgram({ insuranceTypes: ['medicare', 'medicaid'] })

  it('returns true when no filter active', () => {
    expect(matchesInsuranceTypes(p, new Set())).toBe(true)
  })

  it('returns true when program has a matching type', () => {
    expect(matchesInsuranceTypes(p, new Set(['medicare']))).toBe(true)
  })

  it('returns true when one of multiple selections matches', () => {
    expect(matchesInsuranceTypes(p, new Set(['medicare', 'private insurance']))).toBe(true)
  })

  it('returns false when no type matches', () => {
    expect(matchesInsuranceTypes(p, new Set(['private insurance']))).toBe(false)
  })
})

// ── matchesGrantStatuses ─────────────────────────────────────────────────────

describe('matchesGrantStatuses', () => {
  const p = makeProgram({ status: 'Open' })

  it('returns true when no filter active', () => {
    expect(matchesGrantStatuses(p, new Set())).toBe(true)
  })

  it('returns true for matching status (lowercased)', () => {
    expect(matchesGrantStatuses(p, new Set(['open']))).toBe(true)
  })

  it('returns false for non-matching status', () => {
    expect(matchesGrantStatuses(p, new Set(['closed']))).toBe(false)
  })
})

// ── matchesSupportAmounts ────────────────────────────────────────────────────

describe('matchesSupportAmounts', () => {
  it('returns true when no filter active', () => {
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 500 }), new Set())).toBe(true)
  })

  it('null grantAmount always passes', () => {
    expect(matchesSupportAmounts(makeProgram({ grantAmount: null }), new Set(['under-1000']))).toBe(true)
  })

  it('under-1000: matches amount < 1000', () => {
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 999 }), new Set(['under-1000']))).toBe(true)
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 1000 }), new Set(['under-1000']))).toBe(false)
  })

  it('1000-5000: matches 1000 ≤ amount < 5000', () => {
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 1000 }), new Set(['1000-5000']))).toBe(true)
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 4999 }), new Set(['1000-5000']))).toBe(true)
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 5000 }), new Set(['1000-5000']))).toBe(false)
  })

  it('5000-10000: matches 5000 ≤ amount < 10000', () => {
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 5000 }), new Set(['5000-10000']))).toBe(true)
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 9999 }), new Set(['5000-10000']))).toBe(true)
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 10000 }), new Set(['5000-10000']))).toBe(false)
  })

  it('10000-plus: matches amount >= 10000', () => {
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 10000 }), new Set(['10000-plus']))).toBe(true)
    expect(matchesSupportAmounts(makeProgram({ grantAmount: 9999 }), new Set(['10000-plus']))).toBe(false)
  })

  it('OR: matches any of the selected ranges', () => {
    const p = makeProgram({ grantAmount: 1500 })
    expect(matchesSupportAmounts(p, new Set(['under-1000', '1000-5000']))).toBe(true)
  })
})

// ── computeResults ───────────────────────────────────────────────────────────

describe('computeResults', () => {
  const programs: ProgramRecord[] = [
    makeProgram({ id: 'a', status: 'Open', insuranceTypes: ['medicare'], grantAmount: 500 }),
    makeProgram({ id: 'b', status: 'Closed', insuranceTypes: ['private insurance'], grantAmount: 2000 }),
    makeProgram({ id: 'c', status: 'Open', insuranceTypes: ['medicaid'], grantAmount: 15000 }),
  ]

  it('returns all programs when no filters or query', () => {
    const results = computeResults(programs, { debouncedQuery: '', filters: emptyFilters(), sort: { field: null, direction: 'desc' } })
    expect(results).toHaveLength(3)
  })

  it('AND across dimensions: filters insurance AND status', () => {
    const results = computeResults(programs, {
      debouncedQuery: '',
      filters: {
        ...emptyFilters(),
        insuranceTypes: new Set(['medicare']),
        grantStatuses: new Set(['open']),
      },
      sort: { field: null, direction: 'desc' },
    })
    expect(results.map((r) => r.id)).toEqual(['a'])
  })

  it('OR within dimension: returns programs matching either insurance type', () => {
    const results = computeResults(programs, {
      debouncedQuery: '',
      filters: {
        ...emptyFilters(),
        insuranceTypes: new Set(['medicare', 'medicaid']),
      },
      sort: { field: null, direction: 'desc' },
    })
    expect(results.map((r) => r.id).sort()).toEqual(['a', 'c'])
  })

  it('preserves order', () => {
    const results = computeResults(programs, { debouncedQuery: '', filters: emptyFilters(), sort: { field: null, direction: 'desc' } })
    expect(results.map((r) => r.id)).toEqual(['a', 'b', 'c'])
  })

  it('combines search and filter', () => {
    const p = [
      makeProgram({ id: 'x', foundationName: 'Alpha', status: 'Open', insuranceTypes: ['medicare'] }),
      makeProgram({ id: 'y', foundationName: 'Beta', status: 'Open', insuranceTypes: ['medicare'] }),
    ]
    const results = computeResults(p, {
      debouncedQuery: 'alpha',
      filters: { ...emptyFilters(), grantStatuses: new Set(['open']) },
      sort: { field: null, direction: 'desc' },
    })
    expect(results.map((r) => r.id)).toEqual(['x'])
  })
})
