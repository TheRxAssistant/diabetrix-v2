import React from 'react';
import styles from '../unified-modal.module.scss';

const avatar = '/assets/images/avatar.png';

interface IntroStepProps {
    isTyping: boolean;
    isGoodRx: boolean;
    onServiceSelect: (service: string) => void;
}

export const IntroStep: React.FC<IntroStepProps> = ({ isTyping, isGoodRx, onServiceSelect }) => {
    return (
        <div className={`${styles.intro_step} ${isGoodRx ? styles.goodrx_theme : ''}`}>
            {/* Header with Call Button */}
            <div className={styles.concierge_header}>
                <div className={styles.contact_options}>
                    <a href="tel:+18629724788" className={styles.contact_badge}>
                        <i className="fas fa-phone"></i>
                        <span>Call</span>
                    </a>
                </div>
            </div>

            {/* Avatar Section */}
            <div className={styles.avatar_container}>
                <img src={avatar} alt="Alex from Diabetrix" className={styles.avatar} />
                <div className={styles.status_indicator}>
                    <span className={styles.status_text}>LIVE</span>
                </div>
            </div>

            <div className={styles.concierge_message}>
                <h3>Hi, I'm Alex!</h3>
                <div className={styles.typing_container}>
                    {isTyping ? (
                        <div className={styles.typing_indicator}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    ) : (
                        <p>How can I help you today?</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            {!isTyping && (
                <div className={styles.action_buttons}>
                    <button
                        className={`${styles.action_btn} ${styles.find_doctor} ${isGoodRx ? styles.goodrx_actions_theme : ''}`}
                        onClick={() => onServiceSelect('doctor')}>
                        <div className={`${styles.icon_container} ${isGoodRx ? styles.goodrx_actions_theme_icon_container : ''}`}>
                            <i className="fas fa-user-md"></i>
                        </div>
                        <span>Find/Schedule Doctor</span>
                    </button>

                    <button
                        className={`${styles.action_btn} ${styles.cost_support} ${isGoodRx ? styles.goodrx_actions_theme : ''}`}
                        onClick={() => onServiceSelect('insurance')}>
                        <div className={`${styles.icon_container} ${isGoodRx ? styles.goodrx_actions_theme_icon_container : ''}`}>
                            <i className="fas fa-hand-holding-usd"></i>
                        </div>
                        <span>Cost Support / Insurance Help</span>
                    </button>

                    <button
                        className={`${styles.action_btn} ${styles.find_pharmacy} ${isGoodRx ? styles.goodrx_actions_theme : ''}`}
                        onClick={() => onServiceSelect('pharmacy')}>
                        <div className={`${styles.icon_container} ${isGoodRx ? styles.goodrx_actions_theme_icon_container : ''}`}>
                            <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <span>Find In-Stock Pharmacy</span>
                    </button>

                    <button
                        className={`${styles.action_btn} ${styles.learn_more} ${isGoodRx ? styles.goodrx_actions_theme : ''}`}
                        onClick={() => onServiceSelect('learn')}>
                        <div className={`${styles.icon_container} ${isGoodRx ? styles.goodrx_actions_theme_icon_container : ''}`}>
                            <i className="fas fa-book-medical"></i>
                        </div>
                        <span>Learn About Diabetrix</span>
                    </button>

                    <button
                        className={`${styles.action_btn} ${styles.chat} ${isGoodRx ? styles.goodrx_actions_theme : ''}`}
                        onClick={() => onServiceSelect('chat')}>
                        <div className={`${styles.icon_container} ${isGoodRx ? styles.goodrx_actions_theme_icon_container : ''}`}>
                            <i className="fas fa-headset"></i>
                        </div>
                        <span>Talk to Live Concierge</span>
                    </button>
                </div>
            )}
        </div>
    );
};

