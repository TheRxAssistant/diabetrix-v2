import { useState, useCallback } from 'react';
import { postAPI, CAPABILITIES_API_URLS } from '../api';
import { ApprovedRequest, GetAllApprovedRequestsResult } from './types-approved-requests';
import { useAuthStore } from '../../store/authStore';
import { useThemeConfig } from '../../hooks/useThemeConfig';
import { getDomain } from '../../config/theme-config';

export const useApprovedRequests = () => {
    const themeConfig = useThemeConfig();
    const [approved_requests, set_approved_requests] = useState<ApprovedRequest[]>([]);
    const [is_loading, set_is_loading] = useState(false);
    const [error, set_error] = useState<string | null>(null);

    const fetch_approved_requests = useCallback(async (user_id?: string, limit: number = 5) => {
        // Get user_id from parameter or authStore if not provided
        const authStore = useAuthStore.getState();
        const user = authStore.user;
        const target_user_id = user_id || user?.userData?.user_id;

        if (!target_user_id) {
            set_error('User ID is required');
            return;
        }

        set_is_loading(true);
        set_error(null);

        try {
            const response = await postAPI(CAPABILITIES_API_URLS.GET_APPROVED_REQUESTS, {
                user_id: target_user_id,
                limit,
                domain: getDomain(themeConfig),
                offset: 0,
            });

            if (response.statusCode === 200 && response.data) {
                const result = response.data as GetAllApprovedRequestsResult;
                set_approved_requests(result.approved_requests || []);
                set_error(null);
            } else {
                set_error(response.message || 'Failed to fetch approved requests');
                set_approved_requests([]);
            }
        } catch (err) {
            console.error('Error fetching approved requests:', err);
            set_error(err instanceof Error ? err.message : 'Network error while fetching approved requests');
            set_approved_requests([]);
        } finally {
            set_is_loading(false);
        }
    }, [themeConfig]);

    const clear_approved_requests = useCallback(() => {
        set_approved_requests([]);
        set_error(null);
    }, []);

    return {
        approved_requests,
        is_loading,
        error,
        fetch_approved_requests,
        clear_approved_requests,
    };
};
