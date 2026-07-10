/**
 * Singleton AppState with a simple pub/sub notification model.
 * No reactive framework — components subscribe and re-render on change.
 *
 * design.md §5
 */

import type { AppState, FilterState, ProgramRecord, SortState } from './types'
import { trackEvent } from './analytics'

const DISCLAIMER_KEY = 'ff-disclaimer-v1'

const emptyFilters = (): FilterState => ({
  insuranceTypes: new Set<string>(),
  grantStatuses: new Set<string>(),
  supportAmounts: new Set<string>(),
})

const defaultSort = (): SortState => ({ field: null, direction: 'desc' })

let state: AppState = {
  allPrograms: [],
  query: '',
  debouncedQuery: '',
  filters: emptyFilters(),
  sort: defaultSort(),
  expandedProgramId: null,
  phase: 'loading',
  errorMessage: null,
  externalLinkTarget: null,
  externalLinkTrigger: null,
}

const subscribers = new Set<(s: AppState) => void>()

function notify(): void {
  for (const cb of subscribers) {
    cb(state)
  }
}

export function initState(programs: ProgramRecord[]): void {
  let disclaimerSeen = false
  try {
    disclaimerSeen = sessionStorage.getItem(DISCLAIMER_KEY) === '1'
  } catch {
    // sessionStorage unavailable (private browsing) — treat as unseen
  }

  state = {
    allPrograms: Object.freeze(programs) as readonly ProgramRecord[],
    query: '',
    debouncedQuery: '',
    filters: emptyFilters(),
    sort: defaultSort(),
    expandedProgramId: null,
    phase: disclaimerSeen ? 'ready' : 'disclaimer',
    errorMessage: null,
    externalLinkTarget: null,
    externalLinkTrigger: null,
  }
}

export function getState(): AppState {
  return state
}

export function setState<K extends keyof AppState>(key: K, value: AppState[K]): void {
  state = { ...state, [key]: value }
  notify()
}

export function subscribe(callback: (s: AppState) => void): () => void {
  subscribers.add(callback)
  // Call immediately with current state
  callback(state)
  return () => subscribers.delete(callback)
}

export function toggleFilter(dim: keyof FilterState, value: string): void {
  const current = state.filters[dim]
  const next = new Set(current)
  if (next.has(value)) {
    next.delete(value)
    trackEvent('filter_deselected', { dimension: dim, value })
  } else {
    next.add(value)
    trackEvent('filter_selected', { dimension: dim, value })
  }
  setState('filters', { ...state.filters, [dim]: next })
}

export function acknowledgeDisclaimer(): void {
  // TODO: removing session storage
  // try {
  //   sessionStorage.setItem(DISCLAIMER_KEY, '1')
  // } catch {
  //   // ignore — we'll show the disclaimer again next load
  // }
  trackEvent('disclaimer_accepted')
  setState('phase', 'ready')
}

export function clearFilters(): void {
  setState('filters', {
    insuranceTypes: new Set(),
    grantStatuses: new Set(),
    supportAmounts: new Set(),
  })
}

export function setSort(field: SortState['field'], direction: SortState['direction']): void {
  setState('sort', { field, direction })
}

export function resetState(): void {
  state = {
    ...state,
    query: '',
    debouncedQuery: '',
    filters: emptyFilters(),
    sort: defaultSort(),
    expandedProgramId: null,
  }
  notify()
}
