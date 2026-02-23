import React, { useState, useMemo, useEffect } from 'react';
import { FaExclamationTriangle, FaSearch, FaSpinner, FaComment, FaClock } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SmsModal from '../components/SmsModal';
import { postAPI, CAPABILITIES_API_URLS } from '../../services/api';
import { useDomainPrefix } from '../../hooks/useDomainPrefix';
import { useThemeConfig } from '../../hooks/useThemeConfig';
import { getDomain } from '../../config/theme-config';

interface EscalatedRequest {
    request_id: string;
    request_name: string;
    request_details: string;
    user_id?: string;
    user_name?: string;
    user_phone?: string;
    created_at: string;
    request_status: number;
    request_status_name: string;
    request_json?: Record<string, any>;
    domain?: string;
}

export default function EscalatedRequests() {
    const domainPrefix = useDomainPrefix();
    const themeConfig = useThemeConfig();
    const [searchText, setSearchText] = useState('');
    const [requests, setRequests] = useState<EscalatedRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<EscalatedRequest | null>(null);
    const [smsModalOpen, setSmsModalOpen] = useState(false);

    const primaryColor = '#0078D4';

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            setError(null);
            try {
                const domain = getDomain(themeConfig);
                const response = await postAPI(CAPABILITIES_API_URLS.GET_APPROVED_REQUESTS, {
                    task_type_name: 'user_query',
                    is_assigned_to_human: true,
                    request_status: 1, // Requested status
                    domain,
                    limit: 100,
                    offset: 0,
                });

                if (response.statusCode === 200 && response.data) {
                    const result = response.data as { approved_requests: EscalatedRequest[]; total_count: number };
                    setRequests(result.approved_requests || []);
                } else {
                    throw new Error(response.message || 'Failed to fetch escalated requests');
                }
            } catch (err) {
                console.error('Error fetching escalated requests:', err);
                setError(err instanceof Error ? err.message : 'Failed to load escalated requests');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [themeConfig]);

    const filteredRequests = useMemo(() => {
        if (!searchText) return requests;
        const searchLower = searchText.toLowerCase();
        return requests.filter(
            (r) =>
                r.request_details.toLowerCase().includes(searchLower) ||
                r.request_name.toLowerCase().includes(searchLower) ||
                (r.user_name && r.user_name.toLowerCase().includes(searchLower)) ||
                (r.user_phone && r.user_phone.includes(searchText))
        );
    }, [searchText, requests]);

    const handleSendSms = async (message: string) => {
        if (!selectedRequest) return;

        const domain = getDomain(themeConfig);
        const response = await postAPI(CAPABILITIES_API_URLS.SEND_SMS_TO_USER, {
            request_id: selectedRequest.request_id,
            message,
        });

        if (response.statusCode !== 200) {
            throw new Error(response.message || 'Failed to send SMS');
        }

        // Refresh requests after sending SMS
        const refreshResponse = await postAPI(CAPABILITIES_API_URLS.GET_APPROVED_REQUESTS, {
            task_type_name: 'user_query',
            is_assigned_to_human: true,
            request_status: 1,
            domain,
            limit: 100,
            offset: 0,
        });

        if (refreshResponse.statusCode === 200 && refreshResponse.data) {
            const result = refreshResponse.data as { approved_requests: EscalatedRequest[]; total_count: number };
            setRequests(result.approved_requests || []);
        }
    };

    const getPhoneNumber = (request: EscalatedRequest): string => {
        // Try to get phone from request_json first
        if (request.request_json?.user_phone_number) {
            return request.request_json.user_phone_number;
        }
        // Fallback to user_phone
        return request.user_phone || 'N/A';
    };

    const getUserName = (request: EscalatedRequest): string => {
        return request.user_name || 'Anonymous User';
    };

    const getEscalationReason = (request: EscalatedRequest): string => {
        if (request.request_json?.escalation_reason) {
            return request.request_json.escalation_reason;
        }
        return 'No reason provided';
    };

    const columns = [
        {
            title: 'Request ID',
            key: 'request_id',
            render: (_: any, record: EscalatedRequest) => (
                <span className="font-mono text-xs">{record.request_id.substring(0, 8)}...</span>
            ),
        },
        {
            title: 'User',
            key: 'user',
            render: (_: any, record: EscalatedRequest) => (
                <div>
                    <div className="font-medium">{getUserName(record)}</div>
                    <div className="text-sm text-gray-500">{getPhoneNumber(record)}</div>
                </div>
            ),
        },
        {
            title: 'Query',
            key: 'query',
            render: (_: any, record: EscalatedRequest) => (
                <div className="max-w-md">
                    <div className="text-sm font-medium mb-1">{record.request_name}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{record.request_details}</div>
                </div>
            ),
        },
        {
            title: 'Escalation Reason',
            key: 'reason',
            render: (_: any, record: EscalatedRequest) => (
                <div className="max-w-xs text-sm text-gray-700">{getEscalationReason(record)}</div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_: any, record: EscalatedRequest) => (
                <Badge status={record.request_status_name === 'Requested' ? 'warning' : 'default'} text={record.request_status_name} />
            ),
        },
        {
            title: 'Created',
            key: 'created',
            render: (_: any, record: EscalatedRequest) => (
                <div className="text-sm">
                    <div>{new Date(record.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(record.created_at).toLocaleTimeString()}</div>
                </div>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: EscalatedRequest) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<FaComment />}
                    className="bg-[#0078D4] border-[#0078D4]"
                    onClick={() => {
                        setSelectedRequest(record);
                        setSmsModalOpen(true);
                    }}
                >
                    Send SMS
                </Button>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <div className="p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <FaSpinner className="animate-spin text-4xl text-[#0078D4] mb-4" />
                        <p className="text-gray-600">Loading escalated requests...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
                        <p className="text-red-600 mb-4">Error: {error}</p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaExclamationTriangle className="text-2xl text-orange-500" />
                                <h2 className="text-2xl font-bold">Escalated Requests</h2>
                            </div>
                            <p className="text-gray-600 mb-4">
                                User queries that have been escalated to human agents for assistance. You can respond to users via SMS.
                            </p>
                        </div>

                        <Card
                            title={`Escalated Requests (${filteredRequests.length})`}
                            extra={
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search requests..."
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-[250px] focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                                        />
                                    </div>
                                </div>
                            }
                            className="rounded-lg shadow-sm"
                        >
                            {filteredRequests.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <FaClock className="text-4xl mb-4 mx-auto opacity-50" />
                                    <p>No escalated requests found</p>
                                </div>
                            ) : (
                                <Table dataSource={filteredRequests} columns={columns} rowKey="request_id" pagination={{ pageSize: 10 }} />
                            )}
                        </Card>
                    </>
                )}

                <SmsModal
                    isOpen={smsModalOpen}
                    onClose={() => {
                        setSmsModalOpen(false);
                        setSelectedRequest(null);
                    }}
                    onSend={handleSendSms}
                    phoneNumber={selectedRequest ? getPhoneNumber(selectedRequest) : undefined}
                    userName={selectedRequest ? getUserName(selectedRequest) : undefined}
                />
            </div>
        </DashboardLayout>
    );
}
