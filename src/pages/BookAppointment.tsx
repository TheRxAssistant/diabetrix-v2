import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { postAPI, CAPABILITIES_API_URLS } from '../services/api';

interface FormData {
    first_name: string;
    last_name: string;
    user_phone: string;
    user_email: string;
    user_date_of_birth: string;
    user_street: string;
    user_city: string;
    user_state: string;
    user_zipcode: string;
    user_country: string;
    insurance_provider: string;
    member_id: string;
    policy_number: string;
    group_number: string;
    insurance_type: 'commercial' | 'medicare' | 'medicaid' | 'other';
    appointment_with: 'Provider' | 'Facility';
    provider_name: string;
    provider_address: string;
    provider_number: string;
    availability: string;
    reason_for_visit: string;
}

const initialFormData: FormData = {
    first_name: '',
    last_name: '',
    user_phone: '',
    user_email: '',
    user_date_of_birth: '',
    user_street: '',
    user_city: '',
    user_state: '',
    user_zipcode: '',
    user_country: 'US',
    insurance_provider: '',
    member_id: '',
    policy_number: '',
    group_number: '',
    insurance_type: 'commercial',
    appointment_with: 'Provider',
    provider_name: '',
    provider_address: '',
    provider_number: '',
    availability: '',
    reason_for_visit: '',
};

const BookAppointment: React.FC = () => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Validation
        const requiredFields = [
            'first_name', 'last_name', 'user_phone', 'user_email', 'user_date_of_birth',
            'user_street', 'user_city', 'user_state', 'user_zipcode',
            'insurance_provider', 'member_id', 'provider_name', 'availability', 'reason_for_visit'
        ];

        for (const field of requiredFields) {
            if (!formData[field as keyof FormData]) {
                setError(`Please fill in ${field.replace(/_/g, ' ')}`);
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const payload = {
                domain: 'diabetrix',
                user_name: `${formData.first_name} ${formData.last_name}`,
                user_phone: formData.user_phone,
                user_email: formData.user_email,
                user_address: `${formData.user_street}, ${formData.user_city}, ${formData.user_state} ${formData.user_zipcode}, ${formData.user_country}`,
                user_zipcode: formData.user_zipcode,
                user_insurance_details: {
                    provider: formData.insurance_provider,
                    policy_number: formData.policy_number || null,
                    group_number: formData.group_number || null,
                    effective_date: '',
                    insurance_type: formData.insurance_type,
                    member_id: formData.member_id,
                },
                appointment_with: formData.appointment_with,
                appointment_with_details: {
                    provider_name: formData.provider_name,
                    provider_number: formData.provider_number || null,
                    availability: formData.availability,
                    provider_address: formData.provider_address || null,
                    reason_for_visit: formData.reason_for_visit,
                },
                appointment_status: 'Requested',
            };

            const response = await postAPI(CAPABILITIES_API_URLS.SYNC_APPOINTMENT, payload);

            if (response.statusCode === 200) {
                setIsSuccess(true);
            } else {
                setError(response.message || 'Failed to submit appointment request. Please try again.');
            }
        } catch (err) {
            console.error('Error submitting appointment:', err);
            setError('An error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center text-4xl mx-auto mb-6">
                        ✓
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Request Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        We have received your appointment request with <strong>{formData.provider_name}</strong>.
                        Our team will contact you shortly to confirm your appointment.
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        A confirmation SMS has been sent to {formData.user_phone}
                    </p>
                    <button
                        onClick={() => window.close()}
                        className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Close Window
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
                    <p className="text-gray-600">Fill out the form below to request an appointment with your healthcare provider</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
                    {/* Personal Information */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="user_phone"
                                    value={formData.user_phone}
                                    onChange={handleChange}
                                    placeholder="(555) 123-4567"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    name="user_email"
                                    value={formData.user_email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                                <input
                                    type="date"
                                    name="user_date_of_birth"
                                    value={formData.user_date_of_birth}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Address */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Address
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                                <input
                                    type="text"
                                    name="user_street"
                                    value={formData.user_street}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                <input
                                    type="text"
                                    name="user_city"
                                    value={formData.user_city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                <input
                                    type="text"
                                    name="user_state"
                                    value={formData.user_state}
                                    onChange={handleChange}
                                    placeholder="e.g., CA"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                                <input
                                    type="text"
                                    name="user_zipcode"
                                    value={formData.user_zipcode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                    type="text"
                                    name="user_country"
                                    value={formData.user_country}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Insurance Information */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Insurance Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider *</label>
                                <input
                                    type="text"
                                    name="insurance_provider"
                                    value={formData.insurance_provider}
                                    onChange={handleChange}
                                    placeholder="e.g., Blue Cross Blue Shield"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Type *</label>
                                <select
                                    name="insurance_type"
                                    value={formData.insurance_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="commercial">Commercial</option>
                                    <option value="medicare">Medicare</option>
                                    <option value="medicaid">Medicaid</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member ID *</label>
                                <input
                                    type="text"
                                    name="member_id"
                                    value={formData.member_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                                <input
                                    type="text"
                                    name="policy_number"
                                    value={formData.policy_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Group Number</label>
                                <input
                                    type="text"
                                    name="group_number"
                                    value={formData.group_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Appointment Details */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Appointment Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type *</label>
                                <select
                                    name="appointment_with"
                                    value={formData.appointment_with}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="Provider">Healthcare Provider (Doctor)</option>
                                    <option value="Facility">Facility</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Provider/Facility Name *</label>
                                <input
                                    type="text"
                                    name="provider_name"
                                    value={formData.provider_name}
                                    onChange={handleChange}
                                    placeholder="e.g., Dr. John Smith"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Provider Phone</label>
                                <input
                                    type="tel"
                                    name="provider_number"
                                    value={formData.provider_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Provider Address</label>
                                <input
                                    type="text"
                                    name="provider_address"
                                    value={formData.provider_address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Availability *</label>
                                <input
                                    type="text"
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleChange}
                                    placeholder="e.g., Tomorrow at 2pm, Next Monday morning, Any weekday afternoon"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit *</label>
                                <textarea
                                    name="reason_for_visit"
                                    value={formData.reason_for_visit}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Please describe the reason for your appointment..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-center pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-12 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Appointment Request'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default BookAppointment;

