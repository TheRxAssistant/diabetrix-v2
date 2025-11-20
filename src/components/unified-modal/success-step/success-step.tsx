import React from 'react';

const avatar = '/assets/images/avatar.png';

interface SuccessStepProps {
    userData: any;
    selectedService: string;
    onBack: () => void;
    onContinue: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ userData, selectedService, onBack, onContinue }) => {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex flex-col items-center px-6 pt-4 pb-3">
                <button 
                    className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors" 
                    onClick={onBack}>
                    <i className="fas fa-arrow-left text-lg"></i>
                </button>
                <div className="flex items-center justify-center mb-16">{/* Spacer */}</div>
                <h2 className="text-xl font-semibold text-gray-900 text-center mb-1">Confirm Your Information</h2>
                <p className="text-sm text-gray-600 text-center leading-tight">
                    Please review your information and confirm it's correct before proceeding.
                </p>
            </div>

            {/* Content */}
            {userData && (
                <div className="px-6 py-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2">
                                <span className="flex items-center text-sm text-gray-600">
                                    <i className="fas fa-user text-blue-500 mr-2"></i> Name
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {userData.first_name} {userData.last_name}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <span className="flex items-center text-sm text-gray-600">
                                    <i className="fas fa-phone text-blue-500 mr-2"></i> Phone
                                </span>
                                <span className="text-sm font-medium text-gray-900">{userData.phone_number}</span>
                            </div>

                            {userData.address && (
                                <div className="flex items-start justify-between py-2">
                                    <span className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-home text-blue-500 mr-2"></i> Address
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 text-right">
                                        <div>{userData.address.street}</div>
                                        <div>
                                            {userData.address.city}, {userData.address.state} {userData.address.zip_code}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {userData.ssn && (
                                <div className="flex items-center justify-between py-2">
                                    <span className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-id-card text-blue-500 mr-2"></i> SSN
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">XXX-XX-{userData.ssn.slice(-4)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="px-6 pb-6 pt-3">
                <button
                    className="w-full bg-gradient-to-br from-[#0077cc] to-[#0099dd] hover:shadow-lg hover:-translate-y-0.5 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200"
                    onClick={onContinue}>
                    <i className="fas fa-check"></i>
                    <span>Confirm & Continue</span>
                </button>
            </div>
        </div>
    );
};

