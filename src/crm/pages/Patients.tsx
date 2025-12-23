import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaComment, FaPhone, FaSearch, FaFilter, FaChevronDown, FaDownload, FaInfoCircle, FaRocket, FaSpinner } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Tag from '../components/ui/Tag';
import Statistic from '../components/ui/Statistic';
import { postAPI, CAPABILITIES_API_URLS } from '../../services/api';

interface Patient {
    id: string;
    name: string;
    age: number | null;
    status: 'Active' | 'Inactive';
    lastContact: string;
    contactMethod: 'Chat' | 'Call' | 'SMS';
    stage: 'Inquiry' | 'Onboarding' | 'Treatment' | 'Follow-up';
    interactions: number;
    adherence: number | null;
    identified: boolean;
    location: string;
    insuranceStatus: string;
}

interface CoreEngineUser {
    user_id: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    email: string;
    date_of_birth: string;
    address: {
        city: string;
        state: string;
    };
    insurance_details: {
        provider: string;
    };
    created_at: string;
}

export default function AllPatients() {
    const [searchText, setSearchText] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const primaryColor = '#0078D4';
    const secondaryColor = '#00B7C3';
    const tertiaryColor = '#83C995';

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            try {
                const response = await postAPI(CAPABILITIES_API_URLS.GET_CORE_ENGINE_USERS, {});
                if (response.statusCode === 200) {
                    const apiUsers: CoreEngineUser[] = response.data?.users || [];
                    
                    const mappedPatients: Patient[] = apiUsers.map(user => {
                        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                        const isIdentified = fullName.length > 0 && fullName !== 'Anonymous User';
                        
                        // Calculate age if date_of_birth exists
                        let age = null;
                        if (user.date_of_birth) {
                            const birthDate = new Date(user.date_of_birth);
                            const today = new Date();
                            age = today.getFullYear() - birthDate.getFullYear();
                            const m = today.getMonth() - birthDate.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                            }
                        }

                        return {
                            id: user.user_id,
                            name: isIdentified ? fullName : 'Anonymous User',
                            age: age,
                            status: 'Active', // Default to active
                            lastContact: new Date(user.created_at).toLocaleDateString(),
                            contactMethod: 'Chat', // Default
                            stage: 'Inquiry', // Default
                            interactions: 1, // Default
                            adherence: null,
                            identified: isIdentified,
                            location: user.address?.city ? `${user.address.city}, ${user.address.state || ''}` : 'Unknown',
                            insuranceStatus: user.insurance_details?.provider || 'Unknown',
                        };
                    });
                    
                    setPatients(mappedPatients);
                } else {
                    throw new Error(response.message || 'Failed to fetch patients');
                }
            } catch (err) {
                console.error('Error fetching patients:', err);
                setError(err instanceof Error ? err.message : 'Failed to load patients');
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const filteredPatients = useMemo(() => {
        if (!searchText) return patients;
        return patients.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()) || p.id.toLowerCase().includes(searchText.toLowerCase()));
    }, [searchText, patients]);

    const columns = [
        {
            title: 'Patient',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Patient) => (
                <Link to={`/crm/patients/${record.id}`} style={{ color: primaryColor }}>
                    <span className="flex items-center gap-2">
                        {text}
                        {!record.identified && (
                            <span className="text-gray-400" title="Anonymous User">
                                <FaInfoCircle />
                            </span>
                        )}
                    </span>
                </Link>
            ),
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            render: (age: number | null) => age || 'Unknown',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Badge status={status === 'Active' ? 'success' : 'default'} text={status} />,
        },
        {
            title: 'Last Contact',
            dataIndex: 'lastContact',
            key: 'lastContact',
        },
        {
            title: 'Method',
            dataIndex: 'contactMethod',
            key: 'contactMethod',
            render: (method: string) => {
                const icon = method === 'Chat' ? <FaComment style={{ color: primaryColor }} /> : method === 'Call' ? <FaPhone style={{ color: primaryColor }} /> : <FaComment style={{ color: primaryColor }} />;
                return (
                    <span className="flex items-center gap-2">
                        {icon} {method}
                    </span>
                );
            },
        },
        {
            title: 'Stage',
            dataIndex: 'stage',
            key: 'stage',
            render: (stage: string) => {
                let color = '';
                switch (stage) {
                    case 'Inquiry':
                        color = '#8c8c8c';
                        break;
                    case 'Onboarding':
                        color = primaryColor;
                        break;
                    case 'Treatment':
                        color = secondaryColor;
                        break;
                    case 'Follow-up':
                        color = tertiaryColor;
                        break;
                    default:
                        color = '#8c8c8c';
                }
                return <Tag color={color}>{stage}</Tag>;
            },
        },
        {
            title: 'Interactions',
            dataIndex: 'interactions',
            key: 'interactions',
        },
        {
            title: 'Adherence',
            dataIndex: 'adherence',
            key: 'adherence',
            render: (adherence: number | null) => {
                if (adherence === null) return 'N/A';

                let color = '';
                if (adherence >= 90) color = tertiaryColor;
                else if (adherence >= 70) color = secondaryColor;
                else color = '#f5222d';

                return <span style={{ color }}>{adherence}%</span>;
            },
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (location: string) => {
                if (location.startsWith('Est.')) {
                    return (
                        <span className="text-gray-500" title="Estimated from IP address">
                            {location} <FaInfoCircle className="inline text-xs" />
                        </span>
                    );
                }
                return location;
            },
        },
        {
            title: 'Insurance',
            dataIndex: 'insuranceStatus',
            key: 'insuranceStatus',
            render: (insurance: string) => {
                if (insurance.startsWith('Est.')) {
                    return (
                        <span className="text-gray-500" title="Estimated from conversation context">
                            {insurance} <FaInfoCircle className="inline text-xs" />
                        </span>
                    );
                }
                return insurance;
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Patient) => (
                <div className="flex gap-2">
                    <Link to={`/crm/patients/${record.id}/journey`}>
                        <Button type="primary" size="small" icon={<FaRocket />} className="bg-[#0078D4] border-[#0078D4]">
                            Journey
                        </Button>
                    </Link>
                    <Link to={`/crm/patients/${record.id}`}>
                        <Button type="link" className="p-0 text-[#0078D4]">
                            Details
                        </Button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <div className="p-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px]">
                        <FaSpinner className="animate-spin text-4xl text-[#0078D4] mb-4" />
                        <p className="text-gray-600">Loading patients...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <p className="text-red-600 mb-4">Error: {error}</p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                <Card className="rounded-lg">
                                    <Statistic title="Total Patients" value={patients.length} valueStyle={{ color: primaryColor }} />
                                    <div className="mt-2 text-sm text-gray-600">
                                        {patients.filter((p) => p.identified).length} identified, {patients.filter((p) => !p.identified).length} anonymous
                                    </div>
                                </Card>
                                <Card className="rounded-lg">
                                    <Statistic title="Active Patients" value={patients.filter((p) => p.status === 'Active').length} valueStyle={{ color: secondaryColor }} />
                                    <div className="mt-2 text-sm text-gray-600">{patients.length > 0 ? Math.round((patients.filter((p) => p.status === 'Active').length / patients.length) * 100) : 0}% of total</div>
                                </Card>
                                <Card className="rounded-lg">
                                    <Statistic title="Avg. Adherence" value={patients.filter((p) => p.adherence !== null).length > 0 ? Math.round(patients.filter((p) => p.adherence !== null).reduce((acc, p) => acc + (p.adherence || 0), 0) / patients.filter((p) => p.adherence !== null).length) : 0} suffix="%" valueStyle={{ color: tertiaryColor }} />
                                    <div className="mt-2 text-sm text-gray-600">Among identified patients</div>
                                </Card>
                                <Card className="rounded-lg">
                                    <Statistic title="Avg. Interactions" value={patients.length > 0 ? Math.round((patients.reduce((acc, p) => acc + p.interactions, 0) / patients.length) * 10) / 10 : 0} valueStyle={{ color: '#722ED1' }} />
                                    <div className="mt-2 text-sm text-gray-600">Per patient</div>
                                </Card>
                                <Card className="rounded-lg">
                                    <Statistic title="Anonymous to Identified Conversion" value={32} suffix="%" valueStyle={{ color: '#722ED1' }} />
                                    <div className="mt-2 text-sm text-gray-600">Last 30 days</div>
                                </Card>
                            </div>
                        </div>

                        <Card
                            title="All Patients"
                            extra={
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input type="text" placeholder="Search patients" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-[250px] focus:outline-none focus:ring-2 focus:ring-[#0078D4]" />
                                    </div>
                                    <Button icon={<FaFilter />} className="flex items-center gap-2">
                                        Filter
                                        <FaChevronDown />
                                    </Button>
                                    <Button icon={<FaDownload />}>Export</Button>
                                </div>
                            }
                            className="rounded-lg shadow-sm">
                            <Table dataSource={filteredPatients} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
                        </Card>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
