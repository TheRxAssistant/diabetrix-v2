import { setPhoneNumber as setAuthPhoneNumber, setUser as setAuthUser, clear as clearAuth } from '../../../store/authStore';
import { postAPI, INDEX_MEMBER_API_URLS } from '../../../services/api';

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Send OTP to phone number
 */
export const sendOtp = async (phoneNumber: string): Promise<AuthResponse> => {
  try {
    const result = await postAPI(INDEX_MEMBER_API_URLS.SEND_OTP, {
      phone_number: phoneNumber,
    });
    
    if (result.statusCode === 200) {
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        error: result.message || 'Failed to send OTP. Please try again.' 
      };
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
};

/**
 * Verify OTP code
 */
export const verifyOtp = async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
  try {
    const verifyResult = await postAPI(INDEX_MEMBER_API_URLS.VERIFY_OTP, {
      phone_number: phoneNumber,
      otp_code: otp,
    });

    if (verifyResult.statusCode === 200) {
      // Fetch user details after successful OTP verification
      const userDetailsResult = await postAPI(INDEX_MEMBER_API_URLS.VERIFY_USER_BY_VERIFIED, {
        phone_number: phoneNumber,
      });
      
      if (userDetailsResult.statusCode === 200 && userDetailsResult.data?.user_data) {
        const userData = userDetailsResult.data.user_data;
        
        // Store in Zustand
        setAuthPhoneNumber(phoneNumber);
        setAuthUser({
          phoneNumber: phoneNumber,
          isAuthenticated: true,
          userData: userData,
        });
        
        // Store in sessionStorage
        sessionStorage.setItem('diabetrix_auth_session', JSON.stringify({
          phoneNumber,
          user: userData,
          timestamp: Date.now(),
        }));
        
        return { success: true, data: userData };
      }
      
      return { success: true, data: verifyResult.data };
    } else {
      return { 
        success: false, 
        error: verifyResult.message || 'Invalid OTP. Please try again.' 
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.' 
    };
  }
};

/**
 * Check if user has authenticated session
 */
export const checkAuthSession = (): { authenticated: boolean; data?: any } => {
  try {
    const sessionData = sessionStorage.getItem('diabetrix_auth_session');
    if (sessionData) {
      const { phoneNumber, user, timestamp } = JSON.parse(sessionData);
      // Check if session is less than 24 hours old
      const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
      
      if (isValid && user) {
        setAuthPhoneNumber(phoneNumber);
        setAuthUser({
          phoneNumber: phoneNumber,
          isAuthenticated: true,
          userData: user,
        });
        return { authenticated: true, data: user };
      }
    }
  } catch (error) {
    console.error('Error checking auth session:', error);
  }
  
  return { authenticated: false };
};

/**
 * Clear authentication session
 */
export const clearAuthSession = (): void => {
  sessionStorage.removeItem('diabetrix_auth_session');
  setAuthPhoneNumber('');
  // Clear user using the clear function from authStore
  clearAuth();
};

