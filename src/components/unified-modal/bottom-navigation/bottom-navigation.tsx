import React from 'react';
import styles from '../unified-modal.module.scss';

interface BottomNavigationProps {
    step: string;
    setStep: (step: string) => void;
    openEmbeddedChatAndSend: () => void;
    isAuthenticated?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ step, setStep, openEmbeddedChatAndSend, isAuthenticated }) => {
    // List of steps that should show the bottom navigation
    const showNavigationSteps = ['healthcare_search', 'insurance_assistance', 'pharmacy_select', 'home', 'pharmacy_checking', 'embedded_chat', 'profile'];

    // Only render if current step is in the allowed list
    if (!showNavigationSteps.includes(step)) {
        return null;
    }

    return (
        <div className={styles.bottom_navigation}>
            <div className={`${styles.nav_item} ${step === 'home' ? styles.active : ''}`} onClick={() => setStep('home')} onTouchStart={(e) => e.stopPropagation()} role="button" tabIndex={0}>
                <i className="fas fa-home"></i>
                <span>Home</span>
            </div>
            <div className={`${styles.nav_item} ${step === 'healthcare_search' ? styles.active : ''}`} onClick={() => setStep('healthcare_search')} onTouchStart={(e) => e.stopPropagation()} role="button" tabIndex={0}>
                <i className="fas fa-search"></i>
                <span>Find Care</span>
            </div>
            <div className={`${styles.nav_item} ${step === 'embedded_chat' ? styles.active : ''}`} onClick={() => openEmbeddedChatAndSend()} onTouchStart={(e) => e.stopPropagation()} role="button" tabIndex={0}>
                <i className="fas fa-comment"></i>
                <span>Chat</span>
            </div>
            <div className={`${styles.nav_item} ${step === 'insurance_assistance' ? styles.active : ''}`} onClick={() => setStep('insurance_assistance')} onTouchStart={(e) => e.stopPropagation()} role="button" tabIndex={0}>
                <i className="fas fa-dollar-sign"></i>
                <span>Savings</span>
            </div>
            {isAuthenticated && (
                <div className={`${styles.nav_item} ${step === 'profile' ? styles.active : ''}`} onClick={() => setStep('profile')} onTouchStart={(e) => e.stopPropagation()} role="button" tabIndex={0}>
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                </div>
            )}
        </div>
    );
};

export default BottomNavigation;
