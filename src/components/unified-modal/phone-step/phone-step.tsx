import React, { useEffect, useRef } from 'react';
import { isValidPhoneNumber } from '../utils/phone-utils';

const avatar = '/assets/images/avatar.png';

interface PhoneStepProps {
    phoneNumber: string;
    error: string;
    isLoading: boolean;
    onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}

export const PhoneStep: React.FC<PhoneStepProps> = ({
    phoneNumber,
    error,
    isLoading,
    onPhoneChange,
    onSubmit,
    onBack
}) => {
    const hasSubmittedRef = useRef(false);
    const prevPhoneNumberRef = useRef(phoneNumber);
    const isInitialMountRef = useRef(true);

    // Reset ref on mount to prevent auto-submit when navigating back
    useEffect(() => {
        hasSubmittedRef.current = false;
        prevPhoneNumberRef.current = phoneNumber;
        isInitialMountRef.current = true;
        // Mark that initial mount is complete after a brief delay
        const timer = setTimeout(() => {
            isInitialMountRef.current = false;
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Auto-submit when phone number reaches 10 digits
    useEffect(() => {
        const prevPhone = prevPhoneNumberRef.current;
        const currentPhone = phoneNumber;
        
        // Update previous phone number
        prevPhoneNumberRef.current = currentPhone;

        // Reset ref when phone number becomes invalid (user edits it)
        if (!isValidPhoneNumber(currentPhone)) {
            hasSubmittedRef.current = false;
            return;
        }

        // Only auto-submit if:
        // 1. Phone number is valid (10 digits)
        // 2. Not loading and no error
        // 3. Not already submitted
        // 4. Phone number increased in length (user is typing forward, not navigating back)
        //    This prevents auto-submit when navigating back (component mounts with existing 10-digit number)
        const prevDigits = prevPhone.replace(/\D/g, '').length;
        const currentDigits = currentPhone.replace(/\D/g, '').length;
        const isTypingForward = currentDigits > prevDigits;

        if (!isLoading && !error && !hasSubmittedRef.current && isTypingForward) {
            hasSubmittedRef.current = true;
            const syntheticEvent = {
                preventDefault: () => {},
            } as React.FormEvent;
            onSubmit(syntheticEvent);
        }
    }, [phoneNumber, isLoading, error, onSubmit]);
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
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">Quick Verification</h3>
                <p className="text-sm text-gray-600 text-center">Enter your phone number for instant access</p>
            </div>

            {/* Form */}
            <div className="flex-1 px-6">
                <form onSubmit={onSubmit} className="h-full flex flex-col">
                    {/* Disclaimer */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-xs text-gray-600 leading-relaxed">
                        By entering my phone number, I agree that Verified (HealthCare+'s service provider) and its vendors may receive my personal info and autofill more info about me, including my social security number.
                    </div>

                    {/* Phone Input */}
                    <div className="mb-4">
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <input
                                id="phone_number"
                                type="text"
                                value={phoneNumber}
                                onChange={onPhoneChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="(999) 999-9999"
                                required
                            />
                        </div>
                        <div className="text-xs text-gray-500 mt-2">1-Click Signup powered by Verified</div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-auto pb-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-br from-[#0077cc] to-[#0099dd] hover:shadow-lg hover:-translate-y-0.5 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Sending OTP...</span>
                                </>
                            ) : (
                                <span>Send OTP</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

