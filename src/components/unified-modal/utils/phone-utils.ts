/**
 * Formats a phone number to (XXX) XXX-XXXX format
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.slice(0, 10);

  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
};

/**
 * Extracts raw digits from formatted phone number
 */
export const extractPhoneDigits = (formatted: string): string => {
  return formatted.replace(/\D/g, '');
};

/**
 * Validates if phone number has 10 digits
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const digits = extractPhoneDigits(phone);
  return digits.length === 10;
};

/**
 * Formats OTP input to only allow 6 digits
 */
export const formatOtp = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 6);
};

/**
 * Validates if OTP has 6 digits
 */
export const isValidOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

