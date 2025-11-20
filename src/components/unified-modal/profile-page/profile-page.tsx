import React from 'react';
import styles from '../unified-modal.module.scss';

const avatar = '/assets/images/avatar.png';

interface ProfilePageProps {
    userData: any;
    selectedService: string;
    selectedPharmacies: string[];
    messages: any[];
    onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
    userData,
    selectedService,
    selectedPharmacies,
    messages,
    onLogout
}) => {
    return (
        <div className={styles.verification_step}>
            <div className={styles.step_header}>
                <div className={styles.alex_mini}>
                    <img src={avatar} alt="Profile" />
                </div>
                <h3>Profile</h3>
                <p>Manage your account and preferences</p>
            </div>

            <div className={styles.profile_content}>
                {/* Profile Overview */}
                <div className={styles.profile_section}>
                    <h4 className={styles.section_title}>
                        <i className="fas fa-user"></i> Profile Overview
                    </h4>
                    {userData ? (
                        <div className={styles.profile_info}>
                            <div className={styles.info_row}>
                                <span className={styles.info_label}>Name:</span>
                                <span className={styles.info_value}>
                                    {userData.first_name} {userData.last_name}
                                </span>
                            </div>
                            <div className={styles.info_row}>
                                <span className={styles.info_label}>Phone:</span>
                                <span className={styles.info_value}>{userData.phone_number}</span>
                            </div>
                            {userData.address && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Address:</span>
                                    <span className={styles.info_value}>
                                        {userData.address.city}, {userData.address.state}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className={styles.no_data}>No profile data available</p>
                    )}
                </div>

                {/* Request Overview */}
                <div className={styles.profile_section}>
                    <h4 className={styles.section_title}>
                        <i className="fas fa-clipboard-list"></i> Request Overview
                    </h4>
                    <div className={styles.request_summary}>
                        <div className={styles.request_item}>
                            <span className={styles.request_label}>Healthcare Searches:</span>
                            <span className={styles.request_count}>{selectedService === 'doctor' ? '1 active' : '0'}</span>
                        </div>
                        <div className={styles.request_item}>
                            <span className={styles.request_label}>Insurance Requests:</span>
                            <span className={styles.request_count}>{selectedService === 'insurance' ? '1 active' : '0'}</span>
                        </div>
                        <div className={styles.request_item}>
                            <span className={styles.request_label}>Pharmacy Checks:</span>
                            <span className={styles.request_count}>{selectedPharmacies.length > 0 ? `${selectedPharmacies.length} checked` : '0'}</span>
                        </div>
                        <div className={styles.request_item}>
                            <span className={styles.request_label}>Chat Sessions:</span>
                            <span className={styles.request_count}>{messages.length > 0 ? '1 active' : '0'}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.profile_actions}>
                    <button className={`${styles.button} ${styles.logout_button}`} onClick={onLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

