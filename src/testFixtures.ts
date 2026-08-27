/**
 * Realistic test fixtures derived from foundation-import-webflow.csv (2026-08-26).
 * Covers a representative cross-section of program types, statuses, insurance
 * requirements, and grant amount shapes for use across unit and integration tests.
 */
import type { ProgramRecord } from './types'

export const HEALTHWELL_NEUROCOGNITIVE: ProgramRecord = {
  id: 'healthwell-neurocognitive-disease-with-psychosis-medicare-access',
  foundationName: 'HealthWell Foundation',
  programName: 'Neurocognitive Disease with Psychosis - Medicare Access',
  description:
    "Assistance for the treatment of psychosis in patients previously diagnosed with any one of the following neurocognitive diseases: Alzheimer's/Dementia, Parkinson's Disease, Diffuse Lewy Body Disease, Frontotemporal Lobar Degeneration, Huntington's Disease, Prion/Creutzfeldt-Jakob Disease, Traumatic Brain Injury. Covers prescription drug copays or Medicare Part B insurance premiums.",
  status: 'Open',
  lastUpdated: new Date('2026-08-26T00:00:00.000Z'),
  diseaseIndications: [
    "alzheimer's disease",
    'dementia',
    'psychosis associated with neurocognitive disease',
    "parkinson's disease",
    'diffuse lewy body disease',
    'frontotemporal lobar degeneration',
    "huntington's disease",
    'prion/creutzfeldt-jakob disease',
    'traumatic brain injury',
  ],
  insuranceTypes: ['medicare'],
  insuranceTypesRaw: 'Medicare required (Medicare Access Fund); Medicare Part B required for premium assistance',
  insuranceDescription: 'Medicare required (Medicare Access Fund); Medicare Part B required for premium assistance',
  grantAmount: '$6,000',
  applyUrl:
    'https://healthwellfoundation.my.salesforce-sites.com/onlineapplication?fund=a1Z4w00000TgqqTEAR',
  programUrl:
    'https://www.healthwellfoundation.org/fund/neurocognitive-disease-with-psychosis-medicare-access/',
  foundationUrl: 'https://www.healthwellfoundation.org/',
  contactEmail: '',
  contactPhone: '800-675-8416',
  metadata: [
    {
      label: 'Eligibility Requirements',
      value:
        '1) Being treated for neurocognitive disease with psychosis, diagnosis verified by prescriber; 2) Have Medicare (Part B required for premium assistance); 3) Income within guidelines; 4) Receiving treatment in the United States; SSN required to create a grant',
    },
    {
      label: 'Income Limits',
      value:
        '500% of the Federal Poverty Level, adjusted for household size and high cost-of-living areas',
    },
    { label: 'Assistance Type', value: 'Prescription drug copay OR insurance premium (Medicare Part B only)' },
    { label: 'Grant Cycle', value: '12 months' },
    { label: 'Forecasted Average Grant Utilization', value: '$2,500' },
  ],
}

export const TOTALASSIST_ALZHEIMERS_HEALTH_EQUITY: ProgramRecord = {
  id: 'totalassist-alzheimers-disease-health-equity-fund',
  foundationName: 'Patient Advocate Foundation (TotalAssist)',
  programName: "Alzheimer's Disease Health Equity Fund",
  description:
    "Alzheimer's disease is a progressive, incurable, degenerative disorder that attacks the brain's nerve cells, or neurons, resulting in loss of memory, thinking and language skills, and behavioral changes. Health Equity Funds serve people living in counties identified by the CDC as having the highest social vulnerability scores and high rates of chronic disease. The fund covers co-pay, co-insurance and deductible costs (medications and office visits) and medical insurance premiums.",
  status: 'Closed',
  lastUpdated: new Date('2026-08-26T00:00:00.000Z'),
  diseaseIndications: ["alzheimer's disease"],
  insuranceTypes: ['medicare', 'medicaid', 'military benefits'],
  insuranceTypesRaw: 'Medicare, Medicaid, or Military Benefits (government-insured coverage that covers qualifying expenses)',
  insuranceDescription: 'Medicare, Medicaid, or Military Benefits (government-insured coverage that covers qualifying expenses)',
  grantAmount: 'Varies by fund - see program page',
  applyUrl: '',
  programUrl: 'https://totalassist.org/funds/alzheimers-disease-health-equity/',
  foundationUrl: 'https://www.patientadvocate.org/',
  contactEmail: '',
  contactPhone: '866-512-3861',
  metadata: [
    {
      label: 'Status Detail',
      value:
        'Closed to new and renewal applications due to lack of sufficient funding; patients with an active award continue to be supported; funds reopen often',
    },
    {
      label: 'Eligibility Requirements',
      value:
        "Confirmed Alzheimer's disease diagnosis and in treatment (or beginning treatment within 60 days, or treated within past 6 months); government-insured coverage; income at or below 500% FPL; legal U.S. resident; home address in a ZIP code served by a Health Equity Fund",
    },
    {
      label: 'Income Limits',
      value:
        'At or below 500% of the Federal Poverty Level adjusted for regional Cost of Living Index',
    },
    {
      label: 'Organizational Change',
      value:
        'Patient Advocate Foundation and PAN Foundation completed a strategic merger in March 2026; the unified TotalAssist program launched July 1, 2026',
    },
  ],
}

