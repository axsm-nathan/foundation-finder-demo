import { activateFocusTrap } from '../focusTrap'

export interface FilterDrawerProps {
  children: HTMLElement
  onClose: () => void
  triggerEl: HTMLElement
}

export function FilterDrawer(props: FilterDrawerProps): HTMLElement {
  const overlay = document.createElement('div')
  overlay.className = 'ff-drawer-overlay'

  const drawer = document.createElement('div')
  drawer.className = 'ff-drawer'
  drawer.setAttribute('role', 'dialog')
  drawer.setAttribute('aria-modal', 'true')
  drawer.setAttribute('aria-label', 'Filter programs')

  const header = document.createElement('div')
  header.className = 'ff-drawer__header'

  const title = document.createElement('span')
  title.className = 'ff-drawer__title'
  title.textContent = 'Filters'

  const closeBtn = document.createElement('button')
  closeBtn.type = 'button'
  closeBtn.className = 'ff-btn ff-drawer__close'
  closeBtn.setAttribute('aria-label', 'Close filters')
  closeBtn.textContent = '✕'

  header.appendChild(title)
  header.appendChild(closeBtn)

  const body = document.createElement('div')
  body.className = 'ff-drawer__body'
  body.appendChild(props.children)

  drawer.appendChild(header)
  drawer.appendChild(body)
  overlay.appendChild(drawer)

  const deactivate = activateFocusTrap({
    container: drawer,
    escapeDeactivates: true,
    onDeactivate: close,
  })

  function close(): void {
    deactivate()
    overlay.remove()
    props.triggerEl.focus()
    props.onClose()
  }

  closeBtn.addEventListener('click', close)

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close()
  })

  return overlay
}
