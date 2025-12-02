import React, { useState } from 'react';
import diabetrixLogo from '../../../assets/images/diabetrix_logo_2.png';
import { ArrowRight, BookOpen, DollarSign, MapPin, Pill, Search, Stethoscope, Syringe } from 'lucide-react';
import RecentRequests from './recent-requests';

interface Request {
    id: string;
    type: 'pharmacy' | 'doctor' | 'insurance' | 'support';
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    date: string;
    description: string;
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

const HomePage = ({
    setStep,
    openEmbeddedChatAndSend,
    setPendingMessages,
    setIsChatActive,
    setIsLearnFlow,
    setLastLearnTopic,
    setShowQuickReplies,
    setCurrentQuickReplies,
    setChatResetKey,
    create_websocket_connection,
    messages,
    is_reconnecting,
    setUsedQuickReplies,
    isNewRoute = false,
    isExternalRoute = false,
}: HomePageProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

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

    // Mock requests data - in real app this would come from API
    const [requests] = useState([
        {
            id: '1',
            type: 'pharmacy' as const,
            title: 'Find Pharmacy Near Me',
            status: 'completed' as const,
            date: '2024-01-15',
            description: 'Found 8 pharmacies with Diabetrix® in stock',
        },
        {
            id: '2',
            type: 'doctor' as const,
            title: 'Schedule Appointment',
            status: 'in_progress' as const,
            date: '2024-01-14',
            description: 'Searching for endocrinologists in your area',
        },
        {
            id: '3',
            type: 'insurance' as const,
            title: 'Prior Authorization Help',
            status: 'pending' as const,
            date: '2024-01-13',
            description: 'Submitted documents for review',
        },
    ]);

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
                        <img src={diabetrixLogo} alt="Diabetrix" className="w-8 h-8 rounded-md mr-3" />
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold text-gray-900 leading-tight mb-0.5">Diabetrix® Care</h1>
                            <p className="text-xs text-gray-600 font-normal m-0">Your health companion</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-0 my-4"></div>

            {/* Prominent Icons Section - 3 Columns */}
            <div className="grid grid-cols-3 gap-4 px-5 pb-6">
                <button
                    className="flex flex-col items-center p-5 px-3 bg-white border border-gray-200 rounded-2xl cursor-pointer transition-all duration-300 text-center shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-blue-500 active:-translate-y-0.5 group"
                    onClick={() => {
                        if (isNewRoute) {
                            window.open('http://therxassistant-stage.healthbackend.com/external?service=find-doctor', '_blank');
                        } else {
                            setStep('healthcare_search');
                        }
                    }}>
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-b from-slate-50 to-gray-200 rounded-2xl mb-3 text-blue-500 transition-all duration-300 group-hover:bg-gradient-to-b group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:scale-105">
                        <Stethoscope className="w-8 h-8" />
                    </div>
                    <h3 className="m-0 mb-1 text-sm font-semibold text-gray-900 leading-tight">Find Care</h3>
                    <p className="m-0 text-xs text-gray-600 leading-snug">Doctors & specialists</p>
                </button>

                <button
                    className="flex flex-col items-center p-5 px-3 bg-white border border-gray-200 rounded-2xl cursor-pointer transition-all duration-300 text-center shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-blue-500 active:-translate-y-0.5 group"
                    onClick={() => {
                        if (isNewRoute) {
                            window.open('http://therxassistant-stage.healthbackend.com/external?service=find-pharmacy', '_blank');
                        } else {
                            setStep('pharmacy_select');
                        }
                    }}>
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-b from-slate-50 to-gray-200 rounded-2xl mb-3 text-blue-500 transition-all duration-300 group-hover:bg-gradient-to-b group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:scale-105">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <h3 className="m-0 mb-1 text-sm font-semibold text-gray-900 leading-tight">Find Pharmacy</h3>
                    <p className="m-0 text-xs text-gray-600 leading-snug">In-stock locations</p>
                </button>

                <button
                    className="flex flex-col items-center p-5 px-3 bg-white border border-gray-200 rounded-2xl cursor-pointer transition-all duration-300 text-center shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-blue-500 active:-translate-y-0.5 group"
                    onClick={() => {
                        if (isNewRoute) {
                            window.open('http://therxassistant-stage.healthbackend.com/external?service=insurance-help', '_blank');
                        } else {
                            setStep('insurance_assistance');
                        }
                    }}>
                    <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-b from-slate-50 to-gray-200 rounded-2xl mb-3 text-blue-500 transition-all duration-300 group-hover:bg-gradient-to-b group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:scale-105">
                        <DollarSign className="w-8 h-8" />
                    </div>
                    <h3 className="m-0 mb-1 text-sm font-semibold text-gray-900 leading-tight">Savings</h3>
                    <p className="m-0 text-xs text-gray-600 leading-snug">Patient assistance</p>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl py-2 px-3 transition-all duration-200 mx-5 focus-within:border-gray-300 focus-within:shadow-none">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Ask about your diabetes treatment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        className="flex-1 py-2 px-3 border-none outline-none text-sm bg-transparent placeholder:text-gray-500"
                    />
                    <button
                        className="flex items-center justify-center p-2 bg-blue-500 text-white border-none rounded-lg cursor-pointer transition-all duration-200 ml-2 hover:bg-blue-600 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSearch}
                        disabled={!searchQuery.trim()}>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Recent Requests Section */}
            <RecentRequests requests={requests} loadingRequestId={loadingRequestId} onRequestAction={handleRequestAction} isNewRoute={isNewRoute} onFindPharmacy={handleFindPharmacy} />