export const HFC_RESPITE_CARE: ProgramRecord = {
  id: 'hfc-respite-care-grants',
  foundationName: 'HFC (Hilarity for Charity)',
  programName: 'Respite Care Grants (Recharge Grant / Adult Day Center Respite Grant)',
  description:
    "HFC awards respite care grants to those providing care to their loved ones living with Alzheimer's disease or other dementias. The respite care grants are awarded across the United States and Canada. The goal of the respite care grant is to provide exceptional respite care to families affected by this disease, and to give these families support and rest. HFC respite grants cover the cost of professional, in-home or Adult Day Center care.",
  status: 'Open',
  lastUpdated: new Date('2026-08-26T00:00:00.000Z'),
  diseaseIndications: [
    "alzheimer's disease",
    'frontotemporal dementia (ftd)',
    'lewy body dementia',
    'vascular dementia',
    'mixed and other dementias',
    "parkinson's-related dementia",
  ],
  insuranceTypes: [],
  insuranceTypesRaw: '',
  insuranceDescription: '',
  grantAmount:
    'In-kind care, no cash value: Recharge Grant = 100 hours of respite care; Adult Day Center Respite Grant = 24 days of respite care',
  applyUrl: 'https://helpforalzheimersfamilies.submittable.com/submit',
  programUrl: 'https://wearehfc.org/care-grants/',
  foundationUrl: 'https://wearehfc.org/',
  contactEmail: '',
  contactPhone: '',
  metadata: [
    {
      label: 'Eligibility Requirements',
      value:
        "Person cared for must be professionally diagnosed with Alzheimer's disease, FTD, Lewy body dementia, vascular dementia, mixed or other dementias, or Parkinson's-related dementia; person cared for must currently live at home with the caregiver; caregiver must be facing financial and emotional hardship due to caregiving; must reside in the United States or Canada",
    },
    {
      label: 'Income Limits',
      value: 'No specific published income threshold; financial and emotional need assessed',
    },
    {
      label: 'Important Restriction',
      value:
        'Grants provide professional in-home or adult day center care only and have NO CASH VALUE; cash awards cannot be issued in lieu of care',
    },
    {
      label: 'Award Usage Window',
      value:
        'Recharge Grant: 100 hours within 3 months of award. Adult Day Center Respite Grant: 24 days within 3 months of first date of care',
    },
  ],
}

export const HFC_EMERGENCY_RELIEF: ProgramRecord = {
  id: 'hfc-emergency-relief-grants',
  foundationName: 'HFC (Hilarity for Charity)',
  programName: 'Emergency Relief Grants',
  description:
    'HFC is committed to supporting dementia family caregivers impacted by natural and other disasters. Emergency Relief Grants are designated as $1,500 cash grants to families who are most affected by natural or geographic disasters, helping them continue their vital caregiving responsibilities during times of crisis. Official disaster declarations must be in place from FEMA, state, or local government to qualify. Grants are issued at the discretion of HFC.',
  status: 'Open',
  lastUpdated: new Date('2026-08-26T00:00:00.000Z'),
  diseaseIndications: ["alzheimer's disease", 'dementia'],
  insuranceTypes: [],
  insuranceTypesRaw: '',
  insuranceDescription: '',
  grantAmount: '$1,500',
  applyUrl: 'https://helpforalzheimersfamilies.submittable.com/submit',
  programUrl: 'https://helpforalzheimersfamilies.submittable.com/submit',
  foundationUrl: 'https://wearehfc.org/',
  contactEmail: '',
  contactPhone: '',
  metadata: [
    {
      label: 'Eligibility Requirements',
      value:
        'Dementia family caregiver affected by a natural or geographic disaster; an official disaster declaration must be in place from FEMA, state, or local government',
    },
    { label: 'Award Type', value: 'One-time cash grant' },
    { label: 'Discretion', value: 'Grants issued at the discretion of HFC' },
  ],
}

