import React, { useMemo, useState } from 'react';
import styles from './insurance-assistance.module.scss';
import { sendCopayRequest, sendInsuranceRequestWithCopay, sendCopayCardDetails, sendEligibilityCheckFollowUp } from '../../../services/smsService';
import { DiscountOption } from '../../../types/discounts';
import DrugPharmaciesTab from '../../pharmacy/drug-pharmacies-tab/DrugPharmaciesTab';
import { ArrowLeft } from 'lucide-react';
import { ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import InsuranceCardScanModal from '../../insurance/insurance-card-scan/insurance-card-scan-modal';

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
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [insuranceCard, setInsuranceCard] = useState(null);
    const [autoRequestAfterUpload, setAutoRequestAfterUpload] = useState(false);
    const [copayInitiatedScan, setCopayInitiatedScan] = useState(false);
    const [showCashPharmacies, setShowCashPharmacies] = useState(false);
    const drugName = (userData?.drug_name as string) || 'Diabetrix';

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
        try {
            await sendInsuranceRequestWithCopay(drugName);
            console.log('Insurance coverage SMS sent successfully');
        } catch (error) {
            console.error('Failed to send insurance coverage SMS:', error);
        }
    };

    const onInsuranceActionClick = async () => {
        if (!insuranceCard) {
            setIsInsuranceModalOpen(true);
            return;
        }
        await handleInsuranceCheck();
    };

    const handleCopayActionClick = async () => {
        if (!insuranceCard) {
            setCopayInitiatedScan(true);
            setIsInsuranceModalOpen(true);
            return;
        }
        await handleCopayCheck();
    };

    const handleCopayCheck = async () => {
        setCopayStatus('requested');

        // Send SMS notification for copay assistance request
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
                        <button className={`${styles.find_best_cost_btn} ${styles.animated_btn}`} onClick={insuranceCard ? handleFindBestCost : () => setIsInsuranceModalOpen(true)}>
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

                        {insuranceStatus === 'requested' && (
                            <div className={styles.pending_block}>
                                <span className={styles.pending_dot}></span>
                                <span className={styles.pending_text}>Checking coverage...</span>
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

                        {copayStatus === 'requested' && (
                            <div className={styles.success_block}>
                                <span className={styles.success_icon}>✓</span>
                                <span className={styles.success_text}>Copay card requested</span>
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
                                await handleFindBestCost();
                                setAutoRequestAfterUpload(false);
                            } else if (copayInitiatedScan) {
                                // If scan was initiated from copay assistance section, automatically check copay
                                await handleCopayCheck();
                                setCopayInitiatedScan(false);
                            }
                        }}
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
