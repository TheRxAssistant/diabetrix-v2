import React, { useState } from 'react';
import { FaUser, FaPills, FaMapMarkerAlt, FaComment, FaClock, FaQuestionCircle, FaCheckCircle, FaDownload } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Statistic from '../components/ui/Statistic';
import Select from '../components/ui/Select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0078D4', '#00B7C3', '#83C995', '#faad14', '#f5222d', '#4267B2', '#4285F4'];

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    // Mock data - replace with actual API calls
    const userStats = {
        totalUsers: 1245,
        newUsersThisMonth: 128,
        activeUsers: 876,
        pipelineGenerated: '1.2M',
    };

    // Profession breakdown data
    const professionData = [
        { type: 'MD', value: 450 },
        { type: 'Nurse', value: 320 },
        { type: 'Office Staff', value: 280 },
        { type: 'Consumer', value: 195 },
    ];

    // Demographics data
    const demographicsData = {
        gender: [
            { type: 'Male', value: 620 },
            { type: 'Female', value: 610 },
            { type: 'Other', value: 15 },
        ],
        ageGroups: [
            { age: '18-24', count: 120 },
            { age: '25-34', count: 350 },
            { age: '35-44', count: 280 },
            { age: '45-54', count: 210 },
            { age: '55-64', count: 180 },
            { age: '65+', count: 105 },
        ],
    };

    // Entry mode data
    const entryModeData = [
        { type: 'SMS', value: 480 },
        { type: 'Chat', value: 520 },
        { type: 'Voice', value: 245 },
    ];

    // Insurance data
    const insuranceData = [
        { type: 'Medicare', value: 320 },
        { type: 'Medicaid', value: 280 },
        { type: 'Commercial', value: 540 },
        { type: 'Uninsured', value: 105 },
    ];

    // Top insurers
    const topInsurers = [
        { name: 'BCBS', count: 210 },
        { name: 'UHC', count: 180 },
        { name: 'Aetna', count: 150 },
        { name: 'Cigna', count: 120 },
        { name: 'Humana', count: 90 },
    ];

    // Questions asked
    const questionsData = [
        { type: 'Find a doctor', value: 320 },
        { type: 'Cost', value: 280 },
        { type: 'Safety', value: 180 },
        { type: 'Efficacy', value: 150 },
        { type: 'How it works', value: 130 },
        { type: 'How to take', value: 110 },
        { type: 'Patient support', value: 90 },
        { type: 'Insurances covered', value: 210 },
    ];

    // Actions taken
    const actionsData = [
        { type: 'Found doctor', value: 280 },
        { type: 'Scheduled appointment', value: 210 },
        { type: 'Called pharmacy', value: 180 },
        { type: 'Chased PA', value: 150 },
        { type: 'Enrolled in program', value: 130 },
        { type: 'Answered question', value: 320 },
        { type: 'Passed to patient support', value: 90 },
    ];

    // Prescription data
    const prescriptionData = {
        hadPrescription: [
            { type: 'Yes', value: 720 },
            { type: 'No', value: 525 },
        ],
        startedTherapy: [
            { type: 'Yes', value: 580 },
            { type: 'No', value: 140 },
        ],
        likedConcierge: [
            { type: 'Yes', value: 680 },
            { type: 'No', value: 40 },
        ],
    };

    // Top pharmacies
    const topPharmacies = [
        { name: 'CVS Pharmacy', location: 'New York, NY', count: 180 },
        { name: 'Walgreens', location: 'Chicago, IL', count: 150 },
        { name: 'Rite Aid', location: 'Los Angeles, CA', count: 120 },
        { name: 'Walmart Pharmacy', location: 'Houston, TX', count: 90 },
        { name: 'Kroger Pharmacy', location: 'Atlanta, GA', count: 60 },
    ];

    // Top doctors
    const topDoctors = [
        { name: 'Dr. Smith', specialty: 'Cardiology', count: 45 },
        { name: 'Dr. Johnson', specialty: 'Oncology', count: 38 },
        { name: 'Dr. Williams', specialty: 'Neurology', count: 32 },
        { name: 'Dr. Brown', specialty: 'Endocrinology', count: 28 },
        { name: 'Dr. Jones', specialty: 'Rheumatology', count: 25 },
    ];

    // Engagement metrics
    const engagementMetrics = {
        avgTimePhone: 8.5, // minutes
        avgTimeChat: 12.3, // minutes
        avgMessagesPerSession: 14.2,
        followUpRequested: [
            { type: 'Yes', value: 680 },
            { type: 'No', value: 565 },
        ],
        followUpMethod: [
            { type: 'Call', value: 420 },
            { type: 'Text', value: 260 },
        ],
    };

    // Geographic data
    const topLocations = [
        { state: 'California', city: 'Los Angeles', count: 120 },
        { state: 'New York', city: 'New York City', count: 110 },
        { state: 'Texas', city: 'Houston', count: 90 },
        { state: 'Florida', city: 'Miami', count: 85 },
        { state: 'Illinois', city: 'Chicago', count: 80 },
    ];

    // Helper function to render pie chart
    const renderPieChart = (data: Array<{ type: string; value: number }>, height = 300) => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        return (
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => {
                            const percent = entry.percent ? (entry.percent * 100).toFixed(0) : '0';
                            return `${entry.type} ${percent}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="type">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    // Helper function to render bar chart
    const renderBarChart = (data: Array<{ [key: string]: string | number }>, xKey: string, yKey: string, height = 300) => {
        return (
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey={yKey} type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey={xKey} fill="#0078D4" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <DashboardLayout>
            <div className="p-6 bg-gray-50">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold m-0 mb-2">Analytics Dashboard</h2>
                        <p className="text-gray-600 m-0">Track user analytics and insights</p>
                    </div>
                    <div className="flex gap-2">
                        <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078D4]" />
                        <span className="self-center mx-2">to</span>
                        <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078D4]" />
                        <Button type="primary">Apply Filter</Button>
                        <Button icon={<FaDownload />}>Export Data</Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="1" className="w-full">
                    <TabsList>
                        <TabsTrigger value="1">Overview</TabsTrigger>
                        <TabsTrigger value="2">Demographics</TabsTrigger>
                        <TabsTrigger value="3">Insurance</TabsTrigger>
                        <TabsTrigger value="4">Questions & Actions</TabsTrigger>
                        <TabsTrigger value="5">Prescriptions</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Overview */}
                    <TabsContent value="1">
                        <div className="space-y-6">
                            {/* User Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card>
                                    <Statistic title="Total Users" value={userStats.totalUsers} prefix={<FaUser style={{ color: '#0078D4' }} />} valueStyle={{ color: '#0078D4' }} />
                                </Card>
                                <Card>
                                    <Statistic title="New Users (This Month)" value={userStats.newUsersThisMonth} prefix={<FaUser style={{ color: '#0078D4' }} />} valueStyle={{ color: '#0078D4' }} />
                                </Card>
                                <Card>
                                    <Statistic title="Active Users" value={userStats.activeUsers} prefix={<FaUser style={{ color: '#0078D4' }} />} valueStyle={{ color: '#0078D4' }} />
                                </Card>
                                <Card>
                                    <Statistic title="Est. Pipeline Generated" value={userStats.pipelineGenerated} prefix="$" valueStyle={{ color: '#0078D4' }} />
                                </Card>
                            </div>

                            {/* User Breakdown */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">User Breakdown</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="Profession">{renderPieChart(professionData)}</Card>
                                    <Card title="Entry Mode">{renderPieChart(entryModeData)}</Card>
                                </div>
                            </div>

                            {/* Engagement Metrics */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card>
                                        <Statistic title="Avg. Time on Phone (min)" value={engagementMetrics.avgTimePhone} prefix={<FaClock style={{ color: '#0078D4' }} />} valueStyle={{ color: '#0078D4' }} />
                                    </Card>
                                    <Card>
                                        <Statistic title="Avg. Time on Chat (min)" value={engagementMetrics.avgTimeChat} prefix={<FaClock style={{ color: '#0078D4' }} />} valueStyle={{ color: '#0078D4' }} />
                                    </Card>
                                    <Card>
                                        <Statistic title="Avg. Messages Per Session" value={engagementMetrics.avgMessagesPerSession} prefix={<FaComment style={{ color: '#0078D4' }} />} valueStyle={{ color: '#0078D4' }} />
                                    </Card>
                                </div>
                            </div>

                            {/* Outcomes */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Outcomes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card title="Had Prescription">{renderPieChart(prescriptionData.hadPrescription)}</Card>
                                    <Card title="Started Therapy">{renderPieChart(prescriptionData.startedTherapy)}</Card>
                                    <Card title="Liked Concierge Experience">{renderPieChart(prescriptionData.likedConcierge)}</Card>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 2: Demographics */}
                    <TabsContent value="2">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card title="Gender Distribution">{renderPieChart(demographicsData.gender)}</Card>
                                <Card title="Age Distribution">{renderBarChart(demographicsData.ageGroups, 'count', 'age')}</Card>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
                                <Card title="Top Locations">
                                    <Table
                                        dataSource={topLocations}
                                        columns={[
                                            {
                                                title: 'State',
                                                dataIndex: 'state',
                                                key: 'state',
                                            },
                                            {
                                                title: 'City',
                                                dataIndex: 'city',
                                                key: 'city',
                                            },
                                            {
                                                title: 'Users',
                                                dataIndex: 'count',
                                                key: 'count',
                                                sorter: (a, b) => a.count - b.count,
                                            },
                                        ]}
                                        rowKey={(record) => `${record.state}-${record.city}`}
                                        pagination={false}
                                    />
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 3: Insurance */}
                    <TabsContent value="3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card title="Insurance Types">{renderPieChart(insuranceData)}</Card>
                            <Card title="Top Insurers">{renderBarChart(topInsurers, 'count', 'name')}</Card>
                        </div>
                    </TabsContent>

                    {/* Tab 4: Questions & Actions */}
                    <TabsContent value="4">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card title="Questions Asked">{renderBarChart(questionsData, 'value', 'type')}</Card>
                                <Card title="Actions Taken">{renderBarChart(actionsData, 'value', 'type')}</Card>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Follow-up Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="Follow-up Requested">{renderPieChart(engagementMetrics.followUpRequested)}</Card>
                                    <Card title="Follow-up Method">{renderPieChart(engagementMetrics.followUpMethod)}</Card>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 5: Prescriptions */}
                    <TabsContent value="5">
                        <div className="space-y-6">
                            <Card title="Top Pharmacies">
                                <Table
                                    dataSource={topPharmacies}
                                    columns={[
                                        {
                                            title: 'Pharmacy',
                                            dataIndex: 'name',
                                            key: 'name',
                                        },
                                        {
                                            title: 'Location',
                                            dataIndex: 'location',
                                            key: 'location',
                                        },
                                        {
                                            title: 'Prescriptions',
                                            dataIndex: 'count',
                                            key: 'count',
                                            sorter: (a, b) => a.count - b.count,
                                        },
                                    ]}
                                    rowKey="name"
                                    pagination={false}
                                />
                            </Card>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Prescribing Doctors</h3>
                                <Card title="Top Doctors">
                                    <Table
                                        dataSource={topDoctors}
                                        columns={[
                                            {
                                                title: 'Doctor',
                                                dataIndex: 'name',
                                                key: 'name',
                                            },
                                            {
                                                title: 'Specialty',
                                                dataIndex: 'specialty',
                                                key: 'specialty',
                                            },
                                            {
                                                title: 'Prescriptions',
                                                dataIndex: 'count',
                                                key: 'count',
                                                sorter: (a, b) => a.count - b.count,
                                            },
                                        ]}
                                        rowKey="name"
                                        pagination={false}
                                    />
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
