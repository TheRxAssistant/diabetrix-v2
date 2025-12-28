import { useState, useCallback } from 'react';
import { postAPI, CAPABILITIES_API_URLS } from '../api';
import { UserDetails } from './types-user-details';
import { useAuthStore } from '../../store/authStore';

export const useUserDetails = () => {
    const [user_details, set_user_details] = useState<UserDetails | null>(null);
    const [is_loading, set_is_loading] = useState(false);
    const [error, set_error] = useState<string | null>(null);

    const fetch_user_details = useCallback(async (user_id?: string) => {
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
            const response = await postAPI(CAPABILITIES_API_URLS.GET_CORE_ENGINE_USER_DETAILS, {
                user_id: target_user_id,
            });

            if (response.statusCode === 200 && response.data) {
                set_user_details(response.data as UserDetails);
                set_error(null);
            } else if (response.statusCode === 404) {
                set_error('User not found');
                set_user_details(null);
            } else {
                set_error(response.message || 'Failed to fetch user details');
                set_user_details(null);
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
            set_error(err instanceof Error ? err.message : 'Network error while fetching user details');
            set_user_details(null);
        } finally {
            set_is_loading(false);
        }
    }, []);

    const clear_user_details = useCallback(() => {
        set_user_details(null);
        set_error(null);
    }, []);

    return {
        user_details,
        is_loading,
        error,
        fetch_user_details,
        clear_user_details,
    };
};
