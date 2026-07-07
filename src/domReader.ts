/**
 * domReader.ts
 *
 * Reads Webflow CMS collection list items from the DOM at page load and
 * converts them into typed ProgramRecord objects. Called once at
 * DOMContentLoaded; the CMS wrapper is hidden after this call.
 *
 * See design.md §4 for the full data model and attribute names.
 */

import type { MetadataField, ProgramRecord, ProgramStatus } from './types'
import { FIELD_MAPPINGS, MARKER_ATTRIBUTE } from './fieldMappings'

const VALID_STATUSES = new Set<ProgramStatus>([
  'Open',
  'Closed',
  'Not Yet Open',
  'Government Program',
])

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Reads all [data-ff-program] elements from the DOM and returns a typed array.
 * Hides the CMS wrapper element after parsing.
 *
 * Preconditions:
 *   - document.readyState === 'interactive' | 'complete'
 *   - At least one [data-ff-program] element exists in the DOM
 *
 * Postconditions:
 *   - Returns ProgramRecord[] with length equal to the number of
 *     [data-ff-program] elements found
 *   - The source CMS wrapper element(s) are hidden (display:none)
 */
export function readPrograms(): ProgramRecord[] {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>(`[${MARKER_ATTRIBUTE}]`),
  ).filter((el) => el.id !== 'foundation-finder-root')

  const records: ProgramRecord[] = []

  for (const el of elements) {
    try {
      records.push(parseProgram(el))
    } catch (err) {
      console.warn('[FoundationFinder] Failed to parse program element:', el, err)
    }
  }

  // Hide the raw CMS markup after extracting data
  hideCmsWrappers()

  return records
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Parses a single [data-ff-program] element into a ProgramRecord.
 */
function parseProgram(el: HTMLElement): ProgramRecord {
  const id = attr(el, FIELD_MAPPINGS.programId) || slugify(attr(el, FIELD_MAPPINGS.programName))

  const rawStatus = attr(el, FIELD_MAPPINGS.status)
  const status: ProgramStatus = VALID_STATUSES.has(rawStatus as ProgramStatus)
    ? (rawStatus as ProgramStatus)
    : 'Closed'

  return {
    id,
    foundationName: attr(el, FIELD_MAPPINGS.foundationName),
    programName: attr(el, FIELD_MAPPINGS.programName),
    description: attr(el, FIELD_MAPPINGS.description),
    status,
    lastUpdated: parseDate(attr(el, FIELD_MAPPINGS.lastUpdated)),
    diseaseIndications: parseMultiRef(attr(el, FIELD_MAPPINGS.diseaseIndications)),
    insuranceTypes: parseMultiRef(attr(el, FIELD_MAPPINGS.insuranceTypes)),
    grantAmount: parseAmount(attr(el, FIELD_MAPPINGS.grantAmount)),
    applyUrl: attr(el, FIELD_MAPPINGS.applyUrl),
    programUrl: attr(el, FIELD_MAPPINGS.programUrl),
    foundationUrl: attr(el, FIELD_MAPPINGS.foundationUrl),
    contactEmail: attr(el, FIELD_MAPPINGS.contactEmail),
    contactPhone: attr(el, FIELD_MAPPINGS.contactPhone),
    metadata: parseMetadata(attr(el, FIELD_MAPPINGS.metadata)),
  }
}

/**
 * Normalises a comma-separated CMS multi-reference string into a string[].
 * Trims whitespace, removes empty entries, lowercases for comparison.
 *
 * Postconditions: returns string[] with no empty entries; all values lowercased
 */
export function parseMultiRef(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)
}

/**
 * Parses a grant amount string to a number. Returns null for empty/NaN.
 */
function parseAmount(raw: string): number | null {
  if (!raw.trim()) return null
  const value = parseFloat(raw)
  return isNaN(value) ? null : value
}

/**
 * Parses an ISO 8601 date string to a Date. Returns null for empty/invalid.
 */
function parseDate(raw: string): Date | null {
  if (!raw.trim()) return null
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Parses a JSON array of MetadataField objects. Returns [] on failure.
 */
function parseMetadata(raw: string): MetadataField[] {
  if (!raw.trim()) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is MetadataField =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.label === 'string' &&
        typeof item.value === 'string',
    )
  } catch {
    return []
  }
}

/**
 * Returns the trimmed value of a data attribute, or '' if absent.
 */
function attr(el: HTMLElement, name: string): string {
  return (el.getAttribute(name) ?? '').trim()
}

/**
 * Converts a string to a URL-safe slug (fallback ID when data-ff-program-id
 * is absent).
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

/**
 * Hides the Webflow CMS collection list wrapper.
 * Targets the nearest .w-dyn-list ancestor (Webflow's collection list class),
 * or falls back to walking up 3 levels max to avoid hiding unrelated containers.
 */
function hideCmsWrappers(): void {
  const first = document.querySelector<HTMLElement>(`[${MARKER_ATTRIBUTE}]:not(#foundation-finder-root)`)
  if (!first) return

  // Prefer the known Webflow collection list class
  const dynList = first.closest<HTMLElement>('.w-dyn-list')
  if (dynList) {
    dynList.style.display = 'none'
    return
  }

  // Fallback: walk up at most 3 levels to find a non-program ancestor
  let wrapper: HTMLElement | null = first.parentElement
  let levels = 0
  while (wrapper && levels < 3) {
    if (!wrapper.hasAttribute(MARKER_ATTRIBUTE)) {
      wrapper.style.display = 'none'
      return
    }
    wrapper = wrapper.parentElement
    levels++
  }
}
