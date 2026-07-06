import { describe, it, expect, beforeEach } from 'vitest'
import {
  initState,
  getState,
  setState,
  subscribe,
  toggleFilter,
  resetState,
  acknowledgeDisclaimer,
} from './stateManager'
import type { ProgramRecord } from './types'

function makeProgram(id: string): ProgramRecord {
  return {
    id,
    foundationName: 'Foundation',
    programName: 'Program',
    description: '',
    status: 'Open',
    lastUpdated: null,
    diseaseIndications: [],
    insuranceTypes: ['medicare'],
    grantAmount: null,
    applyUrl: '',
    programUrl: '',
    foundationUrl: '',
    contactEmail: '',
    contactPhone: '',
    metadata: [],
  }
}

const programs = [makeProgram('a'), makeProgram('b')]

beforeEach(() => {
  sessionStorage.clear()
  initState(programs)
})

describe('initState', () => {
  it('sets phase to disclaimer when key absent', () => {
    expect(getState().phase).toBe('disclaimer')
  })

  it('sets phase to ready when disclaimer already acknowledged', () => {
    // TODO: removing session storage
    // sessionStorage.setItem('ff-disclaimer-v1', '1')
    initState(programs)
    expect(getState().phase).toBe('ready')
  })

  it('sets allPrograms', () => {
    expect(getState().allPrograms).toHaveLength(2)
  })
})

describe('setState', () => {
  it('updates the target key', () => {
    setState('query', 'hello')
    expect(getState().query).toBe('hello')
  })

  it('notifies subscribers', () => {
    const calls: string[] = []
    const unsub = subscribe((s) => calls.push(s.query))
    setState('query', 'world')
    unsub()
    expect(calls).toContain('world')
  })
})

describe('subscribe', () => {
  it('calls callback immediately with current state', () => {
    let called = false
    const unsub = subscribe(() => { called = true })
    expect(called).toBe(true)
    unsub()
  })

  it('stops notifying after unsubscribe', () => {
    let count = 0
    const unsub = subscribe(() => { count++ })
    unsub()
    setState('query', 'test')
    expect(count).toBe(1) // only the initial call
  })
})

describe('toggleFilter', () => {
  it('adds a value to the set', () => {
    toggleFilter('insuranceTypes', 'medicare')
    expect(getState().filters.insuranceTypes.has('medicare')).toBe(true)
  })

  it('removes a value already in the set (toggle off)', () => {
    toggleFilter('insuranceTypes', 'medicare')
    toggleFilter('insuranceTypes', 'medicare')
    expect(getState().filters.insuranceTypes.has('medicare')).toBe(false)
  })

  it('toggling one dimension does not affect others', () => {
    toggleFilter('insuranceTypes', 'medicare')
    expect(getState().filters.grantStatuses.size).toBe(0)
  })
})

describe('resetState', () => {
  it('clears query, filters, and expandedProgramId', () => {
    setState('query', 'test')
    setState('expandedProgramId', 'a')
    toggleFilter('insuranceTypes', 'medicare')
    resetState()
    const s = getState()
    expect(s.query).toBe('')
    expect(s.debouncedQuery).toBe('')
    expect(s.filters.insuranceTypes.size).toBe(0)
    expect(s.expandedProgramId).toBeNull()
  })
})

describe('acknowledgeDisclaimer', () => {
  it('sets phase to ready', () => {
    acknowledgeDisclaimer()
    expect(getState().phase).toBe('ready')
  })

  it('writes disclaimer key to sessionStorage', () => {
    acknowledgeDisclaimer()
    expect(sessionStorage.getItem('ff-disclaimer-v1')).toBe('1')
  })
})
