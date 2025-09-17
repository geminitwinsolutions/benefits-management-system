// src/utils/constants.js

// --- HR & Employee Related ---

export const payTypes = ['Salary', 'Hourly'];

export const flsaTypes = ['Exempt', 'Non-Exempt'];

// This is the corrected, single definition for EEOC Categories
export const eeocCategories = [
  { code: '0', name: 'Not Specified' },
  { code: '1.1', name: 'Executive/Senior Level Officials and Managers' },
  { code: '1.2', name: 'First/Mid Level Officials and Managers' },
  { code: '2', name: 'Professionals' },
  { code: '3', name: 'Technicians' },
  { code: '4', name: 'Sales Workers' },
  { code: '5', name: 'Administrative Support Workers' },
  { code: '6', name: 'Craft Workers' },
  { code: '7', name: 'Operatives' },
  { code: '8', name: 'Laborers and Helpers' },
  { code: '9', name: 'Service Workers' },
];

export const employmentTypes = [
    'Full-Time',
    'Part-Time',
    'Temporary',
    'Contractor'
];

export const employeeStatuses = [
    'Active',
    'On Leave',
    'Terminated',
    'Pending'
];

export const genderOptions = [
    'Male',
    'Female',
    'Non-binary',
    'Prefer not to say'
];


// --- Client & Location Related ---

export const serviceGroups = ['REIN Client', 'EIN Client', 'Payroll Only'];

export const clientStatuses = ['Active', 'Pending Active', 'Pending Close', 'Inactive'];

export const locationStatuses = ['Active', 'Inactive'];

export const payPeriods = ['Weekly', 'Bi-Weekly 1', 'Bi-Weekly 2', 'Semi-Monthly', 'Monthly'];


// --- Benefits & Enrollment Related ---

export const benefitPlanTypes = [
    'Medical',
    'Dental',
    'Vision',
    'Life',
    'Disability',
    'Critical Illness',
    'Accident',
    'Other'
];

export const coverageLevels = [
    'Employee Only',
    'Employee + Spouse',
    'Employee + Child(ren)',
    'Family'
];


// --- Geographic ---

export const usStates = [
    { name: 'Alabama', abbreviation: 'AL' }, { name: 'Alaska', abbreviation: 'AK' },
    { name: 'Arizona', abbreviation: 'AZ' }, { name: 'Arkansas', abbreviation: 'AR' },
    { name: 'California', abbreviation: 'CA' }, { name: 'Colorado', abbreviation: 'CO' },
    { name: 'Connecticut', abbreviation: 'CT' }, { name: 'Delaware', abbreviation: 'DE' },
    { name: 'Florida', abbreviation: 'FL' }, { name: 'Georgia', abbreviation: 'GA' },
    { name: 'Hawaii', abbreviation: 'HI' }, { name: 'Idaho', abbreviation: 'ID' },
    { name: 'Illinois', abbreviation: 'IL' }, { name: 'Indiana', abbreviation: 'IN' },
    { name: 'Iowa', abbreviation: 'IA' }, { name: 'Kansas', abbreviation: 'KS' },
    { name: 'Kentucky', abbreviation: 'KY' }, { name: 'Louisiana', abbreviation: 'LA' },
    { name: 'Maine', abbreviation: 'ME' }, { name: 'Maryland', abbreviation: 'MD' },
    { name: 'Massachusetts', abbreviation: 'MA' }, { name: 'Michigan', abbreviation: 'MI' },
    { name: 'Minnesota', abbreviation: 'MN' }, { name: 'Mississippi', abbreviation: 'MS' },
    { name: 'Missouri', abbreviation: 'MO' }, { name: 'Montana', abbreviation: 'MT' },
    { name: 'Nebraska', abbreviation: 'NE' }, { name: 'Nevada', abbreviation: 'NV' },
    { name: 'New Hampshire', abbreviation: 'NH' }, { name: 'New Jersey', abbreviation: 'NJ' },
    { name: 'New Mexico', abbreviation: 'NM' }, { name: 'New York', abbreviation: 'NY' },
    { name: 'North Carolina', abbreviation: 'NC' }, { name: 'North Dakota', abbreviation: 'ND' },
    { name: 'Ohio', abbreviation: 'OH' }, { name: 'Oklahoma', abbreviation: 'OK' },
    { name: 'Oregon', abbreviation: 'OR' }, { name: 'Pennsylvania', abbreviation: 'PA' },
    { name: 'Rhode Island', abbreviation: 'RI' }, { name: 'South Carolina', abbreviation: 'SC' },
    { name: 'South Dakota', abbreviation: 'SD' }, { name: 'Tennessee', abbreviation: 'TN' },
    { name: 'Texas', abbreviation: 'TX' }, { name: 'Utah', abbreviation: 'UT' },
    { name: 'Vermont', abbreviation: 'VT' }, { name: 'Virginia', abbreviation: 'VA' },
    { name: 'Washington', abbreviation: 'WA' }, { name: 'West Virginia', abbreviation: 'WV' },
    { name: 'Wisconsin', abbreviation: 'WI' }, { name: 'Wyoming', abbreviation: 'WY' }
];

// --- Workers Compensation ---
export const workersCompCodes = [
    '8810 - Clerical Office Employees',
    '8017 - Furniture Store',
    '7380 - Drivers & Chauffeurs',
    '9079 - Restaurant & Food Service',
    '8868 - College: Professional Staff',
    'Not Applicable'
];