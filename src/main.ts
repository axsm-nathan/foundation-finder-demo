import './main.css'
import { readPrograms } from './domReader'
import { initState } from './stateManager'
import { mount } from './app'
import { ErrorState } from './components/ErrorState'

document.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.getElementById('foundation-finder-root')
  if (!rootEl) return

  let programs
  try {
    programs = readPrograms()
  } catch (err) {
    console.error('[FoundationFinder] Failed to read programs from DOM:', err)
    rootEl.appendChild(ErrorState('An unexpected error occurred while loading programs.'))
    return
  }

  if (programs.length === 0) {
    rootEl.appendChild(ErrorState('No programs are currently available.'))
    return
  }

  initState(programs)
  mount(rootEl)
})
