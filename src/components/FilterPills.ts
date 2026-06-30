import type { FilterState, ProgramRecord } from '../types'
import type { FilterDimension } from '../filterEngine'
import { computeFilterCounts } from '../filterEngine'

export interface FilterPillsProps {
  dimensions: FilterDimension[]
  activeFilters: FilterState
  allPrograms: readonly ProgramRecord[]
  onToggle: (dim: keyof FilterState, value: string) => void
  onClearAll: () => void
}

export function FilterPills(props: FilterPillsProps): HTMLElement {
  const { statuses, insuranceTypes } = computeFilterCounts(props.allPrograms)
  const totalCount = props.allPrograms.length
  const hasActiveFilters =
    props.activeFilters.insuranceTypes.size > 0 ||
    props.activeFilters.grantStatuses.size > 0 ||
    props.activeFilters.supportAmounts.size > 0

  const container = document.createElement('div')
  container.className = 'ff-filters'

  const label = document.createElement('span')
  label.className = 'ff-filter-group__label ff-show-label'
  label.textContent = 'SHOW'
  container.appendChild(label)

  const pills = document.createElement('div')
  pills.className = 'ff-filter-group__pills'

  // "All Programs" pill
  const allBtn = makePill('All Programs', totalCount, !hasActiveFilters)
  allBtn.addEventListener('click', () => props.onClearAll())
  pills.appendChild(allBtn)

  // Status pills
  const statusDim = props.dimensions.find((d) => d.id === 'grantStatuses')
  if (statusDim) {
    for (const value of statusDim.values) {
      const count = statuses.get(value) ?? 0
      if (count === 0) continue
      const active = props.activeFilters.grantStatuses.has(value)
      const btn = makePill(formatLabel('grantStatuses', value), count, active)
      btn.addEventListener('click', () => props.onToggle('grantStatuses', value))
      pills.appendChild(btn)
    }
  }

  // Insurance type pills
  const insuranceDim = props.dimensions.find((d) => d.id === 'insuranceTypes')
  if (insuranceDim) {
    for (const value of insuranceDim.values) {
      const count = insuranceTypes.get(value) ?? 0
      if (count === 0) continue
      const active = props.activeFilters.insuranceTypes.has(value)
      const btn = makePill(formatLabel('insuranceTypes', value), count, active)
      btn.addEventListener('click', () => props.onToggle('insuranceTypes', value))
      pills.appendChild(btn)
    }
  }

  container.appendChild(pills)
  return container
}

function makePill(labelText: string, count: number, active: boolean): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = active ? 'ff-pill ff-pill--active' : 'ff-pill'
  btn.setAttribute('aria-pressed', active ? 'true' : 'false')
  btn.textContent = labelText

  const badge = document.createElement('span')
  badge.className = 'ff-pill-count'
  badge.textContent = String(count)
  btn.appendChild(badge)

  return btn
}

function formatLabel(dim: keyof FilterState, value: string): string {
  if (dim === 'supportAmounts') {
    switch (value) {
      case 'under-1000': return 'Under $1,000'
      case '1000-5000': return '$1,000–$5,000'
      case '5000-10000': return '$5,000–$10,000'
      case '10000-plus': return '$10,000+'
    }
  }
  return value.charAt(0).toUpperCase() + value.slice(1)
}
