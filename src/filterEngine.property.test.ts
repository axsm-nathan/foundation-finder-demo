import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { computeResults } from './filterEngine'
import type { ProgramRecord, ProgramStatus } from './types'

const statusArb = fc.constantFrom<ProgramStatus>(
  'Open', 'Closed', 'Not Yet Open', 'Government Program',
)

const programArb: fc.Arbitrary<ProgramRecord> = fc.record({
  id: fc.string({ minLength: 1 }),
  foundationName: fc.string(),
  programName: fc.string(),
  description: fc.string(),
  status: statusArb,
  lastUpdated: fc.option(fc.date(), { nil: null }),
  diseaseIndications: fc.array(fc.string()),
  insuranceTypes: fc.array(fc.string()),
  grantAmount: fc.option(fc.float({ min: 0, max: 100000, noNaN: true }), { nil: null }),
  applyUrl: fc.string(),
  programUrl: fc.string(),
  foundationUrl: fc.string(),
  contactEmail: fc.string(),
  contactPhone: fc.string(),
  metadata: fc.array(fc.record({ label: fc.string(), value: fc.string() })),
})

const emptyFilters = () => ({
  insuranceTypes: new Set<string>(),
  grantStatuses: new Set<string>(),
  supportAmounts: new Set<string>(),
})

describe('computeResults – property-based', () => {
  it('results are always a subset of input programs', () => {
    fc.assert(
      fc.property(fc.array(programArb), (programs) => {
        const results = computeResults(programs, { debouncedQuery: '', filters: emptyFilters(), sort: { field: null, direction: 'desc' } })
        return results.every((r) => programs.includes(r))
      }),
    )
  })

  it('empty filters + empty query returns all programs', () => {
    fc.assert(
      fc.property(fc.array(programArb), (programs) => {
        const results = computeResults(programs, { debouncedQuery: '', filters: emptyFilters(), sort: { field: null, direction: 'desc' } })
        return results.length === programs.length
      }),
    )
  })

  it('idempotent: applying same filter twice = applying it once', () => {
    fc.assert(
      fc.property(fc.array(programArb), fc.string(), (programs, query) => {
        const state = { debouncedQuery: query, filters: emptyFilters(), sort: { field: null, direction: 'desc' as const } }
        const r1 = computeResults(programs, state)
        const r2 = computeResults(r1, state)
        return r1.length === r2.length && r1.every((p, i) => p === r2[i])
      }),
    )
  })

  it('parseMultiRef-derived: no empty string in set passes correctly', () => {
    fc.assert(
      fc.property(fc.array(programArb), (programs) => {
        // Any filter with values that no program matches should return 0 results (or pass null amounts)
        const results = computeResults(programs, {
          debouncedQuery: '',
          filters: {
            insuranceTypes: new Set(['__no_such_type__']),
            grantStatuses: new Set<string>(),
            supportAmounts: new Set<string>(),
          },
          sort: { field: null, direction: 'desc' as const },
        })
        return results.every((r) => r.insuranceTypes.includes('__no_such_type__'))
      }),
    )
  })
})
