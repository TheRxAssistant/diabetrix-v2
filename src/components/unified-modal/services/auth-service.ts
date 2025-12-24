import { setPhoneNumber as setAuthPhoneNumber, setUser as setAuthUser, clear as clearAuth } from '../../../store/authStore';
import { postAPI, INDEX_MEMBER_API_URLS, CAPABILITIES_API_URLS } from '../../../services/api';

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
    const result = await postAPI(CAPABILITIES_API_URLS.SEND_OTP, {
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
    const verifyResult = await postAPI(CAPABILITIES_API_URLS.VERIFY_OTP, {
      phone_number: phoneNumber,
      otp_code: otp,
    });

    if (verifyResult.statusCode === 200) {
      let user_id: string | undefined;
      let userData: any = {};
      
      // Check if user already exists (from verify-otp response)
      if (verifyResult.data?.user_exists && verifyResult.data?.user) {
        user_id = verifyResult.data.user.user_id;
        userData = verifyResult.data.user.user_data || {};
      } else {
        // Fetch user details after successful OTP verification
        const userDetailsResult = await postAPI(CAPABILITIES_API_URLS.VERIFY_USER_BY_VERIFIED, {
          phone_number: phoneNumber,
        });
        
        if (userDetailsResult.statusCode === 200 && userDetailsResult.data?.user_data) {
          userData = userDetailsResult.data.user_data;
          // Note: user_id might not be available until user is created in core-engine
          // We'll store it when available
        }
      }
      
      // Prepare user object with user_id if available
      const userObject = {
        phoneNumber: phoneNumber,
        isAuthenticated: true,
        userData: {
          ...userData,
          ...(user_id ? { user_id } : {}),
        },
      };
      
      // Store in Zustand
      setAuthPhoneNumber(phoneNumber);
      setAuthUser(userObject);
      
      // Store in sessionStorage
      sessionStorage.setItem('diabetrix_auth_session', JSON.stringify({
        phoneNumber,
        user: {
          ...userData,
          ...(user_id ? { user_id } : {}),
        },
        timestamp: Date.now(),
      }));
      
      // Store user details in localStorage for tracking service (if user_id is available)
      if (user_id) {
        localStorage.setItem('diabetrix_user_details', JSON.stringify({
          user_id: user_id,
          user_data: userData,
          phone_number: phoneNumber,
          timestamp: Date.now(),
        }));
      }
      
      return { success: true, data: { ...userData, ...(user_id ? { user_id } : {}) } };
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
        
        // Also ensure user_details is in localStorage if user_id exists
        if (user.user_id) {
          try {
            const existingDetails = localStorage.getItem('diabetrix_user_details');
            if (!existingDetails) {
              localStorage.setItem('diabetrix_user_details', JSON.stringify({
                user_id: user.user_id,
                user_data: user,
                phone_number: phoneNumber,
                timestamp: Date.now(),
              }));
            }
          } catch (error) {
            console.error('Error storing user details in localStorage:', error);
          }
        }
        
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
  localStorage.removeItem('diabetrix_user_details');
  setAuthPhoneNumber('');
  // Clear user using the clear function from authStore
  clearAuth();
};

