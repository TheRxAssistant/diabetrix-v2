import { setPhoneNumber as setAuthPhoneNumber, setUser as setAuthUser, clear as clearAuth, updateAuthToken, updateAccessToken } from '../../../store/authStore';
import { postAPI, INDEX_MEMBER_API_URLS, CAPABILITIES_API_URLS, CORE_ENGINE_API_URLS } from '../../../services/api';

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode?: number;
  additionalInputs?: string[];
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
      otp: otp,
    });

    if (verifyResult.statusCode === 200) {
      // Extract tokens from verify-otp response
      if (verifyResult.data?.access_token && verifyResult.data?.user_exists) {
        // User already exists - store access_token and clear auth_token
        updateAccessToken(verifyResult.data.access_token);
        updateAuthToken('');
        
        const user_id = verifyResult.data.user.user_id;
        const userData = verifyResult.data.user.user_data || {};
        
        // Prepare user object
        const userObject = {
          phoneNumber: phoneNumber,
          isAuthenticated: true,
          userData: {
            ...userData,
            user_id,
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
            user_id,
          },
          timestamp: Date.now(),
        }));
        
        // Store user details in localStorage for tracking service
        localStorage.setItem('diabetrix_user_details', JSON.stringify({
          user_id: user_id,
          user_data: userData,
          phone_number: phoneNumber,
          timestamp: Date.now(),
        }));
        
        return { 
          success: true, 
          data: { ...userData, user_id },
          statusCode: 200
        };
      } else if (verifyResult.data?.auth_token) {
        // New user - store auth_token
        updateAuthToken(verifyResult.data.auth_token);
        
        // Fetch user details after successful OTP verification
        const userDetailsResult = await verifyUserByVerified(phoneNumber);
        
        // Return the result from verify-user-by-verified for proper flow handling
        return {
          success: userDetailsResult.statusCode === 200,
          data: userDetailsResult.data,
          statusCode: userDetailsResult.statusCode,
          additionalInputs: userDetailsResult.additionalInputs,
          error: userDetailsResult.statusCode !== 200 ? userDetailsResult.error : undefined,
        };
      }
      
      return { 
        success: false, 
        error: 'Invalid response from server.',
        statusCode: verifyResult.statusCode
      };
    } else {
      return { 
        success: false, 
        error: verifyResult.message || 'Invalid OTP. Please try again.',
        statusCode: verifyResult.statusCode
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { 
      success: false, 
      error: 'Network error. Please check your connection and try again.',
      statusCode: 500
    };
  }
};

/**
 * Verify user by verified API (with optional DOB/SSN)
 */
export const verifyUserByVerified = async (
  phoneNumber: string,
  dateOfBirth?: string,
  ssn?: string
): Promise<AuthResponse> => {
  try {
    const result = await postAPI(CAPABILITIES_API_URLS.VERIFY_USER_BY_VERIFIED, {
      phone_number: phoneNumber,
      ...(dateOfBirth && { date_of_birth: dateOfBirth }),
      ...(ssn && { ssn: ssn }),
    });

    if (result.statusCode === 200) {
      // Update auth_token if returned in response
      if (result.data?.auth_token) {
        updateAuthToken(result.data.auth_token);
      }
      
      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } else {
      return {
        success: false,
        data: result.data,
        statusCode: result.statusCode,
        additionalInputs: result.data?.additionalInputs,
        error: result.message || 'Verification failed.',
      };
    }
  } catch (error) {
    console.error('Error verifying user by verified:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      statusCode: 500,
    };
  }
};

/**
 * Generate access token after profile confirmation
 */
export const generateAccessToken = async (userData: any): Promise<AuthResponse> => {
  try {
    const result = await postAPI(CAPABILITIES_API_URLS.GENERATE_INTERNAL_ACCESS_TOKEN, {
      user_data: userData,
    });

    if (result.statusCode === 200) {
      // Update access_token and clear auth_token
      if (result.data?.access_token) {
        updateAccessToken(result.data.access_token);
        updateAuthToken('');
      }
      
      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } else {
      return {
        success: false,
        error: result.message || 'Failed to generate access token.',
        statusCode: result.statusCode,
      };
    }
  } catch (error) {
    console.error('Error generating access token:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      statusCode: 500,
    };
  }
};

/**
 * Sync user data to core engine
 */
export const syncUser = async (userData: any, phoneNumber: string): Promise<AuthResponse> => {
  try {
    const result = await postAPI(CORE_ENGINE_API_URLS.SYNC_USER, {
      user_data: userData,
      user_phone: phoneNumber,
    });

    if (result.statusCode === 200) {
      const syncedUserData = result.data?.user?.user_data || {};
      const user_id = result.data?.user?.user_id;
      
      // Prepare user object
      const userObject = {
        phoneNumber: phoneNumber,
        isAuthenticated: true,
        userData: {
          ...syncedUserData,
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
          ...syncedUserData,
          ...(user_id ? { user_id } : {}),
        },
        timestamp: Date.now(),
      }));
      
      // Store user details in localStorage for tracking service
      if (user_id) {
        localStorage.setItem('diabetrix_user_details', JSON.stringify({
          user_id: user_id,
          user_data: syncedUserData,
          phone_number: phoneNumber,
          timestamp: Date.now(),
        }));
      }
      
      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } else {
      return {
        success: false,
        error: result.message || 'Failed to sync user data.',
        statusCode: result.statusCode,
      };
    }
  } catch (error) {
    console.error('Error syncing user:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
      statusCode: 500,
    };
  }
};

/**
 * Upload insurance card images and extract information
 */
export const upload_insurance_card = async (frontImage: File, backImage?: File): Promise<{ provider: string; member_id: string; policy_number: string; group_number: string } | null> => {
  try {
    // Convert front image to base64
    const frontBase64 = await fileToBase64(frontImage);

    let backBase64: string | undefined;
    if (backImage) {
      backBase64 = await fileToBase64(backImage);
    }

    const { statusCode, data, message } = await postAPI(CAPABILITIES_API_URLS.INSURANCE_CARD_IMAGE, {
      front_image_base64: frontBase64,
      back_image_base64: backBase64,
    });

    if (statusCode === 200) {
      return data;
    } else {
      console.error('Failed to process insurance card:', message || 'Unknown error');
      return null;
    }
  } catch (error: any) {
    console.error('Failed to upload insurance card:', error);
    return null;
  }
};

/**
 * Helper function to convert file to base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data:image/jpeg;base64, prefix
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
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
  sessionStorage.removeItem('diabetrix_auth_tokens');
  localStorage.removeItem('diabetrix_user_details');
  setAuthPhoneNumber('');
  // Clear user and tokens using the clear function from authStore
  clearAuth();
};

