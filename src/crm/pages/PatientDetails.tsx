import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaComment, FaFile, FaShieldAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaIdCard } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import Table from '../components/ui/Table';
import Avatar from '../components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';

interface Conversation {
    id: string;
    created_at: string;
    channel: 'chat' | 'text' | 'voice' | 'email' | 'sms';
    domain: string;
    title?: string;
    summary_text?: string;
    conversation_id: string;
}

interface Request {
    id: string;
    created_at: string;
    request_type: string;
    status: 'pending' | 'approved' | 'denied' | 'completed' | 'in_progress';
    description: string;
    request_id: string;
}

interface PatientDetails {
    id: string;
    name: string;
    age: number | null;
    phone: string | null;
    email: string | null;
    location: string;
    dateOfBirth: string | null;
    insurance: {
        provider: string;
        policyNumber?: string;
        groupNumber?: string;
        memberId?: string;
        effectiveDate?: string;
        planName?: string;
    };
    status: 'Active' | 'Inactive';
    conversations: Conversation[];
    requests: Request[];
}

const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
};

const getChannelColor = (channel: string): string => {
    const colors: Record<string, string> = {
        text: 'bg-blue-100 text-blue-800',
        voice: 'bg-green-100 text-green-800',
        video: 'bg-purple-100 text-purple-800',
        chat: 'bg-cyan-100 text-cyan-800',
        email: 'bg-orange-100 text-orange-800',
        sms: 'bg-yellow-100 text-yellow-800',
    };
    return colors[channel] || 'bg-gray-100 text-gray-800';
};

const getRequestTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
        Appointment: 'bg-blue-100 text-blue-800',
        'Insurance Cost': 'bg-green-100 text-green-800',
        'Copay Card': 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
};

