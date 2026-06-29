import type { ProgramRecord } from '../types'

export interface ExpandableDetailsProps {
  program: ProgramRecord
  panelId: string
}

export function ExpandableDetails(props: ExpandableDetailsProps): HTMLElement {
  const { program, panelId } = props

  const panel = document.createElement('div')
  panel.id = panelId
  panel.className = 'ff-card__body'
  panel.setAttribute('role', 'region')
  panel.setAttribute('aria-label', `${program.programName} details`)

  let hasContent = false

  if (program.contactEmail) {
    hasContent = true
    const row = document.createElement('div')
    row.className = 'ff-details__row'
    const label = document.createElement('span')
    label.className = 'ff-details__label'
    label.textContent = 'Email'
    const link = document.createElement('a')
    link.href = `mailto:${program.contactEmail}`
    link.textContent = program.contactEmail
    row.appendChild(label)
    row.appendChild(link)
    panel.appendChild(row)
  }

  if (program.contactPhone) {
    hasContent = true
    const row = document.createElement('div')
    row.className = 'ff-details__row'
    const label = document.createElement('span')
    label.className = 'ff-details__label'
    label.textContent = 'Phone'
    const link = document.createElement('a')
    link.href = `tel:${program.contactPhone}`
    link.textContent = program.contactPhone
    row.appendChild(label)
    row.appendChild(link)
    panel.appendChild(row)
  }

  if (program.metadata.length > 0) {
    hasContent = true
    const dl = document.createElement('dl')
    dl.className = 'ff-details__metadata'
    for (const field of program.metadata) {
      const dt = document.createElement('dt')
      dt.textContent = field.label
      const dd = document.createElement('dd')
      dd.textContent = field.value
      dl.appendChild(dt)
      dl.appendChild(dd)
    }
    panel.appendChild(dl)
  }

  if (!hasContent) {
    const empty = document.createElement('p')
    empty.className = 'ff-details__empty'
    empty.textContent = 'No additional details available.'
    panel.appendChild(empty)
  }

  return panel
}
