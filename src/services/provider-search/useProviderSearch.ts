import { useState, useCallback, useRef } from 'react';
import { postAPI, CAPABILITIES_API_URLS } from '../api';
import { trackingService } from '../tracking/tracking-service';
// Types exported for use in healthcare provider search components

interface IAddress {
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
    // API response format
    provider_id?: number | string;
    name?: string;
    gender?: string;
    has_booking_links?: boolean;
    booking_links?: Array<{
        url: string;
        serviceProvider: string;
    }>;
    description?: string;
    phone?: string;
    email?: string;
    accepts_new_patients?: boolean;
    address?: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    zipcode?: string;
    rating?: number | null;
    review_count?: number | string;
    website?: string;
    image?: string;
    languages?: string[];
    insurance_accepted?: string[];
    type?: 'provider' | 'facility';
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    npi?: number;

    // Legacy format support (for backward compatibility)
    provider_name?: string;
    provider_specialty?: string;
    provider_address?: string;
    provider_phone?: string;
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
    facility_description?: string;
    facility_name?: string;
    facility_address?: string;
    facility_phone?: string;
    facility_type?: string;
    facility_email?: string;
    facility_website?: string;
    facility_image?: string;
    facility_rating?: number;
    facility_distance?: number;
    facility_review_count?: number | string;
    facility_specialty?: string[];
    facility_full_address_obj?: IAddress;
    reward_amount?: number;
    bundle_median_price?: number;
    type?: 'provider' | 'facility';
}

export interface SearchCategory {
    care_category_id?: string;
    care_category_name: string;
    care_category_type?: 'specialty' | 'condition' | 'procedure';
    category_type?: 'provider' | 'condition' | 'specialty' | 'facility' | 'procedure';
    reference_third_party_id?: string;
    category_name: string;
    integration_id?: '1' | '2' | '3';
}

export interface CategorySearchResults {
    specialties?: any[];
    conditions?: any[];
    procedures?: any[];
    is_talon?: boolean;
}

export interface InsuranceOption {
    plan_name: string;
    payer_name: string;
}

export interface ProviderSpecialty {
    display_name?: string;
    is_primary?: boolean;
}

export interface ProviderFacility {
    name?: string;
    phone?: string[];
    formattedAddress?: string;
}

export interface ProviderCondition {
    condition: string;
    count: number;
    pct: number;
}

export interface ProviderProcedure {
    procedure: string;
    count: number;
    pct: number;
}

export interface ProviderReview {
    date: string;
    rating: number;
    review: string;
}

export interface ProviderReviews {
    Count: number;
    Review: ProviderReview[];
}

export interface ProviderBasicInfo {
    npi?: number;
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    gender?: string;
    specialties?: ProviderSpecialty[];
    image?: string;
    facilities?: ProviderFacility[];
    accepts_new_patients?: boolean;
    languages?: string[];
    rating?: number;
    review_count?: number;
    degrees?: string[];
    emails?: string[];
    insurances?: Array<{ payer_name?: string; plan_name?: string }>;
    distance?: number;
    about?: string[];
}

export interface ProviderFocusArea {
    conditions?: {
        conditions: ProviderCondition[];
        total_std_icd10_count?: number;
        total_unique_icd10_count?: number;
    };
    procedures?: {
        procedures: ProviderProcedure[];
        total_std_hcpcs_count?: number;
        total_unique_hcpcs_count?: number;
    };
}

export interface ProviderDetails {
    basic_info?: ProviderBasicInfo;
    focus_areas?: ProviderFocusArea;
    reviews?: ProviderReviews;
}

