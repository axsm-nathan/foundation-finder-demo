/**
 * Pure filter + search functions. No side effects — fully testable in isolation.
 *
 * design.md §6
 */

import type { AppState, FilterState, ProgramRecord, ProgramStatus, SortState } from './types'

export function computeResults(
  programs: readonly ProgramRecord[],
  state: Pick<AppState, 'debouncedQuery' | 'filters' | 'sort'>,
): ProgramRecord[] {
  const filtered = programs.filter(
    (p) =>
      matchesSearch(p, state.debouncedQuery) &&
      matchesInsuranceTypes(p, state.filters.insuranceTypes) &&
      matchesGrantStatuses(p, state.filters.grantStatuses) &&
      matchesSupportAmounts(p, state.filters.supportAmounts),
  )
  return sortResults(filtered, state.sort)
}

function sortResults(programs: ProgramRecord[], sort: SortState): ProgramRecord[] {
  if (sort.field === null) return programs
  const dir = sort.direction === 'asc' ? 1 : -1
  return [...programs].sort((a, b) => {
    if (sort.field === 'foundationName') {
      return (a.foundationName.localeCompare(b.foundationName) || a.programName.localeCompare(b.programName)) * dir
    }
    if (sort.field === 'grantAmount') {
      if (a.grantAmount === null && b.grantAmount === null) return 0
      if (a.grantAmount === null) return 1
      if (b.grantAmount === null) return -1
      return a.grantAmount.localeCompare(b.grantAmount) * dir
    }
    if (sort.field === 'lastUpdated') {
      const aVal = a.lastUpdated?.getTime() ?? -Infinity
      const bVal = b.lastUpdated?.getTime() ?? -Infinity
      return (aVal - bVal) * dir
    }
    return 0
  })
}

export function matchesSearch(program: ProgramRecord, query: string): boolean {
  if (query.length < 2) return true
  const q = query.toLowerCase()
  return (
    program.foundationName.toLowerCase().includes(q) ||
    program.programName.toLowerCase().includes(q) ||
    program.description.toLowerCase().includes(q) ||
    program.diseaseIndications.some((ind) => ind.includes(q))
  )
}

export function matchesInsuranceTypes(
  program: ProgramRecord,
  selected: Set<string>,
): boolean {
  if (selected.size === 0) return true
  return program.insuranceTypes.some((t) => selected.has(t.toLowerCase()))
}

export function matchesGrantStatuses(
  program: ProgramRecord,
  selected: Set<string>,
): boolean {
  if (selected.size === 0) return true
  return selected.has(program.status.toLowerCase())
}

export function matchesSupportAmounts(
  _program: ProgramRecord,
  _selected: Set<string>,
): boolean {
  return true
}

// ---------------------------------------------------------------------------
// Count programs per filter value / status (for pill badges)
// ---------------------------------------------------------------------------

export function computeFilterCounts(
  programs: readonly ProgramRecord[],
): { statuses: Map<string, number>; insuranceTypes: Map<string, number> } {
  const statuses = new Map<string, number>()
  const insuranceTypes = new Map<string, number>()
  for (const p of programs) {
    const s = p.status.toLowerCase()
    statuses.set(s, (statuses.get(s) ?? 0) + 1)
    for (const t of p.insuranceTypes) {
      insuranceTypes.set(t, (insuranceTypes.get(t) ?? 0) + 1)
    }
  }
  return { statuses, insuranceTypes }
}

export function computeStatusCounts(
  programs: readonly ProgramRecord[],
): Map<ProgramStatus, number> {
  const counts = new Map<ProgramStatus, number>()
  for (const p of programs) {
    counts.set(p.status, (counts.get(p.status) ?? 0) + 1)
  }
  return counts
}

// ---------------------------------------------------------------------------
// Derive dynamic filter dimension values from the loaded programs
// ---------------------------------------------------------------------------

export interface FilterDimension {
  id: keyof FilterState
  label: string
  values: string[]
}

export function buildFilterDimensions(_programs: readonly ProgramRecord[]): FilterDimension[] {
  return [
    {
      id: 'insuranceTypes',
      label: 'Insurance Requirements',
      values: ['medicaid', 'medicare', 'n/a'],
    },
  ]
}
