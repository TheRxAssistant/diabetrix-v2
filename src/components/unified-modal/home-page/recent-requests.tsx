import React from 'react';
import { AlertCircle, ArrowRight, Calendar, CheckCircle, Clock, CreditCard, Loader2, MapPin, MessageCircle, Stethoscope } from 'lucide-react';

interface Request {
    id: string;
    type: 'pharmacy' | 'doctor' | 'insurance' | 'support';
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    date: string;
    description: string;
}

interface RecentRequestsProps {
    requests: Request[];
    loadingRequestId: string | null;
    onRequestAction: (request: Request) => void;
    isNewRoute?: boolean;
    onFindPharmacy: () => void;
}

const RecentRequests: React.FC<RecentRequestsProps> = ({
    requests,
    loadingRequestId,
    onRequestAction,
    isNewRoute = false,
    onFindPharmacy
}) => {
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

    const getTypeIcon = (type: string) => {
        switch (type) {
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

    const getButtonColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200';
            case 'in_progress':
                return 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200';
            case 'pending':
                return 'bg-gray-500 hover:bg-gray-600 text-white shadow-gray-200';
            default:
                return 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200';
        }
    };

    return (
        <div className="px-5 pb-5">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Your Recent Requests</h2>
                <button className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200">
                    View All
                </button>
            </div>

            <div className="space-y-3">
                {requests.map((request) => (
                    <div 
                        key={request.id} 
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
                    >
                        {/* Main Content */}
                        <div className="flex items-start mb-3">
                            {/* Icon */}
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg mr-3 group-hover:bg-gray-100 transition-colors duration-200">
                                <div className="text-gray-600">
                                    {getTypeIcon(request.type)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1.5 gap-2">
                                    <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                                        {request.title}
                                    </h3>
                                    <div className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)} flex-shrink-0`}>
                                        {getStatusIcon(request.status)}
                                        <span className="capitalize">{request.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                    {request.description}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500 font-medium">
                                {new Date(request.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                            
                            <button 
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm hover:shadow-md ${getButtonColor(request.status)} disabled:opacity-50 disabled:cursor-not-allowed`}
                                onClick={() => onRequestAction(request)}
                                disabled={loadingRequestId === request.id}
                            >
                                {loadingRequestId === request.id ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        {getNextStepAction(request.type, request.status)}
                                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {requests.length === 0 && (
                <div className="text-center py-12 px-5 bg-white border border-gray-200 rounded-xl">
                    <div className="text-4xl mb-4 opacity-60">📋</div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">No requests yet</h3>
                    <p className="text-sm text-gray-600 mb-5 max-w-xs mx-auto leading-relaxed">
                        Start by finding a pharmacy or connecting with a doctor
                    </p>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                        onClick={onFindPharmacy}
                    >
                        Find Pharmacy
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentRequests;
