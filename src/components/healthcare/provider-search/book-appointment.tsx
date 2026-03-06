import React, { useState, useEffect } from 'react';
import { ExternalLink, MessageCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppointments } from '../../../services/healthcare/hooks-appointments';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { Provider, Facility } from '../../../services/provider-search/useProviderSearch';

/** Normalized provider shape for booking modal (Provider | Facility | LegacyProvider). */
interface NormalizedProvider {
    name: string;
    image: string | undefined;
    description: string;
    address: string;
    phone: string;
    zipcode: string;
    booking_links?: Array<{ url: string; serviceProvider: string }>;
    is_facility: boolean;
}

function cleanServiceProviderName(service_provider: string): string {
    if (!service_provider) return '';
    return service_provider
        .replace(/&[^;]+;/g, '')
        .replace(/[^\w\s\-.,()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeProvider(provider: Provider | Facility | Record<string, unknown> | null): NormalizedProvider | null {
    if (!provider) return null;
    const p = provider as Record<string, unknown>;
    const name =
        (p.provider_name as string) ||
        (p.facility_name as string) ||
        (p.name as string) ||
        '';
    const image =
        (p.provider_image as string) ||
        (p.facility_image as string) ||
        (p.image as string) ||
        (p.avatar as string) ||
        undefined;
    const description =
        (p.provider_specialty as string) ||
        (p.facility_type as string) ||
        (p.description as string) ||
        (p.specialty as string) ||
        '';
    const address =
        (p.provider_address as string) ||
        (p.facility_address as string) ||
        (p.address as string) ||
        '';
    const phone =
        (p.provider_phone as string) ||
        (p.facility_phone as string) ||
        (p.phone as string) ||
        '';
    let zipcode = (p.zipcode as string) || (p.provider_zipcode as string) || '';
    if (!zipcode && address) {
        const match = address.match(/\b\d{5}\b/);
        if (match) zipcode = match[0];
    }
    const booking_links = (p.booking_links as Array<{ url: string; serviceProvider: string }>) || undefined;
    const is_facility = !!(p.facility_name || p.facility_id);

    return {
        name,
        image,
        description,
        address,
        phone,
        zipcode,
        booking_links: booking_links?.length ? booking_links : undefined,
        is_facility,
    };
}

export interface BookingFormData {
    reason_for_visit: string;
    availability: string;
    provider_id: string;
}

interface BookAppointmentModalProps {
    provider: Provider | Facility | Record<string, unknown> | null;
    is_open?: boolean;
    onClose: () => void;
    onRequestAppointment?: (provider: unknown, reason: string, availability: string) => void;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
    provider,
    is_open = true,
    onClose,
    onRequestAppointment,
}) => {
    const { create_appointment, is_loading } = useAppointments();
    const [form_data, set_form_data] = useState<BookingFormData>({
        reason_for_visit: '',
        availability: '',
        provider_id: '',
    });
    const [sms_status, set_sms_status] = useState<'idle' | 'sending' | 'sent'>('idle');
    const [image_error, set_image_error] = useState(false);

    const normalized = normalizeProvider(provider);
    const provider_id = normalized?.name ?? '';

    useEffect(() => {
        set_form_data((prev) => ({
            ...prev,
            provider_id,
        }));
    }, [provider_id]);

    useEffect(() => {
        if (is_open) {
            set_image_error(false);
        }
    }, [normalized?.image, is_open]);

    const handle_change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        set_form_data((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handle_submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form_data.availability || !form_data.reason_for_visit || !normalized) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            set_sms_status('sending');

            await create_appointment({
                appointment_details: {
                    appointment_date_time: form_data.availability,
                    appointment_notes: form_data.reason_for_visit,
                    appointment_address: normalized.address,
                    doctor_name: normalized.name,
                    doctor_phone: normalized.phone,
                    appointment_zipcode: normalized.zipcode,
                },
                appointment_with: normalized.is_facility ? 'Facility' : 'Provider',
            });

            set_sms_status('sent');

            setTimeout(() => {
                toast.success('Appointment Requested successfully!');
                onRequestAppointment?.(provider, form_data.reason_for_visit, form_data.availability);
                onClose();
            }, 1500);
        } catch {
            set_sms_status('idle');
            toast.error('Failed to request appointment');
        }
    };

    if (!is_open || !normalized) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-appointment-title"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 id="book-appointment-title" className="text-lg font-semibold text-gray-800">
                        Book Appointment
                    </h2>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <X size={20} />
                    </Button>
                </div>

                <div className="p-4 relative">
                    {(is_loading || sms_status !== 'idle') && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                            <div className="flex flex-col items-center">
                                {sms_status === 'sending' && (
                                    <>
                                        <div className="relative mb-4">
                                            <MessageCircle size={48} className="text-blue-600 animate-pulse" />
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                                        </div>
                                        <span className="text-blue-600 font-medium">Sending SMS...</span>
                                        <span className="text-gray-500 text-sm mt-1">Adding your appointment</span>
                                    </>
                                )}
                                {sms_status === 'sent' && (
                                    <>
                                        <div className="relative mb-4">
                                            <MessageCircle size={48} className="text-green-600" />
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        </div>
                                        <span className="text-green-600 font-medium">SMS Sent!</span>
                                        <span className="text-gray-500 text-sm mt-1">Booking request sent</span>
                                    </>
                                )}
                                {is_loading && sms_status === 'idle' && (
                                    <>
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2" />
                                        <span className="text-blue-600 font-medium">Booking appointment...</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center mb-4">
                        {normalized.image && !image_error ? (
                            <img
                                src={normalized.image}
                                alt={normalized.name}
                                className="w-12 h-12 rounded-full object-cover mr-3"
                                onError={() => set_image_error(true)}
                            />
                        ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold">
                                    {normalized.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div>
                            <h3 className="font-medium text-gray-900">{normalized.name}</h3>
                            <p className="text-sm text-gray-600">{normalized.description}</p>
                        </div>
                    </div>

                    {normalized.booking_links && normalized.booking_links.length > 0 ? (
                        <div>
                            <p className="text-sm text-gray-600 mb-4">
                                Book your appointment through one of the following platforms:
                            </p>
                            <div className="space-y-3">
                                {normalized.booking_links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                        onClick={() => onClose()}
                                    >
                                        <div className="flex items-center">
                                            <ExternalLink size={16} className="text-blue-600 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">
                                                Book with {cleanServiceProviderName(link.serviceProvider)}
                                            </span>
                                        </div>
                                        <span className="text-blue-600 text-sm">→</span>
                                    </a>
                                ))}
                            </div>
                            <div className="flex justify-end mt-6">
                                <Button type="button" onClick={onClose} variant="secondary">
                                    Close
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handle_submit}>
                            <div className="mb-4">
                                <label
                                    htmlFor="reason_for_visit"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Reason for visit
                                </label>
                                <Textarea
                                    id="reason_for_visit"
                                    name="reason_for_visit"
                                    value={form_data.reason_for_visit}
                                    onChange={handle_change}
                                    required
                                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Please describe your symptoms or reason for the appointment"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                                    Availability
                                </label>
                                <Textarea
                                    id="availability"
                                    name="availability"
                                    value={form_data.availability}
                                    onChange={handle_change}
                                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={2}
                                    placeholder="Tell us about your availability"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <Button type="button" onClick={onClose} variant="secondary">
                                    Cancel
                                </Button>
                                <Button type="submit">Request Appointment</Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookAppointmentModal;
