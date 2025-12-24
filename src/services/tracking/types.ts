// ========================================
// TRACKING TYPES & INTERFACES
// ========================================

export interface Visit {
    visit_id: string;
    created_at: string;
    user_id?: string;
    anonymous_id: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    landing_page: string;
    referrer?: string;
    domain: string;
    device_type?: string;
    user_agent?: string;
    ip_address?: string;
}

export interface CreateVisitParams {
    anonymous_id?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    landing_page: string;
    referrer?: string;
    domain: string;
    device_type?: string;
    user_agent?: string;
    ip_address?: string;
    user_id?: string;
}

export interface SyncTimelineParams {
    event_name: string;
    title: string;
    description: string;
    event_payload?: any;
}

