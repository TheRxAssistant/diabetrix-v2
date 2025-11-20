export const postAPI = async (url: keyof typeof CAPABILITIES_API_URLS | keyof typeof CORE_ENGINE_API_URLS, payload: any = {}, abortSignal?: AbortSignal): Promise<{ statusCode: number; message: string; data: any }> => {
    const api_path = CAPABILITIES_API_URLS[url as keyof typeof CAPABILITIES_API_URLS] || CORE_ENGINE_API_URLS[url as keyof typeof CORE_ENGINE_API_URLS];
    const base_url = BASE_URL(url);
    const finalUrl = `${base_url}/${api_path}`;

    // Build headers - include Content-Type, domain, and auth token if available
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const finalPayload = { ...payload };

    try {
        const response = await fetch(finalUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(finalPayload),
            signal: abortSignal,
        });

        if (response.status !== 200) {
            return {
                statusCode: response.status,
                message: 'Something went wrong',
                data: {},
            };
        }

        const { data, statusCode, message } = await response.json();

        return {
            statusCode,
            message,
            data,
        };
    } catch (error) {
        console.error('Error in postAPI:', error);
        return {
            statusCode: 500,
            message: 'Something went wrong',
            data: {},
        };
    }
};

export const BASE_URL = (url?: keyof typeof CAPABILITIES_API_URLS | keyof typeof CORE_ENGINE_API_URLS) => {
    const hostname = window.location.hostname;

    // Check if the API exists in CAPABILITIES_API_URLS
    if (url && url in CAPABILITIES_API_URLS) {
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        } else {
            if (hostname.includes('dev')) {
                return `https://capabilities-ai-be-dev.healthbackend.com`;
            } else if (hostname.includes('stage')) {
                return `https://capabilities-ai-be-stage.healthbackend.com`;
            } else {
                return `https://capabilities-ai-be.healthbackend.com`;
            }
        }
    } else if (url && url in CORE_ENGINE_API_URLS) {
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'https://core-engine-be-stage.healthbackend.com';
        } else {
            if (hostname.includes('dev')) {
                return `https://core-engine-be-dev.healthbackend.com`;
            } else if (hostname.includes('stage')) {
                return `https://core-engine-be-stage.healthbackend.com`;
            } else {
                return `https://core-engine-be.healthbackend.com`;
            }
        }
    } else {
        return '';
    }
};

// APIs that should use capabilities-ai-be servers
export const CAPABILITIES_API_URLS = {
    SEND_OTP: 'authenticate/send-otp',
} as const;

export const CORE_ENGINE_API_URLS = {
    // Chat
    SYNC_USER: 'users/sync-user',
} as const;

