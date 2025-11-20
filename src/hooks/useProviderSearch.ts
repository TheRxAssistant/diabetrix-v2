import { useState } from 'react';
import { postAPI, INDEX_MEMBER_API_URLS } from '../services/api';
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

export interface SearchCategory {
    category_type?: 'provider' | 'condition' | 'specialty' | 'facility' | 'procedure';
    reference_third_party_id?: string;
    category_name: string;
    integration_id?: '1' | '2' | '3';
}

const INTEGRATION_ID = 3;

export const useProviderSearch = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSearchCategories = async (query: string): Promise<SearchCategory[]> => {
        if (!query.trim()) {
            return [];
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await postAPI(INDEX_MEMBER_API_URLS.PROVIDER_CATEGORY, {
                integration_id: INTEGRATION_ID,
                query: query
            });
            
            if (result.statusCode !== 200) {
                throw new Error(result.message || 'Network response was not ok');
            }
            
            return result.data?.data || result.data || [];
        } catch (error) {
            setError('Error fetching search categories');
            console.error('Error fetching search categories:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategorySelection = async (
        category: SearchCategory, 
        location: string = ''
    ) => {
        const { category_type, reference_third_party_id, category_name } = category;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const payload: any = {
                location: location,
                integration_id: INTEGRATION_ID,
                reference_third_party_id,
            };

            if (category_type === 'procedure') {
                payload.procedure_id = reference_third_party_id;
                payload.facility_type = category_name;

                const result = await postAPI(INDEX_MEMBER_API_URLS.PROVIDER_MATCHING_FACILITY, payload);
                
                if (result.statusCode === 200) {
                    setFacilities(result.data?.data || result.data || []);
                    setProviders([]);
                }
            } else if (category_type === 'condition') {
                payload.condition_id = reference_third_party_id;
                payload.specialty = category_name;

                const result = await postAPI(INDEX_MEMBER_API_URLS.PROVIDER_MATCHING_INDIVIDUAL, payload);
                
                if (result.statusCode === 200) {
                    setProviders(result.data?.data || result.data || []);
                    setFacilities([]);
                }
            } else if (category_type === 'specialty') {
                payload.speciality_code = reference_third_party_id;
                payload.specialty = category_name;

                const result = await postAPI(INDEX_MEMBER_API_URLS.PROVIDER_MATCHING_INDIVIDUAL, payload);
                
                if (result.statusCode === 200) {
                    setProviders(result.data?.data || result.data || []);
                    setFacilities([]);
                }
            } else if (category_type === 'facility') {
                payload.facility_type = category_name;

                const result = await postAPI(INDEX_MEMBER_API_URLS.PROVIDER_MATCHING_FACILITY, payload);
                
                if (result.statusCode === 200) {
                    setFacilities(result.data?.data || result.data || []);
                    setProviders([]);
                }
            }
        } catch (error) {
            setError('Error fetching providers/facilities');
            console.error('Error fetching providers/facilities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        providers,
        facilities,
        isLoading,
        error,
        fetchSearchCategories,
        handleCategorySelection
    };
};

export default useProviderSearch;
