import { describe, it, expect, beforeEach } from 'vitest'
import { trackEvent } from './analytics'

describe('trackEvent', () => {
  beforeEach(() => {
    // Reset dataLayer before each test
    ;(window as unknown as Record<string, unknown>)['dataLayer'] = undefined
  })

  it('does nothing if dataLayer is absent', () => {
    expect(() => trackEvent('test_event')).not.toThrow()
  })

  it('pushes event to dataLayer', () => {
    const dl: unknown[] = []
    ;(window as unknown as Record<string, unknown>)['dataLayer'] = dl
    trackEvent('search_performed', { query: 'depression' })
    expect(dl).toHaveLength(1)
    expect(dl[0]).toMatchObject({ event: 'search_performed', query: 'depression' })
  })

  it('pushes event without payload', () => {
    const dl: unknown[] = []
    ;(window as unknown as Record<string, unknown>)['dataLayer'] = dl
    trackEvent('disclaimer_accepted')
    expect(dl[0]).toMatchObject({ event: 'disclaimer_accepted' })
  })

  it('does not include PII keys', () => {
    const dl: unknown[] = []
    ;(window as unknown as Record<string, unknown>)['dataLayer'] = dl
    trackEvent('filter_selected', { dimension: 'insuranceTypes', value: 'Medicare' })
    const payload = dl[0] as Record<string, unknown>
    const piiKeys = ['email', 'phone', 'name', 'dob', 'ip']
    for (const key of piiKeys) {
      expect(payload).not.toHaveProperty(key)
    }
  })

  it('swallows errors if dataLayer.push throws', () => {
    ;(window as unknown as Record<string, unknown>)['dataLayer'] = {
      push: () => { throw new Error('GTM error') },
    }
    expect(() => trackEvent('test')).not.toThrow()
  })
})
