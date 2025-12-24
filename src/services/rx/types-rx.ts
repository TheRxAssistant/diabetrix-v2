export interface RxRequestCopayCard {
    request_id: string;
    domain: string;
    user_id?: string;
    user_name: string;
    user_phone: string;
    user_email: string;
    user_address: string;
    user_zipcode: string;
    drug_brand_name: string;
    request_status?: 'Requested' | 'In Progress' | 'Completed' | 'Failed';
    followup_conversation_summary?: string;
    followup_status?: 'Call Placed' | 'Call Attempted' | 'Call Failed' | 'Call Completed' | 'Call Missed';
    followup_conversation_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface RxRequestInsuranceCost {
    request_id: string;
    domain: string;
    user_id?: string;
    user_name: string;
    user_phone: string;
    user_email: string;
    user_address: string;
    user_zipcode: string;
    drug_brand_name: string;
    user_insurance_details?: any;
    request_status?: 'Requested' | 'In Progress' | 'Completed' | 'Failed';
    followup_conversation_summary?: string;
    followup_status?: 'Call Placed' | 'Call Attempted' | 'Call Failed' | 'Call Completed' | 'Call Missed';
    followup_conversation_id?: string;
    created_at?: string;
    updated_at?: string;
}

