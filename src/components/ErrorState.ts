export function ErrorState(message: string): HTMLElement {
  const container = document.createElement('div')
  container.className = 'ff-error'
  container.setAttribute('role', 'alert')

  const heading = document.createElement('p')
  heading.className = 'ff-error__heading'
  heading.textContent = 'Unable to load programs'

  const detail = document.createElement('p')
  detail.className = 'ff-error__detail'
  detail.textContent = message

  container.appendChild(heading)
  container.appendChild(detail)
  return container
}
