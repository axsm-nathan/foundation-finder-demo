export const MARKER_ATTRIBUTE = 'data-ff-program'

export const FIELD_MAPPINGS = {
  programId:          'data-ff-program-id',
  foundationName:     'data-ff-foundation-name',
  programName:        'data-ff-program-name',
  description:        'data-ff-description',
  status:             'data-ff-status',
  lastUpdated:        'data-ff-last-updated',
  diseaseIndications: 'data-ff-disease-indications',
  insuranceTypes:     'data-ff-insurance-types',
  grantAmount:        'data-ff-grant-amount',
  applyUrl:           'data-ff-apply-url',
  programUrl:         'data-ff-program-url',
  foundationUrl:      'data-ff-foundation-url',
  contactEmail:       'data-ff-contact-email',
  contactPhone:       'data-ff-contact-phone',
  metadata:           'data-ff-metadata',
} as const satisfies Record<string, string>
