import { useState } from 'react';
import { postAPI } from '../api';
import { toast } from 'sonner';

export const useApp = () => {
    const [is_loading, set_is_loading] = useState(false);

    // Step 1: Send OTP
    const send_otp = async (phoneNumber: string) => {
        set_is_loading(true);
        const { data, statusCode, message } = await postAPI('SEND_OTP', { phone_number: phoneNumber });
        set_is_loading(false);

        if (statusCode === 200) {
            return {
                data,
            };
        }

        toast(message);
    };

    return {
        is_loading,
        send_otp,
    };
};

