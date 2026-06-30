import type { ProgramRecord, ProgramStatus } from '../types'

export interface GrantCardProps {
  program: ProgramRecord
  onCtaClick: (url: string, programName: string, triggerEl: HTMLElement) => void
}

const STATUS_CLASS: Record<ProgramStatus, string> = {
  Open: 'open',
  Closed: 'closed',
  'Not Yet Open': 'pending',
  'Government Program': 'government',
}

const EXTERNAL_LINK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`

export function GrantCard(props: GrantCardProps): HTMLElement {
  const { program, onCtaClick } = props
  const statusClass = STATUS_CLASS[program.status] ?? 'closed'

  const card = document.createElement('article')
  card.className = `ff-card ff-card--${statusClass}`
  card.setAttribute('data-program-id', program.id)

  // ── Top ───────────────────────────────────────────────────────────────────
  const top = document.createElement('div')
  top.className = 'ff-card__top'

  const topLeft = document.createElement('div')
  topLeft.className = 'ff-card__top-left'

  const foundationName = document.createElement('p')
  foundationName.className = 'ff-card__foundation'
  foundationName.textContent = program.foundationName

  const programName = document.createElement('h3')
  programName.className = 'ff-card__program-name'
  programName.textContent = program.programName

  topLeft.appendChild(foundationName)
  topLeft.appendChild(programName)

  const statusPill = document.createElement('span')
  statusPill.className = `ff-status-pill ff-status-pill--${statusClass}`
  statusPill.textContent = program.status

  top.appendChild(topLeft)
  top.appendChild(statusPill)
  card.appendChild(top)

  // ── Body ──────────────────────────────────────────────────────────────────
  const body = document.createElement('div')
  body.className = 'ff-card__body'

  const desc = document.createElement('p')
  desc.className = 'ff-card__desc'
  desc.textContent = program.description
  body.appendChild(desc)

  if (program.metadata.length > 0) {
    const dg = document.createElement('div')
    dg.className = 'ff-card__dg'
    for (const field of program.metadata) {
      const item = document.createElement('div')
      item.className = 'ff-card__dg-item'
      const dk = document.createElement('div')
      dk.className = 'ff-card__dk'
      dk.textContent = field.label
      const dv = document.createElement('div')
      dv.className = 'ff-card__dv'
      dv.textContent = field.value
      item.appendChild(dk)
      item.appendChild(dv)
      dg.appendChild(item)
    }
    body.appendChild(dg)
  }

  card.appendChild(body)

  // ── Footer ────────────────────────────────────────────────────────────────
  const foot = document.createElement('div')
  foot.className = 'ff-card__foot'

  const links = document.createElement('div')
  links.className = 'ff-card__links'

  if (program.contactEmail) {
    const a = document.createElement('a')
    a.className = 'ff-card__link'
    a.href = `mailto:${program.contactEmail}`
    a.innerHTML = EXTERNAL_LINK_SVG
    a.appendChild(document.createTextNode(program.contactEmail))
    links.appendChild(a)
  }

  const websiteUrl = program.programUrl || program.foundationUrl
  if (websiteUrl) {
    const displayUrl = websiteUrl.replace(/^https?:\/\/(?:www\.)?/, '').replace(/\/$/, '')
    const a = document.createElement('a')
    a.className = 'ff-card__link'
    a.href = websiteUrl
    a.target = '_blank'
    a.rel = 'noopener'
    a.innerHTML = EXTERNAL_LINK_SVG
    a.appendChild(document.createTextNode(displayUrl))
    links.appendChild(a)
  }

  foot.appendChild(links)

  // CTA button
  const applyUrl = program.applyUrl || program.programUrl || program.foundationUrl
  const cta = document.createElement('button')
  cta.type = 'button'
  cta.className = 'ff-btn ff-btn--primary'
  cta.textContent = 'Apply Online →'

  if (!applyUrl) {
    cta.disabled = true
    cta.setAttribute('aria-disabled', 'true')
    cta.classList.add('ff-btn--disabled')
  } else {
    cta.addEventListener('click', () => onCtaClick(applyUrl, program.programName, cta))
  }

  foot.appendChild(cta)
  card.appendChild(foot)

  return card
}
