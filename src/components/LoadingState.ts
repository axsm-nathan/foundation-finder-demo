export function LoadingState(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'ff-loading'
  container.setAttribute('aria-busy', 'true')
  container.setAttribute('aria-label', 'Loading programs')

  const spinner = document.createElement('div')
  spinner.className = 'ff-loading__spinner'
  spinner.setAttribute('aria-hidden', 'true')

  const text = document.createElement('p')
  text.className = 'ff-loading__text'
  text.textContent = 'Loading programs…'

  container.appendChild(spinner)
  container.appendChild(text)
  return container
}
