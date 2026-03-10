import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, BookOpen, DollarSign, MapPin, Pill, Search, Stethoscope, Syringe } from 'lucide-react';
import RecentRequests from './recent-requests';
import { useApprovedRequests } from '../../../services/crm/hooks-approved-requests';
import { useAuthStore } from '../../../store/authStore';
import { ApprovedRequest } from '../../../services/crm/types-approved-requests';
import { useThemeConfig } from '../../../hooks/useThemeConfig';
import { getBrandName, getCondition, getLogo } from '../../../config/theme-config';

interface Request {
    id: string;
    type: 'pharmacy' | 'doctor' | 'insurance' | 'support';
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    date: string;
    description: string;
    task_type_name?: string;
}

interface HomePageProps {
    setStep: (step: string) => void;
    openEmbeddedChatAndSend?: () => void;
    setPendingMessages?: (messages: string[]) => void;
    setIsChatActive?: (active: boolean) => void;
    setIsLearnFlow?: (isLearn: boolean) => void;
    setLastLearnTopic?: (topic: string) => void;
    setShowQuickReplies?: (show: boolean) => void;
    setCurrentQuickReplies?: (replies: string[]) => void;
    setChatResetKey?: (key: number | ((prev: number) => number)) => void;
    create_websocket_connection?: () => void;
    messages?: any[];
    is_reconnecting?: boolean;
    setUsedQuickReplies?: (replies: string[] | ((prev: string[]) => string[])) => void;
    isNewRoute?: boolean;
    isExternalRoute?: boolean;
}

