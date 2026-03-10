import { useAuthStore } from '../store/authStore';
import { CAPABILITIES_API_URLS, postAPI } from './api';
import { getThemeConfig, getBrandName } from '../config/theme-config';

/**
 * SMS Service for sending text messages
 * This service provides a centralized way to send SMS messages
 * The actual API integration will be wired up later
 */

interface SMSResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

interface SMSOptions {
    phoneNumber?: string; // Optional - will use logged in user's number if not provided
    priority?: 'normal' | 'high';
    scheduledTime?: Date;
}

class SMSService {
    /**
     * Send an SMS message
     * @param message - The message content to send
     * @param options - Optional configuration for the SMS
     * @returns Promise<SMSResponse>
     */
    async sendSMS(message: string, options: SMSOptions = {}, from_number?: string): Promise<SMSResponse> {
        try {
            const state = useAuthStore.getState();
            const fallback = '9999999999';
            const rawTarget = options.phoneNumber || state.user?.phoneNumber || fallback;
            const toNumber = (rawTarget || fallback).toString().replace(/\D/g, '') || fallback;

            const result = await postAPI(CAPABILITIES_API_URLS.SEND_SMS, {
                to_number: toNumber,
                message,
                sms_provider: 'twilio',
                from_number,
            });

            if (result.statusCode !== 200) {
                throw new Error(`HTTP ${result.statusCode}: ${result.message}`);
            }

            return {
                success: Boolean(result.data?.success ?? true),
                messageId: `api_${Date.now()}`,
            };
        } catch (error) {
            console.error('SMS Service Error:', error);
            // Fallback to mock so UX continues to work in dev/demo
            const fallback = await this.mockAPICall(message, options);
            return fallback;
        }
    }

    /**
     * Send diabetes medication availability update SMS
     */
    async sendMedicationAvailabilityUpdate(medicationName: string, pharmacyName: string, status: 'checking' | 'in-stock' | 'not-available' | 'pending'): Promise<SMSResponse> {
        const statusMessages = {
            checking: `We're checking with ${pharmacyName} for ${medicationName} availability. You'll get a follow-up soon.`,
            'in-stock': `Great news! ${medicationName} is available at ${pharmacyName}. Ready for pickup!`,
            'not-available': `${pharmacyName} doesn't have ${medicationName} in stock. We're checking other nearby pharmacies for you.`,
            pending: `Update from ${pharmacyName}: Still checking ${medicationName} availability`,
        };

        return this.sendSMS(statusMessages[status]);
    }

    /**
     * Send appointment confirmation SMS
     */
    async sendAppointmentConfirmation(doctorName: string, date: string, time: string): Promise<SMSResponse> {
        const message = `Appointment confirmed with ${doctorName} on ${date} at ${time}. We'll send you a reminder 24 hours before.`;
        return this.sendSMS(message);
    }

    /**
     * Send prescription transfer update SMS
     */
    async sendTransferUpdate(fromPharmacy: string, toPharmacy: string, status: 'initiated' | 'completed' | 'failed'): Promise<SMSResponse> {
        const statusMessages = {
            initiated: `Transfer request submitted from ${fromPharmacy} to ${toPharmacy}. We'll update you on progress.`,
            completed: `Prescription successfully transferred from ${fromPharmacy} to ${toPharmacy}. Ready for pickup!`,
            failed: `Transfer from ${fromPharmacy} to ${toPharmacy} encountered an issue. Please call us for assistance.`,
        };

        return this.sendSMS(statusMessages[status]);
    }

    /**
     * Send copay assistance update SMS
     */
    async sendCopayAssistanceUpdate(medicationName: string, status: 'approved' | 'pending' | 'rejected' | 'requested'): Promise<SMSResponse> {
        const statusMessages = {
            requested: `We've received your copay assistance request for ${medicationName}. We'll review your eligibility and update you within 30-60 minutes.`,
            approved: `Great news! Your copay assistance for ${medicationName} has been approved. Check your email for your savings card details.`,
            pending: `Your copay assistance application for ${medicationName} is being reviewed. We'll update you within 24-48 hours.`,
            rejected: `Your copay assistance application for ${medicationName} needs additional information. Please check your email for next steps.`,
        };

        return this.sendSMS(statusMessages[status]);
    }