export const CMS_GUIDE_MODEL: ProgramRecord = {
  id: 'cms-guide-model',
  foundationName: 'Centers for Medicare & Medicaid Services (CMS) Innovation Center',
  programName: 'GUIDE Model (Guiding an Improved Dementia Experience)',
  description:
    'Launched July 1, 2024, the GUIDE Model tests a new payment approach for key supportive services furnished to people living with dementia, including comprehensive person-centered assessments and care plans; care coordination; 24/7 access to an interdisciplinary care team member or help line; and certain respite services to support caregivers. People with dementia and their caregivers also have the assistance of a Care Navigator to help access clinical and non-clinical services.',
  status: 'Open',
  lastUpdated: new Date('2026-08-26T00:00:00.000Z'),
  diseaseIndications: ['dementia', "alzheimer's disease"],
  insuranceTypes: ['medicare'],
  insuranceTypesRaw: 'Medicare required. Beneficiary must have Medicare Parts A and B with Medicare as primary payer; not enrolled in Medicare Advantage, PACE, or the Medicare hospice benefit',
  insuranceDescription: 'Medicare required. Beneficiary must have Medicare Parts A and B with Medicare as primary payer; not enrolled in Medicare Advantage, PACE, or the Medicare hospice benefit',
  grantAmount: 'Up to $2,625 per year for respite services',
  applyUrl: 'https://www.cms.gov/priorities/innovation/innovation-models/guide',
  programUrl: 'https://www.cms.gov/priorities/innovation/innovation-models/guide',
  foundationUrl: 'https://www.cms.gov/',
  contactEmail: '',
  contactPhone: '1-800-633-4227',
  metadata: [
    {
      label: 'Eligibility Requirements',
      value:
        'Attested dementia diagnosis by a participating clinician; enrolled in Original Medicare (Parts A and B) with Medicare as primary payer; not in Medicare Advantage, PACE, or hospice',
    },
    { label: 'Income Limits', value: 'None' },
    {
      label: 'How to Access',
      value:
        'Enroll through a participating GUIDE dementia care program (over 300-400 participating programs nationwide); available in 47 states',
    },
    { label: 'Model Duration', value: '8 years, launched July 1, 2024' },
  ],
}

export const EXTRA_HELP: ProgramRecord = {
  id: 'ssa-extra-help-medicare-part-d-lis',
  foundationName:
    'Social Security Administration (SSA) / Centers for Medicare & Medicaid Services (CMS)',
  programName: 'Extra Help (Medicare Part D Low-Income Subsidy, LIS)',
  description:
    'Extra Help is a federal program that helps pay for some to most of the out-of-pocket costs of Medicare prescription drug coverage. It is also known as the Part D Low-Income Subsidy (LIS). With Extra Help, both the Part D deductible and plan premium are waived, and prescription copays are capped. People with full Medicaid coverage, Supplemental Security Income, or a Medicare Savings Program are deemed automatically eligible and do not need to apply separately.',
  status: 'Open',
  lastUpdated: new Date('2026-08-26T00:00:00.000Z'),
  diseaseIndications: [],
  insuranceTypes: ['medicare'],
  insuranceTypesRaw: 'Medicare required. Must be enrolled in a Medicare Part D prescription drug plan or a Medicare Advantage plan with drug coverage',
  insuranceDescription: 'Medicare required. Must be enrolled in a Medicare Part D prescription drug plan or a Medicare Advantage plan with drug coverage',
  grantAmount: 'Estimated average annual value of approximately $5,700 per person',
  applyUrl: 'https://www.ssa.gov/medicare/part-d-extra-help',
  programUrl:
    'https://www.ncoa.org/article/understanding-medicare-part-d-low-income-subsidy-lis-extra-help/',
  foundationUrl: 'https://www.ssa.gov/',
  contactEmail: '',
  contactPhone: '1-800-772-1213',
  metadata: [
    {
      label: 'Eligibility Requirements',
      value:
        'Enrolled in Medicare with Part D drug coverage; income and resources within limits; automatic (deemed) eligibility for people with full Medicaid, SSI, or a Medicare Savings Program',
    },
    {
      label: 'Income Limits',
      value:
        '2026: annual income at or below approximately $23,475 for an individual and $31,725 for a married couple living together (150% of the Federal Poverty Level)',
    },
    {
      label: 'Resource Limits',
      value: '2026: $16,590 individual / $33,100 married',
    },
    {
      label: 'Important Note',
      value:
        'Federal anti-kickback law bars manufacturer copay cards and coupons for people enrolled in Medicare, which makes charitable foundation assistance and Extra Help the primary options',
    },
  ],
}

