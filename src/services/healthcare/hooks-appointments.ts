import { useState } from 'react';
import { postAPI, CAPABILITIES_API_URLS } from '../api';
import { Appointment } from './types-appointments';
import { useAuthStore } from '../../store/authStore';

export const useAppointments = () => {
    const [appointments, set_appointments] = useState<Appointment[]>([]);
    const [upcoming_appointments, set_upcoming_appointments] = useState<Appointment[]>([]);
    const [is_loading, set_is_loading] = useState(false);

    const fetch_appointments = async () => {
        set_is_loading(true);
        const response = await postAPI(CAPABILITIES_API_URLS.GET_APPOINTMENTS, {});
        if (response.statusCode === 200) {
            set_appointments(response.data || []);
        }
        set_is_loading(false);
    };

    const fetch_upcoming_appointments = async (limit: number = 3) => {
        set_is_loading(true);
        const response = await postAPI(CAPABILITIES_API_URLS.GET_APPOINTMENTS, {
            upcoming: true,
            limit: limit,
        });
        if (response.statusCode === 200) {
            set_upcoming_appointments(response.data || []);
        }
        set_is_loading(false);
    };

    const get_appointment_details = async (appointment_id: string): Promise<Appointment | null> => {
        set_is_loading(true);
        const response = await postAPI(CAPABILITIES_API_URLS.GET_APPOINTMENT_DETAILS, {
            request_id: appointment_id,
        });
        set_is_loading(false);

        if (response.statusCode === 200) {
            return response.data;
        }
        return null;
    };

    const sync_appointment = async (appointment_details: Partial<Appointment>, is_delete: boolean = false, appointment_with: 'Provider' | 'Facility' = 'Provider') => {
        set_is_loading(true);
        
        try {
            // Get user info from auth store
            const authStore = useAuthStore.getState();
            const user = authStore.user;
            
            if (!user || !user.userData) {
                console.error('User not authenticated');
                set_is_loading(false);
                throw new Error('User not authenticated. Please log in to book an appointment.');
            }

            const userData = user.userData;
            const user_id = userData.user_id;
            const user_name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User';
            const user_phone = user.phoneNumber || userData.phone_number || '';
            const user_email = userData.email || '';
            const user_address = userData.address 
                ? `${userData.address.street || ''}, ${userData.address.city || ''}, ${userData.address.state || ''}`.trim()
                : '';
            const user_zipcode = userData.address?.zip_code || userData.zip_code || '';
            const user_insurance_details = userData.insurance_details || {};

            const response = await postAPI(CAPABILITIES_API_URLS.SYNC_APPOINTMENT, {
                is_delete,
                user_id,
                user_name,
                user_phone,
                user_email,
                user_address,
                user_zipcode,
                user_insurance_details,
                appointment_with_details: appointment_details,
                appointment_with,
            });

            if (response.statusCode === 200) {
                await fetch_appointments();
            } else {
                set_is_loading(false);
                throw new Error(response.message || 'Failed to create appointment request. Please try again.');
            }
            set_is_loading(false);
        } catch (error) {
            set_is_loading(false);
            throw error;
        }
    };

    const create_appointment = async (appointment_data: { appointment_details: Partial<Appointment>; appointment_with: 'Provider' | 'Facility' }) => {
        await sync_appointment(appointment_data.appointment_details, false, appointment_data.appointment_with);
    };

    const update_appointment = async (appointment_id: string, appointment_data: Partial<Appointment>) => {
        await sync_appointment({ appointment_id, ...appointment_data }, false);
    };

    const delete_appointment = async (appointment_id: string) => {
        await sync_appointment({ appointment_id }, true);
    };

    const cancel_appointment = async (appointment_id: string) => {
        await sync_appointment({ appointment_id, appointment_status: 'Cancelled' }, false);
    };

    // Helper functions to filter appointments by type
    const get_doctor_appointments = () => {
        return appointments.filter((appointment) => appointment.appointment_type === 'doctor' || !appointment.appointment_type);
    };

    const get_facility_appointments = () => {
        return appointments.filter((appointment) => appointment.appointment_type === 'facility');
    };

    const get_upcoming_doctor_appointments = () => {
        return upcoming_appointments.filter((appointment) => appointment.appointment_type === 'doctor' || !appointment.appointment_type);
    };

    const get_upcoming_facility_appointments = () => {
        return upcoming_appointments.filter((appointment) => appointment.appointment_type === 'facility');
    };

    return {
        appointments,
        upcoming_appointments,
        is_loading,
        fetch_appointments,
        fetch_upcoming_appointments,
        get_appointment_details,
        create_appointment,
        update_appointment,
        delete_appointment,
        sync_appointment,
        cancel_appointment,
        // Helper functions
        get_doctor_appointments,
        get_facility_appointments,
        get_upcoming_doctor_appointments,
        get_upcoming_facility_appointments,
    };
};

