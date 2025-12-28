import React, { useMemo, useState, useEffect } from 'react';
import styles from './insurance-assistance.module.scss';
import { sendCopayRequest, sendInsuranceRequestWithCopay, sendCopayCardDetails, sendEligibilityCheckFollowUp } from '../../../services/smsService';
import { useRxRequests } from '../../../services/rx/hooks-rx';
import { DiscountOption } from '../../../types/discounts';
import DrugPharmaciesTab from '../../pharmacy/drug-pharmacies-tab/DrugPharmaciesTab';
import { ArrowLeft } from 'lucide-react';
import { ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import InsuranceCardScanModal from '../../insurance/insurance-card-scan/insurance-card-scan-modal';
import { UnifiedModal } from '../../unified-modal/unified-modal';
import { checkAuthSession } from '../../unified-modal/services/auth-service';
import { useAuthStore } from '../../../store/authStore';
import { useUserDetails } from '../../../services/user-management/hooks-user-details';
import { postAPI, CAPABILITIES_API_URLS } from '../../../services/api';

interface InsuranceAssistanceProps {
    onClose: () => void;
    userData?: any;
    embedded?: boolean;
    requestOnInit?: boolean;
    onChatOpen?: () => void;
}

const InsuranceAssistance = ({ onClose, userData, embedded = true, requestOnInit = false, onChatOpen }: InsuranceAssistanceProps) => {
    const [selectedTab, setSelectedTab] = useState('pharmacies');
    const [pharmaciesEnabled, setPharmaciesEnabled] = useState(false);
    const [insuranceStatus, setInsuranceStatus] = useState('check_now');
    const [copayStatus, setCopayStatus] = useState('check_now');
    const [insuranceRequestStatus, setInsuranceRequestStatus] = useState<string | null>(null);
    const [copayRequestStatus, setCopayRequestStatus] = useState<string | null>(null);
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [insuranceCard, setInsuranceCard] = useState(null);
    const [autoRequestAfterUpload, setAutoRequestAfterUpload] = useState(false);
    const [copayInitiatedScan, setCopayInitiatedScan] = useState(false);
    const [showCashPharmacies, setShowCashPharmacies] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [pendingInsuranceAction, setPendingInsuranceAction] = useState<'coverage' | 'eligibility' | 'find_best_cost' | null>(null);
    const drugName = (userData?.drug_name as string) || 'Diabetrix';

    // Use RX requests hook for API calls
    const { requestCopayCard, requestInsuranceCost, copay_loading, insurance_loading } = useRxRequests();

    // Use user details hook to access insurance details from user state
    const { user_details, fetch_user_details } = useUserDetails();

    // Fetch user details on component mount
    useEffect(() => {
        const authStore = useAuthStore.getState();
        const user = authStore.user;
        const user_id = user?.userData?.user_id;
        if (user_id) {
            fetch_user_details(user_id);
        }
    }, [fetch_user_details]);

    // Function to fetch approved requests for a specific task_type_id
    const fetchApprovedRequests = async (task_type_id: number, user_id: string): Promise<any[]> => {
        try {
            const { data, statusCode } = await postAPI(CAPABILITIES_API_URLS.GET_APPROVED_REQUESTS, {
                task_type_id,
                domain: 'diabetrix',
                limit: 100, // Get enough to check if any exist
                offset: 0,
            });

            if (statusCode === 200 && data?.approved_requests) {
                // Filter by user_id to only get requests for the current user
                return data.approved_requests.filter((request: any) => request.user_id === user_id);
            }
            return [];
        } catch (error) {
            console.error(`Error fetching approved requests for task_type_id ${task_type_id}:`, error);
            return [];
        }
    };

    // Check for existing approved requests on mount
    useEffect(() => {
        const checkExistingRequests = async () => {
            const authStore = useAuthStore.getState();
            const user = authStore.user;
            const user_id = user?.userData?.user_id;

            if (!user_id) {
                return;
            }

            // Fetch approved requests for insurance (task_type_id = 2) and copay (task_type_id = 3)
            const [insuranceRequests, copayRequests] = await Promise.all([fetchApprovedRequests(2, user_id), fetchApprovedRequests(3, user_id)]);

            // Update status if requests exist - get the most recent request's status
            if (insuranceRequests && insuranceRequests.length > 0) {
                // Get the most recent request (sorted by created_at descending)
                const latestInsuranceRequest = insuranceRequests.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                const status_name = latestInsuranceRequest.request_status_name || 'Requested';
                // Only set as 'requested' if status is not 'Failed'
                if (status_name !== 'Failed') {
                    setInsuranceStatus('requested');
                    setInsuranceRequestStatus(status_name);
                }
            }
            if (copayRequests && copayRequests.length > 0) {
                // Get the most recent request (sorted by created_at descending)
                const latestCopayRequest = copayRequests.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                const status_name = latestCopayRequest.request_status_name || 'Requested';
                // Only set as 'requested' if status is not 'Failed'
                if (status_name !== 'Failed') {
                    setCopayStatus('requested');
                    setCopayRequestStatus(status_name);
                }
            }
        };

        // Only check after user details are fetched
        if (user_details || useAuthStore.getState().user?.userData?.user_id) {
            checkExistingRequests();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user_details]);

    // Helper function to check if insurance details exist in user state
    const hasInsuranceDetails = (): boolean => {
        // Check user_details from hook first
        if (user_details?.insurance_details) {
            const insurance = user_details.insurance_details;
            // Consider insurance details present if provider and member_id are populated
            return !!(insurance.provider && insurance.member_id);
        }

        // Fallback to authStore userData
        const authStore = useAuthStore.getState();
        const user = authStore.user;
        if (user?.userData?.insurance_details) {
            const insurance = user.userData.insurance_details;
            return !!(insurance.provider && insurance.member_id);
        }

        return false;
    };

    // Hardcoded pharmacy discount options for Jardiance in 98006
    const discount_options: DiscountOption[] = [
        {
            coupon_key: 'jardiance_cvs_001',
            pharmacy: 'CVS Pharmacy',
            pharmacy_type: 'RETAIL',
            price: 127.45,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_walgreens_001',
            pharmacy: 'Walgreens',
            pharmacy_type: 'RETAIL',
            price: 134.89,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_rite_aid_001',
            pharmacy: 'Rite Aid',
            pharmacy_type: 'RETAIL',
            price: 142.15,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_costco_001',
            pharmacy: 'Costco Pharmacy',
            pharmacy_type: 'RETAIL',
            price: 145.67,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_kroger_001',
            pharmacy: 'Kroger Pharmacy',
            pharmacy_type: 'RETAIL',
            price: 148.23,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_walmart_001',
            pharmacy: 'Walmart Pharmacy',
            pharmacy_type: 'RETAIL',
            price: 151.89,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_safeway_001',
            pharmacy: 'Safeway Pharmacy',
            pharmacy_type: 'RETAIL',
            price: 156.44,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_target_001',
            pharmacy: 'Target Pharmacy',
            pharmacy_type: 'RETAIL',
            price: 159.78,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_publix_001',
            pharmacy: 'Publix Pharmacy',
            pharmacy_type: 'RETAIL',
            price: 163.21,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_heb_001',
            pharmacy: 'H-E-B Pharmacy',
            pharmacy_type: 'RETAIL',
            price: 167.55,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_express_scripts_001',
            pharmacy: 'Express Scripts',
            pharmacy_type: 'MAIL_ORDER',
            price: 115.23,
            retail_price: 485.99,
            type: 'coupon',
        },
        {
            coupon_key: 'jardiance_optum_001',
            pharmacy: 'OptumRx',
            pharmacy_type: 'MAIL_ORDER',
            price: 118.67,
            retail_price: 485.99,
            type: 'coupon',
        },
    ];

    const handleInsuranceCheck = async () => {
        setInsuranceStatus('requested');
        setInsuranceRequestStatus('Requested');
        try {
            // Call API to request insurance cost
            const result = await requestInsuranceCost(drugName);
            if (result) {
                console.log('Insurance cost request submitted successfully');
                // Send SMS notification as secondary
                try {
                    await sendInsuranceRequestWithCopay(drugName);
                    console.log('Insurance coverage SMS sent successfully');
                } catch (error) {
                    console.error('Failed to send insurance coverage SMS:', error);
                }
            } else {
                console.error('Failed to request insurance cost');
                setInsuranceStatus('check_now'); // Reset status on error
                setInsuranceRequestStatus(null);
            }
        } catch (error) {
            console.error('Failed to request insurance cost:', error);
            setInsuranceStatus('check_now'); // Reset status on error
            setInsuranceRequestStatus(null);
        }
    };

    const checkAuthentication = (): boolean => {
        const authCheck = checkAuthSession();
        const authStore = useAuthStore.getState();
        return authCheck.authenticated || authStore.user?.isAuthenticated === true;
    };

    const onInsuranceActionClick = async () => {
        // Check authentication first
        if (!checkAuthentication()) {
            setPendingInsuranceAction('coverage');
            setShowVerificationModal(true);
            return;
        }

        // Check if insurance details exist in user state first
        if (hasInsuranceDetails()) {
            // Bypass modal and directly call API
            await handleInsuranceCheck();
            return;
        }

        // If no insurance details in user state, check if insurance card was scanned
        if (!insuranceCard) {
            setIsInsuranceModalOpen(true);
            return;
        }
        await handleInsuranceCheck();
    };

    const handleCopayActionClick = async () => {
        // Check authentication first
        if (!checkAuthentication()) {
            setPendingInsuranceAction('eligibility');
            setShowVerificationModal(true);
            return;
        }

        // Check if insurance details exist in user state first
        if (hasInsuranceDetails()) {
            // Bypass modal and directly call API
            await handleCopayCheck();
            return;
        }

        // If no insurance details in user state, check if insurance card was scanned
        if (!insuranceCard) {
            setCopayInitiatedScan(true);
            setIsInsuranceModalOpen(true);
            return;
        }
        await handleCopayCheck();
    };

    const handleCopayCheck = async () => {
        setCopayStatus('requested');
        setCopayRequestStatus('Requested');
        try {
            // Call API to request copay card
            const result = await requestCopayCard(drugName);
            if (result) {
                console.log('Copay card request submitted successfully');
                // Send SMS notification as secondary
                try {
                    await sendCopayRequest(drugName);
                    // Send copay card details after 1 second
                    setTimeout(async () => {
                        try {
                            await sendCopayCardDetails(drugName);
                        } catch (error) {
                            console.error('Failed to send copay card details SMS:', error);
                        }
                    }, 1000);
                    console.log('Copay assistance SMS sent successfully');
                } catch (error) {
                    console.error('Failed to send copay assistance SMS:', error);
                }
            } else {
                console.error('Failed to request copay card');
                setCopayStatus('check_now'); // Reset status on error
                setCopayRequestStatus(null);
            }
        } catch (error) {
            console.error('Failed to request copay card:', error);
            setCopayStatus('check_now'); // Reset status on error
            setCopayRequestStatus(null);
        }
    };

    // If parent asks to request on init (e.g., after Confirm & Continue),
    // mark both flows as requested and send notifications once.
    React.useEffect(() => {
        const run = async () => {
            if (!requestOnInit) return;
            await Promise.all([handleInsuranceCheck(), handleCopayCheck()]);
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestOnInit]);

    // Compute cash price range from available discount options
    const cashRange = useMemo(() => {
        if (!discount_options || discount_options.length === 0) return null;
        const prices = discount_options.map((d) => d.price).filter(Boolean) as number[];
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return {
            min: `$${min.toFixed(0)}`,
            max: `$${max.toFixed(0)}`,
        };
    }, [discount_options]);

    const handleFindBestCost = async () => {
        // Check authentication first
        if (!checkAuthentication()) {
            setPendingInsuranceAction('find_best_cost');
            setShowVerificationModal(true);
            return;
        }

        // Check if insurance details exist in user state first
        if (hasInsuranceDetails()) {
            // Bypass modal and directly call API
            await handleInsuranceCheck();
            // Send follow-up message after 1 second
            setTimeout(async () => {
                try {
                    await sendEligibilityCheckFollowUp(drugName);
                } catch (error) {
                    console.error('Failed to send eligibility check follow-up SMS:', error);
                }
            }, 1000);
            return;
        }

        // If no insurance details in user state, check if insurance card was scanned
        if (!insuranceCard) {
            setAutoRequestAfterUpload(true);
            setIsInsuranceModalOpen(true);
            return;
        }
        await handleInsuranceCheck();
        // await handleCopayCheck();

        // Send follow-up message after 1 second
        setTimeout(async () => {
            try {
                await sendEligibilityCheckFollowUp(drugName);
            } catch (error) {
                console.error('Failed to send eligibility check follow-up SMS:', error);
            }
        }, 1000);
    };

    const handleVerificationComplete = () => {
        setShowVerificationModal(false);
        // Open insurance modal based on pending action
        setIsInsuranceModalOpen(true);
        if (pendingInsuranceAction === 'coverage') {
            setCopayInitiatedScan(false);
            setAutoRequestAfterUpload(false);
        } else if (pendingInsuranceAction === 'eligibility') {
            setCopayInitiatedScan(true);
            setAutoRequestAfterUpload(false);
        } else if (pendingInsuranceAction === 'find_best_cost') {
            setCopayInitiatedScan(false);
            setAutoRequestAfterUpload(true);
        }
        setPendingInsuranceAction(null);
    };

    const content = (
        <div className={embedded ? styles.container_embedded : styles.container_modal}>
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-200 bg-white">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={onClose} aria-label="Back">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">{drugName}</h1>
            </div>

            {/* Concierge Banner - Attached to Header */}
            <div className={styles.concierge_banner}>
                <span className={styles.banner_text}>Not Sure? What's best for you</span>
                <button
                    className={styles.concierge_btn}
                    onClick={() => {
                        // Navigate to chat with savings question
                        if (onChatOpen) {
                            onChatOpen();
                        }
                    }}>
                    Ask concierge
                </button>
            </div>

            <div className={styles.scrollable_content}>
                {/* Enhanced Find Best Cost Section */}
                <div className={styles.find_best_cost_card}>
                    <div className={styles.cost_card_header}>
                        <div className={styles.cost_content}>
                            <p className={styles.cost_description}>Want us to get the best cost? We'll compare all the options for you!</p>
                        </div>
                    </div>

                    <div className={styles.cost_action_section}>
                        <button
                            className={`${styles.find_best_cost_btn} ${styles.animated_btn}`}
                            onClick={
                                hasInsuranceDetails() || insuranceCard
                                    ? handleFindBestCost
                                    : () => {
                                          if (!checkAuthentication()) {
                                              setPendingInsuranceAction('find_best_cost');
                                              setShowVerificationModal(true);
                                          } else {
                                              setIsInsuranceModalOpen(true);
                                          }
                                      }
                            }>
                            <div className={styles.btn_content}>
                                <span>Check Now!</span>
                            </div>
                            <div className={styles.btn_shimmer}></div>
                        </button>
                    </div>
                </div>

                {/* Cards */}
                <div className={styles.cards_grid}>
                    {/* Insurance Coverage */}
                    <div className={styles.card}>
                        <div className={styles.card_header_with_price}>
                            <div className={styles.card_left}>
                                <div className={`${styles.icon_badge} ${styles.icon_insurance}`}>
                                    <ShieldCheckIcon />
                                </div>
                                <div className={styles.card_title_section}>
                                    <h3 className={styles.card_title}>Insurance Coverage</h3>
                                    <p className={styles.card_subtitle}>Insurance check for coverage verification</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.full_width_action}>
                            <button className={`${styles.action_btn_full} ${insuranceStatus === 'requested' ? styles.requested : styles.primary}`} onClick={onInsuranceActionClick} disabled={insuranceStatus === 'requested'}>
                                {insuranceStatus === 'requested' ? '✓ Requested' : 'Check coverage'}
                            </button>
                        </div>

                        {insuranceStatus === 'requested' && insuranceRequestStatus && (
                            <div className={styles.pending_block} style={{ color: '#10b981' }}>
                                <span className={styles.pending_dot} style={{ backgroundColor: '#10b981' }}></span>
                                <span className={styles.pending_text} style={{ color: '#10b981' }}>
                                    ✓ {insuranceRequestStatus === 'Completed' ? 'Request completed' : insuranceRequestStatus === 'In Progress' ? 'Request in progress' : insuranceRequestStatus === 'Requested' ? 'Request submitted successfully' : insuranceRequestStatus}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Copay Assistance */}
                    <div className={styles.card}>
                        <div className={styles.card_header_with_price}>
                            <div className={styles.card_left}>
                                <div className={`${styles.icon_badge} ${styles.icon_copay}`}>
                                    <CreditCardIcon />
                                </div>
                                <div className={styles.card_title_section}>
                                    <h3 className={styles.card_title}>Copay Assistance</h3>
                                    <p className={styles.card_subtitle}>As low as $10/month with savings card</p>
                                </div>
                            </div>
                            <div className={styles.price_section}>
                                {copayStatus === 'requested' ? (
                                    <span className={styles.price_success}>✓ Applied</span>
                                ) : (
                                    <span className={styles.price_highlight}>
                                        $10/mo <span className={styles.asterisk}>*</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.full_width_action}>
                            <button className={`${styles.action_btn_full} ${copayStatus === 'requested' ? styles.requested : styles.primary}`} onClick={handleCopayActionClick} disabled={copayStatus === 'requested'}>
                                {copayStatus === 'requested' ? '✓ Requested' : 'Check eligibility'}
                            </button>
                        </div>

                        {copayStatus === 'requested' && copayRequestStatus && (
                            <div className={styles.success_block} style={{ color: '#10b981' }}>
                                <span className={styles.success_icon} style={{ color: '#10b981' }}>
                                    ✓
                                </span>
                                <span className={styles.success_text} style={{ color: '#10b981' }}>
                                    ✓ {copayRequestStatus === 'Completed' ? 'Request completed' : copayRequestStatus === 'In Progress' ? 'Request in progress' : copayRequestStatus === 'Requested' ? 'Request submitted successfully' : copayRequestStatus}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Cash Price */}
                    <div className={styles.card}>
                        <div className={styles.card_header_with_price}>
                            <div className={styles.card_left}>
                                <div className={`${styles.icon_badge} ${styles.icon_cash}`}>
                                    <CreditCardIcon />
                                </div>
                                <div className={styles.card_title_section}>
                                    <h3 className={styles.card_title}>Cash Price</h3>
                                    <p className={styles.card_subtitle}>Estimated cash range from pharmacies</p>
                                </div>
                            </div>
                            <div className={styles.price_section}>
                                {cashRange ? (
                                    <span className={styles.price_range}>
                                        {cashRange.min}–{cashRange.max}
                                    </span>
                                ) : (
                                    <span className={styles.price_placeholder}>$$</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.full_width_action}>
                            <button
                                className={`${styles.action_btn_full} ${styles.secondary}`}
                                onClick={() => {
                                    setPharmaciesEnabled(true);
                                    setSelectedTab('pharmacies');
                                    setShowCashPharmacies((v) => !v);
                                }}>
                                {showCashPharmacies ? 'Hide options' : 'View options'}
                            </button>
                        </div>

                        {showCashPharmacies && (
                            <div className={styles.tab_content}>
                                <DrugPharmaciesTab discount_options={discount_options} is_loading={false} />
                            </div>
                        )}
                    </div>
                </div>

                {isInsuranceModalOpen && (
                    <InsuranceCardScanModal
                        isOpen={isInsuranceModalOpen}
                        onClose={() => {
                            setIsInsuranceModalOpen(false);
                            setAutoRequestAfterUpload(false);
                            setCopayInitiatedScan(false);
                        }}
                        onScanComplete={async (data: any) => {
                            console.log(data);
                            setInsuranceCard(data);
                            setIsInsuranceModalOpen(false);

                            if (autoRequestAfterUpload) {
                                await handleInsuranceCheck();
                                setAutoRequestAfterUpload(false);
                            } else if (copayInitiatedScan) {
                                // If scan was initiated from copay assistance section, automatically check copay
                                await handleCopayCheck();
                                setCopayInitiatedScan(false);
                            }
                        }}
                    />
                )}

                {showVerificationModal && (
                    <UnifiedModal
                        onClose={() => {
                            setShowVerificationModal(false);
                            setPendingInsuranceAction(null);
                        }}
                        initialStep="phone"
                        onVerificationComplete={handleVerificationComplete}
                    />
                )}
            </div>
        </div>
    );

    if (embedded) {
        return content;
    }

    return <div className={styles.modal_backdrop}>{content}</div>;
};

export default InsuranceAssistance;
