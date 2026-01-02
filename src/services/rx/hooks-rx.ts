import { useState } from 'react';
import { postAPI, CAPABILITIES_API_URLS } from '../api';
import { RxRequestCopayCard, RxRequestInsuranceCost } from './types-rx';
import { useAuthStore } from '../../store/authStore';

export const useRxRequests = () => {
    const [copay_loading, set_copay_loading] = useState(false);
    const [insurance_loading, set_insurance_loading] = useState(false);
    const [error, set_error] = useState<string | null>(null);

    const requestCopayCard = async (drug_brand_name: string, drug_form?: string, drug_quantity?: string, drug_strength?: string): Promise<RxRequestCopayCard | null> => {
        set_copay_loading(true);
        set_error(null);

        try {
            // Get user info from auth store
            const authStore = useAuthStore.getState();
            const user = authStore.user;
            
            if (!user || !user.userData) {
                set_error('User not authenticated');
                return null;
            }

            const userData = user.userData;
            const domain = 'diabetrix'; // Default domain for diabetrix-v2
            const user_id = userData.user_id;
            const user_name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User';
            const user_phone = user.phoneNumber || userData.phone_number || '';
            const user_email = userData.email || '';
            const user_address = userData.address 
                ? `${userData.address.street || ''}, ${userData.address.city || ''}, ${userData.address.state || ''}`.trim()
                : '';
            const user_zipcode = userData.address?.zip_code || userData.zip_code || '';
            const user_insurance_details = userData.insurance_details || {};

            // Now make the copay card request with all required info
            const { data, statusCode, message } = await postAPI(CAPABILITIES_API_URLS.REQUEST_COPAY_CARD, {
                domain,
                user_id,
                user_name,
                user_phone,
                user_email,
                user_address,
                user_zipcode,
                user_insurance_details,
                drug_brand_name,
                drug_form,
                drug_quantity,
                drug_strength,
            });

            if (statusCode === 200) {
                if (data && data.duplicate_request) {
                    console.log('Copay card request:', message);
                    return data as RxRequestCopayCard;
                } else {
                    return data as RxRequestCopayCard;
                }
            } else {
                set_error(message || 'Failed to request copay card');
                return null;
            }
        } catch (err) {
            set_error('An error occurred while requesting copay card');
            console.error('Error requesting copay card:', err);
            return null;
        } finally {
            set_copay_loading(false);
        }
    };

    const requestInsuranceCost = async (drug_brand_name: string, drug_form?: string, drug_quantity?: string, drug_strength?: string): Promise<RxRequestInsuranceCost | null> => {
        set_insurance_loading(true);
        set_error(null);

        try {
            // Get user info from auth store
            const authStore = useAuthStore.getState();
            const user = authStore.user;
            
            if (!user || !user.userData) {
                set_error('User not authenticated');
                return null;
            }

            const userData = user.userData;
            const domain = 'diabetrix'; // Default domain for diabetrix-v2
            const user_id = userData.user_id;
            const user_name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User';
            const user_phone = user.phoneNumber || userData.phone_number || '';
            const user_email = userData.email || '';
            const user_address = userData.address 
                ? `${userData.address.street || ''}, ${userData.address.city || ''}, ${userData.address.state || ''}`.trim()
                : '';
            const user_zipcode = userData.address?.zip_code || userData.zip_code || '';
            const user_insurance_details = userData.insurance_details || {};

            // Now make the insurance cost request with all required info
            const { data, statusCode, message } = await postAPI(CAPABILITIES_API_URLS.REQUEST_INSURANCE_COST, {
                domain,
                user_id,
                user_name,
                user_phone,
                user_email,
                user_address,
                user_zipcode,
                user_insurance_details,
                drug_brand_name: drug_brand_name || 'diabetrix',
                drug_form: drug_form || 'tablet',
                drug_quantity: drug_quantity || '30',
                drug_strength: drug_strength || '500mg',
            });

            if (statusCode === 200) {
                if (data && data.duplicate_request) {
                    console.log('Insurance cost request:', message);
                    return data as RxRequestInsuranceCost;
                } else {
                    return data as RxRequestInsuranceCost;
                }
            } else {
                set_error(message || 'Failed to request insurance cost');
                return null;
            }
        } catch (err) {
            set_error('An error occurred while requesting insurance cost');
            console.error('Error requesting insurance cost:', err);
            return null;
        } finally {
            set_insurance_loading(false);
        }
    };

    return {
        copay_loading,
        insurance_loading,
        error,
        requestCopayCard,
        requestInsuranceCost,
    };
};

