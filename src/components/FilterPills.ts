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
  const hasActiveFilters =
    props.activeFilters.insuranceTypes.size > 0 ||
    props.activeFilters.grantStatuses.size > 0 ||
    props.activeFilters.supportAmounts.size > 0

  const container = document.createElement('div')
  container.className = 'ff-filters'

  const filterHeader = document.createElement('div')
  filterHeader.className = 'ff-filters__header'

  if (hasActiveFilters) {
    const clearBtn = document.createElement('button')
    clearBtn.type = 'button'
    clearBtn.className = 'ff-clear-btn'
    clearBtn.textContent = 'Clear filters'
    clearBtn.addEventListener('click', () => props.onClearAll())
    filterHeader.appendChild(clearBtn)
  }

  container.appendChild(filterHeader)

  // ── Status group ──────────────────────────────────────────────────────────
  const statusGroup = document.createElement('div')
  statusGroup.className = 'ff-filter-group'

  const statusLabel = document.createElement('span')
  statusLabel.className = 'ff-filter-group__label'
  statusLabel.textContent = 'STATUS'
  statusGroup.appendChild(statusLabel)

  const statusPills = document.createElement('div')
  statusPills.className = 'ff-filter-group__pills'

  const allBtn = makePill('All Programs', props.allPrograms.length, !hasActiveFilters)
  allBtn.addEventListener('click', () => props.onClearAll())
  statusPills.appendChild(allBtn)

  const statusDim = props.dimensions.find((d) => d.id === 'grantStatuses')
  if (statusDim) {
    for (const value of statusDim.values) {
      const count = statuses.get(value) ?? 0
      if (count === 0) continue
      const active = props.activeFilters.grantStatuses.has(value)
      const btn = makePill(formatLabel('grantStatuses', value), count, active)
      btn.addEventListener('click', () => props.onToggle('grantStatuses', value))
      statusPills.appendChild(btn)
    }
  }

  statusGroup.appendChild(statusPills)
  container.appendChild(statusGroup)

  // ── Insurance group ───────────────────────────────────────────────────────
  const insuranceDim = props.dimensions.find((d) => d.id === 'insuranceTypes')
  if (insuranceDim && insuranceDim.values.some((v) => (insuranceTypes.get(v) ?? 0) > 0)) {
    const insuranceGroup = document.createElement('div')
    insuranceGroup.className = 'ff-filter-group'

    const insuranceLabel = document.createElement('span')
    insuranceLabel.className = 'ff-filter-group__label'
    insuranceLabel.textContent = 'INSURANCE'
    insuranceGroup.appendChild(insuranceLabel)

    const insurancePills = document.createElement('div')
    insurancePills.className = 'ff-filter-group__pills'

    for (const value of insuranceDim.values) {
      const count = insuranceTypes.get(value) ?? 0
      if (count === 0) continue
      const active = props.activeFilters.insuranceTypes.has(value)
      const btn = makePill(formatLabel('insuranceTypes', value), count, active)
      btn.addEventListener('click', () => props.onToggle('insuranceTypes', value))
      insurancePills.appendChild(btn)
    }

    insuranceGroup.appendChild(insurancePills)
    container.appendChild(insuranceGroup)
  }

  return container
}

function makePill(labelText: string, count: number, active: boolean): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = active ? 'ff-pill ff-pill--active' : 'ff-pill'
  btn.setAttribute('aria-pressed', active ? 'true' : 'false')
  const labelSpan = document.createElement('span')
  labelSpan.className = 'ff-pill__label'
  labelSpan.textContent = labelText
  btn.appendChild(labelSpan)

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