            {/* Healthcare Options Grid */}
            <div className="grid grid-cols-3 gap-3 p-5 mt-4 bg-white rounded-t-xl border-t border-gray-200">
                <button
                    className="flex flex-col items-center p-4 px-3 bg-slate-50 border border-gray-200 rounded-xl cursor-pointer transition-all duration-300 text-center min-h-[100px] hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-500 hover:bg-white active:translate-y-0 group"
                    onClick={() => openChatWithMessage('Schedule and dosage', 'About diabetrix')}>
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-b from-slate-100 to-gray-200 rounded-xl mb-2 text-blue-500 transition-all duration-300 group-hover:bg-gradient-to-b group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:scale-105">
                        <Pill className="w-6 h-6" />
                    </div>
                    <h4 className="m-0 mb-1 text-xs font-semibold text-gray-900 leading-tight">About diabetrix</h4>
                    <p className="m-0 text-xs text-gray-600 leading-snug">Schedule and dosage</p>
                </button>

                <button
                    className="flex flex-col items-center p-4 px-3 bg-slate-50 border border-gray-200 rounded-xl cursor-pointer transition-all duration-300 text-center min-h-[100px] hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-500 hover:bg-white active:translate-y-0 group"
                    onClick={() => openChatWithMessage('About diabetes', 'About diabetes')}>
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-b from-slate-100 to-gray-200 rounded-xl mb-2 text-blue-500 transition-all duration-300 group-hover:bg-gradient-to-b group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:scale-105">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h4 className="m-0 mb-1 text-xs font-semibold text-gray-900 leading-tight">About diabetes</h4>
                    <p className="m-0 text-xs text-gray-600 leading-snug">Education & info</p>
                </button>

                <button
                    className="flex flex-col items-center p-4 px-3 bg-slate-50 border border-gray-200 rounded-xl cursor-pointer transition-all duration-300 text-center min-h-[100px] hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-500 hover:bg-white active:translate-y-0 group"
                    onClick={() => openChatWithMessage('Help', 'Help')}>
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-b from-slate-100 to-gray-200 rounded-xl mb-2 text-blue-500 transition-all duration-300 group-hover:bg-gradient-to-b group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white group-hover:scale-105">
                        <Syringe className="w-6 h-6" />
                    </div>
                    <h4 className="m-0 mb-1 text-xs font-semibold text-gray-900 leading-tight">Help</h4>
                    <p className="m-0 text-xs text-gray-600 leading-snug">How to use</p>
                </button>
            </div>
        </div>
    );
};

export default HomePage;
