export function EmptyState(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'ff-empty'

  const heading = document.createElement('p')
  heading.className = 'ff-empty__heading'
  heading.textContent = 'No programs found'

  const hint = document.createElement('p')
  hint.className = 'ff-empty__hint'
  hint.textContent =
    'Try adjusting your search terms or removing some filters to see more results.'

  container.appendChild(heading)
  container.appendChild(hint)
  return container
}
