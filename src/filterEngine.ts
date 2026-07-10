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
    if (sort.field === 'grantAmount') {
      const aVal = a.grantAmount ?? -Infinity
      const bVal = b.grantAmount ?? -Infinity
      return (aVal - bVal) * dir
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
  program: ProgramRecord,
  selected: Set<string>,
): boolean {
  if (selected.size === 0) return true
  if (program.grantAmount === null) return true

  const amount = program.grantAmount
  return [...selected].some((key) => rangeMatches(key, amount))
}

function rangeMatches(key: string, amount: number): boolean {
  switch (key) {
    case 'under-1000':
      return amount < 1000
    case '1000-5000':
      return amount >= 1000 && amount < 5000
    case '5000-10000':
      return amount >= 5000 && amount < 10000
    case '10000-plus':
      return amount >= 10000
    default:
      return false
  }
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

export function buildFilterDimensions(programs: readonly ProgramRecord[]): FilterDimension[] {
  const insuranceSet = new Set<string>()
  const statusSet = new Set<string>()

  for (const p of programs) {
    for (const t of p.insuranceTypes) insuranceSet.add(t)
    statusSet.add(p.status.toLowerCase())
  }

  const dimensions: FilterDimension[] = []

  if (insuranceSet.size > 0) {
    dimensions.push({
      id: 'insuranceTypes',
      label: 'Insurance Type',
      values: [...insuranceSet].sort(),
    })
  }

  if (statusSet.size > 0) {
    dimensions.push({
      id: 'grantStatuses',
      label: 'Status',
      values: [...statusSet].sort(),
    })
  }

  dimensions.push({
    id: 'supportAmounts',
    label: 'Support Amount',
    values: ['under-1000', '1000-5000', '5000-10000', '10000-plus'],
  })

  return dimensions
}
