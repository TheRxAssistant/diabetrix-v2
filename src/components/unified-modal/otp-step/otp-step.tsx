import React, { useEffect, useRef } from 'react';
import { isValidOtp } from '../utils/phone-utils';

const avatar = '/assets/images/avatar.png';

interface OtpStepProps {
    phoneNumber: string;
    otp: string;
    error: string;
    isLoading: boolean;
    onOtpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBack: () => void;
}

export const OtpStep: React.FC<OtpStepProps> = ({
    phoneNumber,
    otp,
    error,
    isLoading,
    onOtpChange,
    onSubmit,
    onBack
}) => {
    const hasSubmittedRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevOtpRef = useRef(otp);
    const isInitialMountRef = useRef(true);

    // Reset ref on mount to prevent auto-submit when navigating back
    useEffect(() => {
        hasSubmittedRef.current = false;
        prevOtpRef.current = otp;
        isInitialMountRef.current = true;
        // Mark that initial mount is complete after a brief delay
        const timer = setTimeout(() => {
            isInitialMountRef.current = false;
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Autofocus input when component mounts
    useEffect(() => {
        // Small delay to ensure the modal animation completes
        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Auto-submit when OTP reaches 6 digits
    useEffect(() => {
        const prevOtp = prevOtpRef.current;
        const currentOtp = otp;
        
        // Update previous OTP
        prevOtpRef.current = currentOtp;

        // Reset ref when OTP becomes invalid (user edits it)
        if (!isValidOtp(currentOtp)) {
            hasSubmittedRef.current = false;
            return;
        }

        // Only auto-submit if:
        // 1. OTP is valid (6 digits)
        // 2. Not loading and no error
        // 3. Not already submitted
        // 4. OTP length increased (user is typing forward, not navigating back)
        //    This prevents auto-submit when navigating back (component mounts with existing 6-digit OTP)
        const prevLength = prevOtp.length;
        const currentLength = currentOtp.length;
        const isTypingForward = currentLength > prevLength;

        if (!isLoading && !error && !hasSubmittedRef.current && isTypingForward) {
            hasSubmittedRef.current = true;
            const syntheticEvent = {
                preventDefault: () => {},
            } as React.FormEvent;
            onSubmit(syntheticEvent);
        }
    }, [otp, isLoading, error, onSubmit]);
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
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">Verify Your Number</h3>
                <p className="text-sm text-gray-600 text-center">
                    We sent a code to {phoneNumber}
                </p>
            </div>

            {/* Form */}
            <div className="flex-1 px-6">
                <form onSubmit={onSubmit} className="h-full flex flex-col">
                    {/* OTP Input */}
                    <div className="mb-4">
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <input
                            ref={inputRef}
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={onOtpChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-2xl tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                            required
                        />
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
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <span>Verify</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

