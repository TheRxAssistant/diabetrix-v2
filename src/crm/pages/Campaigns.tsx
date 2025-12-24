import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaGoogle, FaShoppingCart, FaRobot, FaPills, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import Progress from '../components/ui/Progress';
import Statistic from '../components/ui/Statistic';
import Select from '../components/ui/Select';

interface Campaign {
    id: string;
    name: string;
    platform: 'meta' | 'google';
    adType: 'find_doctor' | 'market_access' | 'awareness' | 'education';
    status: 'active' | 'paused' | 'completed';
    startDate: string;
    endDate?: string;
    budget: number;
    spent: number;
    adClicks: number;
    engagements: number;
    qualifications: number;
    filled: number;
    conversionRate: number;
    cpc: number;
    cpf: number;
}

export default function CampaignsPage() {
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [selectedAdType, setSelectedAdType] = useState<string>('all');

    const primaryColor = '#0078D4';
    const secondaryColor = '#00B7C3';
    const tertiaryColor = '#83C995';
    const warningColor = '#faad14';
    const dangerColor = '#f5222d';
    const metaBlue = '#4267B2';
    const googleBlue = '#4285F4';

    const campaigns: Campaign[] = [
        {
            id: 'META-FD-2023-Q3',
            name: 'Find Doctor Q3 2023',
            platform: 'meta',
            adType: 'find_doctor',
            status: 'active',
            startDate: '2023-07-01',
            budget: 50000,
            spent: 32500,
            adClicks: 8234,
            engagements: 4567,
            qualifications: 1234,
            filled: 567,
            conversionRate: 55.5,
            cpc: 3.95,
            cpf: 57.3,
        },
        {
            id: 'GOOGLE-MA-2023-Q4',
            name: 'Market Access Q4 2023',
            platform: 'google',
            adType: 'market_access',
            status: 'active',
            startDate: '2023-10-01',
            budget: 75000,
            spent: 28900,
            adClicks: 5234,
            engagements: 2890,
            qualifications: 890,
            filled: 234,
            conversionRate: 55.2,
            cpc: 5.52,
            cpf: 123.5,
        },
        {
            id: 'META-EDU-2023-Q3',
            name: 'Education Q3 2023',
            platform: 'meta',
            adType: 'education',
            status: 'completed',
            startDate: '2023-07-01',
            endDate: '2023-09-30',
            budget: 30000,
            spent: 29800,
            adClicks: 6789,
            engagements: 3456,
            qualifications: 789,
            filled: 345,
            conversionRate: 50.9,
            cpc: 4.39,
            cpf: 86.4,
        },
        {
            id: 'GOOGLE-FD-2023-Q4',
            name: 'Find Doctor Q4 2023',
            platform: 'google',
            adType: 'find_doctor',
            status: 'active',
            startDate: '2023-10-01',
            budget: 60000,
            spent: 15200,
            adClicks: 3456,
            engagements: 1890,
            qualifications: 567,
            filled: 123,
            conversionRate: 54.7,
            cpc: 4.4,
            cpf: 123.6,
        },
    ];

    const filteredCampaigns = campaigns.filter((campaign) => {
        if (selectedPlatform !== 'all' && campaign.platform !== selectedPlatform) return false;
        if (selectedAdType !== 'all' && campaign.adType !== selectedAdType) return false;
        return true;
    });

    const totalStats = {
        adClicks: filteredCampaigns.reduce((sum, c) => sum + c.adClicks, 0),
        engagements: filteredCampaigns.reduce((sum, c) => sum + c.engagements, 0),
        qualifications: filteredCampaigns.reduce((sum, c) => sum + c.qualifications, 0),
        filled: filteredCampaigns.reduce((sum, c) => sum + c.filled, 0),
        spent: filteredCampaigns.reduce((sum, c) => sum + c.spent, 0),
        budget: filteredCampaigns.reduce((sum, c) => sum + c.budget, 0),
    };

    const getFunnelConversion = (stage: string, value: number) => {
        if (stage === 'engagement') return ((value / totalStats.adClicks) * 100).toFixed(1);
        if (stage === 'qualification') return ((value / totalStats.engagements) * 100).toFixed(1);
        if (stage === 'fill') return ((value / totalStats.qualifications) * 100).toFixed(1);
        return '0';
    };

    const columns = [
        {
            title: 'Campaign',
            dataIndex: 'name',
            key: 'name',
            render: (_: any, record: Campaign) => (
                <div>
                    <div className="flex items-center gap-2">
                        {record.platform === 'meta' ? <FaFacebook style={{ color: metaBlue, fontSize: 18 }} /> : <FaGoogle style={{ color: googleBlue, fontSize: 18 }} />}
                        <span className="font-semibold">{record.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-7">{record.id}</span>
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'adType',
            key: 'adType',
            render: (type: string) => {
                const labels: Record<string, string> = {
                    find_doctor: 'Find Doctor',
                    market_access: 'Market Access',
                    awareness: 'Awareness',
                    education: 'Education',
                };
                return <Tag>{labels[type] || type}</Tag>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const colors: Record<string, string> = {
                    active: 'green',
                    paused: 'orange',
                    completed: 'default',
                };
                return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Budget / Spent',
            key: 'budget',
            render: (_: any, record: Campaign) => (
                <div>
                    <div>
                        <span className="text-gray-900">${record.spent.toLocaleString()}</span>
                        <span className="text-gray-500"> / ${record.budget.toLocaleString()}</span>
                    </div>
                    <div className="mt-1">
                        <Progress percent={Math.round((record.spent / record.budget) * 100)} size="small" showInfo={false} strokeColor={record.spent > record.budget * 0.9 ? dangerColor : primaryColor} />
                    </div>
                </div>
            ),
        },
        {
            title: 'Funnel',
            key: 'funnel',
            render: (_: any, record: Campaign) => (
                <div className="min-w-[200px]">
                    <div className="flex justify-between mb-1">
                        <span className="text-xs">Ad Clicks</span>
                        <span className="text-xs font-semibold">{record.adClicks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="text-xs">Engagements</span>
                        <span className="text-xs font-semibold">{record.engagements.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="text-xs">Qualified</span>
                        <span className="text-xs font-semibold">{record.qualifications.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs">Filled</span>
                        <span className="text-xs font-semibold" style={{ color: tertiaryColor }}>
                            {record.filled.toLocaleString()}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Performance',
            key: 'performance',
            render: (_: any, record: Campaign) => (
                <div>
                    <div className="mb-2">
                        <span className="text-xs">Ad Click → Engagement: </span>
                        <span className="text-xs font-semibold">{record.conversionRate}%</span>
                    </div>
                    <div>
                        <span className="text-xs">CPF: </span>
                        <span className="text-xs font-semibold" style={{ color: tertiaryColor }}>
                            ${record.cpf.toFixed(2)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Campaign) => (
                <Link to={`/crm/marketing/campaigns/${record.id}`}>
                    <Button type="link" size="small">
                        View Details
                    </Button>
                </Link>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <div className="p-6 bg-gray-50">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold m-0 mb-2">Campaign Performance</h2>
                        <p className="text-gray-600 m-0">Track campaign performance across the patient journey funnel</p>
                    </div>
                    <div className="flex gap-2">
                        <Button icon={<FaDownload />}>Export</Button>
                        <Button type="primary">New Campaign</Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6 rounded-xl shadow-md">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Platform: </span>
                            <Select
                                value={selectedPlatform}
                                onChange={setSelectedPlatform}
                                options={[
                                    { value: 'all', label: 'All Platforms' },
                                    { value: 'meta', label: 'Meta' },
                                    { value: 'google', label: 'Google' },
                                ]}
                                style={{ width: 150 }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Ad Type: </span>
                            <Select
                                value={selectedAdType}
                                onChange={setSelectedAdType}
                                options={[
                                    { value: 'all', label: 'All Types' },
                                    { value: 'find_doctor', label: 'Find Doctor' },
                                    { value: 'market_access', label: 'Market Access' },
                                    { value: 'education', label: 'Education' },
                                    { value: 'awareness', label: 'Awareness' },
                                ]}
                                style={{ width: 150 }}
                            />
                        </div>
                        <div>
                            <input type="date" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078D4]" />
                            <span className="mx-2">to</span>
                            <input type="date" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078D4]" />
                        </div>
                        <div className="flex-1 flex justify-end">
                            <div className="relative max-w-[300px] w-full">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search campaigns..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078D4]" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Card className="rounded-xl shadow-md">
                        <Statistic title="Total Ad Clicks" value={totalStats.adClicks.toLocaleString()} prefix={<FaShoppingCart style={{ color: primaryColor }} />} valueStyle={{ color: primaryColor }} />
                    </Card>
                    <Card className="rounded-xl shadow-md">
                        <Statistic title="Engagements" value={totalStats.engagements.toLocaleString()} prefix={<FaRobot style={{ color: secondaryColor }} />} valueStyle={{ color: secondaryColor }} />
                    </Card>
                    <Card className="rounded-xl shadow-md">
                        <Statistic title="Qualified" value={totalStats.qualifications.toLocaleString()} prefix={<FaPills style={{ color: warningColor }} />} valueStyle={{ color: warningColor }} />
                    </Card>
                    <Card className="rounded-xl shadow-md">
                        <Statistic title="Prescriptions Filled" value={totalStats.filled.toLocaleString()} prefix={<FaPills style={{ color: tertiaryColor }} />} valueStyle={{ color: tertiaryColor }} />
                    </Card>
                </div>

                {/* Funnel Visualization */}
                <Card title="Funnel Conversion Rates" className="mb-6 rounded-xl shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2" style={{ color: secondaryColor }}>
                                {getFunnelConversion('engagement', totalStats.engagements)}%
                            </div>
                            <p className="text-gray-600 mb-2">Ad Click → Engagement</p>
                            <div>
                                <span className="font-semibold">{totalStats.engagements.toLocaleString()}</span>
                                <span className="text-gray-500"> / {totalStats.adClicks.toLocaleString()} ad clicks</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2" style={{ color: warningColor }}>
                                {getFunnelConversion('qualification', totalStats.qualifications)}%
                            </div>
                            <p className="text-gray-600 mb-2">Engagement → Qualified</p>
                            <div>
                                <span className="font-semibold">{totalStats.qualifications.toLocaleString()}</span>
                                <span className="text-gray-500"> / {totalStats.engagements.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold mb-2" style={{ color: tertiaryColor }}>
                                {getFunnelConversion('fill', totalStats.filled)}%
                            </div>
                            <p className="text-gray-600 mb-2">Qualified → Fill</p>
                            <div>
                                <span className="font-semibold">{totalStats.filled.toLocaleString()}</span>
                                <span className="text-gray-500"> / {totalStats.qualifications.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Campaigns Table */}
                <Card className="rounded-xl shadow-md">
                    <Table dataSource={filteredCampaigns} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
                </Card>
            </div>
        </DashboardLayout>
    );
}
