export interface SearchBarProps {
  onQueryChange: (value: string) => void
  initialValue?: string
}

export function SearchBar(props: SearchBarProps): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'ff-search'

  const label = document.createElement('label')
  label.htmlFor = 'ff-search-input'
  label.className = 'ff-search__label'
  label.textContent = 'Search programs'

  const input = document.createElement('input')
  input.type = 'search'
  input.id = 'ff-search-input'
  input.className = 'ff-search__input'
  input.setAttribute('aria-label', 'Search programs')
  input.placeholder = 'Search by name, foundation, or indication…'
  input.maxLength = 200
  input.value = props.initialValue ?? ''

  input.addEventListener('input', () => {
    props.onQueryChange(input.value)
  })

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = ''
      props.onQueryChange('')
    }
  })

  wrapper.appendChild(label)
  wrapper.appendChild(input)
  return wrapper
}
