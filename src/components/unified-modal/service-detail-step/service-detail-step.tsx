import React from 'react';
import styles from '../unified-modal.module.scss';

const avatar = '/assets/images/avatar.png';

interface ServiceContent {
    title: string;
    subtitle: string;
    icon: string;
    benefit: string;
    stats?: string;
    animation: string;
}

interface ServiceDetailStepProps {
    service: ServiceContent;
    selectedService: string;
    isAuthenticatedSession: boolean;
    onBack: () => void;
    onGetStarted: () => void;
    onLearnQuestionClick?: (question: string) => void;
}

export const ServiceDetailStep: React.FC<ServiceDetailStepProps> = ({
    service,
    selectedService,
    isAuthenticatedSession,
    onBack,
    onGetStarted,
    onLearnQuestionClick
}) => {
    return (
        <div className={`${styles.service_detail_step} ${styles[service.animation]}`}>
            {/* Header with Back Button */}
            <div className={styles.step_header}>
                <button className={styles.back_button} onClick={onBack}>
                    <i className="fas fa-arrow-left"></i>
                </button>
            </div>

            {/* Alex Intro Section */}
            <div className={styles.alex_intro}>
                <div className={styles.alex_avatar}>
                    <img src={avatar} alt="Alex" />
                    <span className={styles.status_badge}>LIVE</span>
                </div>
                <div className={styles.alex_message}>
                    <h3>Great choice!</h3>
                    <p>Let me get you set up with {service.title.toLowerCase()}</p>
                </div>
            </div>

            {/* Service Preview */}
            <div className={styles.service_preview}>
                <div className={styles.service_icon}>
                    <i className={service.icon}></i>
                </div>
                <h2>{service.title}</h2>
                <p className={styles.service_subtitle}>{service.subtitle}</p>

                {service.stats && (
                    <div className={styles.stats_container}>
                        {service.stats.split('\n').map((stat, index) => (
                            <div key={index} className={styles.stat_item}>
                                {stat.replace('• ', '')}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <div className={styles.cta_section}>
                <p className={styles.cta_text}>Get instant access with secure phone verification</p>
                <button className={styles.get_started_btn} onClick={onGetStarted}>
                    Get Started - It's Free!
                </button>
            </div>

            {/* Learn flow questions (optional, hidden by default) */}
            {selectedService === 'learn' && false && onLearnQuestionClick && (
                <div className="grid gap-2 mt-4 px-6">
                    {['How to use Diabetrix', 'What is the dosage?', 'Side effects', 'When will it start working?'].map((q) => (
                        <button
                            key={q}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                            onClick={() => onLearnQuestionClick?.(q)}>
                            {q}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

