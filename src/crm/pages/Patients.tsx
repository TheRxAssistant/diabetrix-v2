import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaComment, FaPhone, FaSearch, FaFilter, FaChevronDown, FaDownload, FaInfoCircle, FaRocket } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Tag from '../components/ui/Tag';
import Statistic from '../components/ui/Statistic';

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

export default function AllPatients() {
    const [searchText, setSearchText] = useState('');

    const primaryColor = '#0078D4';
    const secondaryColor = '#00B7C3';
    const tertiaryColor = '#83C995';

    const patients: Patient[] = [
        {
            id: '1',
            name: 'John Smith',
            age: 58,
            status: 'Active',
            lastContact: '10/15/2023',
            contactMethod: 'Chat',
            stage: 'Onboarding',
            interactions: 12,
            adherence: 85,
            identified: true,
            location: 'New York, NY',
            insuranceStatus: 'Commercial',
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            age: 62,
            status: 'Active',
            lastContact: '10/14/2023',
            contactMethod: 'Call',
            stage: 'Treatment',
            interactions: 8,
            adherence: 92,
            identified: true,
            location: 'Chicago, IL',
            insuranceStatus: 'Medicare',
        },
        {
            id: '3',
            name: 'Michael Brown',
            age: 55,
            status: 'Inactive',
            lastContact: '10/10/2023',
            contactMethod: 'SMS',
            stage: 'Follow-up',
            interactions: 15,
            adherence: 68,
            identified: true,
            location: 'Los Angeles, CA',
            insuranceStatus: 'Commercial',
        },
        {
            id: '4',
            name: 'Anonymous User',
            age: null,
            status: 'Active',
            lastContact: '10/16/2023',
            contactMethod: 'Chat',
            stage: 'Inquiry',
            interactions: 2,
            adherence: null,
            identified: false,
            location: 'Est. New York, NY',
            insuranceStatus: 'Est. Commercial',
        },
        {
            id: '5',
            name: 'Anonymous User',
            age: null,
            status: 'Active',
            lastContact: '10/15/2023',
            contactMethod: 'Chat',
            stage: 'Inquiry',
            interactions: 1,
            adherence: null,
            identified: false,
            location: 'Est. Chicago, IL',
            insuranceStatus: 'Est. Medicare',
        },
        {
            id: '6',
            name: 'Emily Wilson',
            age: 42,
            status: 'Active',
            lastContact: '10/13/2023',
            contactMethod: 'Call',
            stage: 'Treatment',
            interactions: 6,
            adherence: 90,
            identified: true,
            location: 'Boston, MA',
            insuranceStatus: 'Commercial',
        },
        {
            id: '7',
            name: 'Robert Davis',
            age: 67,
            status: 'Active',
            lastContact: '10/12/2023',
            contactMethod: 'SMS',
            stage: 'Follow-up',
            interactions: 9,
            adherence: 95,
            identified: true,
            location: 'Miami, FL',
            insuranceStatus: 'Medicare',
        },
        {
            id: '8',
            name: 'Anonymous User',
            age: null,
            status: 'Inactive',
            lastContact: '10/09/2023',
            contactMethod: 'Chat',
            stage: 'Inquiry',
            interactions: 1,
            adherence: null,
            identified: false,
            location: 'Est. Dallas, TX',
            insuranceStatus: 'Est. Medicaid',
        },
    ];

    const filteredPatients = useMemo(() => {
        if (!searchText) return patients;
        return patients.filter((p) => p.name.toLowerCase().includes(searchText.toLowerCase()));
    }, [searchText]);

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
                            <div className="mt-2 text-sm text-gray-600">{Math.round((patients.filter((p) => p.status === 'Active').length / patients.length) * 100)}% of total</div>
                        </Card>
                        <Card className="rounded-lg">
                            <Statistic title="Avg. Adherence" value={Math.round(patients.filter((p) => p.adherence !== null).reduce((acc, p) => acc + (p.adherence || 0), 0) / patients.filter((p) => p.adherence !== null).length)} suffix="%" valueStyle={{ color: tertiaryColor }} />
                            <div className="mt-2 text-sm text-gray-600">Among identified patients</div>
                        </Card>
                        <Card className="rounded-lg">
                            <Statistic title="Avg. Interactions" value={Math.round((patients.reduce((acc, p) => acc + p.interactions, 0) / patients.length) * 10) / 10} valueStyle={{ color: '#722ED1' }} />
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
            </div>
        </DashboardLayout>
    );
}
