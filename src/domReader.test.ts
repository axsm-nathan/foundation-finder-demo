import { describe, it, expect, beforeEach } from 'vitest'
import { readPrograms, parseMultiRef } from './domReader'
import { FIELD_MAPPINGS, MARKER_ATTRIBUTE } from './fieldMappings'

function makeProgramEl(attrs: Record<string, string>): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('data-ff-program', '')
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('readPrograms', () => {
  it('returns empty array when no [data-ff-program] elements', () => {
    expect(readPrograms()).toHaveLength(0)
  })

  it('parses a complete program element', () => {
    makeProgramEl({
      'data-ff-program-id': 'prog-1',
      'data-ff-foundation-name': 'Test Foundation',
      'data-ff-program-name': 'Test Program',
      'data-ff-description': 'A description',
      'data-ff-status': 'Open',
      'data-ff-last-updated': '2024-01-15',
      'data-ff-disease-indications': 'depression, anxiety',
      'data-ff-insurance-types': 'Medicare, Medicaid',
      'data-ff-grant-amount': '5000',
      'data-ff-apply-url': 'https://example.com/apply',
      'data-ff-program-url': 'https://example.com/program',
      'data-ff-foundation-url': 'https://example.com',
      'data-ff-contact-email': 'test@example.com',
      'data-ff-contact-phone': '1-800-555-0100',
      'data-ff-metadata': '[{"label":"Eligibility","value":"Income-based"}]',
    })
    const records = readPrograms()
    expect(records).toHaveLength(1)
    const r = records[0]!
    expect(r.id).toBe('prog-1')
    expect(r.foundationName).toBe('Test Foundation')
    expect(r.status).toBe('Open')
    expect(r.lastUpdated?.getFullYear()).toBe(2024)
    expect(r.insuranceTypes).toEqual(['medicare', 'medicaid'])
    expect(r.diseaseIndications).toEqual(['depression', 'anxiety'])
    expect(r.grantAmount).toBe(5000)
    expect(r.metadata).toEqual([{ label: 'Eligibility', value: 'Income-based' }])
  })

  it('falls back to slug id when data-ff-program-id is absent', () => {
    makeProgramEl({ 'data-ff-program-name': 'My Test Program' })
    const [r] = readPrograms()
    expect(r?.id).toBe('my-test-program')
  })

  it('defaults invalid status to Closed', () => {
    makeProgramEl({ 'data-ff-program-id': 'x', 'data-ff-status': 'Unknown' })
    const [r] = readPrograms()
    expect(r?.status).toBe('Closed')
  })

  it('sets grantAmount to null for non-numeric string', () => {
    makeProgramEl({ 'data-ff-program-id': 'x', 'data-ff-grant-amount': 'N/A' })
    const [r] = readPrograms()
    expect(r?.grantAmount).toBeNull()
  })

  it('sets lastUpdated to null for invalid date', () => {
    makeProgramEl({ 'data-ff-program-id': 'x', 'data-ff-last-updated': 'not-a-date' })
    const [r] = readPrograms()
    expect(r?.lastUpdated).toBeNull()
  })

  it('defaults metadata to [] for invalid JSON', () => {
    makeProgramEl({ 'data-ff-program-id': 'x', 'data-ff-metadata': '{bad json' })
    const [r] = readPrograms()
    expect(r?.metadata).toEqual([])
  })

  it('skips non-object items in metadata array', () => {
    makeProgramEl({ 'data-ff-program-id': 'x', 'data-ff-metadata': '[1, null, {"label":"A","value":"B"}]' })
    const [r] = readPrograms()
    expect(r?.metadata).toEqual([{ label: 'A', value: 'B' }])
  })

  it('hides the parent wrapper element', () => {
    const wrapper = document.createElement('div')
    const child = document.createElement('div')
    child.setAttribute('data-ff-program', '')
    child.setAttribute('data-ff-program-id', 'y')
    wrapper.appendChild(child)
    document.body.appendChild(wrapper)
    readPrograms()
    expect(wrapper.style.display).toBe('none')
  })
})

describe('fieldMappings wiring', () => {
  it('reads programName from the attribute named in FIELD_MAPPINGS', () => {
    const el = document.createElement('div')
    el.setAttribute(MARKER_ATTRIBUTE, '')
    el.setAttribute(FIELD_MAPPINGS.programName, 'Mapped Name')
    document.body.appendChild(el)
    const [r] = readPrograms()
    expect(r?.programName).toBe('Mapped Name')
  })
})

describe('parseMultiRef', () => {
  it('splits comma-separated values', () => {
    expect(parseMultiRef('Medicare, Medicaid')).toEqual(['medicare', 'medicaid'])
  })

  it('returns empty array for empty string', () => {
    expect(parseMultiRef('')).toEqual([])
  })

  it('trims whitespace', () => {
    expect(parseMultiRef('  Medicare  ,  Medicaid  ')).toEqual(['medicare', 'medicaid'])
  })

  it('removes empty entries', () => {
    expect(parseMultiRef(',,')).toEqual([])
  })

  it('lowercases all values', () => {
    expect(parseMultiRef('MEDICARE')).toEqual(['medicare'])
  })
})
