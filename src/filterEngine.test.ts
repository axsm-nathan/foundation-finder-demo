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
    insuranceTypesRaw: 'Medicare required',
    insuranceDescription: 'Medicare required',
    grantAmount: null,
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
  const p = makeProgram({ insuranceTypesRaw: 'Medicare, Medicaid, or Military Benefits' })

  it('returns true when no filter active', () => {
    expect(matchesInsuranceTypes(p, new Set())).toBe(true)
  })

  it('returns true when raw string contains the tag (case-insensitive)', () => {
    expect(matchesInsuranceTypes(p, new Set(['Medicare']))).toBe(true)
  })

  it('returns true when one of multiple selections matches', () => {
    expect(matchesInsuranceTypes(p, new Set(['Medicare', 'Private Insurance']))).toBe(true)
  })

  it('returns false when no tag appears in raw string', () => {
    expect(matchesInsuranceTypes(p, new Set(['Private Insurance']))).toBe(false)
  })

  it('matches substring within a longer prose value', () => {
    const prose = makeProgram({ insuranceTypesRaw: 'Medicare required. Must have Medicare Part A to enroll' })
    expect(matchesInsuranceTypes(prose, new Set(['Medicare']))).toBe(true)
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
  it('always returns true (support amount filter removed)', () => {
    expect(matchesSupportAmounts(makeProgram(), new Set())).toBe(true)
    expect(matchesSupportAmounts(makeProgram(), new Set(['under-1000']))).toBe(true)
    expect(matchesSupportAmounts(makeProgram({ grantAmount: null }), new Set(['under-1000']))).toBe(true)
  })
})

// ── computeResults ───────────────────────────────────────────────────────────

describe('computeResults', () => {
  const programs: ProgramRecord[] = [
    makeProgram({ id: 'a', status: 'Open', insuranceTypes: ['medicare'], insuranceTypesRaw: 'Medicare required', insuranceDescription: 'Medicare required', grantAmount: '$500' }),
    makeProgram({ id: 'b', status: 'Closed', insuranceTypes: ['private insurance'], insuranceTypesRaw: 'Private insurance required', insuranceDescription: 'Private insurance required', grantAmount: '$2,000' }),
    makeProgram({ id: 'c', status: 'Open', insuranceTypes: ['medicaid'], insuranceTypesRaw: 'Medicaid required', insuranceDescription: 'Medicaid required', grantAmount: '$15,000' }),
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
        insuranceTypes: new Set(['Medicare']),
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
        insuranceTypes: new Set(['Medicare', 'Medicaid']),
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
