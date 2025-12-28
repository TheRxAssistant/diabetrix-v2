export interface ApprovedRequest {
    request_id: string;
    created_at: string;
    created_by?: string;
    created_by_name?: string;
    task_id?: string;
    task_type_id?: number;
    task_type_name?: string;
    is_source_request: boolean;
    source_request_id?: string;
    request_name: string;
    request_instructions?: string;
    request_json?: Record<string, any>;
    request_details: string;
    phone_number_to_be_called?: string;
    request_trigger_time?: string;
    request_status: number;
    request_status_name: string;
    request_error?: string;
    request_notes?: string;
    user_id?: string;
    user_name?: string;
    user_phone?: string;
    domain?: string;
}

export interface GetAllApprovedRequestsResult {
    approved_requests: ApprovedRequest[];
    total_count: number;
}
