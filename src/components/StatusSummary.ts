import type { ProgramRecord, ProgramStatus } from '../types'
import { computeStatusCounts } from '../filterEngine'

export interface StatusSummaryProps {
  programs: ProgramRecord[]
}

const STATUS_LABELS: Record<ProgramStatus, string> = {
  'Open': 'Open',
  'Closed': 'Closed',
  'Not Yet Open': 'Closed / Pending',
  'Government Program': 'Government Programs',
}

const STATUS_CLASSES: Record<ProgramStatus, string> = {
  'Open': 'ff-status-summary__item--open',
  'Closed': 'ff-status-summary__item--closed',
  'Not Yet Open': 'ff-status-summary__item--pending',
  'Government Program': 'ff-status-summary__item--government',
}

const STATUS_ORDER: ProgramStatus[] = ['Open', 'Closed', 'Not Yet Open', 'Government Program']

export function StatusSummary(props: StatusSummaryProps): HTMLElement {
  const counts = computeStatusCounts(props.programs)

  const container = document.createElement('div')
  container.className = 'ff-status-summary'

  for (const status of STATUS_ORDER) {
    const count = counts.get(status)
    if (!count) continue

    const item = document.createElement('span')
    item.className = `ff-status-summary__item ${STATUS_CLASSES[status]}`

    const countEl = document.createElement('strong')
    countEl.textContent = String(count)

    item.appendChild(countEl)
    item.append(` ${STATUS_LABELS[status]}`)
    container.appendChild(item)
  }

  return container
}