const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        denied: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-orange-100 text-orange-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export default function PatientDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const primaryColor = '#0078D4';
    const secondaryColor = '#00B7C3';
    const tertiaryColor = '#83C995';

    // Mock data - in a real app, this would come from an API
    const patientData: PatientDetails = useMemo(() => {
        const patientId = id || '1';
        const basePatient = {
            id: patientId,
            name: patientId === '1' ? 'John Smith' : patientId === '4' ? 'Anonymous User' : 'Sarah Johnson',
            age: patientId === '4' ? null : patientId === '1' ? 58 : 62,
            phone: patientId === '4' ? null : patientId === '1' ? '+1 (555) 123-4567' : '+1 (555) 987-6543',
            email: patientId === '4' ? null : patientId === '1' ? 'john.smith@example.com' : 'sarah.johnson@example.com',
            location: patientId === '4' ? 'Unknown' : patientId === '1' ? 'New York, NY' : 'Chicago, IL',
            dateOfBirth: patientId === '4' ? null : patientId === '1' ? '1965-03-15' : '1961-08-22',
            insurance: {
                provider: patientId === '4' ? 'Unknown' : patientId === '1' ? 'Commercial' : 'Medicare',
                policyNumber: patientId === '4' ? undefined : 'POL-123456',
                groupNumber: patientId === '4' ? undefined : 'GRP-789',
                memberId: patientId === '4' ? undefined : 'MEM-456789',
                effectiveDate: patientId === '4' ? undefined : '2023-01-01',
                planName: patientId === '4' ? undefined : 'Premium Health Plan',
            },
            status: 'Active' as const,
            conversations: [
                {
                    id: '1',
                    created_at: '2025-01-15T10:20:00Z',
                    channel: 'chat' as const,
                    domain: 'diabetrix',
                    title: 'Finding endocrinologist',
                    summary_text: 'Patient discussed finding an endocrinologist near them',
                    conversation_id: 'conv-12345678',
                },
                {
                    id: '2',
                    created_at: '2025-01-18T14:00:00Z',
                    channel: 'voice' as const,
                    domain: 'diabetrix',
                    title: 'Voice check in',
                    summary_text: 'Appointment confirmation call',
                    conversation_id: 'conv-12345679',
                },
            ],
            requests: [
                {
                    id: '1',
                    created_at: '2025-01-15T10:25:00Z',
                    request_type: 'Appointment',
                    status: 'approved' as const,
                    description: 'Schedule appointment with Dr. Robert Chen',
                    request_id: 'req-12345678',
                },
                {
                    id: '2',
                    created_at: '2025-02-06T10:30:00Z',
                    request_type: 'Insurance Cost',
                    status: 'completed' as const,
                    description: 'Benefits check for Diabetrix 500mg',
                    request_id: 'req-12345679',
                },
            ],
        };
        return basePatient;
    }, [id]);

    const conversationColumns = [
        {
            title: 'Date & Time',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value: string) => <div className="font-medium">{formatDate(value)}</div>,
        },
        {
            title: 'Channel',
            dataIndex: 'channel',
            key: 'channel',
            render: (channel: string) => <Badge className={`${getChannelColor(channel)} capitalize`}>{channel}</Badge>,
        },
        {
            title: 'Domain',
            dataIndex: 'domain',
            key: 'domain',
            render: (domain: string) => <div className="text-gray-600">{domain}</div>,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title: string) => <div className="max-w-md truncate">{title || 'No title'}</div>,
        },
        {
            title: 'Summary',
            dataIndex: 'summary_text',
            key: 'summary_text',
            render: (summary: string) => <div className="max-w-md truncate">{summary || 'No summary available'}</div>,
        },
        {
            title: 'ID',
            dataIndex: 'conversation_id',
            key: 'conversation_id',
            render: (convId: string) => <div className="text-xs font-mono text-gray-500">{convId.slice(0, 8)}...</div>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Conversation) => (
                <Button type="default" size="small" onClick={() => navigate(`/crm/patients/${id}/journey`)}>
                    View Details
                </Button>
            ),
        },
    ];

    const requestColumns = [
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (value: string) => <div className="font-medium">{formatDate(value)}</div>,
        },
        {
            title: 'Type',
            dataIndex: 'request_type',
            key: 'request_type',
            render: (type: string) => <Badge className={`${getRequestTypeColor(type)} capitalize`}>{type.replace('_', ' ')}</Badge>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Badge className={`${getStatusColor(status)} capitalize`}>{status.replace('_', ' ')}</Badge>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (description: string) => <div className="max-w-md truncate">{description}</div>,
        },
        {
            title: 'ID',
            dataIndex: 'request_id',
            key: 'request_id',
            render: (reqId: string) => (
                <button onClick={() => window.open(`${window.location.origin}/crm/patients/${id}`, '_blank', 'noopener,noreferrer')} className="text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                    {reqId.slice(0, 8)}...
                </button>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <div className="p-6 bg-gray-50 min-h-screen overflow-x-hidden">
                {/* Header */}
                <div className="mb-5">
                    <Link to="/crm/patients">
                        <Button type="link" icon={<FaArrowLeft />} className="pl-0 mb-3 text-sm h-auto text-[#0078D4]">
                            Back to Patients
                        </Button>
                    </Link>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-5 min-w-0">
                            <Avatar size={60} icon={<FaUser />} className="shadow-lg flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                            <div className="min-w-0">
                                <h2 className="text-2xl font-bold m-0 text-gray-900 break-words">{patientData.name}</h2>
                                <div className="flex items-center gap-2 mt-1.5 text-sm">
                                    <span className="text-gray-600 font-medium break-words">{patientData.location}</span>
                                    <span className="text-gray-300 flex-shrink-0">•</span>
                                    <span className="text-gray-600 font-medium break-words">{patientData.insurance.provider}</span>
                                </div>
                            </div>
                        </div>
                        <Badge status={patientData.status === 'Active' ? 'success' : 'default'} text={<span className="text-sm font-semibold">{patientData.status}</span>} />
                    </div>
                </div>

                {/* Patient Info Card */}
                <Card className="rounded-2xl shadow-lg border border-gray-200 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                                    <FaPhone className="text-xs" />
                                    Phone
                                </p>
                                <p className="text-sm text-gray-900">{patientData.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                                    <FaEnvelope className="text-xs" />
                                    Email
                                </p>
                                <p className="text-sm text-gray-900">{patientData.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-xs" />
                                    Location
                                </p>
                                <p className="text-sm text-gray-900">{patientData.location || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                                    <FaBirthdayCake className="text-xs" />
                                    Date of Birth
                                </p>
                                <p className="text-sm text-gray-900">{patientData.dateOfBirth ? formatDate(patientData.dateOfBirth) : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                                    <FaShieldAlt className="text-xs" />
                                    Insurance Provider
                                </p>
                                <p className="text-sm text-gray-900">{patientData.insurance.provider || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                                    <FaIdCard className="text-xs" />
                                    Patient ID
                                </p>
                                <p className="text-xs font-mono text-gray-900">{patientData.id}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Insurance Details Card */}
                {patientData.insurance && patientData.insurance.provider !== 'Unknown' && (
                    <Card className="rounded-2xl shadow-lg border border-gray-200 mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <FaShieldAlt className="h-5 w-5 text-[#0078D4]" />
                                <h3 className="text-lg font-semibold text-gray-900">Insurance Information</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500">Provider</p>
                                    <p className="text-sm text-gray-900">{patientData.insurance.provider || 'N/A'}</p>
                                </div>
                                {patientData.insurance.policyNumber && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Policy Number</p>
                                        <p className="text-sm font-mono text-gray-900">{patientData.insurance.policyNumber}</p>
                                    </div>
                                )}
                                {patientData.insurance.groupNumber && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Group Number</p>
                                        <p className="text-sm font-mono text-gray-900">{patientData.insurance.groupNumber}</p>
                                    </div>
                                )}
                                {patientData.insurance.memberId && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Member ID</p>
                                        <p className="text-sm font-mono text-gray-900">{patientData.insurance.memberId}</p>
                                    </div>
                                )}
                                {patientData.insurance.effectiveDate && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Effective Date</p>
                                        <p className="text-sm text-gray-900">{formatDate(patientData.insurance.effectiveDate)}</p>
                                    </div>
                                )}
                                {patientData.insurance.planName && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Plan Name</p>
                                        <p className="text-sm font-mono text-gray-900">{patientData.insurance.planName}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Tabs for Conversations and Requests */}
                <Tabs defaultValue="conversations" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="conversations" className="flex items-center gap-2">
                            <FaComment className="h-4 w-4" />
                            Conversations ({patientData.conversations?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="flex items-center gap-2">
                            <FaFile className="h-4 w-4" />
                            Requests ({patientData.requests?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="conversations" className="space-y-4">
                        <Card className="rounded-2xl shadow-lg border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <FaComment className="h-5 w-5 text-[#0078D4]" />
                                    <h3 className="text-lg font-semibold text-gray-900">Conversation History</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                {patientData.conversations && patientData.conversations.length > 0 ? (
                                    <Table dataSource={patientData.conversations} columns={conversationColumns} rowKey="id" pagination={{ pageSize: 10 }} />
                                ) : (
                                    <div className="text-center py-8">
                                        <FaComment className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600">No conversations found for this patient</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-4">
                        <Card className="rounded-2xl shadow-lg border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <FaFile className="h-5 w-5 text-[#0078D4]" />
                                    <h3 className="text-lg font-semibold text-gray-900">Request History</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                {patientData.requests && patientData.requests.length > 0 ? (
                                    <Table dataSource={patientData.requests} columns={requestColumns} rowKey="id" pagination={{ pageSize: 10 }} />
                                ) : (
                                    <div className="text-center py-8">
                                        <FaFile className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600">No requests found for this patient</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