    // Send a welcome message to the user from diabetrix number
    async sendWelcomeMessage(phoneNumber: string) {
        console.log('Sending welcome message to', phoneNumber);
        // Get brand name from current pathname
        const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
        const themeConfig = getThemeConfig(pathname);
        const brandName = getBrandName(themeConfig);
        const capitalizedBrandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
        const message = `Hi, I'm Alex, Your ${capitalizedBrandName} Concierge. How can I help you today?`;
        return this.sendSMS(message, { phoneNumber }, '+18629724788');
    }

    /**
     * Send insurance coverage check SMS
     */
    async sendInsuranceCoverageUpdate(medicationName: string, status: 'checking' | 'covered' | 'not-covered' | 'partial' | 'requested' | 'requested_with_copay'): Promise<SMSResponse> {
        const statusMessages = {
            requested: `We've received your insurance coverage request for ${medicationName}. We'll verify your benefits and contact you within 30-60 minutes.`,
            checking: `We're checking your insurance coverage for ${medicationName}. We'll update you as soon as we have results.`,
            covered: `Good news! Your insurance covers ${medicationName}. Check your email for coverage details and estimated costs.`,
            'not-covered': `Your insurance doesn't cover ${medicationName}, but we're finding alternative options and savings programs for you.`,
            partial: `Your insurance partially covers ${medicationName}. We're checking for additional savings options to reduce your cost.`,
            requested_with_copay: `We've received your insurance coverage request for ${medicationName}. We'll verify your benefits and contact you within 30-60 minutes. Meanwhile here is your copay card: BIN: 610020, PCN: PDMI, Group: 99995260, Coupon ID: 1406895387. Is there anything else I can help you with?`,
        };

        return this.sendSMS(statusMessages[status]);
    }

    /**
     * Mock API call - will be replaced with actual implementation
     */
    private async mockAPICall(_message: string, _options: SMSOptions): Promise<SMSResponse> {
        // Simulate different response scenarios
        const shouldSucceed = Math.random() > 0.1; // 90% success rate for testing

        if (shouldSucceed) {
            return {
                success: true,
                messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
        } else {
            return {
                success: false,
                error: 'Failed to send SMS - network error',
            };
        }
    }
}

// Export singleton instance
export const smsService = new SMSService();

// Export the class for testing or custom instances
export { SMSService };

// Convenience function for quick SMS sending
export const sendSMS = (message: string, options?: SMSOptions) => {
    return smsService.sendSMS(message, options);
};

// Convenience functions for common Diabetrix notifications
export const sendInsuranceRequest = (medicationName: string) => {
    return smsService.sendInsuranceCoverageUpdate(medicationName, 'requested');
};
export const sendInsuranceRequestWithCopay = (medicationName: string) => {
    return smsService.sendInsuranceCoverageUpdate(medicationName, 'requested_with_copay');
};

export const sendCopayRequest = (medicationName: string) => {
    return smsService.sendCopayAssistanceUpdate(medicationName, 'requested');
};

export const sendCopayCardDetails = (medicationName: string) => {
    const message = `Here is your ${medicationName} Coupon Card: BIN: 610020, PCN: PDMI, Group: 99995260, Coupon ID: 1406895387. Is there anything else I can help you with?`;
    return smsService.sendSMS(message);
};

export const sendEligibilityCheckFollowUp = (medicationName: string) => {
    const message = `We are still checking your eligibility, meanwhile here is your copay card: BIN: 610020, PCN: PDMI, Group: 99995260, Coupon ID: 1406895387. Is there anything else I can help you with?`;
    return smsService.sendSMS(message);
};

export const sendMedicationAvailability = (medicationName: string, pharmacyName: string, status: 'checking' | 'in-stock' | 'not-available') => {
    return smsService.sendMedicationAvailabilityUpdate(medicationName, pharmacyName, status);
};

export const sendWelcomeMessage = (phoneNumber: string) => {
    return smsService.sendWelcomeMessage(phoneNumber);
};
