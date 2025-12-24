import { useState, useCallback } from 'react';

type StepType = 'intro' | 'service_selection' | 'service_detail' | 'phone' | 'otp' | 'additional_info' | 'confirm_profile' | 'success' | 
  'healthcare_search' | 'insurance_assistance' | 'pharmacy_select' | 'pharmacy_checking' | 
  'embedded_chat' | 'home' | 'more' | 'profile';

export const useModalState = (initialStep: StepType = 'home') => {
  const [step, setStep] = useState<StepType>(initialStep);
  const [selectedService, setSelectedService] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [isAuthenticatedSession, setIsAuthenticatedSession] = useState<boolean>(false);
  const [pendingChatMessage, setPendingChatMessage] = useState<string | null>(null);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [shouldEditProfile, setShouldEditProfile] = useState<boolean>(false);

  const resetError = useCallback(() => setError(''), []);
  const resetAuth = useCallback(() => {
    setPhoneNumber('');
    setOtp('');
    setError('');
    setUserData(null);
    setIsAuthenticatedSession(false);
    setRequiredFields([]);
    setShouldEditProfile(false);
  }, []);

  return {
    step,
    setStep,
    selectedService,
    setSelectedService,
    phoneNumber,
    setPhoneNumber,
    otp,
    setOtp,
    error,
    setError,
    resetError,
    isLoading,
    setIsLoading,
    userData,
    setUserData,
    isAuthenticatedSession,
    setIsAuthenticatedSession,
    pendingChatMessage,
    setPendingChatMessage,
    requiredFields,
    setRequiredFields,
    shouldEditProfile,
    setShouldEditProfile,
    resetAuth,
  };
};