export const DEMENTIA_ALLIANCE_NC: ProgramRecord = {
  id: 'dementia-alliance-nc-caregiver-assistance-fund',
  foundationName: 'Dementia Alliance of North Carolina',
  programName: 'Caregiver Assistance Fund (Caregiver Assistance Program)',
  description:
    'The Dementia Alliance Caregiver Assistance Program is designed to support family caregivers throughout the state by awarding up to $500 in financial assistance or reimbursement during a time of need, allowing caregivers temporary relief (respite). Funds received may be used to hire a Home Health Agency or a private caregiver. Services must start within 30 days of approval and be completed within 90 days.',
  status: 'Open',
  lastUpdated: new Date('2026-08-26T00:00:00.000Z'),
  diseaseIndications: ['dementia'],
  insuranceTypes: [],
  insuranceTypesRaw: 'Not eligible for those who have been approved for or are receiving Medicaid',
  insuranceDescription: 'Not eligible for those who have been approved for or are receiving Medicaid',
  grantAmount: '$500',
  applyUrl: 'https://dementianc.org/helpsupport/caregiverassistancefund/',
  programUrl: 'https://dementianc.org/helpsupport/caregiverassistancefund/',
  foundationUrl: 'https://dementianc.org/',
  contactEmail: '',
  contactPhone: '919-832-3732',
  metadata: [
    {
      label: 'Eligibility Requirements',
      value:
        'Caregiver and the person living with dementia must both reside in North Carolina; the person living with dementia must not be living full-time in a facility',
    },
    {
      label: 'Exclusions',
      value:
        'Not for those approved for or receiving Medicaid; not for caregivers of individuals living full-time in a facility',
    },
    {
      label: 'Frequency Limit',
      value:
        'No more than one award per fiscal year (July - June) and not within 6 months of receiving previous funds',
    },
    { label: 'Geography', value: 'North Carolina only' },
  ],
}

export const BENEFITS_CHECKUP: ProgramRecord = {
  id: 'ncoa-benefitscheckup',
  foundationName: 'National Council on Aging (NCOA)',
  programName: 'BenefitsCheckUp',
  description:
    "BenefitsCheckUp is NCOA's free, confidential online screening tool that helps older adults, caregivers and professionals quickly determine eligibility for programs that offset the cost of medicine, food, household utilities and more. The tool features over 2,000 public and private benefits programs across all 50 states and the District of Columbia, matching users with programs based on their financial situation and location. It is available in English and Spanish and requires no registration.",
  status: 'Open',
  lastUpdated: new Date('2026-08-26T00:00:00.000Z'),
  diseaseIndications: [],
  insuranceTypes: [],
  insuranceTypesRaw: '',
  insuranceDescription: '',
  grantAmount: null,
  applyUrl: 'https://benefitscheckup.org/',
  programUrl: 'https://www.ncoa.org/page/benefits-access/',
  foundationUrl: 'https://www.ncoa.org/',
  contactEmail: '',
  contactPhone: '',
  metadata: [
    {
      label: 'Tool Type',
      value:
        'Resource navigator / benefits eligibility screening tool that surfaces other financial assistance programs',
    },
    {
      label: 'Programs Covered',
      value:
        'More than 2,000 federal, state, local and private benefits programs across all 50 states and DC',
    },
    { label: 'Languages', value: 'English and Spanish' },
  ],
}

/** All fixtures as a flat array, ordered as they appear in the CSV. */
export const ALL_TEST_PROGRAMS: ProgramRecord[] = [
  HEALTHWELL_NEUROCOGNITIVE,
  TOTALASSIST_ALZHEIMERS_HEALTH_EQUITY,
  HFC_RESPITE_CARE,
  HFC_EMERGENCY_RELIEF,
  CMS_GUIDE_MODEL,
  EXTRA_HELP,
  DEMENTIA_ALLIANCE_NC,
  BENEFITS_CHECKUP,
]
