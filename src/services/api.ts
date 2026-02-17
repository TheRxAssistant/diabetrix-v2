/**
 * Get base URL from environment variables with fallback defaults
 */
const getBaseUrl = (apiType: 'INDEX_MEMBER' | 'CAPABILITIES' | 'CORE_ENGINE'): string => {
    const env = import.meta.env;

    switch (apiType) {
        case 'INDEX_MEMBER':
            return env.VITE_API_INDEX_MEMBER_BASE_URL || 'https://index-member-be-dev.healthbackend.com';
        case 'CAPABILITIES':
            return env.VITE_API_CAPABILITIES_BASE_URL || 'https://capabilities-ai-be-dev.healthbackend.com';
        case 'CORE_ENGINE':
            return env.VITE_API_CORE_ENGINE_BASE_URL || 'https://core-engine-be-dev.healthbackend.com';
        default:
            return '';
    }
};

/**
 * Centralized POST API function
 * Supports both endpoint keys and full URLs
 */
export const postAPI = async (url: string | keyof typeof CAPABILITIES_API_URLS | keyof typeof CORE_ENGINE_API_URLS, payload: any = {}, abortSignal?: AbortSignal): Promise<{ statusCode: number; message: string; data: any }> => {
    // Import auth store to get tokens
    const { useAuthStore } = await import('../store/authStore');
    const authStore = useAuthStore.getState();
    let finalUrl: string;

    // Check if it's a full URL (starts with http)
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
        finalUrl = url;
    } else {
        // It's an endpoint key or value, resolve it
        let apiPath = '';
        let baseUrl = '';

        // Check if it's a key in CAPABILITIES_API_URLS
        if (url in CAPABILITIES_API_URLS) {
            apiPath = CAPABILITIES_API_URLS[url as keyof typeof CAPABILITIES_API_URLS];
            baseUrl = getBaseUrl('CAPABILITIES');
        }
        // Check if it's a value in CAPABILITIES_API_URLS
        else if (Object.values(CAPABILITIES_API_URLS).includes(url as any)) {
            apiPath = url as string;
            baseUrl = getBaseUrl('CAPABILITIES');
        }
        // Check if it's a key in CORE_ENGINE_API_URLS
        else if (url in CORE_ENGINE_API_URLS) {
            apiPath = CORE_ENGINE_API_URLS[url as keyof typeof CORE_ENGINE_API_URLS];
            baseUrl = getBaseUrl('CORE_ENGINE');
        }
        // Check if it's a value in CORE_ENGINE_API_URLS
        else if (Object.values(CORE_ENGINE_API_URLS).includes(url as any)) {
            apiPath = url as string;
            baseUrl = getBaseUrl('CORE_ENGINE');
        } else {
            return {
                statusCode: 400,
                message: `Unknown API endpoint: ${url}`,
                data: {},
            };
        }

        // Ensure baseUrl doesn't end with / and apiPath doesn't start with /
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        const cleanApiPath = apiPath.replace(/^\//, '');
        finalUrl = `${cleanBaseUrl}/${cleanApiPath}`;
    }

    // Build headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Get tokens from auth store
    const authToken = authStore.getAuthToken();
    const accessToken = authStore.getAccessToken();

    // Add auth tokens to headers if available
    if (authToken) {
        headers['auth-token'] = authToken;
    }
    if (accessToken) {
        headers['access-token'] = accessToken;
    }

    // Add domain header if available (for core engine and capabilities APIs)
    // Get domain dynamically from theme config
    let domain = 'diabetrix';
    if (typeof window !== 'undefined') {
        const { getThemeConfig, getDomain } = await import('../config/theme-config');
        const pathname = window.location.pathname;
        const themeConfig = getThemeConfig(pathname);
        domain = getDomain(themeConfig);
    }
    if (url in CORE_ENGINE_API_URLS || Object.values(CORE_ENGINE_API_URLS).includes(url as any)) {
        headers['domain'] = domain;
    }
    if (url in CAPABILITIES_API_URLS || Object.values(CAPABILITIES_API_URLS).includes(url as any)) {
        headers['domain'] = domain;
    }

    const finalPayload = { ...payload };

    try {
        const response = await fetch(finalUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(finalPayload),
            signal: abortSignal,
        });

        if (!response.ok) {
            let errorMessage = 'Something went wrong';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {
                // If response is not JSON, use default message
            }

            // Handle 403 status code by clearing auth session
            if (response.status === 403) {
                // Clear tokens from session storage
                sessionStorage.removeItem('diabetrix_auth_tokens');
                sessionStorage.removeItem('diabetrix_auth_session');
                authStore.clear();
            }

            return {
                statusCode: response.status,
                message: errorMessage,
                data: {},
            };
        }

        const responseData = await response.json();

        // Handle different response formats
        let statusCode: number;
        let message: string;
        let data: any;

        if (responseData.statusCode !== undefined) {
            statusCode = responseData.statusCode;
            message = responseData.message || 'Success';
            data = responseData.data || responseData;
        } else {
            // If response doesn't have statusCode, assume success
            statusCode = 200;
            message = 'Success';
            data = responseData;
        }

        // Handle 403 status code by clearing auth session
        if (statusCode === 403) {
            // Clear tokens from session storage
            sessionStorage.removeItem('diabetrix_auth_tokens');
            sessionStorage.removeItem('diabetrix_auth_session');
            authStore.clear();
        }

        // Update tokens from response if present
        if (data?.auth_token) {
            authStore.updateAuthToken(data.auth_token);
        }
        if (data?.access_token) {
            authStore.updateAccessToken(data.access_token);
        }

        return {
            statusCode,
            message,
            data,
        };
    } catch (error) {
        console.error('Error in postAPI:', error);
        return {
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Network error. Please check your connection and try again.',
            data: {},
        };
    }
};

