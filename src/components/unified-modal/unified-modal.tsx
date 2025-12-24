import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import styles from './unified-modal.module.scss';
import { sendMedicationAvailability, sendWelcomeMessage } from '../../services/smsService';
import { featuredPharmacies } from '../../data/pharmacies/pharmacies';
import { AIService } from '../../services/ai-service';
import { postAPI, INDEX_MEMBER_API_URLS } from '../../services/api';
import ChatHeader from '../chat/chat-header/chat-header';
import ChatBody from '../chat/chat-body/chat-body';
import ChatFooter from '../chat/chat-footer/chat-footer';
import { useChat } from '../../services/chat/hooks-chat';
import HomePage from './home-page/home-page';
import MorePage from './more-page/more-page';
import BottomNavigation from './bottom-navigation/bottom-navigation';
import { serviceContents } from './service-contents';
import { IntroStep } from './intro-step/intro-step';
import { PhoneStep } from './phone-step/phone-step';
import { OtpStep } from './otp-step/otp-step';
import { AdditionalInfoStep } from './additional-info-step/additional-info-step';
import { ConfirmProfileStep } from './confirm-profile-step/confirm-profile-step';
import { SuccessStep } from './success-step/success-step';
import { ProfilePage } from './profile-page/profile-page';
import { ServiceDetailStep } from './service-detail-step/service-detail-step';
import { HealthcareSearchStep } from './healthcare-search-step/healthcare-search-step';
import { InsuranceAssistanceStep } from './insurance-assistance-step/insurance-assistance-step';
import { PharmacySelectStep } from './pharmacy-select-step/pharmacy-select-step';
import { PharmacyCheckingStep } from './pharmacy-checking-step/pharmacy-checking-step';
import { EmbeddedChatStep } from './embedded-chat-step/embedded-chat-step';
// Custom hooks
import { useModalState } from './hooks/useModalState';
import { useChatState } from './hooks/useChatState';
import { usePharmacyState } from './hooks/usePharmacyState';
// Utilities
import { formatPhoneNumber, formatOtp, isValidPhoneNumber } from './utils/phone-utils';
import { SERVICE_TYPES } from './utils/constants';
import { CAPABILITIES_API_URLS } from '../../services/api';
// Services
import { sendOtp, verifyOtp, verifyUserByVerified, generateAccessToken, syncUser, checkAuthSession } from './services/auth-service';
import { trackingService } from '../../services/tracking/tracking-service';
import { useAuthStore } from '../../store/authStore';


interface UnifiedModalProps {
    onClose: () => void;
    onChatOpen?: () => void;
    initialStep?: 'intro' | 'service_selection' | 'home';
}

