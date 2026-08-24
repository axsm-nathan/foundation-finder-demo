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
const MAIL_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`
const PHONE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>`

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

  const topRight = document.createElement('div')
  topRight.className = 'ff-card__top-right'

  if (program.lastUpdated) {
    const lastUpdated = document.createElement('span')
    lastUpdated.className = 'ff-card__last-updated'
    lastUpdated.textContent = `Updated ${program.lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    topRight.appendChild(lastUpdated)
  }

  // const statusPill = document.createElement('span')
  // statusPill.className = `ff-status-pill ff-status-pill--${statusClass}`
  // statusPill.textContent = program.status
  // topRight.appendChild(statusPill)

  top.appendChild(topLeft)
  top.appendChild(topRight)
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
    featuredFields.push({ label: 'Grant Amount', value: program.grantAmount })
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

  // Contact info
  if (program.contactEmail || program.contactPhone) {
    const contactInfo = document.createElement('div')
    contactInfo.className = 'ff-card__contact'

    if (program.contactEmail) {
      const emailLink = document.createElement('a')
      emailLink.href = `mailto:${program.contactEmail}`
      emailLink.className = 'ff-card__contact-link'
      emailLink.innerHTML = `${MAIL_SVG}<span>${program.contactEmail}</span>`
      contactInfo.appendChild(emailLink)
    }

    if (program.contactPhone) {
      const phoneLink = document.createElement('a')
      phoneLink.href = `tel:${program.contactPhone}`
      phoneLink.className = 'ff-card__contact-link'
      phoneLink.innerHTML = `${PHONE_SVG}<span>${program.contactPhone}</span>`
      contactInfo.appendChild(phoneLink)
    }

    foot.appendChild(contactInfo)
  }

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