/**
 * Stream API function for handling streaming responses
 */
export const streamAPI = async (url: keyof typeof CORE_ENGINE_API_URLS, payload: any = {}, onChunk: (chunk: string) => void): Promise<void> => {
    // Import auth store to get tokens
    const { useAuthStore } = await import('../store/authStore');
    const authStore = useAuthStore.getState();

    const apiPath = CORE_ENGINE_API_URLS[url];
    const baseUrl = getBaseUrl('CORE_ENGINE');

    // Ensure baseUrl doesn't end with / and apiPath doesn't start with /
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanApiPath = apiPath.replace(/^\//, '');
    const finalUrl = `${cleanBaseUrl}/${cleanApiPath}`;

    // Build headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Get access token from auth store
    const accessToken = authStore.getAccessToken();
    if (accessToken) {
        headers['access-token'] = accessToken;
    }

    // Add domain header for core engine APIs
    // Get domain dynamically from theme config
    let domain = 'diabetrix';
    if (typeof window !== 'undefined') {
        const { getThemeConfig, getDomain } = await import('../config/theme-config');
        const pathname = window.location.pathname;
        const themeConfig = getThemeConfig(pathname);
        domain = getDomain(themeConfig);
    }
    headers['domain'] = domain;

    try {
        console.log('🔵 streamAPI called:', { url, finalUrl, payload });
        const response = await fetch(finalUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
            throw new Error('ReadableStream not supported');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                onChunk(chunk);
            }
        } finally {
            reader.releaseLock();
        }
    } catch (error) {
        console.error('Error in streamAPI:', error);
        throw error;
    }
};

// Capabilities API endpoints
export const CAPABILITIES_API_URLS = {
    // Auth
    SEND_OTP: 'authenticate/send-otp',
    VERIFY_OTP: 'authenticate/verify-otp',
    VERIFY_USER_BY_VERIFIED: 'authenticate/verify-user-by-verified',
    GENERATE_INTERNAL_ACCESS_TOKEN: 'authenticate/generate-access-token',

    // SMS
    SEND_SMS: 'sms/send-message',
    GENERATE_QUICK_REPLIES: 'drugs/generate-quick-replies',
    GENERATE_INTELLIGENT_OPTIONS: 'drugs/generate-intelligent-options',
    // Insurance
    INSURANCE_CARD_IMAGE: 'insurance-card-image',

    // Find Care APIs
    GET_CARE_CATEGORY_V2: 'find-care/get-care-categories-v2',
    GET_NEARBY_CARE_DETAILS: 'find-care/get-care-details',
    GET_NEARBY_CARE_V2: 'find-care/find-nearby-care-v2',
    SEARCH_PROVIDERS_BY_NAME: 'find-care/search-providers-by-name',

    // Appointment APIs
    GET_APPOINTMENTS: 'appointments/get-appointments',
    GET_APPOINTMENT_DETAILS: 'appointments/get-appointment-details',
    SYNC_APPOINTMENT: 'appointments/sync-appointment',

    // Rx Savings APIs
    REQUEST_COPAY_CARD: 'rx-savings/sync-copay-card',
    REQUEST_INSURANCE_COST: 'rx-savings/sync-insurance-cost',
    GET_COPAY_REQUEST_DETAILS: 'rx-savings/get-copay-request-details',
    GET_INSURANCE_COST_REQUEST_DETAILS: 'rx-savings/get-insurance-cost-request-details',

    // Tracking APIs
    CREATE_VISIT: 'tracking/create-visit',
    SYNC_TIMELINE: 'tracking/sync-timeline',

    // Appointment and Copay APIs
    SYNC_COPAY_REQUEST: 'rx-savings/sync-copay-card',

    // CRM User APIs
    GET_USER_JOURNEY: 'crm/users/get-user-journey',
    GET_USER_TIMELINE: 'crm/users/get-user-timeline',
    GET_CORE_ENGINE_USERS: 'crm/users/get-core-engine-users',
    GET_CORE_ENGINE_USER_DETAILS: 'crm/users/get-core-engine-user-details',
    GET_USER_DETAILS_BY_ID: 'crm/users/get-core-engine-user-details',
    GET_PATIENTS: 'crm/users/get-patients',

    // Approved Requests APIs
    GET_APPROVED_REQUESTS: 'crm/approved-requests/get-approved-requests',
    SYNC_APPROVED_REQUEST: 'crm/approved-requests/sync-approved-request',

    // Pharmacy Stock Check APIs
    SYNC_PHARMACY_STOCK_CHECK: 'pharmacy-stock-checks/sync-pharmacy-stock-check',
} as const;

