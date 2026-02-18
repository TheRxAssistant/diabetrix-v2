// ChatLoader.tsx
import React, { useEffect, useState } from "react";
import "./chat-body.scss";
import { ThemeConfig, getBrandName, getThemeConfig } from "../../../config/theme-config";

interface ChatLoaderProps {
    is_reconnecting?: boolean;
    is_initial_load?: boolean;
    themeConfig?: ThemeConfig;
}

const getLoadingSteps = (brandName: string) => [
    { text: `Connecting to ${brandName.charAt(0).toUpperCase() + brandName.slice(1)} network`, duration: 1500 },
    { text: "Finding your personal concierge", duration: 2000 },
    { text: "Establishing secure connection", duration: 1500 },
    { text: "Almost ready", duration: 1000 }
];

const ChatLoader: React.FC<ChatLoaderProps> = ({ is_reconnecting, is_initial_load, themeConfig }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAvatarVisible, setIsAvatarVisible] = useState(false);
    const [showDots, setShowDots] = useState(true);
    
    // Get theme config from prop or window.location
    const effectiveThemeConfig = themeConfig || (typeof window !== 'undefined' ? getThemeConfig(window.location.pathname) : undefined);
    const brandName = effectiveThemeConfig ? getBrandName(effectiveThemeConfig) : 'diabetrix';
    const LoadingSteps = getLoadingSteps(brandName);

    useEffect(() => {
        if (is_initial_load) {
            let currentTimeout = 0;
            
            // Show avatar after first step
            setTimeout(() => {
                setIsAvatarVisible(true);
            }, LoadingSteps[0].duration);

            // Progress through loading steps
            LoadingSteps.forEach((step, index) => {
                setTimeout(() => {
                    setCurrentStep(index);
                    // Hide dots on last step
                    if (index === LoadingSteps.length - 1) {
                        setShowDots(false);
                    }
                }, currentTimeout);
                currentTimeout += step.duration;
            });
        }
    }, [is_initial_load, LoadingSteps]);

    if (is_reconnecting) {
        return (
            <div className="message system-message">
                <div className="message-content">
                    <div className="reconnecting-indicator">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round">
                                <animateTransform
                                    attributeName="transform"
                                    attributeType="XML"
                                    type="rotate"
                                    from="0 12 12"
                                    to="360 12 12"
                                    dur="1s"
                                    repeatCount="indefinite"
                                />
                            </path>
                        </svg>
                        <span>Reconnecting to your concierge...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (is_initial_load) {
        return (
            <div className="connecting-animation initial-load">
                <div className={`avatar-container ${isAvatarVisible ? 'visible' : ''}`}>
                    <img 
                        src="/assets/images/avatar.png" 
                        alt={`Alex - ${brandName.charAt(0).toUpperCase() + brandName.slice(1)} Concierge`}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `data:image/svg+xml,${encodeURIComponent('<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#0066FF"/><text x="50%" y="50%" font-family="Arial" font-size="32" fill="white" text-anchor="middle" dy=".3em">A</text></svg>')}`;
                        }}
                    />
                    <div className="connecting-ring"></div>
                </div>
                <div className="connecting-text">
                    {LoadingSteps[currentStep].text}
                    {showDots && (
                        <span className="dots">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="message system-message">
            <div className="message-content">
                <div className="typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
            </div>
        </div>
    );
};

export default ChatLoader;
