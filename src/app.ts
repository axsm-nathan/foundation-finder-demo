/**
 * Root application renderer.
 * Mounts UI into #foundation-finder-root and subscribes to state changes.
 *
 * design.md §2, §7
 */

import type { AppState } from './types'
import {
  getState,
  setState,
  subscribe,
  toggleFilter,
  acknowledgeDisclaimer,
} from './stateManager'
import { computeResults, buildFilterDimensions } from './filterEngine'
import { debounce } from './debounce'
import { trackEvent } from './analytics'
import { announce, observeBreakpoint } from './accessibility'
import { DisclaimerModal } from './components/DisclaimerModal'
import { SearchBar } from './components/SearchBar'
import { FilterPills } from './components/FilterPills'
import { FilterDrawer } from './components/FilterDrawer'
import { GrantCard } from './components/GrantCard'
import { ExternalLinkModal } from './components/ExternalLinkModal'
import { EmptyState } from './components/EmptyState'

export function mount(rootEl: HTMLElement): void {
  rootEl.setAttribute('role', 'main')
  rootEl.setAttribute('aria-label', 'Foundation Finder')
  rootEl.classList.add('ff-root')

  observeBreakpoint(rootEl)

  // ── Search & filter section ───────────────────────────────────────────────
  const controlsSection = document.createElement('section')
  controlsSection.setAttribute('aria-label', 'Search and filter programs')
  controlsSection.className = 'ff-controls'

  const state = getState()
  const dimensions = buildFilterDimensions(state.allPrograms)

  const setDebouncedQuery = debounce((value: string) => {
    setState('debouncedQuery', value)
    if (value.length >= 2) {
      trackEvent('search_performed', { query: value })
    }
  }, 300)

  const searchBar = SearchBar({
    onQueryChange: (value) => {
      setState('query', value)
      setDebouncedQuery(value)
    },
  })

  const filterPillsEl = FilterPills({
    dimensions,
    activeFilters: state.filters,
    onToggle: (dim, value) => {
      toggleFilter(dim, value)
      const results = computeResults(getState().allPrograms, getState())
      announce(`${results.length} program${results.length !== 1 ? 's' : ''} found`, 'polite')
    },
  })

  // Mobile filter button
  const filterBtn = document.createElement('button')
  filterBtn.type = 'button'
  filterBtn.className = 'ff-btn ff-filters-btn'
  filterBtn.setAttribute('aria-label', 'Open filters')
  filterBtn.textContent = 'Filters'
  filterBtn.addEventListener('click', () => {
    const drawerPills = FilterPills({
      dimensions,
      activeFilters: getState().filters,
      onToggle: (dim, value) => {
        toggleFilter(dim, value)
        const results = computeResults(getState().allPrograms, getState())
        announce(
          `${results.length} program${results.length !== 1 ? 's' : ''} found`,
          'polite',
        )
      },
    })
    const drawer = FilterDrawer({
      children: drawerPills,
      triggerEl: filterBtn,
      onClose: () => {
        document.body.removeChild(drawer)
      },
    })
    document.body.appendChild(drawer)
  })

  controlsSection.appendChild(searchBar)
  controlsSection.appendChild(filterBtn)
  controlsSection.appendChild(filterPillsEl)
  rootEl.appendChild(controlsSection)

  // ── Results section ───────────────────────────────────────────────────────
  const resultsSection = document.createElement('section')
  resultsSection.setAttribute('aria-label', 'Program results')
  resultsSection.className = 'ff-results'

  // Results count announcement region (not the sr-only one — this is visible)
  const countEl = document.createElement('p')
  countEl.className = 'ff-results__count'
  countEl.setAttribute('aria-live', 'polite')
  countEl.setAttribute('aria-atomic', 'true')

  const listEl = document.createElement('div')
  listEl.className = 'ff-results__list'

  resultsSection.appendChild(countEl)
  resultsSection.appendChild(listEl)
  rootEl.appendChild(resultsSection)

  // ── Disclaimer modal ──────────────────────────────────────────────────────
  let disclaimerEl: HTMLElement | null = null

  // ── External link modal ───────────────────────────────────────────────────
  let externalLinkEl: HTMLElement | null = null

  // ── State subscription ────────────────────────────────────────────────────
  subscribe((s: AppState) => {
    renderDisclaimer(s)
    renderExternalLinkModal(s)
    renderResults(s)
    renderFilterPills(s)
  })

  // ── Renderers ─────────────────────────────────────────────────────────────

  function renderDisclaimer(s: AppState): void {
    if (s.phase === 'disclaimer' && !disclaimerEl) {
      disclaimerEl = DisclaimerModal({
        onAcknowledge: acknowledgeDisclaimer,
      })
      document.body.appendChild(disclaimerEl)
    } else if (s.phase !== 'disclaimer' && disclaimerEl) {
      disclaimerEl.remove()
      disclaimerEl = null
    }
  }

  function renderExternalLinkModal(s: AppState): void {
    if (s.externalLinkTarget && !externalLinkEl) {
      const targetUrl = s.externalLinkTarget
      const triggerEl = s.externalLinkTrigger ?? rootEl

      externalLinkEl = ExternalLinkModal({
        targetUrl,
        triggerEl,
        onConfirm: () => {
          setState('externalLinkTarget', null)
          setState('externalLinkTrigger', null)
          externalLinkEl = null
        },
        onCancel: () => {
          setState('externalLinkTarget', null)
          setState('externalLinkTrigger', null)
          externalLinkEl = null
        },
      })
      document.body.appendChild(externalLinkEl)
    }
  }

  function renderResults(s: AppState): void {
    if (s.phase !== 'ready' && s.phase !== 'error') return

    const results = computeResults(s.allPrograms, s)
    const countText = `${results.length} program${results.length !== 1 ? 's' : ''} found`
    countEl.textContent = countText

    listEl.innerHTML = ''

    if (results.length === 0) {
      listEl.appendChild(EmptyState())
      return
    }

    for (const program of results) {
      const card = GrantCard({
        program,
        isExpanded: s.expandedProgramId === program.id,
        onToggle: (id) => {
          const wasExpanded = getState().expandedProgramId === id
          setState('expandedProgramId', wasExpanded ? null : id)
          if (wasExpanded) {
            trackEvent('card_collapsed', { program_name: program.programName })
            announce(`${program.programName} details collapsed`, 'polite')
          } else {
            trackEvent('card_expanded', { program_name: program.programName })
            announce(`${program.programName} details expanded`, 'polite')
          }
        },
        onCtaClick: (url, programName, triggerEl) => {
          trackEvent('cta_clicked', { program_name: programName, target_url: url })
          setState('externalLinkTarget', url)
          setState('externalLinkTrigger', triggerEl)
        },
      })
      listEl.appendChild(card)
    }
  }

  function renderFilterPills(s: AppState): void {
    // Replace inline filter pills to reflect new active state
    const existing = controlsSection.querySelector('.ff-filters')
    if (!existing) return

    const updated = FilterPills({
      dimensions,
      activeFilters: s.filters,
      onToggle: (dim, value) => {
        toggleFilter(dim, value)
        const results = computeResults(getState().allPrograms, getState())
        announce(
          `${results.length} program${results.length !== 1 ? 's' : ''} found`,
          'polite',
        )
      },
    })
    existing.replaceWith(updated)
  }
}
