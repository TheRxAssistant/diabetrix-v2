import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaComment, FaFile, FaShieldAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaIdCard, FaSpinner } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import Table from '../components/ui/Table';
import Avatar from '../components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { postAPI, CAPABILITIES_API_URLS } from '../../services/api';

interface Conversation {
    conversation_id: string;
    created_at: string;
    channel: 'chat' | 'text' | 'voice' | 'email' | 'sms';
    domain: string;
    title?: string;
    summary_text?: string;
}

interface Request {
    request_id: string;
    created_at: string;
    request_type: string;
    status: 'pending' | 'approved' | 'denied' | 'completed' | 'in_progress' | string;
    description: string;
}

interface PatientDetails {
    user_id: string;
    first_name: string;
    last_name: string;
    name: string;
    age: number | null;
    phone_number: string | null;
    email: string | null;
    address: {
        city: string;
        state: string;
        street: string;
        zip_code: string;
    };
    location: string;
    date_of_birth: string | null;
    insurance_details: {
        provider: string;
        policy_number?: string;
        group_number?: string;
        member_id?: string;
        effective_date?: string;
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
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export default function PatientDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patientData, setPatientData] = useState<PatientDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const primaryColor = '#0078D4';
    const secondaryColor = '#00B7C3';
    const tertiaryColor = '#83C995';

    useEffect(() => {
        const fetchPatientDetails = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await postAPI(CAPABILITIES_API_URLS.GET_CORE_ENGINE_USER_DETAILS, { user_id: id });
                if (response.statusCode === 200) {
                    const data = response.data;
                    const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Anonymous User';
                    
                    // Calculate age
                    let age = null;
                    if (data.date_of_birth) {
                        const birthDate = new Date(data.date_of_birth);
                        const today = new Date();
                        age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                    }

                    setPatientData({
                        ...data,
                        name: fullName,
                        age,
                        location: data.address?.city ? `${data.address.city}, ${data.address.state || ''}` : 'Unknown',
                        status: 'Active',
                        conversations: data.conversations || [],
                        requests: data.requests || [],
                    });
                } else {
                    throw new Error(response.message || 'Failed to fetch patient details');
                }
            } catch (err) {
                console.error('Error fetching patient details:', err);
                setError(err instanceof Error ? err.message : 'Failed to load patient details');
            } finally {
                setLoading(false);
            }
        };

        fetchPatientDetails();
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
            render: (convId: string) => <div className="text-xs font-mono text-gray-500">{convId?.slice(0, 8)}...</div>,
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
                    {reqId?.slice(0, 8)}...
                </button>
            ),
        },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                    <FaSpinner className="animate-spin text-4xl text-[#0078D4] mb-4" />
                    <p className="text-gray-600">Loading patient details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !patientData) {
        return (
            <DashboardLayout>
                <div className="p-6 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
                    <p className="text-red-600 mb-4">Error: {error || 'Patient not found'}</p>
                    <Button onClick={() => navigate('/crm/patients')}>Back to Patients</Button>
                </div>
            </DashboardLayout>
        );
    }

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
                                    <span className="text-gray-600 font-medium break-words">{patientData.insurance_details.provider}</span>
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
                                <p className="text-sm text-gray-900">{patientData.phone_number || 'N/A'}</p>
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
                                <p className="text-sm text-gray-900">{patientData.date_of_birth ? formatDate(patientData.date_of_birth) : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                                    <FaShieldAlt className="text-xs" />
                                    Insurance Provider
                                </p>
                                <p className="text-sm text-gray-900">{patientData.insurance_details.provider || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                                    <FaIdCard className="text-xs" />
                                    Patient ID
                                </p>
                                <p className="text-xs font-mono text-gray-900">{patientData.user_id}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Insurance Details Card */}
                {patientData.insurance_details && patientData.insurance_details.provider !== 'Unknown' && (
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
                                    <p className="text-sm text-gray-900">{patientData.insurance_details.provider || 'N/A'}</p>
                                </div>
                                {patientData.insurance_details.policy_number && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Policy Number</p>
                                        <p className="text-sm font-mono text-gray-900">{patientData.insurance_details.policy_number}</p>
                                    </div>
                                )}
                                {patientData.insurance_details.group_number && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Group Number</p>
                                        <p className="text-sm font-mono text-gray-900">{patientData.insurance_details.group_number}</p>
                                    </div>
                                )}
                                {patientData.insurance_details.member_id && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Member ID</p>
                                        <p className="text-sm font-mono text-gray-900">{patientData.insurance_details.member_id}</p>
                                    </div>
                                )}
                                {patientData.insurance_details.effective_date && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-500">Effective Date</p>
                                        <p className="text-sm text-gray-900">{formatDate(patientData.insurance_details.effective_date)}</p>
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
                                    <Table dataSource={patientData.conversations} columns={conversationColumns} rowKey="conversation_id" pagination={{ pageSize: 10 }} />
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
                                    <Table dataSource={patientData.requests} columns={requestColumns} rowKey="request_id" pagination={{ pageSize: 10 }} />
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
