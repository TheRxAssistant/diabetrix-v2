export const MODAL_CONSTANTS = {
  SESSION_AUTH_KEY: 'diabetrix_auth_session',
  POPUP_DELAY: 1000,
  TYPING_DELAY: 1000,
  ANIMATION_DELAY: 300,
  PHARMACY_CHECK_DELAY: 800,
  PHARMACY_COMPLETE_DELAY: 600,
  PENDING_MESSAGES_DELAY: 500,
  MESSAGE_STAGGER_DELAY: 800,
  QUICK_REPLY_DELAY: 1500,
} as const;

export const STEP_TYPES = {
  INTRO: 'intro',
  SERVICE_SELECTION: 'service_selection',
  SERVICE_DETAIL: 'service_detail',
  PHONE: 'phone',
  OTP: 'otp',
  SUCCESS: 'success',
  HEALTHCARE_SEARCH: 'healthcare_search',
  INSURANCE_ASSISTANCE: 'insurance_assistance',
  PHARMACY_SELECT: 'pharmacy_select',
  PHARMACY_CHECKING: 'pharmacy_checking',
  EMBEDDED_CHAT: 'embedded_chat',
  HOME: 'home',
  MORE: 'more',
  PROFILE: 'profile',
} as const;

export const SERVICE_TYPES = {
  DOCTOR: 'doctor',
  INSURANCE: 'insurance',
  PHARMACY: 'pharmacy',
  LEARN: 'learn',
  CHAT: 'chat',
} as const;

export const ROUTE_PATHS = {
  NEW: '/new',
  EXTERNAL: '/external',
} as const;

export const URL_PARAMS = {
  SERVICE: 'service',
} as const;

export const EXTERNAL_SERVICE_MAP = {
  'find-pharmacy': SERVICE_TYPES.PHARMACY,
  'find-doctor': SERVICE_TYPES.DOCTOR,
  'insurance-help': SERVICE_TYPES.INSURANCE,
} as const;

