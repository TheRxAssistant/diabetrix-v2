import React, { useEffect, useState } from 'react';
import styles from '../unified-modal.module.scss';
import { useUserDetails } from '../../../services/user-management/hooks-user-details';
import { useAuthStore } from '@/store/authStore';
import { postAPI, CORE_ENGINE_API_URLS } from '../../../services/api';

const avatar = '/assets/images/avatar.png';

interface ProfilePageProps {
    userData: any;
    selectedService: string;
    selectedPharmacies: string[];
    messages: any[];
    onLogout: () => void;
    onShowRequests?: () => void;
}

interface AddressForm {
    street: string;
    city: string;
    state: string;
    zip_code: string;
}

const lookupLocationFromZipcode = async (zipcode: string): Promise<{ city: string; state: string } | null> => {
    if (zipcode.length !== 5) return null;
    try {
        const response = await fetch(`https://api.zippopotam.us/us/${zipcode}`);
        if (!response.ok) return null;
        const data = await response.json();
        if (data && data.places && data.places.length > 0) {
            return {
                city: data.places[0]['place name'],
                state: data.places[0]['state abbreviation'],
            };
        }
        return null;
    } catch (error) {
        console.error('Error looking up zipcode:', error);
        return null;
    }
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ userData, selectedService, selectedPharmacies, messages, onLogout, onShowRequests }) => {
    const { user_details, is_loading, error, fetch_user_details } = useUserDetails();
    const [insuranceDetails, setInsuranceDetails] = useState<any>(null);

    const authStore = useAuthStore.getState();
    const user = authStore.user;

    const [is_editing_address, set_is_editing_address] = useState(false);
    const [address_form, set_address_form] = useState<AddressForm>({ street: '', city: '', state: '', zip_code: '' });
    const [is_saving, set_is_saving] = useState(false);
    const [save_error, set_save_error] = useState<string | null>(null);
    const [save_success, set_save_success] = useState(false);

    useEffect(() => {
        const insurance_details = user?.userData?.insurance_details || {};
        setInsuranceDetails(insurance_details);
    }, [user]);

    useEffect(() => {
        const user_id = userData?.user_id;
        if (user_id) {
            fetch_user_details(user_id);
        } else {
            fetch_user_details();
        }
    }, [userData?.user_id, fetch_user_details]);

    const displayUserData = user_details || userData;

    const startEditingAddress = () => {
        const addr = displayUserData?.address || {};
        set_address_form({
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            zip_code: addr.zip_code || '',
        });
        set_save_error(null);
        set_save_success(false);
        set_is_editing_address(true);
    };

    const cancelEditingAddress = () => {
        set_is_editing_address(false);
        set_save_error(null);
    };

    const handleZipChange = async (zip: string) => {
        const sanitized = zip.replace(/\D/g, '').slice(0, 5);
        set_address_form((prev) => ({ ...prev, zip_code: sanitized }));

        if (sanitized.length === 5) {
            const location = await lookupLocationFromZipcode(sanitized);
            if (location) {
                set_address_form((prev) => ({ ...prev, city: location.city, state: location.state }));
            }
        }
    };

    const saveAddress = async () => {
        set_is_saving(true);
        set_save_error(null);

        try {
            const phone_number = user?.phoneNumber || userData?.phone_number || '';
            const existing_user_data = displayUserData || {};

            const updated_user_data = {
                ...existing_user_data,
                address: {
                    ...(existing_user_data.address || {}),
                    street: address_form.street,
                    city: address_form.city,
                    state: address_form.state,
                    zip_code: address_form.zip_code,
                },
            };

            const result = await postAPI(CORE_ENGINE_API_URLS.SYNC_USER, {
                user_data: updated_user_data,
                user_phone: phone_number,
            });

            if (result.statusCode === 200) {
                set_save_success(true);
                set_is_editing_address(false);
                // Re-fetch user details to reflect updated data
                const user_id = userData?.user_id;
                if (user_id) {
                    fetch_user_details(user_id);
                } else {
                    fetch_user_details();
                }
            } else {
                set_save_error(result.message || 'Failed to save address. Please try again.');
            }
        } catch (err) {
            console.error('Error saving address:', err);
            set_save_error('Network error. Please check your connection and try again.');
        } finally {
            set_is_saving(false);
        }
    };

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

                            {/* Address Section */}
                            <div className={styles.info_row} style={{ alignItems: 'flex-start' }}>
                                <span className={styles.info_label}>Address:</span>
                                <div style={{ flex: 1 }}>
                                    {is_editing_address ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input
                                                type="text"
                                                placeholder="Street"
                                                value={address_form.street}
                                                onChange={(e) => set_address_form((prev) => ({ ...prev, street: e.target.value }))}
                                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Zip Code"
                                                inputMode="numeric"
                                                maxLength={5}
                                                value={address_form.zip_code}
                                                onChange={(e) => handleZipChange(e.target.value)}
                                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={address_form.city}
                                                onChange={(e) => set_address_form((prev) => ({ ...prev, city: e.target.value }))}
                                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}
                                            />
                                            <input
                                                type="text"
                                                placeholder="State (e.g. NY)"
                                                maxLength={2}
                                                value={address_form.state}
                                                onChange={(e) => set_address_form((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))}
                                                style={{ width: '100%', padding: '6px 10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px' }}
                                            />
                                            {save_error && (
                                                <p style={{ color: '#dc3545', fontSize: '12px', margin: 0 }}>{save_error}</p>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                <button
                                                    onClick={saveAddress}
                                                    disabled={is_saving}
                                                    style={{ flex: 1, padding: '7px', background: '#0077cc', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: is_saving ? 'not-allowed' : 'pointer', opacity: is_saving ? 0.7 : 1 }}>
                                                    {is_saving ? 'Saving…' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={cancelEditingAddress}
                                                    disabled={is_saving}
                                                    style={{ flex: 1, padding: '7px', background: '#f5f5f5', color: '#333', border: '1px solid #ccc', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <span className={styles.info_value} style={{ flex: 1 }}>
                                                {displayUserData.address ? (
                                                    <>
                                                        {displayUserData.address.street && `${displayUserData.address.street}, `}
                                                        {displayUserData.address.city || ''}
                                                        {displayUserData.address.city && displayUserData.address.state ? ', ' : ''}
                                                        {displayUserData.address.state || ''}
                                                        {displayUserData.address.zip_code && ` ${displayUserData.address.zip_code}`}
                                                    </>
                                                ) : (
                                                    <span style={{ color: '#999' }}>No address on file</span>
                                                )}
                                            </span>
                                            <button
                                                onClick={startEditingAddress}
                                                title="Edit address"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0077cc', padding: '2px 4px', flexShrink: 0 }}>
                                                <i className="fas fa-pencil-alt" style={{ fontSize: '13px' }}></i>
                                            </button>
                                        </div>
                                    )}
                                    {save_success && !is_editing_address && (
                                        <p style={{ color: '#28a745', fontSize: '12px', margin: '4px 0 0' }}>Address updated successfully.</p>
                                    )}
                                </div>
                            </div>
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
                            {(displayUserData?.insurance_details?.provider || insuranceDetails?.provider) && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Provider:</span>
                                    <span className={styles.info_value}>{displayUserData?.insurance_details?.provider || insuranceDetails?.provider}</span>
                                </div>
                            )}
                            {(displayUserData?.insurance_details?.member_id || insuranceDetails?.member_id) && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Member ID:</span>
                                    <span className={styles.info_value}>{displayUserData?.insurance_details?.member_id || insuranceDetails?.member_id}</span>
                                </div>
                            )}
                            {(displayUserData?.insurance_details?.policy_number || insuranceDetails?.policy_number) && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Policy Number:</span>
                                    <span className={styles.info_value}>{displayUserData?.insurance_details?.policy_number || insuranceDetails?.policy_number}</span>
                                </div>
                            )}
                            {(displayUserData?.insurance_details?.group_number || insuranceDetails?.group_number) && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Group Number:</span>
                                    <span className={styles.info_value}>{displayUserData?.insurance_details?.group_number || insuranceDetails?.group_number}</span>
                                </div>
                            )}
                            {(displayUserData?.insurance_details?.effective_date || insuranceDetails?.effective_date) && (
                                <div className={styles.info_row}>
                                    <span className={styles.info_label}>Effective Date:</span>
                                    <span className={styles.info_value}>{displayUserData.insurance_details.effective_date}</span>
                                </div>
                            )}
                            {!displayUserData.insurance_details.provider && !insuranceDetails?.provider && <p className={styles.no_data}>No insurance information available</p>}
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
