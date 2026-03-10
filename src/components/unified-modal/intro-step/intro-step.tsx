import React from 'react';
import styles from '../unified-modal.module.scss';
import { ThemeConfig, PopupButton } from '../../../config/theme-config';

const avatar = '/assets/images/avatar.png';

interface IntroStepProps {
    isTyping: boolean;
    themeConfig: ThemeConfig;
    onServiceSelect: (service: string) => void;
}

export const IntroStep: React.FC<IntroStepProps> = ({ isTyping, themeConfig, onServiceSelect }) => {
    const isCustomTheme = themeConfig.domain !== 'default';
    const isOnapgo = themeConfig.domain === 'onapgo';
    
    // Handle button click - for onapgo, all buttons go to chat
    const handleButtonClick = (service: string) => {
        if (isOnapgo) {
            onServiceSelect('chat');
        } else {
            onServiceSelect(service);
        }
    };
    
    // Build background style (only bg_color, not bg_image - bg_image goes to page background)
    const backgroundStyle: React.CSSProperties = {};
    if (isCustomTheme && !themeConfig.bg_image) {
        // Use bg_color if it's a custom theme and no bg_image (bg_image is handled at page level)
        backgroundStyle.backgroundColor = themeConfig.bg_color;
    }
    
    // Add CSS variables for theming
    if (isCustomTheme) {
        Object.assign(backgroundStyle, {
            '--theme-bg-color': themeConfig.bg_color,
            '--theme-button-bg': themeConfig.button_bg_color,
            '--theme-button-text': themeConfig.button_text_color,
            '--theme-button-hover': themeConfig.button_hover_color,
            '--theme-icon-bg': themeConfig.icon_container_color,
            '--theme-icon-text': themeConfig.icon_container_text_color,
        } as React.CSSProperties);
    }
    
    return (
        <div 
            className={`${styles.intro_step} ${isCustomTheme ? styles.custom_theme : ''}`}
            style={Object.keys(backgroundStyle).length > 0 ? backgroundStyle : undefined}
        >
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
                    {themeConfig.popup_btns && themeConfig.popup_btns.length > 0 ? (
                        // Render buttons from config
                        themeConfig.popup_btns.map((btn: PopupButton, index: number) => (
                            <button
                                key={`${btn.action}-${index}`}
                                className={`${styles.action_btn} ${isCustomTheme ? styles.custom_actions_theme : ''}`}
                                onClick={() => handleButtonClick(btn.action)}
                                style={isCustomTheme ? {
                                    background: themeConfig.button_bg_color,
                                    color: themeConfig.button_text_color,
                                    border: `1px solid ${themeConfig.button_hover_color || '#e2e8f0'}`,
                                } : undefined}
                            >
                                {btn.icon && (
                                    <div 
                                        className={`${styles.icon_container} ${isCustomTheme ? styles.custom_actions_theme_icon_container : ''}`}
                                        style={isCustomTheme ? {
                                            background: themeConfig.icon_container_color,
                                        } : undefined}
                                    >
                                        <i 
                                            className={btn.icon}
                                            style={isCustomTheme ? {
                                                color: themeConfig.icon_container_text_color,
                                            } : undefined}
                                        ></i>
                                    </div>
                                )}
                                <span>{btn.text}</span>
                            </button>
                        ))
                    ) : (
                        // Fallback to default buttons if popup_btns not provided
                        <>
                            <button
                                className={`${styles.action_btn} ${styles.find_doctor} ${isCustomTheme ? styles.custom_actions_theme : ''}`}
                                onClick={() => handleButtonClick('doctor')}
                                style={isCustomTheme ? {
                                    background: themeConfig.button_bg_color,
                                    color: themeConfig.button_text_color,
                                    border: `1px solid ${themeConfig.button_hover_color || '#e2e8f0'}`,
                                } : undefined}
                            >
                                <div 
                                    className={`${styles.icon_container} ${isCustomTheme ? styles.custom_actions_theme_icon_container : ''}`}
                                    style={isCustomTheme ? {
                                        background: themeConfig.icon_container_color,
                                    } : undefined}
                                >
                                    <i 
                                        className="fas fa-user-md"
                                        style={isCustomTheme ? {
                                            color: themeConfig.icon_container_text_color,
                                        } : undefined}
                                    ></i>
                                </div>
                                <span>Find/Schedule Doctor</span>
                            </button>

                            <button
                                className={`${styles.action_btn} ${styles.cost_support} ${isCustomTheme ? styles.custom_actions_theme : ''}`}
                                onClick={() => handleButtonClick('insurance')}
                                style={isCustomTheme ? {
                                    background: themeConfig.button_bg_color,
                                    color: themeConfig.button_text_color,
                                    border: `1px solid ${themeConfig.button_hover_color || '#e2e8f0'}`,
                                } : undefined}
                            >
                                <div 
                                    className={`${styles.icon_container} ${isCustomTheme ? styles.custom_actions_theme_icon_container : ''}`}
                                    style={isCustomTheme ? {
                                        background: themeConfig.icon_container_color,
                                    } : undefined}
                                >
                                    <i 
                                        className="fas fa-hand-holding-usd"
                                        style={isCustomTheme ? {
                                            color: themeConfig.icon_container_text_color,
                                        } : undefined}
                                    ></i>
                                </div>
                                <span>Cost Support / Insurance Help</span>
                            </button>

                            <button
                                className={`${styles.action_btn} ${styles.find_pharmacy} ${isCustomTheme ? styles.custom_actions_theme : ''}`}
                                onClick={() => handleButtonClick('pharmacy')}
                                style={isCustomTheme ? {
                                    background: themeConfig.button_bg_color,
                                    color: themeConfig.button_text_color,
                                    border: `1px solid ${themeConfig.button_hover_color || '#e2e8f0'}`,
                                } : undefined}
                            >
                                <div 
                                    className={`${styles.icon_container} ${isCustomTheme ? styles.custom_actions_theme_icon_container : ''}`}
                                    style={isCustomTheme ? {
                                        background: themeConfig.icon_container_color,
                                    } : undefined}
                                >
                                    <i 
                                        className="fas fa-map-marker-alt"
                                        style={isCustomTheme ? {
                                            color: themeConfig.icon_container_text_color,
                                        } : undefined}
                                    ></i>
                                </div>
                                <span>Find In-Stock Pharmacy</span>
                            </button>

                            <button
                                className={`${styles.action_btn} ${styles.learn_more} ${isCustomTheme ? styles.custom_actions_theme : ''}`}
                                onClick={() => handleButtonClick('learn')}
                                style={isCustomTheme ? {
                                    background: themeConfig.button_bg_color,
                                    color: themeConfig.button_text_color,
                                    border: `1px solid ${themeConfig.button_hover_color || '#e2e8f0'}`,
                                } : undefined}
                            >
                                <div 
                                    className={`${styles.icon_container} ${isCustomTheme ? styles.custom_actions_theme_icon_container : ''}`}
                                    style={isCustomTheme ? {
                                        background: themeConfig.icon_container_color,
                                    } : undefined}
                                >
                                    <i 
                                        className="fas fa-book-medical"
                                        style={isCustomTheme ? {
                                            color: themeConfig.icon_container_text_color,
                                        } : undefined}
                                    ></i>
                                </div>
                                <span>Learn About Diabetrix</span>
                            </button>

                            <button
                                className={`${styles.action_btn} ${styles.chat} ${isCustomTheme ? styles.custom_actions_theme : ''}`}
                                onClick={() => handleButtonClick('chat')}
                                style={isCustomTheme ? {
                                    background: themeConfig.button_bg_color,
                                    color: themeConfig.button_text_color,
                                    border: `1px solid ${themeConfig.button_hover_color || '#e2e8f0'}`,
                                } : undefined}
                            >
                                <div 
                                    className={`${styles.icon_container} ${isCustomTheme ? styles.custom_actions_theme_icon_container : ''}`}
                                    style={isCustomTheme ? {
                                        background: themeConfig.icon_container_color,
                                    } : undefined}
                                >
                                    <i 
                                        className="fas fa-headset"
                                        style={isCustomTheme ? {
                                            color: themeConfig.icon_container_text_color,
                                        } : undefined}
                                    ></i>
                                </div>
                                <span>Talk to Live Concierge</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

