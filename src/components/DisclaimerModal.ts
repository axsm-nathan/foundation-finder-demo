import { activateFocusTrap } from '../focusTrap'

export interface DisclaimerModalProps {
  onAcknowledge: () => void
}

export function DisclaimerModal(props: DisclaimerModalProps): HTMLElement {
  const overlay = document.createElement('div')
  overlay.className = 'ff-modal ff-modal--scoped'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-labelledby', 'ff-disclaimer-title')

  const dialog = document.createElement('div')
  dialog.className = 'ff-modal__dialog'

  const title = document.createElement('h2')
  title.id = 'ff-disclaimer-title'
  title.className = 'ff-modal__title'
  title.textContent = 'Important Information'

  const body = document.createElement('div')
  body.className = 'ff-modal__body'

  const p1 = document.createElement('p')
  p1.textContent =
    'The Foundation Finder is a resource tool intended to help patients identify potential financial assistance programs. This tool does not constitute medical, legal, or financial advice.'

  const p2 = document.createElement('p')
  p2.textContent =
    'Eligibility requirements, program availability, and benefit amounts are subject to change. Always confirm current program details directly with the sponsoring organization.'

  const p3 = document.createElement('p')
  p3.textContent =
    'By continuing, you acknowledge that this information is provided for educational purposes only and that Axsome Therapeutics is not responsible for the content of third-party websites or programs.'

  body.appendChild(p1)
  body.appendChild(p2)
  body.appendChild(p3)

  const footer = document.createElement('div')
  footer.className = 'ff-modal__footer'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'ff-btn ff-btn--primary'
  btn.textContent = 'I Understand'

  footer.appendChild(btn)
  dialog.appendChild(title)
  dialog.appendChild(body)
  dialog.appendChild(footer)
  overlay.appendChild(dialog)

  // Trap focus — Escape does NOT close per design.md §10.3
  let deactivate: (() => void) | null = null

  function mount(): void {
    deactivate = activateFocusTrap({
      container: dialog,
      escapeDeactivates: false,
    })
  }

  btn.addEventListener('click', () => {
    deactivate?.()
    overlay.remove()
    props.onAcknowledge()
  })

  // Activate trap after element is in the DOM
  requestAnimationFrame(mount)

  return overlay
}
