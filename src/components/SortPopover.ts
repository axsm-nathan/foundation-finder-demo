import type { SortField, SortDirection, SortState } from '../types'

export interface SortPopoverProps {
  sort: SortState
  onSort: (field: SortField | null, direction: SortDirection) => void
}

const OPTIONS: { field: SortField; label: string }[] = [
  { field: 'grantAmount', label: 'Grant Amount' },
  { field: 'lastUpdated', label: 'Last Updated' },
]

export function SortButton(props: SortPopoverProps): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'ff-sort-wrapper'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'ff-btn ff-sort-btn'
  btn.setAttribute('aria-haspopup', 'true')
  btn.setAttribute('aria-expanded', 'false')
  updateButtonLabel(btn, props.sort)

  let popover: HTMLElement | null = null

  function openPopover(): void {
    if (popover) return

    popover = document.createElement('div')
    popover.className = 'ff-sort-popover'
    popover.setAttribute('role', 'menu')

    for (const opt of OPTIONS) {
      const isActive = props.sort.field === opt.field
      const currentDir = isActive ? props.sort.direction : 'desc'

      const item = document.createElement('button')
      item.type = 'button'
      item.className = 'ff-sort-option' + (isActive ? ' ff-sort-option--active' : '')
      item.setAttribute('role', 'menuitem')

      const labelSpan = document.createElement('span')
      labelSpan.textContent = opt.label

      const dirSpan = document.createElement('span')
      dirSpan.className = 'ff-sort-option__dir'
      dirSpan.textContent = isActive ? (currentDir === 'asc' ? '↑' : '↓') : ''

      item.appendChild(labelSpan)
      item.appendChild(dirSpan)

      item.addEventListener('click', () => {
        if (isActive) {
          // Toggle direction
          props.onSort(opt.field, currentDir === 'asc' ? 'desc' : 'asc')
        } else {
          props.onSort(opt.field, 'desc')
        }
        closePopover()
      })

      popover.appendChild(item)
    }

    // Clear sort option
    if (props.sort.field !== null) {
      const clearItem = document.createElement('button')
      clearItem.type = 'button'
      clearItem.className = 'ff-sort-option ff-sort-option--clear'
      clearItem.setAttribute('role', 'menuitem')
      clearItem.textContent = 'Default order'
      clearItem.addEventListener('click', () => {
        props.onSort(null, 'desc')
        closePopover()
      })
      popover.appendChild(clearItem)
    }

    wrapper.appendChild(popover)
    btn.setAttribute('aria-expanded', 'true')

    // Close on outside click
    requestAnimationFrame(() => {
      document.addEventListener('click', onOutsideClick)
    })
  }

  function closePopover(): void {
    if (!popover) return
    popover.remove()
    popover = null
    btn.setAttribute('aria-expanded', 'false')
    document.removeEventListener('click', onOutsideClick)
  }

  function onOutsideClick(e: MouseEvent): void {
    if (!wrapper.contains(e.target as Node)) closePopover()
  }

  btn.addEventListener('click', () => {
    if (popover) {
      closePopover()
    } else {
      openPopover()
    }
  })

  wrapper.appendChild(btn)
  return wrapper
}

function updateButtonLabel(btn: HTMLButtonElement, sort: SortState): void {
  if (sort.field === null) {
    btn.textContent = 'Sort'
    btn.classList.remove('ff-sort-btn--active')
    return
  }
  const opt = OPTIONS.find((o) => o.field === sort.field)
  const dir = sort.direction === 'asc' ? '↑' : '↓'
  btn.textContent = `${opt?.label ?? 'Sort'} ${dir}`
  btn.classList.add('ff-sort-btn--active')
}
