// Healthcare provider types
export const MAPS_API_KEY = "AIzaSyA0PMa5_XTyo_pLZ5PIDN_IE4eIVVyDPIU";

export interface IAddress {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    formatted_address?: string;
    county?: string;
    lat?: number;
    long?: number;
}

export interface Provider {
    provider_id?: string;
    provider_name?: string;
    provider_specialty?: string;
    provider_address?: string;
    provider_phone: string;
    provider_email?: string;
    provider_website?: string;
    provider_image?: string;
    provider_rating?: number;
    provider_distance?: number;
    provider_next_available?: string;
    provider_accepts_insurance?: boolean;
    provider_review_count?: number;
    provider_degree?: string;
    provider_languages?: string;
    provider_facilities?: string[];
    provider_full_address_obj?: IAddress;
    is_bookmarked?: boolean;
}

export interface Facility {
    facility_id?: string;
    facility_name?: string;
    facility_address?: string;
    facility_phone?: string;
    facility_type?: string;
    facility_email?: string;
    facility_website?: string;
    facility_image?: string;
    facility_rating?: number;
    facility_distance?: number;
    facility_review_count?: number;
    facility_specialty?: string[];
    facility_full_address_obj?: IAddress;
    reward_amount?: number;
    bundle_median_price?: number;
}