export const UnifiedModal = ({ onClose, onChatOpen, initialStep = 'home' }: UnifiedModalProps) => {
    const isGoodRx = useMemo(() => window.location.pathname.includes('goodrx'), []);
    
    // Create a wrapper for onClose that removes the session storage item
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    // Custom hooks for state management
    const modalState = useModalState(initialStep as any);
    const chatState = useChatState();
    const pharmacyState = usePharmacyState();

    // Destructure for easier access
    const { step, setStep, selectedService, setSelectedService, phoneNumber, setPhoneNumber, 
            otp, setOtp, error, setError, resetError, isLoading, setIsLoading,
            userData, setUserData, isAuthenticatedSession, setIsAuthenticatedSession,
            pendingChatMessage, setPendingChatMessage, requiredFields, setRequiredFields,
            shouldEditProfile, setShouldEditProfile } = modalState;

    const { chatResetKey, setChatResetKey, isChatActive, setIsChatActive, pendingMessages, 
            setPendingMessages, inputMessage: input_message, setInputMessage, isLearnFlow, setIsLearnFlow,
            showQuickReplies, setShowQuickReplies, currentQuickReplies, setCurrentQuickReplies,
            lastLearnTopic, setLastLearnTopic, usedQuickReplies, setUsedQuickReplies,
            showLearnOverlay, setShowLearnOverlay } = chatState;

    const { selectedPharmacy, setSelectedPharmacy, selectedPharmacies, setSelectedPharmacies,
            pharmacyCheckDone, setPharmacyCheckDone, checkingPharmacies, setCheckingPharmacies,
            currentCheckIndex, setCurrentCheckIndex, currentSubStep, setCurrentSubStep,
            notifiedMap, setNotifiedMap, startPharmacyCheck } = pharmacyState;

    // Parse URL parameters early so they're available throughout the component
    const urlParams = new URLSearchParams(window.location.search);
    const isAuthRequired = urlParams.get('is_auth_required') === 'true';

    // Local state not in hooks
    const [showAnimation, setShowAnimation] = useState(false);
    const [isTyping, setIsTyping] = useState(true);
    const [requestInsuranceOnInit, setRequestInsuranceOnInit] = useState<boolean>(false);
    const [showExternalLinkConfirmation, setShowExternalLinkConfirmation] = useState<boolean>(false);
    const [pendingExternalUrl, setPendingExternalUrl] = useState<string>('');
    
    const messages_end_ref = useRef<HTMLDivElement | null>(null);
    const { 
        messages: chatMessages, 
        is_loading: chatLoading, 
        is_waiting_for_response, 
        is_streaming, 
        streaming_message,
        sendMessage: sendChatMessage, 
        createChatThread,
        conversation_id,
        error_message: chatError
    } = useChat();

    // Convert chat messages to the format expected by ChatBody
    const messages = chatMessages.map((msg, index) => ({
        id: index + 1,
        content: msg.message,
        role: msg.role === 'human' ? 'user' : 'assistant',
        buttons: msg.buttons,
        timestamp: new Date(msg.created_at),
    }));

    const loading = is_waiting_for_response || chatLoading;
    const is_reconnecting = false; // Not needed with streaming API

    // Wrapper function for setStep to match expected type signature
    const handleSetStep = (newStep: string) => {
        setStep(newStep as any);
    };

    const openEmbeddedChatAndSend = useCallback(async (message?: string) => {
        setIsChatActive(true);
        // Create chat thread if not already created
        if (!conversation_id) {
            await createChatThread();
        }
        setStep('embedded_chat' as any);
        // Send initial message if provided
        if (message && typeof message === "string" && message.trim().length > 0) {
            setPendingMessages([message]);
        }
    }, [conversation_id, createChatThread, setIsChatActive, setStep]);

    // AI-powered follow-up replies generation
    const getFollowUpReplies = useCallback(async (usedReply: string, messages: any[]): Promise<string[]> => {
        try {
            console.log('🔄 Generating AI follow-up replies for:', usedReply);
            const aiReplies = await AIService.generateQuickReplies(messages);
            return aiReplies.map((reply) => reply.text);
        } catch (error) {
            console.error('❌ Error generating follow-up replies:', error);
            // Fallback to simple responses
            return ['Tell me more', 'What else?', 'Any concerns?', 'Next steps?'];
        }
    }, []);

    // AI-powered initial replies generation for topics
    const getInitialRepliesForTopic = useCallback(async (topic: string, messages: any[]): Promise<string[]> => {
        try {
            console.log('🎯 Generating AI initial replies for topic:', topic);
            const aiReplies = await AIService.generateQuickReplies(messages);
            return aiReplies.map((reply) => reply.text);
        } catch (error) {
            console.error('❌ Error generating initial replies:', error);
            switch (topic.toLowerCase()) {
                case 'about diabetrix':
                case 'side effects':
                    return ['Tell me more', 'Any precautions?', 'How often?', 'What else should I know?'];
                default:
                    return ['Tell me more', 'How does this help?', "What's next?", 'Any concerns?'];
            }
        }
    }, []);

    // AI-powered quick replies generation
    const generateQuickRepliesForTopic = useCallback(async (topic: string, messages: any[]): Promise<string[]> => {
        try {
            console.log('🚀 Generating AI quick replies for topic:', topic, 'with', messages.length, 'messages');

            const aiReplies = await AIService.generateQuickReplies(messages);
            const replyTexts = aiReplies.map((reply) => reply.text);

            // Return all quick replies from backend without filtering
            return replyTexts;
        } catch (error) {
            console.error('❌ Error generating quick replies:', error);
            return ['Tell me more', 'What else?', 'Any concerns?', 'How can I help?'];
        }
    }, []);

    // Initialize tracking on component mount
    useEffect(() => {
        const initializeTracking = async () => {
            const authStore = useAuthStore.getState();
            const user = authStore.user;
            const user_id = user?.userData?.user_id;
            await trackingService.initializeTracking(user_id);
        };
        initializeTracking();
    }, []);

    // Effect to send pending messages when chat becomes active and conversation is ready
    useEffect(() => {
        if (pendingMessages.length > 0 && isChatActive && conversation_id) {
            const tryToSendMessages = async () => {
                const messagesToSend = [...pendingMessages];

                for (let index = 0; index < messagesToSend.length; index++) {
                    await new Promise(resolve => setTimeout(resolve, index * 800));
                    try {
                        await sendChatMessage(messagesToSend[index]);
                        console.log(`Sending message "${messagesToSend[index]}"`);
                        if (index === messagesToSend.length - 1) {
                            // Clear pending messages only after the last message is sent successfully
                            setPendingMessages([]);
                        }
                    } catch (error) {
                        console.error(`Failed to send message "${messagesToSend[index]}":`, error);
                    }
                }
            };

            const timer = setTimeout(tryToSendMessages, 500);
            return () => clearTimeout(timer);
        }
    }, [pendingMessages, isChatActive, conversation_id, sendChatMessage]);

    // Track the last message ID we've generated quick replies for to prevent infinite loops
    const lastProcessedMessageIdRef = useRef<string | number | null>(null);

    // Effect to show AI-generated quick replies after AI responds (works for all chat types)
    useEffect(() => {
        if (messages.length > 0 && !loading && !is_streaming && step === 'embedded_chat') {
            // Check if the last message is from the assistant (AI)
            const lastMessage = messages[messages.length - 1];
            const lastMessageId = lastMessage?.id;
            
            // Only generate quick replies if:
            // 1. Last message is from AI
            // 2. We haven't processed this message yet
            // 3. Not currently streaming
            if (lastMessage && lastMessage.role !== 'user' && lastMessageId !== lastProcessedMessageIdRef.current) {
                // Mark this message as processed
                lastProcessedMessageIdRef.current = lastMessageId;
                
                // Generate AI quick replies immediately
                (async () => {
                    try {
                        console.log('🎪 Triggering AI quick replies generation...');

                        // Use lastLearnTopic if available (for learn flow), otherwise use generic topic
                        const topic = lastLearnTopic || 'general_chat';
                        const aiReplies = await generateQuickRepliesForTopic(topic, messages);

                        console.log('✨ Setting AI quick replies:', aiReplies);
                        setCurrentQuickReplies(aiReplies);
                        setShowQuickReplies(true);
                    } catch (error) {
                        console.error('💥 Error setting quick replies:', error);
                        // Fallback to simple replies
                        setCurrentQuickReplies(['Tell me more', 'What else?', 'Any concerns?', 'How can I help?']);
                        setShowQuickReplies(true);
                    }
                })();
            }
        }
    }, [messages.length, loading, is_streaming, step, lastLearnTopic, generateQuickRepliesForTopic]);


    // Lock body scroll when modal is mounted (prevents background scroll on mobile/desktop)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const { body, documentElement } = document;
        const scrollY = window.scrollY || 0;
        const originalOverflow = body.style.overflow;
        const originalPosition = body.style.position;
        const originalTop = body.style.top;
        const originalWidth = body.style.width;
        const originalHtmlOverflow = documentElement.style.overflow;

        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
        documentElement.style.overflow = 'hidden';

        return () => {
            body.style.overflow = originalOverflow;
            body.style.position = originalPosition;
            body.style.top = originalTop;
            body.style.width = originalWidth;
            documentElement.style.overflow = originalHtmlOverflow;
            window.scrollTo(0, scrollY);
        };
    }, []);

    useEffect(() => {
        // Trigger animation after modal opens
        const timer = setTimeout(() => setShowAnimation(true), 300);

        // Simulate typing effect for intro
        const typingTimer = setTimeout(() => {
            setIsTyping(false);
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(typingTimer);
        };
    }, []);

    // Load session auth state on mount
    useEffect(() => {
        const { authenticated, data } = checkAuthSession();
        if (authenticated && data) {
            setIsAuthenticatedSession(true);
            setUserData(data);
            setPhoneNumber(data.phone_number || '');
        }
    }, [setIsAuthenticatedSession, setUserData, setPhoneNumber]);

    // Phone and OTP input handlers
    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    }, [setPhoneNumber]);

    const handleOtpChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatOtp(e.target.value);
        setOtp(formatted);
    }, [setOtp]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!phoneNumber || phoneNumber.length < 14) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsLoading(true);

        try {
            const result = await postAPI(CAPABILITIES_API_URLS.SEND_OTP, {
                phone_number: phoneNumber,
            });

            if (result.statusCode === 200) {
                setStep('otp');
            } else {
                setError(result.message || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error('Error sending OTP:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);

        try {
            const result = await verifyOtp(phoneNumber, otp);
            
            if (result.success && result.statusCode === 200 && result.data?.user_id) {
                // User already exists - complete authentication
                setUserData(result.data);
                setIsAuthenticatedSession(true);
                
                // Track user login/signup milestone
                const userData = result.data;
                if (userData?.user_id || userData?.user?.user_id) {
                    const user_id = userData?.user_id || userData?.user?.user_id;
                    await trackingService.initializeTracking(user_id);
                    await trackingService.syncTimeline({
                        event_name: 'user_logged_in',
                        title: 'User Logged In',
                        description: `User ${userData?.first_name || ''} ${userData?.last_name || ''} logged in`,
                        event_payload: {
                            phone_number: phoneNumber,
                        },
                    });
                } else {
                    // Initialize tracking even without user_id
                    await trackingService.initializeTracking();
                }
                
                // Send welcome message
                if (phoneNumber) {
                    try {
                        sendWelcomeMessage(phoneNumber);
                        console.log('Welcome message sent successfully');
                    } catch (error) {
                        console.error('Failed to send welcome message:', error);
                    }
                }
                
                // If auth was required via URL param and we have a selected service, go directly to that service
                if (isAuthRequired && selectedService) {
                    if (selectedService === 'doctor') {
                        setStep('healthcare_search');
                    } else if (selectedService === 'insurance') {
                        setStep('insurance_assistance');
                    } else if (selectedService === 'pharmacy') {
                        setStep('pharmacy_select');
                    } else if (selectedService === 'chat') {
                        openEmbeddedChatAndSend();
                    } else if (selectedService === 'learn') {
                        setShowLearnOverlay(true);
                        setStep('embedded_chat');
                        setIsChatActive(false);
                    } else {
                        setStep('success' as any);
                    }
                } else {
                    // Default behavior: go to success step
                    setStep('success' as any);
                }
            } else if (result.statusCode === 435) {
                // Additional info required
                setRequiredFields(result.additionalInputs || []);
                setStep('additional_info' as any);
            } else if (result.statusCode === 200 && result.data?.user_data) {
                // Success - user data retrieved, proceed to confirm profile
                setUserData(result.data.user_data);
                // Handle multiple addresses
                if (Array.isArray(result.data.user_data.address) && result.data.user_data.address.length > 1) {
                    const selectedAddress = result.data.user_data.address.find((addr: any) => addr.is_selected);
                    if (selectedAddress) {
                        result.data.user_data.address = selectedAddress;
                    } else {
                        result.data.user_data.address = result.data.user_data.address[0];
                    }
                }
                setStep('confirm_profile' as any);
            } else if (result.statusCode === 437 || result.statusCode === 407) {
                // User not found or access denied - allow manual entry
                setUserData({ phone_number: phoneNumber });
                setShouldEditProfile(true);
                setStep('confirm_profile' as any);
            } else if (result.statusCode === 403) {
                // Mismatch in additional inputs - allow manual entry
                setUserData({ phone_number: phoneNumber });
                setShouldEditProfile(true);
                setStep('confirm_profile' as any);
            } else {
                setError(result.error || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error('Error verifying OTP:', error);
        } finally {
            setIsLoading(false);
        }
    }, [otp, phoneNumber, setError, setIsLoading, setUserData, setIsAuthenticatedSession, setStep, setRequiredFields, setShouldEditProfile, isAuthRequired, selectedService, openEmbeddedChatAndSend, setShowLearnOverlay, setIsChatActive]);

    const handleServiceSelect = (serviceType: string) => {
        // Check if we're on the new route and redirect to external URLs
        if (isNewRoute) {
            switch (serviceType) {
                case 'doctor':
                    setPendingExternalUrl('http://therxassistant-stage.healthbackend.com/external?service=find-doctor');
                    setShowExternalLinkConfirmation(true);
                    break;
                case 'pharmacy':
                    setPendingExternalUrl('http://therxassistant-stage.healthbackend.com/external?service=find-pharmacy');
                    setShowExternalLinkConfirmation(true);
                    break;
                case 'insurance':
                    setPendingExternalUrl('http://therxassistant-stage.healthbackend.com/external?service=insurance-help');
                    setShowExternalLinkConfirmation(true);
                    break;
                case 'learn':
                    setPendingExternalUrl('http://therxassistant-stage.healthbackend.com/external?service=live-concierge');
                    setShowExternalLinkConfirmation(true);
                    break;
                case 'chat':
                    setPendingExternalUrl('http://therxassistant-stage.healthbackend.com/external?service=live-concierge');
                    setShowExternalLinkConfirmation(true);
                    break;
                default:
                    setSelectedService(serviceType);
                    setStep('service_detail');
                    break;
            }
        } else {
            // Original behavior for normal routes
            setSelectedService(serviceType);
            // Reset learn flow flag when selecting a different service
            if (serviceType !== 'learn') {
                setIsLearnFlow(false);
            }
            // Route all services (including chat) through the service detail step.
            // Chat will proceed through verification like other services and open after success.
            setStep('service_detail');
        }
    };

    const handleExternalLinkConfirm = () => {
        if (pendingExternalUrl) {
            window.open(pendingExternalUrl, '_blank');
        }
        setShowExternalLinkConfirmation(false);
        setPendingExternalUrl('');
    };

    const handleExternalLinkCancel = () => {
        setShowExternalLinkConfirmation(false);
        setPendingExternalUrl('');
    };

    const renderIntroStep = () => (
        <IntroStep 
            isTyping={isTyping} 
            isGoodRx={isGoodRx} 
            onServiceSelect={handleServiceSelect} 
        />
    );

    const renderServiceDetailStep = () => {
        const service = serviceContents[selectedService] || serviceContents.doctor;
        
        const handleGetStarted = () => {
            // Check if authentication is required via URL parameter
            if (isAuthRequired && !isAuthenticatedSession) {
                // Navigate to phone verification step
                setStep('phone');
                return;
            }
            
            // Skip verification step - go directly to selected service
            if (selectedService === 'doctor') {
                setStep('healthcare_search');
            } else if (selectedService === 'insurance') {
                setStep('insurance_assistance');
            } else if (selectedService === 'pharmacy') {
                setStep('pharmacy_select');
            } else if (selectedService === 'chat') {
                openEmbeddedChatAndSend();
            } else if (selectedService === 'learn') {
                setShowLearnOverlay(true);
                setStep('embedded_chat');
                setIsChatActive(false);
            } else {
                handleClose();
            }
        };
        
        const handleLearnQuestionClick = (question: string) => {
            // Skip verification step - go directly to chat
            openEmbeddedChatAndSend(question);
        };

        return (
            <ServiceDetailStep
                service={service}
                selectedService={selectedService}
                isAuthenticatedSession={isAuthenticatedSession}
                onBack={() => setStep('intro')}
                onGetStarted={handleGetStarted}
                onLearnQuestionClick={handleLearnQuestionClick}
            />
        );
    };


    const renderPhoneStep = () => (
        <PhoneStep
            phoneNumber={phoneNumber}
            error={error}
            isLoading={isLoading}
            onPhoneChange={handlePhoneChange}
            onSubmit={handleSendOtp}
            onBack={() => setStep('intro')}
        />
    );

    const renderOtpStep = () => (
        <OtpStep
            phoneNumber={phoneNumber}
            otp={otp}
            error={error}
            isLoading={isLoading}
            onOtpChange={handleOtpChange}
            onSubmit={handleVerifyOtp}
            onBack={() => setStep('phone')}
        />
    );

    const handleAdditionalInfoSubmit = useCallback(async (dateOfBirth: string, ssn: string) => {
        setIsLoading(true);
        setError('');

        try {
            const result = await verifyUserByVerified(phoneNumber, dateOfBirth, ssn);

            if (result.statusCode === 200) {
                // Success - user data retrieved
                setUserData(result.data.user_data);
                // Handle multiple addresses
                if (Array.isArray(result.data.user_data.address) && result.data.user_data.address.length > 1) {
                    const selectedAddress = result.data.user_data.address.find((addr: any) => addr.is_selected);
                    if (selectedAddress) {
                        result.data.user_data.address = selectedAddress;
                    } else {
                        result.data.user_data.address = result.data.user_data.address[0];
                    }
                }
                setStep('confirm_profile' as any);
            } else if (result.statusCode === 403) {
                // Mismatch in additional inputs
                setShouldEditProfile(true);
                setStep('confirm_profile' as any);
            } else if (result.statusCode === 435) {
                // Still need more info
                setRequiredFields(result.additionalInputs || []);
                setError(`Please provide all required information: ${(result.additionalInputs || []).join(', ')}`);
            } else if (result.statusCode === 407) {
                // Maximum attempts reached or access denied
                setShouldEditProfile(true);
                setStep('confirm_profile' as any);
            } else if (result.statusCode === 437) {
                // User not found
                setUserData({ phone_number: phoneNumber });
                setShouldEditProfile(true);
                setStep('confirm_profile' as any);
            } else {
                setError(result.error || 'Verification failed. Please try again.');
            }
        } catch (error) {
            setError('Verification failed. Please try again.');
            console.error('Error submitting additional info:', error);
        } finally {
            setIsLoading(false);
        }
    }, [phoneNumber, setError, setIsLoading, setStep, setUserData, setRequiredFields, setShouldEditProfile]);

    const renderAdditionalInfoStep = () => (
        <AdditionalInfoStep
            onSubmit={handleAdditionalInfoSubmit}
            onBack={() => setStep('otp')}
            isLoading={isLoading}
            requiredFields={requiredFields}
        />
    );

    const handleProfileConfirm = useCallback(async (confirmedData: any) => {
        setIsLoading(true);
        setError('');

        try {
            // Step 1: Generate access token
            const tokenResult = await generateAccessToken({
                ...confirmedData,
                phone_number: phoneNumber,
            });

            if (tokenResult.statusCode !== 200) {
                setError(tokenResult.error || 'Failed to generate access token.');
                return;
            }

            // Step 2: Sync user with access token
            const syncResult = await syncUser(confirmedData, phoneNumber);

            if (syncResult.statusCode === 200) {
                setIsAuthenticatedSession(true);
                
                // Track user login/signup milestone
                const syncedUserData = syncResult.data?.user?.user_data || confirmedData;
                const user_id = syncResult.data?.user?.user_id;
                
                if (user_id) {
                    await trackingService.initializeTracking(user_id);
                    await trackingService.syncTimeline({
                        event_name: 'user_logged_in',
                        title: 'User Logged In',
                        description: `User ${syncedUserData.first_name || ''} ${syncedUserData.last_name || ''} logged in`,
                        event_payload: {
                            phone_number: phoneNumber,
                        },
                    });
                } else {
                    await trackingService.initializeTracking();
                }
                
                // Send welcome message
                if (phoneNumber) {
                    try {
                        sendWelcomeMessage(phoneNumber);
                        console.log('Welcome message sent successfully');
                    } catch (error) {
                        console.error('Failed to send welcome message:', error);
                    }
                }
                
                // Navigate based on auth requirement
                if (isAuthRequired && selectedService) {
                    if (selectedService === 'doctor') {
                        setStep('healthcare_search');
                    } else if (selectedService === 'insurance') {
                        setStep('insurance_assistance');
                    } else if (selectedService === 'pharmacy') {
                        setStep('pharmacy_select');
                    } else if (selectedService === 'chat') {
                        openEmbeddedChatAndSend();
                    } else if (selectedService === 'learn') {
                        setShowLearnOverlay(true);
                        setStep('embedded_chat');
                        setIsChatActive(false);
                    } else {
                        setStep('success' as any);
                    }
                } else {
                    setStep('success' as any);
                }
            } else {
                setError(syncResult.error || 'Failed to sync user data.');
            }
        } catch (error) {
            setError('Failed to complete login. Please try again.');
            console.error('Profile confirmation error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [phoneNumber, setError, setIsLoading, setStep, setIsAuthenticatedSession, isAuthRequired, selectedService, openEmbeddedChatAndSend, setShowLearnOverlay, setIsChatActive]);

    const renderConfirmProfileStep = () => (
        <ConfirmProfileStep
            userData={userData}
            onConfirm={handleProfileConfirm}
            onBack={() => {
                setStep('otp');
                setUserData(null);
                setShouldEditProfile(false);
            }}
            isLoading={isLoading}
            editMode={shouldEditProfile}
        />
    );

    const renderSuccessStep = () => {
        const handleContinue = () => {
            if (selectedService === 'doctor') {
                setStep('healthcare_search');
            } else if (selectedService === 'insurance') {
                setRequestInsuranceOnInit(true);
                setStep('insurance_assistance');
            } else if (selectedService === 'pharmacy') {
                setStep('pharmacy_select');
            } else if (selectedService === 'chat') {
                openEmbeddedChatAndSend(pendingChatMessage || undefined);
                setPendingChatMessage(null);
            } else if (selectedService === 'learn') {
                setShowLearnOverlay(true);
                setStep('embedded_chat');
                setIsChatActive(false);
            } else {
                handleClose();
            }
        };

        return (
            <SuccessStep
                userData={userData}
                selectedService={selectedService}
                onBack={() => setStep('otp')}
                onContinue={handleContinue}
            />
        );
    };

    const renderHealthcareSearchStep = () => (
        <HealthcareSearchStep onBack={() => setStep('home')} />
    );

    const renderInsuranceAssistanceStep = () => (
        <InsuranceAssistanceStep 
            requestInsuranceOnInit={requestInsuranceOnInit}
            onBack={() => setStep('home')} 
        />
    );

    const renderEmbeddedChatStep = () => (
        <EmbeddedChatStep
            chatResetKey={chatResetKey}
            isChatActive={isChatActive}
            isLearnFlow={isLearnFlow}
            showLearnOverlay={showLearnOverlay}
            showQuickReplies={showQuickReplies}
            currentQuickReplies={currentQuickReplies}
            inputMessage={input_message}
            messages={messages}
            loading={loading}
            isReconnecting={is_reconnecting}
            messagesEndRef={messages_end_ref}
            isGoodRx={isGoodRx}
            onClose={() => setStep('intro')}
            onSetShowLearnOverlay={setShowLearnOverlay}
            onSetIsChatActive={setIsChatActive}
            onSetIsLearnFlow={setIsLearnFlow}
            onSetLastLearnTopic={setLastLearnTopic}
            onSetShowQuickReplies={setShowQuickReplies}
            onSetCurrentQuickReplies={setCurrentQuickReplies}
            onCreateWebsocketConnection={async () => {
                if (!conversation_id) {
                    await createChatThread();
                }
            }}
            onSetChatResetKey={setChatResetKey}
            onSetPendingMessages={setPendingMessages}
            onSetUsedQuickReplies={setUsedQuickReplies}
            onSetInputMessage={setInputMessage}
            onSendMessage={sendChatMessage}
            streaming_message={streaming_message}
            is_streaming={is_streaming}
        />
    );

    const pharmacies = featuredPharmacies;

    const drugName = (userData?.drug_name as string) || 'Diabetrix';

    const handlePharmacySelect = async (pharmacyName: string) => {
        setSelectedPharmacy(pharmacyName);
        setSelectedPharmacies([pharmacyName]);
        setCheckingPharmacies([pharmacyName]);
        setCurrentCheckIndex(0);
        setCurrentSubStep(0);
        setNotifiedMap([false]);
        setPharmacyCheckDone(false);
        setStep('pharmacy_checking');
    };

    const handlePharmaciesSubmit = async () => {
        if (selectedPharmacies.length === 0) return;
        setSelectedPharmacy(selectedPharmacies[0] || '');
        setCheckingPharmacies(selectedPharmacies);
        setCurrentCheckIndex(0);
        setCurrentSubStep(0);
        setNotifiedMap(new Array(selectedPharmacies.length).fill(false));
        setPharmacyCheckDone(false);
        setStep('pharmacy_checking');
    };

    useEffect(() => {
        if (step !== 'pharmacy_checking') return;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const tick = async () => {
            if (currentCheckIndex < checkingPharmacies.length) {
                const target = checkingPharmacies[currentCheckIndex];

                // Send notification once per pharmacy during the "Initiating call" substep
                if (currentSubStep === 1 && !notifiedMap[currentCheckIndex]) {
                    try {
                        await sendMedicationAvailability(drugName, target, 'checking');
                    } catch (e) {
                        console.error('Failed to send availability SMS', e);
                    }
                    setNotifiedMap((map) => {
                        const next = [...map];
                        next[currentCheckIndex] = true;
                        return next;
                    });
                }

                timer = setTimeout(() => {
                    setCurrentSubStep((s) => {
                        if (s < 2) return s + 1; // advance substep: 0->1->2
                        // after final substep, move to next pharmacy
                        setCurrentCheckIndex((i) => i + 1);
                        return 0;
                    });
                }, 800);
            } else {
                timer = setTimeout(() => setPharmacyCheckDone(true), 600);
            }
        };

        tick();
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [step, currentCheckIndex, currentSubStep, checkingPharmacies, drugName, notifiedMap]);

    const renderPharmacySelectStep = () => (
        <PharmacySelectStep
            pharmacies={pharmacies}
            selectedPharmacies={selectedPharmacies}
            drugName={drugName}
            onPharmaciesChange={setSelectedPharmacies}
            onSubmit={handlePharmaciesSubmit}
            onBack={() => setStep('home')}
        />
    );

    const renderPharmacyCheckingStep = () => (
        <PharmacyCheckingStep
            checkingPharmacies={checkingPharmacies}
            pharmacies={pharmacies as any}
            currentCheckIndex={currentCheckIndex}
            currentSubStep={currentSubStep}
            pharmacyCheckDone={pharmacyCheckDone}
            onSetPharmacyCheckDone={setPharmacyCheckDone}
            onGoHome={() => setStep('home')}
            onGoBack={() => setStep('pharmacy_select')}
        />
    );

    // Detect current route
    const currentPath = window.location.pathname;
    const isNewRoute = currentPath === '/new';
    const isExternalRoute = currentPath === '/external';

    // Parse URL parameters for external route (serviceParam already parsed above)
    const serviceParam = urlParams.get('service');

    // Map service parameter to selected service for external route
    const getExternalServiceSelection = useCallback(() => {
        if (!isExternalRoute || !serviceParam) return '';

        const externalMap: Record<string, string> = {
            'find-pharmacy': SERVICE_TYPES.PHARMACY,
            'find-doctor': SERVICE_TYPES.DOCTOR,
            'insurance-help': SERVICE_TYPES.INSURANCE,
        };
        
        return externalMap[serviceParam] || '';
    }, [isExternalRoute, serviceParam]);

    // Override initial step and set service for external route
    React.useEffect(() => {
        if (isExternalRoute && serviceParam) {
            // Set the selected service based on URL parameter
            const service = getExternalServiceSelection();
            if (service) {
                setSelectedService(service);
                // Go to service detail step to show the "Great choice!" screen
                setStep('service_detail');
            }
        }
    }, [isExternalRoute, serviceParam]);

    // Render Home page using the imported component
    const renderHomePage = useCallback(() => (
        <HomePage
            setStep={handleSetStep}
            openEmbeddedChatAndSend={openEmbeddedChatAndSend}
            setPendingMessages={setPendingMessages}
            setIsChatActive={setIsChatActive}
            setIsLearnFlow={setIsLearnFlow}
            setLastLearnTopic={setLastLearnTopic}
            setShowQuickReplies={setShowQuickReplies}
            setCurrentQuickReplies={setCurrentQuickReplies}
            setChatResetKey={setChatResetKey}
            create_websocket_connection={async () => {
                if (!conversation_id) {
                    await createChatThread();
                }
            }}
            messages={messages}
            is_reconnecting={false}
            setUsedQuickReplies={setUsedQuickReplies}
            isNewRoute={isNewRoute}
            isExternalRoute={isExternalRoute}
        />
    ), [handleSetStep, openEmbeddedChatAndSend, setPendingMessages, setIsChatActive, setIsLearnFlow, 
        setLastLearnTopic, setShowQuickReplies, setCurrentQuickReplies, setChatResetKey, 
        conversation_id, createChatThread, messages, setUsedQuickReplies, 
        isNewRoute, isExternalRoute]);

    // Render More page using the imported component
    const renderMorePage = useCallback(() => <MorePage setStep={handleSetStep} />, [handleSetStep]);

    // Logout function that clears all auth states
    const handleLogout = useCallback(async () => {
        // Clear session storage using auth service
        const { clearAuthSession } = await import('./services/auth-service');
        clearAuthSession();
        
        // Reset states using custom hooks
        modalState.resetAuth();
        chatState.resetChat();
        pharmacyState.resetPharmacySelection();
        
        setRequestInsuranceOnInit(false);

        // Clear auth store
        const authStore = await import('../../store/authStore.ts');
        authStore.clear();

        // Close modal
        handleClose();
    }, [modalState, chatState, pharmacyState, handleClose]);

    // Render Profile page
    const renderProfilePage = () => (
        <ProfilePage
            userData={userData}
            selectedService={selectedService}
            selectedPharmacies={selectedPharmacies}
            messages={messages}
            onLogout={handleLogout}
        />
    );

    // Helper function to determine if bottom navigation should be shown
    const hasBottomNavigation = () => {
        const showNavigationSteps = ['healthcare_search', 'insurance_assistance', 'pharmacy_select', 'home', 'more', 'pharmacy_checking', 'embedded_chat', 'profile'];
        return showNavigationSteps.includes(step);
    };

    // Render the external link confirmation modal
    const renderExternalLinkConfirmation = () => (
        <div className={styles.external_link_modal_overlay} onClick={handleExternalLinkCancel}>
            <div className={styles.external_link_modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.external_link_modal_header}>
                    <h3>
                        YOU ARE LEAVING THE DIABETRIX<sup>®</sup> WEBSITE.
                    </h3>
                </div>
                <div className={styles.external_link_modal_content}>
                    <p>
                        Click <strong>YES</strong> to leave this site, or click <strong>NO</strong> to return to the Diabetrix site.
                    </p>
                </div>
                <div className={styles.external_link_modal_actions}>
                    <button className={styles.external_link_button} onClick={handleExternalLinkConfirm}>
                        YES
                    </button>
                    <button className={styles.external_link_button} onClick={handleExternalLinkCancel}>
                        NO
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div
                className={styles.backdrop}
                onClick={handleClose}
                onWheel={(e) => {
                    e.preventDefault();
                }}
                onTouchStart={(e) => {
                    // Prevent touch events on backdrop from interfering with modal content
                    if (e.target === e.currentTarget) {
                        e.preventDefault();
                    }
                }}
                onTouchMove={(e) => {
                    // Only prevent touch move on the backdrop itself, not its children
                    if (e.target === e.currentTarget) {
                        e.preventDefault();
                    }
                }}
                onTouchEnd={(e) => {
                    // Only close on backdrop touch, not on modal content
                    if (e.target === e.currentTarget) {
                        e.preventDefault();
                        handleClose();
                    }
                }}
            />
            <div className={styles.modal_overlay}>
                <div className={`${styles.modal} ${step === 'success' ? styles.confirm_page_zoom : ''}`}>
                    <button
                        className={styles.close_btn}
                        onClick={handleClose}
                        onTouchStart={(e) => {
                            e.stopPropagation();
                        }}
                        aria-label="Close modal">
                        <i className="fas fa-times"></i>
                    </button>

                    <div className={`${styles.modal_content} ${hasBottomNavigation() ? styles.with_bottom_nav : ''}`}>
                        {step === 'intro' && renderIntroStep()}
                        {step === 'service_detail' && renderServiceDetailStep()}
                        {step === 'phone' && renderPhoneStep()}
                        {step === 'otp' && renderOtpStep()}
                        {step === 'additional_info' && renderAdditionalInfoStep()}
                        {step === 'confirm_profile' && renderConfirmProfileStep()}
                        {step === 'success' && renderSuccessStep()}
                        {step === 'healthcare_search' && renderHealthcareSearchStep()}
                        {step === 'insurance_assistance' && renderInsuranceAssistanceStep()}
                        {step === 'pharmacy_select' && renderPharmacySelectStep()}
                        {step === 'pharmacy_checking' && renderPharmacyCheckingStep()}
                        {step === 'embedded_chat' && renderEmbeddedChatStep()}
                        {step === 'home' && renderHomePage()}
                        {step === 'profile' && renderProfilePage()}
                    </div>

                    {/* Bottom Navigation Component */}
                    <BottomNavigation step={step} setStep={handleSetStep} openEmbeddedChatAndSend={openEmbeddedChatAndSend} />
                </div>
            </div>

            {/* External Link Confirmation Modal */}
            {showExternalLinkConfirmation && renderExternalLinkConfirmation()}
        </>
    );
};

export default UnifiedModal;
