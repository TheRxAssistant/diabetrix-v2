import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUser, FaChartLine, FaChartBar } from 'react-icons/fa';
import Avatar from './ui/Avatar';
import avatarImage from '../../assets/images/avatar.png';
import DiabetrixIcon from './ui/DiabetrixIcon';
import { useThemeConfig } from '../../hooks/useThemeConfig';
import { getBrandName } from '../../config/theme-config';
import { useDomainPrefix } from '../../hooks/useDomainPrefix';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const location = useLocation();
    const themeConfig = useThemeConfig();
    const brandName = getBrandName(themeConfig);
    const capitalizedBrandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    const domainPrefix = useDomainPrefix();

    const [activeSideMenu, setActiveSideMenu] = useState(() => {
        const pathWithoutDomain = location.pathname.replace(/^\/goodrx|\/onapgo/, '');
        if (pathWithoutDomain === '/crm/patients' || pathWithoutDomain === '/crm/patients') return '2';
        if (pathWithoutDomain.includes('/crm/patients/')) return '2';
        if (pathWithoutDomain.includes('/crm/marketing')) return '5';
        if (pathWithoutDomain.includes('/crm/analytics')) return '6';
        return '2';
    });

    const primaryColor = themeConfig.primary_color;

    const menuItems = [
        { key: '2', icon: <FaUser />, label: 'Patient Journeys', path: `${domainPrefix}/crm/patients` },
        { key: '5', icon: <FaChartLine />, label: 'Marketing', path: `${domainPrefix}/crm/marketing/campaigns` },
        { key: '6', icon: <FaChartBar />, label: 'Analytics', path: `${domainPrefix}/crm/analytics` },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header 
                className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 shadow-sm"
                style={{ backgroundColor: themeConfig.header_bg_color }}
            >
                <div className="flex items-center">
                    <DiabetrixIcon size={32} className="mr-3" />
                    <h4 
                        className="text-lg font-semibold m-0"
                        style={{ color: themeConfig.header_text_color }}
                    >
                        {capitalizedBrandName}<sup>®</sup> Digital Navigation Hub
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
                                    <Link 
                                        to={item.path} 
                                        className={`flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors ${activeSideMenu === item.key ? 'text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                        style={activeSideMenu === item.key ? { backgroundColor: themeConfig.sidebar_active_color } : undefined}
                                        onClick={() => setActiveSideMenu(item.key)}
                                    >
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
