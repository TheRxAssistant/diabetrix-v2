import React, { useState, useEffect } from 'react';
import avatarImage from '../../../assets/images/avatar.png';
import { trackingService } from '../../../services/tracking/tracking-service';
import { useProviderSearch } from '../../../services/provider-search/useProviderSearch';
import { postAPI, CAPABILITIES_API_URLS } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { useThemeConfig } from '../../../hooks/useThemeConfig';
import { getDomain } from '../../../config/theme-config';
// Using inline styles instead of module import to avoid lint errors

interface BookAppointmentModalProps {
    provider: any;
    onClose: () => void;
    onRequestAppointment: (provider: any, reason: string, availability: string) => any;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ provider, onClose, onRequestAppointment }) => {
    const themeConfig = useThemeConfig();
    const [reason, setReason] = useState('');
    const [availability, setAvailability] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [enrichedProvider, setEnrichedProvider] = useState<any>(provider);
    const [is_loading, set_is_loading] = useState(false);
    const { enrichProviderWithCareDetails } = useProviderSearch();

    // Fetch care details when modal opens for a provider with provider_id
    useEffect(() => {
        const fetchCareDetails = async () => {
            if (!provider?.provider_id) {
                setEnrichedProvider(provider);
                return;
            }

            try {
                const enriched = await enrichProviderWithCareDetails(provider);
                setEnrichedProvider(enriched);
            } catch (error) {
                console.error('Error fetching care details:', error);
                setEnrichedProvider(provider);
            }
        };

        fetchCareDetails();
    }, []);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError('Please provide a reason for your visit');
            return;
        }

        setIsSubmitting(true);
        set_is_loading(true);
        setError('');

        try {
            // Get user info from auth store
            const authStore = useAuthStore.getState();
            const user = authStore.user;
            
            if (!user || !user.userData) {
                throw new Error('User not authenticated. Please log in to book an appointment.');
            }

            const userData = user.userData;
            const user_id = userData.user_id;
            const providerName = provider?.provider_name || provider?.facility_name || 'Provider';
            const isFacility = !!provider?.facility_name || !!provider?.facility_id;

            // Extract zipcode from address if available
            let zipcode = '';
            if (provider?.provider_address || provider?.address) {
                const address = provider?.provider_address || provider?.address;
                const zipcodeMatch = address.match(/\b\d{5}\b/);
                if (zipcodeMatch) {
                    zipcode = zipcodeMatch[0];
                }
            }

            // Prepare request JSON with appointment details
            const request_json: any = {
                appointment_notes: reason,
                appointment_address: provider?.provider_address || provider?.address || '',
                appointment_zipcode: zipcode || provider?.provider_zipcode || provider?.zipcode || '',
                appointment_status: 'Requested',
            };

            if (isFacility) {
                request_json.facility_name = providerName;
                request_json.facility_phone = provider?.facility_phone || provider?.phone || '';
            } else {
                request_json.doctor_name = providerName;
                // Use phone from enriched provider (from care details API) if available, otherwise fall back to original provider phone
                request_json.doctor_phone = enrichedProvider?.provider_phone || enrichedProvider?.phone || provider?.provider_phone || provider?.phone || '';
                request_json.provider_id = provider?.provider_id || provider?.id;
            }

            if (availability) {
                request_json.appointment_date_time = availability;
            }

            // Build request_details string
            const address_str = request_json.appointment_address || 'Not specified';
            const phone_str = request_json.doctor_phone || request_json.facility_phone || 'Not specified';
            const request_details = `Provider: ${providerName}\nAddress: ${address_str}\nPhone: ${phone_str}\nReason: ${reason}${availability ? `\nAvailability: ${availability}` : ''}`;

            // Create approved request via API
            const response = await postAPI(CAPABILITIES_API_URLS.SYNC_APPROVED_REQUEST, {
                domain: getDomain(themeConfig),
                task_type_name: 'doctor-appointment-booking',
                user_id,
                request_name: `Book Appointment with ${providerName}`,
                request_details,
                request_json,
                is_source_request: true,
            });

            if (response.statusCode === 200) {
                setIsSubmitting(false);
                set_is_loading(false);
                setIsSuccess(true);

                // Close modal after showing success message for 2 seconds
                setTimeout(async () => {
                    await onRequestAppointment(provider, reason, availability);
                    onClose();
                }, 2000);
            } else {
                throw new Error(response.message || 'Failed to request appointment. Please try again.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to request appointment. Please try again.';
            setError(errorMessage);
            setIsSubmitting(false);
            set_is_loading(false);
            console.error('Error booking appointment:', err);
        }
    };

    const providerName = provider?.provider_name || provider?.facility_name || 'Provider';
    const providerSpecialty = provider?.provider_specialty || provider?.facility_type || 'Healthcare Provider';

    return (
        <div onClick={onClose} className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg w-full max-w-lg shadow-xl relative flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10">
                        ×
                    </button>
                    <h2 className="text-xl font-semibold mt-0 mb-0 pr-8">{isSuccess ? 'Appointment Requested' : 'Book Appointment'}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-4">

                {isSuccess ? (
                    <div className="text-center mb-6">
                        <div className="w-15 h-15 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
                        <h3 className="text-lg font-medium mb-4">Request Successful!</h3>
                        <p className="mb-4 text-gray-600 text-sm">Your appointment request with {providerName} has been submitted.</p>
                        <p className="mb-6 text-gray-600 text-sm">We will contact you shortly with confirmation details.</p>
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
                        <div className="flex items-center">
                            <div
                                className="w-12 h-12 min-w-[3rem] min-h-[3rem] rounded-full bg-gray-200 mr-4 bg-cover bg-center bg-no-repeat"
                                style={{
                                    backgroundImage: `url(${provider?.provider_image || avatarImage})`,
                                }}
                                aria-label={`${providerName} avatar`}
                            />
                            <div>
                                <h3 className="text-base font-medium text-gray-900 m-0">{providerName}</h3>
                                <p className="text-sm text-gray-600 mt-1 m-0">{providerSpecialty}</p>
                            </div>
                        </div>
                    </div>
                )}

                {!isSuccess && (
                    <>
                        <div className="mb-4">
                            <label htmlFor="reason" className="block mb-2 text-sm font-medium text-gray-700">
                                Reason for visit
                            </label>
                            <textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please describe your symptoms or reason for the appointment"
                                className="w-full p-3 border border-gray-300 rounded-md min-h-[100px] resize-vertical text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="availability" className="block mb-2 text-sm font-medium text-gray-700">
                                Availability
                            </label>
                            <textarea
                                id="availability"
                                value={availability}
                                onChange={(e) => setAvailability(e.target.value)}
                                placeholder="Tell us about your availability"
                                className="w-full p-3 border border-gray-300 rounded-md min-h-[100px] resize-vertical text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                            />
                        </div>
                    </>
                )}

                {error && <div className="text-red-700 mb-4 p-2 bg-red-50 rounded text-sm">{error}</div>}
                
                </div>

                <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
                    <div className={`flex gap-3 ${isSuccess ? 'flex-row justify-center' : 'flex-col'}`}>
                        {(isSubmitting || is_loading) && (
                            <div className="text-center w-full">
                                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full mx-auto mb-4 animate-spin" />
                                <p className="m-0 text-gray-600 text-sm">Processing your request...</p>
                            </div>
                        )}

                        {!isSubmitting && !is_loading && !isSuccess && (
                            <>
                                <button onClick={onClose} className="w-full py-3 px-4 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm">
                                    Cancel
                                </button>
                                <button onClick={handleSubmit} disabled={isSubmitting || is_loading} className="w-full py-3 px-4 text-white font-medium rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 border-none hover:shadow-lg transition-all duration-200 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                    Place Request
                                </button>
                            </>
                        )}

                        {isSuccess && (
                            <button onClick={onClose} className="py-3 px-4 text-white font-medium rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 border-none hover:shadow-lg transition-all duration-200 shadow-sm w-full max-w-[200px] text-sm">
                                Close
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookAppointmentModal;
