import React from 'react';
import styles from '../unified-modal.module.scss';
import { AnimatePresence, motion } from 'framer-motion';

const avatar = '/assets/images/avatar.png';

interface Pharmacy {
    name: string;
    logo?: string;
}

interface PharmacyCheckingStepProps {
    checkingPharmacies: string[];
    pharmacies: Pharmacy[];
    currentCheckIndex: number;
    currentSubStep: number;
    pharmacyCheckDone: boolean;
    onSetPharmacyCheckDone: (done: boolean) => void;
    onGoHome: () => void;
    onGoBack: () => void;
}

export const PharmacyCheckingStep: React.FC<PharmacyCheckingStepProps> = ({
    checkingPharmacies,
    pharmacies,
    currentCheckIndex,
    currentSubStep,
    pharmacyCheckDone,
    onSetPharmacyCheckDone,
    onGoHome,
    onGoBack
}) => {
    return (
        <div className={styles.verification_step}>
            <div className={styles.step_header}>
                <div className={styles.alex_mini}>
                    <img src={avatar} alt="Alex" />
                </div>
                {pharmacyCheckDone ? (
                    <>
                        <h3>Request submitted</h3>
                        <p>We'll notify you.</p>
                    </>
                ) : (
                    <>
                        <h3>Submitting your request</h3>
                        <p>Please wait while we contact your selected pharmacies…</p>
                    </>
                )}
            </div>

            <div className={styles.service_preview}>
                {(() => {
                    const total = checkingPharmacies.length || 1;
                    const pct = Math.min(currentCheckIndex / total, 1);
                    const subLabel = currentSubStep === 0 
                        ? 'Getting pharmacy contact' 
                        : currentSubStep === 1 
                        ? 'Initiating call' 
                        : 'Calling pharmacy';

                    return (
                        <>
                            <ul className={styles.pharmacy_list}>
                                <AnimatePresence initial={false}>
                                    {checkingPharmacies.map((name, idx) => {
                                        const isDone = idx < currentCheckIndex;
                                        const isCurrent = idx === currentCheckIndex && !pharmacyCheckDone;
                                        const logo = pharmacies.find((p) => p.name === name)?.logo;

                                        return (
                                            <motion.li 
                                                key={name} 
                                                className={styles.pharmacy_row} 
                                                initial={{ opacity: 0, y: 8 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                exit={{ opacity: 0, y: -8 }} 
                                                transition={{ duration: 0.25 }}>
                                                <div className={styles.pharmacy_row_icon}>
                                                    {isCurrent ? (
                                                        <span className={styles.spinner}></span>
                                                    ) : (
                                                        <i className="fas fa-ellipsis-h"></i>
                                                    )}
                                                </div>
                                                {logo && (
                                                    <span className={styles.pharmacy_logo_box}>
                                                        <img src={logo} alt={`${name} logo`} />
                                                    </span>
                                                )}
                                                <div className={styles.pharmacy_row_name}>
                                                    {isDone && <div>{name}</div>}
                                                    {isCurrent && (
                                                        <>
                                                            <div className={styles.overlay_loader}>
                                                                <div className={styles.status_loader}>
                                                                    <span></span>
                                                                    <span></span>
                                                                    <span></span>
                                                                </div>
                                                            </div>
                                                            <motion.div 
                                                                initial={{ opacity: 0 }} 
                                                                animate={{ opacity: 1 }} 
                                                                transition={{ duration: 0.3 }} 
                                                                className={styles.animated_status}>
                                                                <div className={styles.status_text}>{subLabel}</div>
                                                                <span className={styles.pharmacy_name}>{name}</span>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                    {!isDone && !isCurrent && <div>Queued — {name}</div>}
                                                </div>
                                            </motion.li>
                                        );
                                    })}
                                </AnimatePresence>
                            </ul>

                            {pharmacyCheckDone && (
                                <div className={styles.modal_popup_overlay}>
                                    <motion.div
                                        className={styles.modal_popup}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 25,
                                            duration: 0.4,
                                        }}>
                                        <div className={styles.modal_popup_content}>
                                            <div className={styles.green_checkbox}>
                                                <motion.i
                                                    className="fas fa-check"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 260,
                                                        damping: 20,
                                                        delay: 0.3,
                                                    }}
                                                />
                                            </div>
                                            <h3>Request Submitted</h3>
                                            <p>We will text you a list of pharmacies with Diabetrix in stock</p>
                                            <div className={styles.estimated_time}>
                                                <i className="far fa-clock"></i>
                                                <span>Estimated time: 10 min</span>
                                            </div>
                                            <button 
                                                className={styles.modal_close_button} 
                                                onClick={() => onSetPharmacyCheckDone(false)}>
                                                Close
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>

            <div className={styles.actions_column}>
                <button className={styles.button} onClick={onGoHome}>
                    Done
                </button>
                <button className={`${styles.button} ${styles.secondary_button}`} onClick={onGoBack}>
                    Choose a different pharmacy
                </button>
            </div>
        </div>
    );
};

