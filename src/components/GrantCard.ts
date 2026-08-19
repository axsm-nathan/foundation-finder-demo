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

  const featuredFields: Array<{ label: string; value: string }> = []
  if (program.diseaseIndications.length > 0) {
    featuredFields.push({ label: 'Disease Indications', value: program.diseaseIndications.join(', ') })
  }
  if (program.insuranceTypes.length > 0) {
    featuredFields.push({ label: 'Insurance Types', value: program.insuranceTypes.join(', ') })
  }
  if (program.grantAmount !== null) {
    featuredFields.push({
      label: 'Grant Amount',
      value: program.grantAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    })
  }

  const makeMetaItem = (label: string, value: string): HTMLElement => {
    const item = document.createElement('div')
    item.className = 'ff-card__dg-item'
    const dk = document.createElement('div')
    dk.className = 'ff-card__dk'
    dk.textContent = label
    const dv = document.createElement('div')
    dv.className = 'ff-card__dv'
    dv.textContent = value
    item.appendChild(dk)
    item.appendChild(dv)
    return item
  }

  if (featuredFields.length > 0 || program.metadata.length > 0) {
    const meta = document.createElement('div')
    meta.className = 'ff-card__meta'
    if (featuredFields.length > 0 && program.metadata.length > 0) {
      meta.classList.add('ff-card__meta--divided')
    }

    if (featuredFields.length > 0) {
      const featured = document.createElement('div')
      featured.className = 'ff-card__featured'
      for (const field of featuredFields) {
        featured.appendChild(makeMetaItem(field.label, field.value))
      }
      meta.appendChild(featured)
    }

    if (program.metadata.length > 0) {
      const dg = document.createElement('div')
      dg.className = 'ff-card__dg'
      for (const field of program.metadata) {
        dg.appendChild(makeMetaItem(field.label, field.value))
      }
      meta.appendChild(dg)
    }

    body.appendChild(meta)
  }

  card.appendChild(body)

  // ── Footer ────────────────────────────────────────────────────────────────
  const foot = document.createElement('div')
  foot.className = 'ff-card__foot'

  // CTA button
  const ctaUrl = program.foundationUrl || program.programUrl
  const cta = document.createElement('button')
  cta.type = 'button'
  cta.className = 'ff-btn ff-btn--primary'
  cta.innerHTML = `Visit Site ${EXTERNAL_LINK_SVG}`

  if (!ctaUrl) {
    cta.disabled = true
    cta.setAttribute('aria-disabled', 'true')
    cta.classList.add('ff-btn--disabled')
  } else {
    cta.addEventListener('click', () => onCtaClick(ctaUrl, program.programName, cta))
  }

  foot.appendChild(cta)
  card.appendChild(foot)

  return card
}
