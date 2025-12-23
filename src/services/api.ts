/**
 * Get base URL from environment variables with fallback defaults
 */
const getBaseUrl = (apiType: 'INDEX_MEMBER' | 'RX_HUB' | 'CAPABILITIES' | 'CORE_ENGINE'): string => {
    const env = import.meta.env;
    
    switch (apiType) {
        case 'INDEX_MEMBER':
            return env.VITE_API_INDEX_MEMBER_BASE_URL || 'https://index-member-be-dev.healthbackend.com';
        case 'RX_HUB':
            return env.VITE_API_RX_HUB_BASE_URL || 'https://rx-hub-be-dev.healthbackend.com';
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
export const postAPI = async (
    url: string | keyof typeof INDEX_MEMBER_API_URLS | keyof typeof CAPABILITIES_API_URLS | keyof typeof CORE_ENGINE_API_URLS | keyof typeof RX_HUB_API_URLS,
    payload: any = {},
    abortSignal?: AbortSignal
): Promise<{ statusCode: number; message: string; data: any }> => {
    let finalUrl: string;
    
    // Check if it's a full URL (starts with http)
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
        finalUrl = url;
    } else {
        // It's an endpoint key or value, resolve it
        let apiPath = '';
        let baseUrl = '';
        
        // Check if it's a key in INDEX_MEMBER_API_URLS
        if (url in INDEX_MEMBER_API_URLS) {
            apiPath = INDEX_MEMBER_API_URLS[url as keyof typeof INDEX_MEMBER_API_URLS];
            baseUrl = getBaseUrl('INDEX_MEMBER');
        } 
        // Check if it's a value in INDEX_MEMBER_API_URLS
        else if (Object.values(INDEX_MEMBER_API_URLS).includes(url as any)) {
            apiPath = url as string;
            baseUrl = getBaseUrl('INDEX_MEMBER');
        }
        // Check if it's a key in RX_HUB_API_URLS
        else if (url in RX_HUB_API_URLS) {
            apiPath = RX_HUB_API_URLS[url as keyof typeof RX_HUB_API_URLS];
            baseUrl = getBaseUrl('RX_HUB');
        }
        // Check if it's a value in RX_HUB_API_URLS
        else if (Object.values(RX_HUB_API_URLS).includes(url as any)) {
            apiPath = url as string;
            baseUrl = getBaseUrl('RX_HUB');
        }
        // Check if it's a key in CAPABILITIES_API_URLS
        else if (url in CAPABILITIES_API_URLS) {
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

    // Add domain header if available (for core engine and capabilities APIs)
    const domain = 'diabetrix'; // Default domain for diabetrix-v2
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
            
            return {
                statusCode: response.status,
                message: errorMessage,
                data: {},
            };
        }

        const responseData = await response.json();
        
        // Handle different response formats
        if (responseData.statusCode !== undefined) {
            return {
                statusCode: responseData.statusCode,
                message: responseData.message || 'Success',
                data: responseData.data || responseData,
            };
        }

        // If response doesn't have statusCode, assume success
        return {
            statusCode: 200,
            message: 'Success',
            data: responseData,
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
export const streamAPI = async (
    url: keyof typeof CORE_ENGINE_API_URLS,
    payload: any = {},
    onChunk: (chunk: string) => void
): Promise<void> => {
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

    // Add domain header for core engine APIs
    const domain = 'diabetrix'; // Default domain for diabetrix-v2
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

// Index Member API endpoints (auth, AI)
export const INDEX_MEMBER_API_URLS = {
    // Auth
    SEND_OTP: 'auth/send-otp',
    VERIFY_OTP: 'auth/verify-otp',
    VERIFY_USER_BY_VERIFIED: 'auth/verify-user-by-verified',
    
    // AI
    AI_GENERATE_OBJECT: 'ai/generate-object',
    AI_GENERATE_TEXT: 'ai/generate-text',
} as const;

// RX Hub API endpoints (SMS)
export const RX_HUB_API_URLS = {
    SEND_SMS: 'notifications/send-sms',
} as const;

// Capabilities API endpoints
export const CAPABILITIES_API_URLS = {
    SEND_OTP: 'authenticate/send-otp',
    GENERATE_QUICK_REPLIES: 'drugs/generate-quick-replies',
    // Find Care APIs
    GET_CARE_CATEGORY: 'find-care/get-care-categories',
    GET_CARE_CATEGORY_V2: 'find-care/get-care-categories-v2',
    GET_NEARBY_CARE_DETAILS: 'find-care/get-care-details',
    GET_NEARBY_CARE: 'find-care/find-nearby-care',
    GET_NEARBY_CARE_V2: 'find-care/find-nearby-care-v2',
    SEARCH_PROVIDERS_BY_NAME: 'find-care/search-providers-by-name',
    // CRM User APIs
    GET_USER_JOURNEY: 'crm/users/get-user-journey',
    GET_USER_TIMELINE: 'crm/users/get-user-timeline',
    GET_CORE_ENGINE_USERS: 'crm/users/get-core-engine-users',
    GET_CORE_ENGINE_USER_DETAILS: 'crm/users/get-core-engine-user-details',
    GET_USER_DETAILS_BY_ID: 'crm/users/get-core-engine-user-details',
} as const;

// Core Engine API endpoints
export const CORE_ENGINE_API_URLS = {
    SYNC_USER: 'users/sync-user',
    SYNC_CHAT_THREAD: 'conversation/sync-conversation',
    GET_CHAT_THREADS: 'conversation/get-conversations',
    GET_CHAT_MESSAGES: 'conversation/get-messages',
    STREAM_CHAT_MESSAGE: 'conversation/stream-message',
} as const;

