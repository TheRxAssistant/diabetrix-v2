import { CreateVisitParams, SyncTimelineParams, Visit } from './types';
import { useAuthStore } from '../../store/authStore';
import { postAPI } from '../api';

// ========================================
// CONSTANTS
// ========================================

const VISIT_ID_KEY = 'diabetrix_visit_id';
const ANONYMOUS_ID_KEY = 'diabetrix_anonymous_id';
const DOMAIN = 'diabetrix'; // Default domain for diabetrix-v2

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get anonymous_id from localStorage
 */
const getAnonymousId = (): string | null => {
    const stored = localStorage.getItem(ANONYMOUS_ID_KEY);
    return stored || null;
};

/**
 * Set anonymous_id in localStorage
 */
const setAnonymousId = (anonymous_id: string): void => {
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymous_id);
};

/**
 * Clear anonymous_id from localStorage
 */
const clearAnonymousId = (): void => {
    localStorage.removeItem(ANONYMOUS_ID_KEY);
};

/**
 * Get device type from user agent
 */
const getDeviceType = (): string => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
};

/**
 * Extract UTM parameters from URL
 */
const extractUTMParams = (): {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
} => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
    };
};

/**
 * Get or create visit_id from localStorage
 */
const getVisitId = (): string | null => {
    return localStorage.getItem(VISIT_ID_KEY);
};

/**
 * Set visit_id in localStorage
 */
const setVisitId = (visit_id: string): void => {
    localStorage.setItem(VISIT_ID_KEY, visit_id);
};

/**
 * Clear visit_id from localStorage
 */
const clearVisitId = (): void => {
    localStorage.removeItem(VISIT_ID_KEY);
};

/**
 * Generate random UUID
 */
const randomUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// ========================================
// TRACKING SERVICE
// ========================================

class TrackingService {
    private initialized = false;
    private initializing = false;
    private currentVisitId: string | null = null;
    private currentAnonymousId: string | null = null;

    /**
     * Initialize tracking - Call this on app load
     */
    async initializeTracking(user_id?: string): Promise<void> {
        // Prevent concurrent initialization
        if (this.initializing) {
            console.log('Tracking initialization already in progress');
            return;
        }

        if (this.initialized) {
            console.log('Tracking already initialized');
            return;
        }

        // Check if visit_id already exists in localStorage BEFORE setting flags
        const existingVisitId = getVisitId();
        const existingAnonymousId = getAnonymousId();
        if (existingVisitId && existingAnonymousId) {
            // Visit already exists, just store it
            this.currentVisitId = existingVisitId;
            this.currentAnonymousId = existingAnonymousId;
            this.initialized = true;
            console.log('Existing visit found:', existingVisitId);
            return;
        }

        // Set initializing flag to prevent concurrent calls
        this.initializing = true;
        console.log('Initializing tracking...');

        try {
            // Create new visit
            const utmParams = extractUTMParams();
            const existingAnonymousId = getAnonymousId();

            // Only include user_id if it's a valid non-empty string
            const visitParams: CreateVisitParams = {
                ...(existingAnonymousId ? { anonymous_id: existingAnonymousId } : {}),
                ...utmParams,
                landing_page: window.location.href,
                referrer: document.referrer || undefined,
                domain: DOMAIN,
                device_type: getDeviceType(),
                user_agent: navigator.userAgent,
                // Only include user_id if it's a valid non-empty string
                ...(user_id && user_id.trim() !== '' ? { user_id } : {}),
            };

            const visit = await postAPI('tracking/create-visit', visitParams);

            if (visit.statusCode === 200 && visit.data && visit.data.visit_id) {
                this.currentVisitId = visit.data.visit_id;
                this.currentAnonymousId = visit.data.anonymous_id;
                setVisitId(visit.data.visit_id);
                setAnonymousId(visit.data.anonymous_id);
                console.log('New visit created:', visit.data.visit_id, 'anonymous_id:', visit.data.anonymous_id);

                // Log landing event as a timeline milestone
                await this.syncTimeline({
                    event_name: 'landing',
                    title: 'App Visited',
                    description: `User landed on ${window.location.pathname}`,
                    event_payload: {
                        page: window.location.pathname,
                        ...utmParams,
                    },
                });
            } else {
                console.error('Failed to create visit');
            }
        } catch (error) {
            console.error('Error initializing tracking:', error);
        } finally {
            this.initializing = false;
            this.initialized = true;
        }
    }

    /**
     * Sync timeline entry (with automatic identity stitching on backend)
     */
    async syncTimeline(params: SyncTimelineParams): Promise<void> {
        // Ensure tracking is initialized
        if (!this.initialized) {
            await this.initializeTracking();
        }

        // Try to get user_id from multiple sources
        let user_id: string | undefined;
        
        // First, try from authStore
        const authStore = useAuthStore.getState();
        const user = authStore.user;
        if (user?.userData?.user_id && user.userData.user_id.trim() !== '') {
            user_id = user.userData.user_id;
        }
        
        // If not found, try from localStorage
        if (!user_id) {
            try {
                const storedUserDetails = localStorage.getItem('diabetrix_user_details');
                if (storedUserDetails) {
                    const parsed = JSON.parse(storedUserDetails);
                    if (parsed.user_id && parsed.user_id.trim() !== '') {
                        user_id = parsed.user_id;
                    }
                }
            } catch (error) {
                console.error('Error reading user details from localStorage:', error);
            }
        }
        
        const anonymous_id = this.currentAnonymousId || getAnonymousId();

        if (!user_id && !anonymous_id) {
            console.error('No identifier available for timeline sync');
            return;
        }

        const payload = {
            visit_id: this.currentVisitId,
            user_id,
            anonymous_id,
            event_name: params.event_name,
            event_payload: params.event_payload,
            title: params.title,
            description: params.description,
            conversation_id: params.conversation_id,
        };

        try {
            await postAPI('tracking/sync-timeline', payload);
        } catch (error) {
            console.error('Error syncing timeline:', error);
        }
    }

    /**
     * Get current visit context
     */
    getVisitContext(): { visit_id: string | null; anonymous_id: string | null } {
        return {
            visit_id: this.currentVisitId,
            anonymous_id: this.currentAnonymousId || getAnonymousId(),
        };
    }

    /**
     * Reset tracking (for testing or logout)
     */
    resetTracking(): void {
        clearVisitId();
        clearAnonymousId();
        this.currentVisitId = null;
        this.currentAnonymousId = null;
        this.initialized = false;
        this.initializing = false;
        console.log('Tracking reset');
    }
}

// Export singleton instance
export const trackingService = new TrackingService();

