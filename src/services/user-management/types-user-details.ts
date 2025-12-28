/**
 * User Details Interface matching CoreEngineUserWithConversations structure
 */
export interface UserDetails {
    user_id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip_code: string;
        country: string;
        coordinates: {
            lat: number | null;
            lng: number | null;
        };
    };
    insurance_details: {
        provider: string;
        policy_number: string;
        group_number: string;
        member_id: string;
        effective_date: string;
    };
    created_at: string;
    ssn: string;
    employee_id: string;
    user_phone_number: string;
    domain: string;
    conversations?: any[];
    requests?: any[];
}
