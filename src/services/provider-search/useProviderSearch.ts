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

export const useProviderSearch = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const abort_controller_ref = useRef<AbortController | null>(null);

    const fetchSearchCategories = async (query: string): Promise<CategorySearchResults> => {
        if (!query.trim()) {
            return {
                specialties: [],
                conditions: [],
                procedures: [],
            };
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await postAPI(CAPABILITIES_API_URLS.GET_CARE_CATEGORY, {
                query: query.trim()
            });
            
            if (result.statusCode !== 200) {
                throw new Error(result.message || 'Network response was not ok');
            }
            
            return result.data || {
                specialties: [],
                conditions: [],
                procedures: [],
            };
        } catch (error) {
            setError('Error fetching search categories');
            console.error('Error fetching search categories:', error);
            return {
                specialties: [],
                conditions: [],
                procedures: [],
            };
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategorySelection = useCallback(
        async (
            category: SearchCategory, 
            location: string = '',
            first_name?: string,
            last_name?: string,
            selected_insurance?: InsuranceOption | null
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

            // Hardcoded values for find care APIs
            const HARDCODED_ZIP = '98006';
            const HARDCODED_FIRST_NAME = 'Richard';
            const HARDCODED_LAST_NAME = 'Hendricks';
            const HARDCODED_PAYER_NAME = 'MultiPlan';
            const HARDCODED_PLAN_NAME = 'PPO';

            const payload: any = {
                zipcode: HARDCODED_ZIP,
                first_name: first_name || HARDCODED_FIRST_NAME,
                last_name: last_name || HARDCODED_LAST_NAME,
                payer_name: selected_insurance?.payer_name || HARDCODED_PAYER_NAME,
                plan_name: selected_insurance?.plan_name || HARDCODED_PLAN_NAME,
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

    const fetchProviderCareDetails = useCallback(async (providerId: number | string): Promise<string | null> => {
        if (!providerId) return null;

        try {
            const result = await postAPI(CAPABILITIES_API_URLS.GET_NEARBY_CARE_DETAILS, {
                provider_id: providerId
            });

            if (result.statusCode === 200 && result.data) {
                const basicInfo = result.data.basic_info;
                if (basicInfo?.facilities && Array.isArray(basicInfo.facilities) && basicInfo.facilities.length > 0) {
                    const firstFacility = basicInfo.facilities[0];
                    if (firstFacility?.phone && Array.isArray(firstFacility.phone) && firstFacility.phone.length > 0) {
                        return firstFacility.phone[0];
                    }
                }
            }
        } catch (error) {
            console.error(`Error fetching care details for provider ${providerId}:`, error);
        }

        return null;
    }, []);

    const enrichProviderWithCareDetails = useCallback(async (provider: Provider): Promise<Provider> => {
        if (!provider.provider_id) return provider;

        const phone = await fetchProviderCareDetails(provider.provider_id);
        if (phone) {
            return {
                ...provider,
                phone: phone,
                provider_phone: phone
            };
        }

        return provider;
    }, [fetchProviderCareDetails]);

    return {
        providers,
        facilities,
        isLoading,
        error,
        fetchSearchCategories,
        handleCategorySelection,
        fetchProviderCareDetails,
        enrichProviderWithCareDetails
    };
};

export default useProviderSearch;

