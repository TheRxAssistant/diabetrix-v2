import React, { useEffect } from 'react';
import styles from '../unified-modal.module.scss';
import { useUserDetails } from '../../../services/user-management/hooks-user-details';

const avatar = '/assets/images/avatar.png';

interface ProfilePageProps {
    userData: any;
    selectedService: string;
    selectedPharmacies: string[];
    messages: any[];
    onLogout: () => void;
    onShowRequests?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userData, selectedService, selectedPharmacies, messages, onLogout, onShowRequests }) => {
    const { user_details, is_loading, error, fetch_user_details } = useUserDetails();

    // Fetch user details on component mount
    useEffect(() => {
        // Try to get user_id from props first, then from authStore
        const user_id = userData?.user_id;
        if (user_id) {
            fetch_user_details(user_id);
        } else {
            // If no user_id in props, let hook try to get it from authStore
            fetch_user_details();
        }
    }, [userData?.user_id, fetch_user_details]);

    // Use fetched data if available, otherwise fall back to props
    const displayUserData = user_details || userData;

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
                {/* Error State */}
                {error && !is_loading && (
                    <div className={styles.profile_section}>
                        <div className={styles.error_message} style={{ color: '#dc3545', padding: '12px', backgroundColor: '#f8d7da', borderRadius: '8px', marginBottom: '16px' }}>
                            <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                            {error}
                        </div>
                    </div>
                )}

                {/* Profile Overview */}
                <div className={styles.profile_section}>
                    <h4 className={styles.section_title}>
                        <i className="fas fa-user"></i> Profile Overview
                    </h4>
                    {displayUserData ? (
                        <div className={styles.profile_info}>
                            <div className={styles.info_row}>
                                <span className={styles.info_label}>Name:</span>
                                <span className={styles.info_value}>
                                    {displayUserData.first_name || ''} {displayUserData.last_name || ''}
                                </span>
                            </div>
                            <div className={styles.info_row}>
                                <span className={styles.info_label}>Phone:</span>
                                <span className={styles.info_value}>{displayUserData.phone_number || displayUserData.user_phone_number || 'N/A'}</span>
                            </div>
                            {displayUserData.email && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Email:</span>
                                    <span className={styles.info_value}>{displayUserData.email}</span>
                                </div>
                            )}
                            {displayUserData.date_of_birth && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Date of Birth:</span>
                                    <span className={styles.info_value}>{displayUserData.date_of_birth}</span>
                                </div>
                            )}
                            {displayUserData.address && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Address:</span>
                                    <span className={styles.info_value}>
                                        {displayUserData.address.street && `${displayUserData.address.street}, `}
                                        {displayUserData.address.city || ''}
                                        {displayUserData.address.city && displayUserData.address.state ? ', ' : ''}
                                        {displayUserData.address.state || ''}
                                        {displayUserData.address.zip_code && ` ${displayUserData.address.zip_code}`}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className={styles.no_data}>No profile data available</p>
                    )}
                </div>

                {/* Insurance Information */}
                {displayUserData?.insurance_details && (
                    <div className={styles.profile_section}>
                        <h4 className={styles.section_title}>
                            <i className="fas fa-shield-alt"></i> Insurance Information
                        </h4>
                        <div className={styles.profile_info}>
                            {displayUserData.insurance_details.provider && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Provider:</span>
                                    <span className={styles.info_value}>{displayUserData.insurance_details.provider}</span>
                                </div>
                            )}
                            {displayUserData.insurance_details.member_id && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Member ID:</span>
                                    <span className={styles.info_value}>{displayUserData.insurance_details.member_id}</span>
                                </div>
                            )}
                            {displayUserData.insurance_details.policy_number && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Policy Number:</span>
                                    <span className={styles.info_value}>{displayUserData.insurance_details.policy_number}</span>
                                </div>
                            )}
                            {displayUserData.insurance_details.group_number && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Group Number:</span>
                                    <span className={styles.info_value}>{displayUserData.insurance_details.group_number}</span>
                                </div>
                            )}
                            {displayUserData.insurance_details.effective_date && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Effective Date:</span>
                                    <span className={styles.info_value}>{displayUserData.insurance_details.effective_date}</span>
                                </div>
                            )}
                            {!displayUserData.insurance_details.provider && !displayUserData.insurance_details.member_id && !displayUserData.insurance_details.policy_number && !displayUserData.insurance_details.group_number && !displayUserData.insurance_details.effective_date && <p className={styles.no_data}>No insurance information available</p>}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className={styles.profile_actions}>
                    <button className={`${styles.button} ${styles.secondary_button} ${styles.full_width_button}`} onClick={onShowRequests || (() => {})}>
                        <i className="fas fa-clipboard-list"></i>
                        Show Ongoing Requests
                    </button>
                    <button className={`${styles.button} ${styles.logout_button}`} onClick={onLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};
