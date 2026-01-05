import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaChartLine, FaChartBar } from 'react-icons/fa';
import Avatar from './ui/Avatar';
import avatarImage from '../../assets/images/avatar.png';
import DiabetrixIcon from './ui/DiabetrixIcon';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();

    const [activeSideMenu, setActiveSideMenu] = useState(() => {
        if (location.pathname === '/crm/patients') return '2';
        if (location.pathname.includes('/crm/patients/')) return '2';
        if (location.pathname.includes('/crm/marketing')) return '5';
        if (location.pathname.includes('/crm/analytics')) return '6';
        return '2';
    });

    const primaryColor = '#0078D4';

    const menuItems = [
        { key: '2', icon: <FaUser />, label: 'Patient Journeys', path: '/crm/patients' },
        { key: '5', icon: <FaChartLine />, label: 'Marketing', path: '/crm/marketing/campaigns' },
        { key: '6', icon: <FaChartBar />, label: 'Analytics', path: '/crm/analytics' },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-6 h-16 shadow-sm">
                <div className="flex items-center">
                    <DiabetrixIcon size={32} className="mr-3" />
                    <h4 className="text-lg font-semibold text-[#0078D4] m-0">
                        Diabetrix<sup>®</sup> Digital Navigation Hub
                    </h4>
                </div>

                <Avatar src={avatarImage} size="large" />
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="fixed left-0 top-16 bottom-0 w-[200px] bg-white border-r border-gray-200 overflow-auto">
                    <nav className="p-4">
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.key}>
                                    <Link to={item.path} className={`flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors ${activeSideMenu === item.key ? 'bg-[#0078D4] text-white' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setActiveSideMenu(item.key)}>
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-[200px] min-h-[calc(100vh-64px)] bg-gray-50 overflow-x-hidden">{children}</main>
            </div>
        </div>
    );
}
