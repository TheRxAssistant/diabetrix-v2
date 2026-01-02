import React from 'react';
import { AlertCircle, Calendar, CheckCircle, Clock, CreditCard, DollarSign, FileText, MapPin, MessageCircle, Phone, Stethoscope } from 'lucide-react';

interface Request {
    id: string;
    type: 'pharmacy' | 'doctor' | 'insurance' | 'support';
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    date: string;
    description: string;
    task_type_name?: string;
}

interface RecentRequestsProps {
    requests: Request[];
    loadingRequestId: string | null;
    onRequestAction: (request: Request) => void;
    isNewRoute?: boolean;
    onFindPharmacy: () => void;
    is_loading?: boolean;
}

const RecentRequests: React.FC<RecentRequestsProps> = ({ requests, loadingRequestId, onRequestAction, isNewRoute = false, onFindPharmacy, is_loading = false }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'in_progress':
                return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'pending':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTypeIcon = (request: Request) => {
        // Use task_type_name if available, otherwise fall back to type
        const task_type = request.task_type_name?.toLowerCase() || request.type;

        switch (task_type) {
            // Database task types
            case 'doctor-appointment-booking':
                return <Stethoscope className="w-5 h-5" />;
            case 'insurance-request':
                return <CreditCard className="w-5 h-5" />;
            case 'copay-request':
                return <DollarSign className="w-5 h-5" />;
            case 'pharmacy-stock-check':
                return <MapPin className="w-5 h-5" />;
            case 'prior-authorization':
                return <FileText className="w-5 h-5" />;
            case 'send-sms':
                return <Phone className="w-5 h-5" />;
            // Fallback to simplified types for backward compatibility
            case 'pharmacy':
                return <MapPin className="w-5 h-5" />;
            case 'doctor':
                return <Stethoscope className="w-5 h-5" />;
            case 'insurance':
                return <CreditCard className="w-5 h-5" />;
            case 'support':
                return <MessageCircle className="w-5 h-5" />;
            default:
                return <Calendar className="w-5 h-5" />;
        }
    };

    const getIconColor = (request: Request) => {
        const task_type = request.task_type_name?.toLowerCase() || request.type;
        switch (task_type) {
            case 'doctor-appointment-booking':
            case 'doctor':
                return 'text-blue-600 bg-blue-50';
            case 'insurance-request':
            case 'insurance':
                return 'text-purple-600 bg-purple-50';
            case 'copay-request':
                return 'text-green-600 bg-green-50';
            case 'pharmacy-stock-check':
            case 'pharmacy':
                return 'text-orange-600 bg-orange-50';
            case 'prior-authorization':
                return 'text-indigo-600 bg-indigo-50';
            case 'send-sms':
                return 'text-teal-600 bg-teal-50';
            case 'support':
                return 'text-gray-600 bg-gray-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'in_progress':
                return <Clock className="w-4 h-4" />;
            case 'pending':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    // Skeleton Loader Component
    const SkeletonLoader = () => (
        <div className="space-y-3">
            {[1, 2, 3].map((index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                    <div className="flex items-start mb-3">
                        {/* Icon Skeleton */}
                        <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                        {/* Content Skeleton */}
                        <div className="flex-1 min-w-0">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                    {/* Footer Skeleton */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="px-5 pb-5">
            <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Your Recent Requests</h2>
                <p className="text-xs text-gray-500 mt-1">Track your service requests</p>
            </div>

            {/* Loading State */}
            {is_loading ? (
                <SkeletonLoader />
            ) : (
                <>
                    <div className="space-y-3">
                        {requests.map((request) => (
                            <div key={request.id} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group cursor-pointer backdrop-blur-sm">
                                {/* Main Content */}
                                <div className="flex items-start mb-3">
                                    {/* Icon */}
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-xl mr-4 transition-all duration-300 group-hover:shadow-md ${getIconColor(request)}`}>
                                        {getTypeIcon(request)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-1.5 group-hover:text-blue-700 transition-colors duration-200">{request.title}</h3>
                                        <div className="relative group/desc">
                                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{request.description}</p>
                                            {request.description && (
                                                <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/desc:opacity-100 group-hover/desc:visible transition-all duration-200 z-10 max-w-xs whitespace-normal pointer-events-none">
                                                    {request.description}
                                                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-500 font-medium">
                                            {new Date(request.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${getStatusColor(request.status)} flex-shrink-0`}>
                                        {getStatusIcon(request.status)}
                                        <span className="capitalize">{request.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {requests.length === 0 && (
                        <div className="text-center py-16 px-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl">
                            <div className="text-5xl mb-4 opacity-50">📋</div>
                            <h3 className="text-base font-bold text-gray-900 mb-2">No requests yet</h3>
                            <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">Start by finding a pharmacy or connecting with a doctor</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RecentRequests;