export const useProviderSearch = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const abort_controller_ref = useRef<AbortController | null>(null);

    const handleCategorySelection = useCallback(
        async (
            category: SearchCategory, 
            location: string = '',
            first_name?: string,
            last_name?: string,
            selected_insurance?: InsuranceOption | null,
            zipcode?: string
        ) => {
            // Use new format if available, otherwise fall back to old format
            const care_category_id = category.care_category_id || category.reference_third_party_id;
            const care_category_name = category.care_category_name || category.category_name;
            const care_category_type = category.care_category_type || category.category_type;

            if (!care_category_type || !care_category_name) {
                setProviders([]);
                setFacilities([]);
                return;
            }

            // Cancel any ongoing request
            if (abort_controller_ref.current) {
                abort_controller_ref.current.abort();
            }

            // Create new abort controller for this request
            abort_controller_ref.current = new AbortController();

            const resolved_zipcode = zipcode || location || '';

            const payload: any = {
                zipcode: resolved_zipcode,
                first_name: first_name || '',
                last_name: last_name || '',
                payer_name: selected_insurance?.payer_name || '',
                plan_name: selected_insurance?.plan_name || '',
                care_category_id: care_category_id,
                care_category_type: care_category_type,
                care_category_name: care_category_name,
            };

            setIsLoading(true);
            setError(null);
            
            try {
                const result = await postAPI(
                    CAPABILITIES_API_URLS.GET_NEARBY_CARE_V2, 
                    payload,
                    abort_controller_ref.current.signal
                );
                
                setIsLoading(false);

                if (result.statusCode === 200) {
                    const results = result.data || [];
                    // API returns array of providers - filter by type if present, otherwise treat all as providers
                    const providers_list = results.filter((item: any) => !item.type || item.type === 'provider');
                    const facilities_list = results.filter((item: any) => item.type === 'facility');

                    setProviders(providers_list as Provider[]);
                    setFacilities(facilities_list as Facility[]);

                    // Track find doctor milestone
                    const specialty = care_category_name || 'any specialty';
                    const zipcode = location || payload.zipcode || 'unknown';
                    await trackingService.syncTimeline({
                        event_name: 'find_doctor',
                        title: 'Doctor Search',
                        description: `Find a ${specialty} doctor near zip code ${zipcode}`,
                        event_payload: {
                            zip_code: zipcode,
                            specialty,
                            care_category_type: care_category_type,
                            results_count: results.length || 0,
                        },
                    });
                } else if (result.statusCode !== 499) {
                    // Don't show error if request was cancelled (statusCode 499)
                    setError(result.message || 'Failed to search for care providers');
                }
            } catch (error: any) {
                setIsLoading(false);
                // Don't show error if request was aborted
                if (error.name !== 'AbortError') {
                    setError('Error fetching providers/facilities');
                    console.error('Error fetching providers/facilities:', error);
                }
            }
        },
        []
    );

    const fetchProviderCareDetails = useCallback(async (providerId: number | string, isFacility?: boolean): Promise<ProviderDetails | null> => {
        if (!providerId) return null;

        try {
            const payload = isFacility
                ? { facility_id: providerId }
                : { provider_id: providerId };

            const result = await postAPI(CAPABILITIES_API_URLS.GET_NEARBY_CARE_DETAILS, payload);

            if (result.statusCode === 200 && result.data) {
                return result.data as ProviderDetails;
            }
        } catch (error) {
            console.error(`Error fetching care details for provider ${providerId}:`, error);
        }

        return null;
    }, []);

    const enrichProviderWithCareDetails = useCallback(async (provider: Provider): Promise<Provider> => {
        if (!provider.provider_id) return provider;

        const details = await fetchProviderCareDetails(provider.provider_id);
        if (details?.basic_info?.facilities?.[0]?.phone?.[0]) {
            return {
                ...provider,
                phone: details.basic_info.facilities[0].phone[0],
                provider_phone: details.basic_info.facilities[0].phone[0],
            };
        }

        return provider;
    }, [fetchProviderCareDetails]);

    return {
        providers,
        facilities,
        isLoading,
        error,
        handleCategorySelection,
        fetchProviderCareDetails,
        enrichProviderWithCareDetails
    };
};

export default useProviderSearch;

