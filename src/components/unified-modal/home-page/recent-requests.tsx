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
}

const RecentRequests: React.FC<RecentRequestsProps> = ({ requests, loadingRequestId, onRequestAction, isNewRoute = false, onFindPharmacy }) => {
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

    return (
        <div className="px-5 pb-5">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Recent Requests</h2>
            </div>

            <div className="space-y-3">
                {requests.map((request) => (
                    <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
                        {/* Main Content */}
                        <div className="flex items-start mb-3">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mr-3 group-hover:bg-gray-100 transition-colors duration-200">
                                <div className="text-gray-600">{getTypeIcon(request)}</div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 line-clamp-1 mb-1.5">{request.title}</h3>
                                <div className="relative group/desc">
                                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{request.description}</p>
                                    {request.description && (
                                        <div className="absolute left-0 bottom-full mb-2 px-3 py-2 bg-white text-black text-xs rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover/desc:opacity-100 group-hover/desc:visible transition-all duration-200 z-10 max-w-xs whitespace-normal pointer-events-none">
                                            {request.description}
                                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-xs text-gray-500 font-medium">
                                {new Date(request.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)} flex-shrink-0`}>
                                {getStatusIcon(request.status)}
                                <span className="capitalize">{request.status.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {requests.length === 0 && (
                <div className="text-center py-12 px-5 bg-white border border-gray-200 rounded-xl">
                    <div className="text-4xl mb-4 opacity-60">📋</div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">No requests yet</h3>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">Start by finding a pharmacy or connecting with a doctor</p>
                </div>
            )}
        </div>
    );
};

export default RecentRequests;
