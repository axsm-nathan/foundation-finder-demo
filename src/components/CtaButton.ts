import type { ProgramRecord } from '../types'

export interface CtaButtonProps {
  program: ProgramRecord
  onClick: (url: string, programName: string, triggerEl: HTMLElement) => void
}

export function CtaButton(props: CtaButtonProps): HTMLElement {
  const { program } = props
  const url = program.applyUrl || program.programUrl || program.foundationUrl

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'ff-btn ff-btn--primary'

  if (!url) {
    btn.disabled = true
    btn.setAttribute('aria-disabled', 'true')
    btn.classList.add('ff-btn--disabled')
    btn.textContent = 'Apply Now'
    return btn
  }

  btn.textContent = 'Apply Now'

  btn.addEventListener('click', () => {
    props.onClick(url, program.programName, btn)
  })

  return btn
}
