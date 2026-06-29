// ---------------------------------------------------------------------------
// Shared types — matches the data model defined in design.md §4.2
// ---------------------------------------------------------------------------

export interface MetadataField {
  label: string
  value: string
}

export type ProgramStatus =
  | 'Open'
  | 'Closed'
  | 'Not Yet Open'
  | 'Government Program'

export interface ProgramRecord {
  id: string
  foundationName: string
  programName: string
  /** Full text from CMS. UI truncates to 150 chars with ellipsis. */
  description: string
  status: ProgramStatus
  lastUpdated: Date | null
  /** Normalised to lowercase for matching */
  diseaseIndications: string[]
  /** Normalised to lowercase for matching */
  insuranceTypes: string[]
  grantAmount: number | null
  applyUrl: string
  programUrl: string
  foundationUrl: string
  contactEmail: string
  contactPhone: string
  metadata: MetadataField[]
}

// ---------------------------------------------------------------------------
// State types — design.md §5.1
// ---------------------------------------------------------------------------

export interface FilterState {
  /** OR within dimension; lowercase values */
  insuranceTypes: Set<string>
  /** OR within dimension; e.g. "open", "closed" */
  grantStatuses: Set<string>
  /** OR within dimension; range keys e.g. "under-1000", "1000-5000" */
  supportAmounts: Set<string>
}

export interface AppState {
  // Source data (immutable after init)
  readonly allPrograms: readonly ProgramRecord[]

  // Search
  query: string
  debouncedQuery: string

  // Filters
  filters: FilterState

  // Card interaction
  expandedProgramId: string | null

  // UI lifecycle
  phase: 'loading' | 'disclaimer' | 'ready' | 'error'
  errorMessage: string | null

  // External link modal
  externalLinkTarget: string | null
  externalLinkTrigger: HTMLElement | null
}
