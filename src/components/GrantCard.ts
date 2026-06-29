import type { ProgramRecord, ProgramStatus } from '../types'
import { ExpandableDetails } from './ExpandableDetails'
import { CtaButton } from './CtaButton'

export interface GrantCardProps {
  program: ProgramRecord
  isExpanded: boolean
  onToggle: (id: string) => void
  onCtaClick: (url: string, programName: string, triggerEl: HTMLElement) => void
}

const STATUS_CLASS: Record<ProgramStatus, string> = {
  Open: 'open',
  Closed: 'closed',
  'Not Yet Open': 'pending',
  'Government Program': 'government',
}

export function GrantCard(props: GrantCardProps): HTMLElement {
  const { program, isExpanded, onToggle, onCtaClick } = props
  const statusClass = STATUS_CLASS[program.status] ?? 'closed'
  const panelId = `ff-details-${program.id}`

  const card = document.createElement('article')
  card.className = `ff-card ff-card--${statusClass}`
  card.setAttribute('data-program-id', program.id)

  // ── Header ────────────────────────────────────────────────────────────────
  const header = document.createElement('div')
  header.className = 'ff-card__header'
  header.setAttribute('role', 'button')
  header.setAttribute('tabindex', '0')
  header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false')
  header.setAttribute('aria-controls', panelId)

  const meta = document.createElement('div')
  meta.className = 'ff-card__meta'

  const foundationName = document.createElement('p')
  foundationName.className = 'ff-card__foundation'
  foundationName.textContent = program.foundationName

  const programName = document.createElement('h3')
  programName.className = 'ff-card__program-name'
  programName.textContent = program.programName

  const description = document.createElement('p')
  description.className = 'ff-card__description'
  const truncated =
    program.description.length > 150
      ? program.description.slice(0, 150) + '…'
      : program.description
  description.textContent = truncated

  meta.appendChild(foundationName)
  meta.appendChild(programName)
  meta.appendChild(description)

  // Status pill + last updated
  const statusRow = document.createElement('div')
  statusRow.className = 'ff-card__status-row'

  const statusPill = document.createElement('span')
  statusPill.className = `ff-status-pill ff-status-pill--${statusClass}`
  statusPill.textContent = program.status

  statusRow.appendChild(statusPill)

  if (program.lastUpdated) {
    const updated = document.createElement('span')
    updated.className = 'ff-card__updated'
    updated.textContent = `Updated ${formatDate(program.lastUpdated)}`
    statusRow.appendChild(updated)
  }

  // CTA
  const cta = CtaButton({ program, onClick: onCtaClick })

  // Expand toggle icon
  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = 'ff-card__toggle'
  toggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false')
  toggle.setAttribute('aria-controls', panelId)
  toggle.setAttribute('aria-label', isExpanded ? 'Collapse details' : 'Expand details')
  toggle.textContent = isExpanded ? '▲' : '▼'

  header.appendChild(meta)
  header.appendChild(statusRow)
  header.appendChild(cta)
  header.appendChild(toggle)
  card.appendChild(header)

  // ── Expandable panel ──────────────────────────────────────────────────────
  if (isExpanded) {
    const details = ExpandableDetails({ program, panelId })
    card.appendChild(details)
  }

  // ── Event handling ────────────────────────────────────────────────────────
  function handleToggle(e: Event): void {
    // Don't toggle if the click was on the CTA button or a link
    const target = e.target as HTMLElement
    if (target.closest('.ff-btn') || target.closest('a')) return
    onToggle(program.id)
  }

  header.addEventListener('click', handleToggle)
  header.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle(e)
    }
  })

  toggle.addEventListener('click', (e) => {
    e.stopPropagation()
    onToggle(program.id)
  })

  return card
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