/**
 * Get Core Engine base URL
 */
export const BASE_URL = (): string => {
    return getBaseUrl('CORE_ENGINE');
};

/**
 * Get WebSocket base URL for Core Engine
 */
export const WS_BASE_URL = (): string => {
    const base_url = getBaseUrl('CORE_ENGINE');
    return base_url.replace(/^http/, 'ws');
};

/**
 * Transcription result interface
 */
export interface TranscriptionResult {
    text: string;
    segments: Array<{
        text: string;
        startSecond: number;
        endSecond: number;
    }>;
    language?: string;
    durationInSeconds?: number;
}

/**
 * Speech result interface
 */
export interface SpeechResult {
    audio: {
        base64: string;
        mediaType: string;
    };
}

/**
 * Speech generation options
 */
export interface SpeechOptions {
    voice?: string;
    language?: string;
}

/**
 * Transcribe audio blob to text
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
    // Import auth store to get tokens
    const { useAuthStore } = await import('../store/authStore');
    const authStore = useAuthStore.getState();

    const apiPath = CORE_ENGINE_API_URLS.TRANSCRIBE_AUDIO;
    const baseUrl = getBaseUrl('CORE_ENGINE');

    // Ensure baseUrl doesn't end with / and apiPath doesn't start with /
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanApiPath = apiPath.replace(/^\//, '');
    const finalUrl = `${cleanBaseUrl}/${cleanApiPath}`;

    // Build headers
    const headers: Record<string, string> = {};

    // Get tokens from auth store
    const authToken = authStore.getAuthToken();
    const accessToken = authStore.getAccessToken();

    // Add auth tokens to headers if available
    if (authToken) {
        headers['auth-token'] = authToken;
    }
    if (accessToken) {
        headers['access-token'] = accessToken;
    }

    // Add domain header for core engine APIs
    const domain = 'diabetrix'; // Default domain for diabetrix-v2
    headers['domain'] = domain;

    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');

        const response = await fetch(finalUrl, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Handle different response formats
        if (result.statusCode !== undefined) {
            if (result.statusCode !== 200) {
                throw new Error(result.message || 'Failed to transcribe audio');
            }
            return result.data;
        }

        // If response doesn't have statusCode, assume success
        return result;
    } catch (error) {
        console.error('Error in transcribeAudio:', error);
        throw error;
    }
};

/**
 * Generate speech from text
 */
export const generateSpeech = async (text: string, options?: SpeechOptions): Promise<SpeechResult> => {
    // Import auth store to get tokens
    const { useAuthStore } = await import('../store/authStore');
    const authStore = useAuthStore.getState();

    const apiPath = CORE_ENGINE_API_URLS.GENERATE_SPEECH;
    const baseUrl = getBaseUrl('CORE_ENGINE');

    // Ensure baseUrl doesn't end with / and apiPath doesn't start with /
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanApiPath = apiPath.replace(/^\//, '');
    const finalUrl = `${cleanBaseUrl}/${cleanApiPath}`;

    // Build headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Get tokens from auth store
    const authToken = authStore.getAuthToken();
    const accessToken = authStore.getAccessToken();

    // Add auth tokens to headers if available
    if (authToken) {
        headers['auth-token'] = authToken;
    }
    if (accessToken) {
        headers['access-token'] = accessToken;
    }

    // Add domain header for core engine APIs
    const domain = 'diabetrix'; // Default domain for diabetrix-v2
    headers['domain'] = domain;

    try {
        const response = await fetch(finalUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                text,
                voice: options?.voice || 'aura-2-helena-en', // Deepgram voice model (voice and language embedded in model ID)
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Handle different response formats
        if (result.statusCode !== undefined) {
            if (result.statusCode !== 200) {
                throw new Error(result.message || 'Failed to generate speech');
            }
            return result.data;
        }

        // If response doesn't have statusCode, assume success
        return result;
    } catch (error) {
        console.error('Error in generateSpeech:', error);
        throw error;
    }
};

// Core Engine API endpoints
export const CORE_ENGINE_API_URLS = {
    SYNC_USER: 'users/sync-user',
    SYNC_CHAT_THREAD: 'conversation/sync-conversation',
    GET_CHAT_THREADS: 'conversation/get-conversations',
    GET_CHAT_MESSAGES: 'conversation/get-messages',
    STREAM_CHAT_MESSAGE: 'conversation/stream-message',
    STREAM_CHAT_MESSAGE_V2: 'conversation/stream-message/v2',
    TRANSCRIBE_AUDIO: 'conversation/transcribe',
    GENERATE_SPEECH: 'conversation/speech',
} as const;
