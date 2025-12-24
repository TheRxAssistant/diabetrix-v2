import React, { useState } from 'react';

const avatar = '/assets/images/avatar.png';

interface AdditionalInfoStepProps {
    onSubmit: (dateOfBirth: string, ssn: string) => void;
    onBack: () => void;
    isLoading: boolean;
    requiredFields?: string[];
}

export const AdditionalInfoStep: React.FC<AdditionalInfoStepProps> = ({
    onSubmit,
    onBack,
    isLoading,
    requiredFields = []
}) => {
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [ssn, setSsn] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check only required fields
        const needsBirthDate = requiredFields.includes('birthDate');
        const needsSSN = requiredFields.includes('ssn');

        if (needsBirthDate && !dateOfBirth.trim()) {
            return;
        }
        if (needsSSN && !ssn.trim()) {
            return;
        }

        onSubmit(dateOfBirth, ssn);
    };

    const formatSsn = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        return cleaned.slice(0, 4);
    };

    const needsBirthDate = requiredFields.includes('birthDate');
    const needsSSN = requiredFields.includes('ssn');

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex flex-col items-center px-6 pt-4 pb-3">
                <button 
                    className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors" 
                    onClick={onBack}
                >
                    <i className="fas fa-arrow-left text-lg"></i>
                </button>
                <div className="w-12 h-12 rounded-full overflow-hidden mb-3">
                    <img src={avatar} alt="Alex" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">Additional Information Required</h3>
                <p className="text-sm text-gray-600 text-center">
                    We need a bit more information to verify your identity
                </p>
            </div>

            {/* Form */}
            <div className="flex-1 px-6">
                <form onSubmit={handleSubmit} className="h-full flex flex-col">
                    <div className="space-y-4 mb-4">
                        {needsBirthDate && (
                            <div>
                                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    id="dob"
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required={needsBirthDate}
                                />
                            </div>
                        )}

                        {needsSSN && (
                            <div>
                                <label htmlFor="ssn" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last 4 Digits of SSN
                                </label>
                                <input
                                    id="ssn"
                                    type="text"
                                    value={ssn}
                                    onChange={(e) => setSsn(formatSsn(e.target.value))}
                                    placeholder="XXXX"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-xl tracking-widest font-mono"
                                    maxLength={4}
                                    required={needsSSN}
                                />
                                <p className="text-xs text-gray-500 mt-1">This information is encrypted and used only for identity verification</p>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-auto pb-6">
                        <button
                            type="submit"
                            disabled={isLoading || (needsBirthDate && !dateOfBirth.trim()) || (needsSSN && !ssn.trim())}
                            className="w-full bg-gradient-to-br from-[#0077cc] to-[#0099dd] hover:shadow-lg hover:-translate-y-0.5 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Verify Information</span>
                                    <i className="fas fa-arrow-right ml-2"></i>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

