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
  clearFilters,
  setSort,
} from './stateManager'
import { computeResults, buildFilterDimensions } from './filterEngine'
import { debounce } from './debounce'
import { trackEvent } from './analytics'
import { announce, observeBreakpoint } from './accessibility'
import { DisclaimerModal } from './components/DisclaimerModal'
import { SearchBar } from './components/SearchBar'
import { FilterPills } from './components/FilterPills'
import { FilterDrawer } from './components/FilterDrawer'
import { SortButton } from './components/SortPopover'
import { GrantCard } from './components/GrantCard'
import { ExternalLinkModal } from './components/ExternalLinkModal'
import { EmptyState } from './components/EmptyState'
import { StatusSummary } from './components/StatusSummary'

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
    allPrograms: state.allPrograms,
    onToggle: (dim, value) => {
      toggleFilter(dim, value)
      const results = computeResults(getState().allPrograms, getState())
      announce(`${results.length} program${results.length !== 1 ? 's' : ''} found`, 'polite')
    },
    onClearAll: clearFilters,
  })

  // Mobile filter button
  let activeDrawerOverlay: HTMLElement | null = null

  const filterBtn = document.createElement('button')
  filterBtn.type = 'button'
  filterBtn.className = 'ff-btn ff-filters-btn'
  filterBtn.setAttribute('aria-label', 'Open filters')
  filterBtn.textContent = 'Filters'

  const mobileClearBtn = document.createElement('button')
  mobileClearBtn.type = 'button'
  mobileClearBtn.className = 'ff-clear-btn ff-mobile-clear-btn'
  mobileClearBtn.setAttribute('aria-label', 'Clear all filters')
  mobileClearBtn.textContent = 'Clear filters'
  mobileClearBtn.addEventListener('click', () => clearFilters())

  filterBtn.addEventListener('click', () => {
    const drawerPills = FilterPills({
      dimensions,
      activeFilters: getState().filters,
      allPrograms: getState().allPrograms,
      onToggle: (dim, value) => {
        toggleFilter(dim, value)
        const results = computeResults(getState().allPrograms, getState())
        announce(
          `${results.length} program${results.length !== 1 ? 's' : ''} found`,
          'polite',
        )
      },
      onClearAll: clearFilters,
    })
    const drawer = FilterDrawer({
      children: drawerPills,
      triggerEl: filterBtn,
      onClearAll: clearFilters,
      onClose: () => {
        document.body.removeChild(drawer)
        activeDrawerOverlay = null
      },
    })
    activeDrawerOverlay = drawer
    document.body.appendChild(drawer)
  })

  let sortWrapperEl = SortButton({
    sort: state.sort,
    onSort: (field, direction) => setSort(field, direction),
  })
  sortWrapperEl.className = 'ff-sort-wrapper'

  controlsSection.appendChild(searchBar)
  controlsSection.appendChild(sortWrapperEl)
  controlsSection.appendChild(filterBtn)
  controlsSection.appendChild(mobileClearBtn)
  controlsSection.appendChild(filterPillsEl)
  rootEl.appendChild(controlsSection)

  // ── Status summary row ────────────────────────────────────────────────────
  let statusSummaryEl = StatusSummary({ programs: [...state.allPrograms] })
  rootEl.appendChild(statusSummaryEl)

  // ── Results section ───────────────────────────────────────────────────────
  const resultsSection = document.createElement('section')
  resultsSection.setAttribute('aria-label', 'Program results')
  resultsSection.className = 'ff-results'

  let firstCardObserver: IntersectionObserver | null = null

  // Results count announcement region (not the sr-only one — this is visible)
  const countEl = document.createElement('p')
  countEl.className = 'ff-results__count'
  countEl.setAttribute('aria-live', 'polite')
  countEl.setAttribute('aria-atomic', 'true')

  const listEl = document.createElement('div')
  listEl.className = 'ff-results__list'

  const scrollTopBtn = document.createElement('button')
  scrollTopBtn.type = 'button'
  scrollTopBtn.className = 'ff-scroll-top'
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top')
  scrollTopBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>`
  scrollTopBtn.addEventListener('click', () => rootEl.scrollIntoView({ behavior: 'smooth' }))

  resultsSection.appendChild(countEl)
  resultsSection.appendChild(listEl)
  resultsSection.appendChild(scrollTopBtn)
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
    renderDrawerPills(s)
    renderSortButton(s)
    const hasFilters =
      s.filters.insuranceTypes.size > 0 ||
      s.filters.grantStatuses.size > 0 ||
      s.filters.supportAmounts.size > 0
    mobileClearBtn.classList.toggle('ff-mobile-clear-btn--visible', hasFilters)
  })

  // ── Renderers ─────────────────────────────────────────────────────────────

  function renderDisclaimer(s: AppState): void {
    if (s.phase === 'disclaimer' && !disclaimerEl) {
      disclaimerEl = DisclaimerModal({
        onAcknowledge: acknowledgeDisclaimer,
      })
      rootEl.appendChild(disclaimerEl)
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

    const updatedSummary = StatusSummary({ programs: results })
    statusSummaryEl.replaceWith(updatedSummary)
    statusSummaryEl = updatedSummary

    listEl.innerHTML = ''
    firstCardObserver?.disconnect()
    scrollTopBtn.classList.remove('ff-scroll-top--visible')

    if (results.length === 0) {
      listEl.appendChild(EmptyState())
      return
    }

    const charitable = results.filter(p => p.status !== 'Government Program')
    const government = results.filter(p => p.status === 'Government Program')

    for (const [label, group] of [
      ['CHARITABLE PATIENT ASSISTANCE FOUNDATIONS', charitable],
      ['GOVERNMENT PROGRAMS', government],
    ] as [string, typeof results][]) {
      if (group.length === 0) continue

      const secHead = document.createElement('div')
      secHead.className = 'ff-sec-head'
      secHead.textContent = label
      listEl.appendChild(secHead)

      const grid = document.createElement('div')
      grid.className = 'ff-grid'
      for (const program of group) {
        grid.appendChild(GrantCard({
          program,
          onCtaClick: (url, programName, triggerEl) => {
            trackEvent('cta_clicked', { program_name: programName, target_url: url })
            setState('externalLinkTarget', url)
            setState('externalLinkTrigger', triggerEl)
          },
        }))
      }
      listEl.appendChild(grid)
    }

    const firstCard = listEl.querySelector<HTMLElement>('.ff-card')
    if (firstCard) {
      firstCardObserver = new IntersectionObserver(
        ([entry]) => {
          scrollTopBtn.classList.toggle('ff-scroll-top--visible', !entry!.isIntersecting)
        },
        { threshold: 0 },
      )
      firstCardObserver.observe(firstCard)
    }
  }

  function renderFilterPills(s: AppState): void {
    // Replace inline filter pills to reflect new active state
    const existing = controlsSection.querySelector('.ff-filters')
    if (!existing) return

    const updated = FilterPills({
      dimensions,
      activeFilters: s.filters,
      allPrograms: s.allPrograms,
      onToggle: (dim, value) => {
        toggleFilter(dim, value)
        const results = computeResults(getState().allPrograms, getState())
        announce(
          `${results.length} program${results.length !== 1 ? 's' : ''} found`,
          'polite',
        )
      },
      onClearAll: clearFilters,
    })
    existing.replaceWith(updated)
  }

  function renderDrawerPills(s: AppState): void {
    if (!activeDrawerOverlay) return
    const existing = activeDrawerOverlay.querySelector('.ff-filters')
    if (!existing) return

    const updated = FilterPills({
      dimensions,
      activeFilters: s.filters,
      allPrograms: s.allPrograms,
      onToggle: (dim, value) => {
        toggleFilter(dim, value)
        const results = computeResults(getState().allPrograms, getState())
        announce(
          `${results.length} program${results.length !== 1 ? 's' : ''} found`,
          'polite',
        )
      },
      onClearAll: clearFilters,
    })
    existing.replaceWith(updated)
  }

  function renderSortButton(s: AppState): void {
    const updated = SortButton({
      sort: s.sort,
      onSort: (field, direction) => setSort(field, direction),
    })
    sortWrapperEl.replaceWith(updated)
    sortWrapperEl = updated
  }
}