const HomePage = ({ setStep, openEmbeddedChatAndSend, setPendingMessages, setIsChatActive, setIsLearnFlow, setLastLearnTopic, setShowQuickReplies, setCurrentQuickReplies, setChatResetKey, create_websocket_connection, messages, is_reconnecting, setUsedQuickReplies, isNewRoute = false, isExternalRoute = false }: HomePageProps) => {
    const themeConfig = useThemeConfig();
    const brandName = getBrandName(themeConfig);
    const capitalizedBrandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    const condition = getCondition(themeConfig);
    const logo = getLogo(themeConfig);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

    const { approved_requests, is_loading, fetch_approved_requests } = useApprovedRequests();

    // Fetch approved requests when component mounts if user is authenticated
    useEffect(() => {
        const authStore = useAuthStore.getState();
        const user = authStore.user;
        const user_id = user?.userData?.user_id;

        if (user_id) {
            fetch_approved_requests(user_id, 5);
        }
    }, [fetch_approved_requests]);

    // Transform approved requests to Request format
    const transformApprovedRequestToRequest = (approved_request: ApprovedRequest): Request => {
        // Map task_type_name to type
        const getTypeFromTaskType = (task_type_name?: string): 'pharmacy' | 'doctor' | 'insurance' | 'support' => {
            if (!task_type_name) return 'support';
            const type_lower = task_type_name.toLowerCase();
            if (type_lower.includes('pharmacy') || type_lower.includes('stock')) return 'pharmacy';
            if (type_lower.includes('doctor') || type_lower.includes('appointment') || type_lower.includes('care')) return 'doctor';
            if (type_lower.includes('insurance') || type_lower.includes('copay') || type_lower.includes('prior')) return 'insurance';
            return 'support';
        };

        // Map request_status_name to status
        const getStatusFromRequestStatus = (status_name: string): 'pending' | 'in_progress' | 'completed' => {
            const status_lower = status_name.toLowerCase();
            if (status_lower.includes('completed')) return 'completed';
            if (status_lower.includes('progress') || status_lower.includes('processing')) return 'in_progress';
            return 'pending';
        };

        // Generate description based on task type
        const generateDescription = (): string => {
            const task_type = approved_request.task_type_name?.toLowerCase() || '';
            const json_data = approved_request.request_json || {};

            if (task_type === 'doctor-appointment-booking') {
                let appointment_data = json_data.appointment_with_details || {};
                const provider_name = appointment_data.provider_name || appointment_data.doctor_name;

                if (provider_name) {
                    return `Appointment Request for ${provider_name} on ${appointment_data.appointment_date_time || appointment_data.availability || ''}`;
                } else {
                    return `Appointment Request`;
                }
            }

            return approved_request.request_details || approved_request.request_name;
        };

        return {
            id: approved_request.request_id,
            type: getTypeFromTaskType(approved_request.task_type_name),
            title: approved_request.request_name,
            status: getStatusFromRequestStatus(approved_request.request_status_name),
            date: approved_request.created_at,
            description: generateDescription(),
            task_type_name: approved_request.task_type_name,
        };
    };

    // Transform approved requests to Request format
    const requests = useMemo(() => {
        return approved_requests.map(transformApprovedRequestToRequest);
    }, [approved_requests]);

    // Function to open chat with specific message
    const openChatWithMessage = (message: string, topic: string) => {
        if (setIsChatActive) setIsChatActive(true);
        if (setIsLearnFlow) setIsLearnFlow(true);
        if (setLastLearnTopic) setLastLearnTopic(topic);
        if (setShowQuickReplies) setShowQuickReplies(false);
        if (setCurrentQuickReplies) setCurrentQuickReplies([]);

        // Only create connection if not already active
        if (create_websocket_connection) {
            create_websocket_connection();
        }

        if (setChatResetKey) setChatResetKey((k) => k + 1);

        // Queue messages to be sent when connection is ready
        if (setPendingMessages) setPendingMessages(['yes', message]);

        // Navigate to chat
        setStep('embedded_chat');
    };

    // Function to handle search - flows directly to chat without consent
    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        // Flow directly to chat with the search query
        openChatWithMessage(searchQuery.trim(), 'Search');

        // Clear the search input
        setSearchQuery('');
    };

    // Handle Enter key press in search input
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    // Handle request action button clicks
    const handleRequestAction = async (request: Request) => {
        const getNextStepAction = (type: string, status: string) => {
            if (status === 'completed') return 'View Details';
            switch (type) {
                case 'pharmacy':
                    return 'Find More';
                case 'doctor':
                    return 'Book Now';
                case 'insurance':
                    return 'Check Status';
                default:
                    return 'Continue';
            }
        };

        const action = getNextStepAction(request.type, request.status);

        if (isNewRoute) {
            // For new route, redirect to external URLs
            switch (action) {
                case 'View Details':
                case 'Find More':
                    if (request.type === 'pharmacy') {
                        window.open('http://therxassistant-stage.healthbackend.com/external?service=find-pharmacy', '_blank');
                    } else if (request.type === 'doctor') {
                        window.open('http://therxassistant-stage.healthbackend.com/external?service=find-doctor', '_blank');
                    } else if (request.type === 'insurance') {
                        window.open('http://therxassistant-stage.healthbackend.com/external?service=insurance-help', '_blank');
                    }
                    break;
                case 'Book Now':
                    window.open('http://therxassistant-stage.healthbackend.com/external?service=find-doctor', '_blank');
                    break;
                case 'Check Status':
                    setLoadingRequestId(request.id);
                    setTimeout(() => {
                        setLoadingRequestId(null);
                    }, 2000);
                    break;
                default:
                    if (request.type === 'pharmacy') {
                        window.open('http://therxassistant-stage.healthbackend.com/external?service=find-pharmacy', '_blank');
                    } else if (request.type === 'doctor') {
                        window.open('http://therxassistant-stage.healthbackend.com/external?service=find-doctor', '_blank');
                    } else if (request.type === 'insurance') {
                        window.open('http://therxassistant-stage.healthbackend.com/external?service=insurance-help', '_blank');
                    }
                    break;
            }
        } else if (isExternalRoute) {
            // For external route, navigate within modal
            switch (action) {
                case 'View Details':
                    if (request.type === 'pharmacy') {
                        setStep('pharmacy_select');
                    } else if (request.type === 'doctor') {
                        setStep('healthcare_search');
                    } else if (request.type === 'insurance') {
                        setStep('insurance_assistance');
                    }
                    break;
                case 'Find More':
                    setStep('pharmacy_select');
                    break;
                case 'Book Now':
                    setStep('healthcare_search');
                    break;
                case 'Check Status':
                    setLoadingRequestId(request.id);
                    setTimeout(() => {
                        setLoadingRequestId(null);
                    }, 2000);
                    break;
                default:
                    if (request.type === 'pharmacy') {
                        setStep('pharmacy_select');
                    } else if (request.type === 'doctor') {
                        setStep('healthcare_search');
                    } else if (request.type === 'insurance') {
                        setStep('insurance_assistance');
                    }
                    break;
            }
        } else {
            // Original logic for normal routes
            switch (action) {
                case 'View Details':
                    if (request.type === 'pharmacy') {
                        setStep('pharmacy_select');
                    } else if (request.type === 'doctor') {
                        setStep('healthcare_search');
                    } else if (request.type === 'insurance') {
                        setStep('insurance_assistance');
                    }
                    break;
                case 'Find More':
                    setStep('pharmacy_select');
                    break;
                case 'Book Now':
                    setStep('healthcare_search');
                    break;
                case 'Check Status':
                    setLoadingRequestId(request.id);
                    setTimeout(() => {
                        setLoadingRequestId(null);
                    }, 2000);
                    break;
                default:
                    setStep(request.type);
                    break;
            }
        }
    };

    // Handler for find pharmacy button
    const handleFindPharmacy = () => {
        if (isNewRoute) {
            window.open('http://therxassistant-stage.healthbackend.com/external?service=find-pharmacy', '_blank');
        } else {
            setStep('pharmacy_select');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 scrollbar-hide min-h-0">
            {/* Header Section */}
            <div className="px-6 py-6 bg-white border-b border-gray-200 mb-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center text-left">
                        <img src={logo} alt={capitalizedBrandName} className="h-8 w-auto rounded-md mr-3 object-contain" />
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold text-gray-900 leading-tight mb-0.5">{capitalizedBrandName}® Care</h1>
                            <p className="text-xs text-gray-600 font-normal m-0">Your health companion</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prominent Icons Section - 3 Columns */}
            <div className="grid grid-cols-3 gap-3 px-5 pb-6 pt-4">
                <button
                    className="flex flex-col items-center p-5 px-3 bg-white/95 backdrop-blur-md border border-blue-100/60 rounded-3xl cursor-pointer transition-all duration-500 text-center shadow-lg shadow-blue-50/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-100/60 hover:border-blue-300/80 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-white active:-translate-y-0.5 group relative overflow-hidden"
                    onClick={() => {
                        if (isNewRoute) {
                            window.open('http://therxassistant-stage.healthbackend.com/external?service=find-doctor', '_blank');
                        } else {
                            setStep('healthcare_search');
                        }
                    }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:via-blue-500/5 group-hover:to-blue-600/10 transition-all duration-500"></div>
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 via-blue-100/80 to-blue-50 rounded-3xl mb-3.5 text-blue-600 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:via-blue-600 group-hover:to-blue-700 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl group-hover:shadow-blue-200/50 relative z-10">
                        <Stethoscope className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h3 className="m-0 mb-1.5 text-sm font-bold text-gray-900 leading-tight relative z-10 group-hover:text-blue-700 transition-colors duration-300">Find Care</h3>
                    <p className="m-0 text-xs text-gray-600 leading-snug relative z-10 font-medium">Doctors & specialists</p>
                </button>

                <button
                    className="flex flex-col items-center p-5 px-3 bg-white/95 backdrop-blur-md border border-orange-100/60 rounded-3xl cursor-pointer transition-all duration-500 text-center shadow-lg shadow-orange-50/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-100/60 hover:border-orange-300/80 hover:bg-gradient-to-br hover:from-orange-50/50 hover:to-white active:-translate-y-0.5 group relative overflow-hidden"
                    onClick={() => {
                        if (isNewRoute) {
                            window.open('http://therxassistant-stage.healthbackend.com/external?service=find-pharmacy', '_blank');
                        } else {
                            setStep('pharmacy_select');
                        }
                    }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-600/0 group-hover:from-orange-500/10 group-hover:via-orange-500/5 group-hover:to-orange-600/10 transition-all duration-500"></div>
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-50 via-orange-100/80 to-orange-50 rounded-3xl mb-3.5 text-orange-600 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:via-orange-600 group-hover:to-orange-700 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl group-hover:shadow-orange-200/50 relative z-10">
                        <MapPin className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h3 className="m-0 mb-1.5 text-sm font-bold text-gray-900 leading-tight relative z-10 group-hover:text-orange-700 transition-colors duration-300">Find Pharmacy</h3>
                    <p className="m-0 text-xs text-gray-600 leading-snug relative z-10 font-medium">In-stock locations</p>
                </button>

                <button
                    className="flex flex-col items-center p-5 px-3 bg-white/95 backdrop-blur-md border border-emerald-100/60 rounded-3xl cursor-pointer transition-all duration-500 text-center shadow-lg shadow-emerald-50/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-100/60 hover:border-emerald-300/80 hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-white active:-translate-y-0.5 group relative overflow-hidden"
                    onClick={() => {
                        if (isNewRoute) {
                            window.open('http://therxassistant-stage.healthbackend.com/external?service=insurance-help', '_blank');
                        } else {
                            setStep('insurance_assistance');
                        }
                    }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-600/0 group-hover:from-emerald-500/10 group-hover:via-emerald-500/5 group-hover:to-emerald-600/10 transition-all duration-500"></div>
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-50 via-emerald-100/80 to-emerald-50 rounded-3xl mb-3.5 text-emerald-600 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:via-emerald-600 group-hover:to-emerald-700 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl group-hover:shadow-emerald-200/50 relative z-10">
                        <DollarSign className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h3 className="m-0 mb-1.5 text-sm font-bold text-gray-900 leading-tight relative z-10 group-hover:text-emerald-700 transition-colors duration-300">Savings</h3>
                    <p className="m-0 text-xs text-gray-600 leading-snug relative z-10 font-medium">Patient assistance</p>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 px-5">
                <div className="flex items-center bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-2xl py-3 px-4 transition-all duration-300 shadow-md shadow-gray-100/50 focus-within:border-blue-400/60 focus-within:shadow-xl focus-within:shadow-blue-100/50 focus-within:bg-white">
                    <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <input type="text" placeholder={`Ask about your ${condition} treatment...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleSearchKeyPress} className="flex-1 py-1 px-2 border-none outline-none text-sm bg-transparent placeholder:text-gray-400 text-gray-900 font-medium" />
                    <button className="flex items-center justify-center p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none rounded-xl cursor-pointer transition-all duration-300 ml-2 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-200/50 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none" onClick={handleSearch} disabled={!searchQuery.trim()}>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Recent Requests Section */}
            <RecentRequests requests={requests} loadingRequestId={loadingRequestId} onRequestAction={handleRequestAction} isNewRoute={isNewRoute} onFindPharmacy={handleFindPharmacy} is_loading={is_loading} />

            {/* Healthcare Options Grid */}
            <div className="grid grid-cols-3 gap-3 p-5 mt-4 bg-white/80 backdrop-blur-sm rounded-t-3xl border-t border-gray-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <button className="flex flex-col items-center p-4 px-3 bg-white/90 backdrop-blur-sm border border-purple-100/60 rounded-2xl cursor-pointer transition-all duration-500 text-center min-h-[110px] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-purple-100/50 hover:border-purple-300/80 hover:bg-gradient-to-br hover:from-purple-50/40 hover:to-white active:translate-y-0 group relative overflow-hidden" onClick={() => openChatWithMessage('Schedule and dosage', `About ${brandName}`)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-600/0 group-hover:from-purple-500/8 group-hover:via-purple-500/4 group-hover:to-purple-600/8 transition-all duration-500"></div>
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-50 via-purple-100/70 to-purple-50 rounded-2xl mb-2.5 text-purple-600 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:via-purple-600 group-hover:to-purple-700 group-hover:text-white group-hover:scale-110 group-hover:rotate-2 group-hover:shadow-lg group-hover:shadow-purple-200/50 relative z-10">
                        <Pill className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h4 className="m-0 mb-1 text-xs font-bold text-gray-900 leading-tight relative z-10 group-hover:text-purple-700 transition-colors duration-300">About {brandName}</h4>
                    <p className="m-0 text-xs text-gray-600 leading-snug relative z-10 font-medium">Schedule and dosage</p>
                </button>

                <button className="flex flex-col items-center p-4 px-3 bg-white/90 backdrop-blur-sm border border-indigo-100/60 rounded-2xl cursor-pointer transition-all duration-500 text-center min-h-[110px] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-300/80 hover:bg-gradient-to-br hover:from-indigo-50/40 hover:to-white active:translate-y-0 group relative overflow-hidden" onClick={() => openChatWithMessage(`About ${condition}`, `About ${condition}`)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-600/0 group-hover:from-indigo-500/8 group-hover:via-indigo-500/4 group-hover:to-indigo-600/8 transition-all duration-500"></div>
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-50 via-indigo-100/70 to-indigo-50 rounded-2xl mb-2.5 text-indigo-600 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:via-indigo-600 group-hover:to-indigo-700 group-hover:text-white group-hover:scale-110 group-hover:rotate-2 group-hover:shadow-lg group-hover:shadow-indigo-200/50 relative z-10">
                        <BookOpen className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h4 className="m-0 mb-1 text-xs font-bold text-gray-900 leading-tight relative z-10 group-hover:text-indigo-700 transition-colors duration-300">About {condition}</h4>
                    <p className="m-0 text-xs text-gray-600 leading-snug relative z-10 font-medium">Education & info</p>
                </button>

                <button className="flex flex-col items-center p-4 px-3 bg-white/90 backdrop-blur-sm border border-teal-100/60 rounded-2xl cursor-pointer transition-all duration-500 text-center min-h-[110px] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-teal-100/50 hover:border-teal-300/80 hover:bg-gradient-to-br hover:from-teal-50/40 hover:to-white active:translate-y-0 group relative overflow-hidden" onClick={() => openChatWithMessage('Help', 'Help')}>
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 via-teal-500/0 to-teal-600/0 group-hover:from-teal-500/8 group-hover:via-teal-500/4 group-hover:to-teal-600/8 transition-all duration-500"></div>
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-50 via-teal-100/70 to-teal-50 rounded-2xl mb-2.5 text-teal-600 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:via-teal-600 group-hover:to-teal-700 group-hover:text-white group-hover:scale-110 group-hover:rotate-2 group-hover:shadow-lg group-hover:shadow-teal-200/50 relative z-10">
                        <Syringe className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h4 className="m-0 mb-1 text-xs font-bold text-gray-900 leading-tight relative z-10 group-hover:text-teal-700 transition-colors duration-300">Help</h4>
                    <p className="m-0 text-xs text-gray-600 leading-snug relative z-10 font-medium">How to use</p>
                </button>
            </div>
        </div>
    );
};

export default HomePage;
