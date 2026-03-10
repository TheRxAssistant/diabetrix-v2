import { useState, useCallback, useRef } from 'react';
import { postAPI, CAPABILITIES_API_URLS } from '../api';
import { ApprovedRequest, GetAllApprovedRequestsResult } from './types-approved-requests';
import { useThemeConfig } from '../../hooks/useThemeConfig';
import { getDomain } from '../../config/theme-config';

export type MessageRole = 'user' | 'ai' | 'crm_agent';

export interface EscalatedMessage {
    message_id: string;
    role: MessageRole;
    message: string;
    created_at: string;
    created_by_name?: string;
}

export interface GetEscalatedRequestMessagesResult {
    messages: EscalatedMessage[];
    request_id: string;
}

export const useEscalatedChat = () => {
    const themeConfig = useThemeConfig();
    const [escalated_requests, set_escalated_requests] = useState<ApprovedRequest[]>([]);
    const [selected_request, set_selected_request] = useState<ApprovedRequest | null>(null);
    const [messages, set_messages] = useState<EscalatedMessage[]>([]);
    const [is_loading_requests, set_is_loading_requests] = useState(false);
    const [is_loading_messages, set_is_loading_messages] = useState(false);
    const [is_sending, set_is_sending] = useState(false);
    const [requests_error, set_requests_error] = useState<string | null>(null);
    const [messages_error, set_messages_error] = useState<string | null>(null);
    const polling_interval_ref = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetch_escalated_requests = useCallback(async (request_status?: number | string) => {
        set_is_loading_requests(true);
        set_requests_error(null);

        try {
            const domain = getDomain(themeConfig);
            const request_params: Record<string, any> = {
                task_type_name: 'user_query',
                domain,
                limit: 100,
                offset: 0,
            };

            // Only include request_status if provided
            if (request_status !== undefined && request_status !== null) {
                request_params.request_status = request_status;
                // When filtering by status, don't filter by is_assigned_to_human
                // (completed requests have is_assigned_to_human: false)
            }
            // When no request_status is provided (user selected "All"), return all requests
            // without filtering by is_assigned_to_human or request_status

            const response = await postAPI(CAPABILITIES_API_URLS.GET_APPROVED_REQUESTS, request_params);

            if (response.statusCode === 200 && response.data) {
                const result = response.data as GetAllApprovedRequestsResult;
                set_escalated_requests(result.approved_requests || []);
            } else {
                set_requests_error(response.message || 'Failed to fetch escalated requests');
            }
        } catch (err) {
            set_requests_error(err instanceof Error ? err.message : 'Failed to load escalated requests');
        } finally {
            set_is_loading_requests(false);
        }
    }, [themeConfig]);

    const fetch_request_messages = useCallback(async (request_id: string) => {
        set_is_loading_messages(true);
        set_messages_error(null);

        try {
            const response = await postAPI(CAPABILITIES_API_URLS.GET_ESCALATED_REQUEST_MESSAGES, { request_id });

            if (response.statusCode === 200 && response.data) {
                const result = response.data as GetEscalatedRequestMessagesResult;
                set_messages(result.messages || []);
            } else {
                set_messages_error(response.message || 'Failed to fetch messages');
            }
        } catch (err) {
            set_messages_error(err instanceof Error ? err.message : 'Failed to load messages');
        } finally {
            set_is_loading_messages(false);
        }
    }, []);

    const send_crm_reply = useCallback(async (request_id: string, message: string): Promise<boolean> => {
        set_is_sending(true);

        // Optimistic update
        const optimistic_message: EscalatedMessage = {
            message_id: `optimistic-${Date.now()}`,
            role: 'crm_agent',
            message,
            created_at: new Date().toISOString(),
        };
        set_messages((prev) => [...prev, optimistic_message]);

        try {
            const response = await postAPI(CAPABILITIES_API_URLS.SEND_SMS_TO_USER, { request_id, message });

            if (response.statusCode === 200) {
                // Replace optimistic message with the real one from server
                await fetch_request_messages(request_id);
                return true;
            } else {
                // Roll back optimistic update on failure
                set_messages((prev) => prev.filter((m) => m.message_id !== optimistic_message.message_id));
                return false;
            }
        } catch {
            set_messages((prev) => prev.filter((m) => m.message_id !== optimistic_message.message_id));
            return false;
        } finally {
            set_is_sending(false);
        }
    }, [fetch_request_messages]);

    const start_polling = useCallback((request_id: string, interval_ms = 15000) => {
        stop_polling();
        polling_interval_ref.current = setInterval(() => {
            fetch_request_messages(request_id);
        }, interval_ms);
    }, [fetch_request_messages]);

    const stop_polling = useCallback(() => {
        if (polling_interval_ref.current) {
            clearInterval(polling_interval_ref.current);
            polling_interval_ref.current = null;
        }
    }, []);

    const select_request = useCallback(async (request: ApprovedRequest) => {
        set_selected_request(request);
        set_messages([]);
        stop_polling();
        await fetch_request_messages(request.request_id);
        start_polling(request.request_id);
    }, [fetch_request_messages, start_polling, stop_polling]);

    const clear_selected_request = useCallback(() => {
        set_selected_request(null);
        set_messages([]);
        stop_polling();
    }, [stop_polling]);

    return {
        escalated_requests,
        selected_request,
        messages,
        is_loading_requests,
        is_loading_messages,
        is_sending,
        requests_error,
        messages_error,
        fetch_escalated_requests,
        fetch_request_messages,
        send_crm_reply,
        select_request,
        clear_selected_request,
        stop_polling,
    };
};
