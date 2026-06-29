import type { FilterState } from '../types'
import type { FilterDimension } from '../filterEngine'

export interface FilterPillsProps {
  dimensions: FilterDimension[]
  activeFilters: FilterState
  onToggle: (dim: keyof FilterState, value: string) => void
}

export function FilterPills(props: FilterPillsProps): HTMLElement {
  const container = document.createElement('div')
  container.className = 'ff-filters'

  for (const dim of props.dimensions) {
    const group = document.createElement('div')
    group.className = 'ff-filter-group'

    const heading = document.createElement('span')
    heading.className = 'ff-filter-group__label'
    heading.textContent = dim.label
    group.appendChild(heading)

    const pills = document.createElement('div')
    pills.className = 'ff-filter-group__pills'

    for (const value of dim.values) {
      const active = props.activeFilters[dim.id].has(value)
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = active ? 'ff-pill ff-pill--active' : 'ff-pill'
      btn.setAttribute('aria-pressed', active ? 'true' : 'false')
      btn.textContent = formatPillLabel(dim.id, value)

      btn.addEventListener('click', () => {
        props.onToggle(dim.id, value)
      })

      pills.appendChild(btn)
    }

    group.appendChild(pills)
    container.appendChild(group)
  }

  return container
}

function formatPillLabel(dim: keyof FilterState, value: string): string {
  if (dim === 'supportAmounts') {
    switch (value) {
      case 'under-1000':
        return 'Under $1,000'
      case '1000-5000':
        return '$1,000–$5,000'
      case '5000-10000':
        return '$5,000–$10,000'
      case '10000-plus':
        return '$10,000+'
    }
  }
  // Capitalize first letter for status/insurance values
  return value.charAt(0).toUpperCase() + value.slice(1)
}
