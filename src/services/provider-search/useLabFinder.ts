import { useState, useCallback, useRef } from 'react';
import { postAPI, CAPABILITIES_API_URLS } from '../api';
import type { FindNearbyCareResultItem } from '../types/healthcare/types';
import type { Facility } from './useProviderSearch';

/** Map API result item to Facility shape used by UI and PlotMap. */
function mapResultToFacility(item: FindNearbyCareResultItem): Facility {
    const lat = item.latitude;
    const lng = item.longitude;
    return {
        facility_id: item.facility_id,
        facility_name: item.name,
        facility_address: item.address,
        facility_phone: item.phone,
        facility_type: item.description,
        facility_email: item.email,
        facility_website: item.website,
        facility_image: item.image,
        facility_rating: item.rating,
        facility_review_count: item.review_count,
        facility_description: item.description,
        facility_full_address_obj:
            lat != null && lng != null && !isNaN(lat) && !isNaN(lng)
                ? { lat, long: lng }
                : undefined,
        type: 'facility',
    };
}

export interface UseLabFinderResult {
    facilities: Facility[];
    isLoading: boolean;
    error: string | null;
    search: (zipcode: string, distance: number) => Promise<void>;
}

export function useLabFinder(): UseLabFinderResult {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const search = useCallback(async (zipcode: string, distance: number) => {
        const trimmedZip = zipcode?.trim() || '';
        if (!trimmedZip) {
            setError('Please enter a zipcode');
            setFacilities([]);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const payload = {
            zipcode: trimmedZip,
            search_radius: distance,
            care_category_id: 'Lab',
            care_category_name: 'Lab',
            care_category_type: 'facility',
        };

        setIsLoading(true);
        setError(null);

        try {
            const result = await postAPI(
                CAPABILITIES_API_URLS.GET_NEARBY_CARE_V2,
                payload,
                abortControllerRef.current.signal
            );

            setIsLoading(false);

            if (result.statusCode === 200) {
                const results = (result.data as FindNearbyCareResultItem[] | undefined) ?? [];
                const filteredResults = results.filter(result => result?.description?.toLowerCase() === 'lab');
                const facilitiesList = filteredResults.map(mapResultToFacility);
                setFacilities(facilitiesList);
            } else if (result.statusCode !== 499) {
                setError(result.message || 'Failed to search for labs');
                setFacilities([]);
            }
        } catch (err: any) {
            setIsLoading(false);
            if (err.name !== 'AbortError') {
                setError('Error fetching labs');
                setFacilities([]);
                console.error('Error fetching labs:', err);
            }
        }
    }, []);

    return { facilities, isLoading, error, search };
}

export default useLabFinder;
