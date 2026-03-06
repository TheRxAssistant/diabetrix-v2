import React, { useEffect, useState } from 'react';
import { X, Star, MapPin, Calendar } from 'lucide-react';
import { Provider, Facility, ProviderDetails, ProviderBasicInfo, ProviderFocusArea, ProviderReviews } from '../../../services/provider-search/useProviderSearch';
import { MAPS_API_KEY } from '../../../services/types/healthcare/types';

interface LegacyProvider {
    id: string;
    name: string;
    specialty: string;
    rating: number;
    reviewCount: number;
    languages: string[];
    address: string;
    distance: string;
    avatar: string;
    phone?: string;
    topConditions: Array<{
        condition: string;
        percentage: string;
    }>;
    topProcedures: Array<{
        procedure: string;
        percentage: string;
    }>;
    acceptsInsurance: boolean;
    nextAvailable: string;
}

interface ProviderDetailsModalProps {
    provider: Provider | Facility | LegacyProvider | null;
    onClose: () => void;
    onBookAppointment?: (provider: Provider | Facility | LegacyProvider) => void;
    fetchProviderCareDetails?: (providerId: number | string, isFacility?: boolean) => Promise<ProviderDetails | null>;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({ provider, onClose, onBookAppointment, fetchProviderCareDetails }) => {
    const [details, set_details] = useState<ProviderDetails | null>(null);
    const [is_loading_details, set_is_loading_details] = useState(false);
    const [basic_info, set_basic_info] = useState<ProviderBasicInfo>({});
    const [focus_areas, set_focus_areas] = useState<ProviderFocusArea>({});
    const [reviews, set_reviews] = useState<ProviderReviews>({ Count: 0, Review: [] });
    const [image_load_error, set_image_load_error] = useState(false);

    if (!provider) return null;

    const isApiProvider = 'provider_name' in provider || ('provider_id' in provider && !('facility_id' in provider));
    const isFacility = 'facility_name' in provider || 'facility_id' in provider;
    const isLegacyProvider = 'name' in provider && !('provider_name' in provider) && !('facility_name' in provider) && !('provider_id' in provider);

    const getName = () => {
        if (isApiProvider) return (provider as Provider).provider_name || '';
        if (isFacility) return (provider as Facility).facility_name || '';
        if (isLegacyProvider) return (provider as LegacyProvider).name;
        return '';
    };

    const getSpecialty = () => {
        if (isApiProvider) return (provider as Provider).provider_specialty;
        if (isFacility) return (provider as Facility).facility_type;
        if (isLegacyProvider) return (provider as LegacyProvider).specialty;
        return '';
    };

    const getRating = () => {
        if (basic_info?.rating) return basic_info.rating;
        if (isApiProvider) return (provider as Provider).provider_rating || (provider as Provider).rating || null;
        if (isFacility) return (provider as Facility).facility_rating || null;
        if (isLegacyProvider) return (provider as LegacyProvider).rating;
        return null;
    };

    const getReviewCount = () => {
        if (basic_info?.review_count) return basic_info.review_count;
        if (reviews.Count > 0) return reviews.Count;
        if (isApiProvider) return (provider as Provider).provider_review_count || (provider as Provider).review_count || 0;
        if (isFacility) return (provider as Facility).facility_review_count || 0;
        if (isLegacyProvider) return (provider as LegacyProvider).reviewCount;
        return 0;
    };

    const getAddress = () => {
        if (basic_info?.facilities?.[0]?.formattedAddress) return basic_info.facilities[0].formattedAddress;
        if (isApiProvider) return (provider as Provider).provider_address || (provider as Provider).address;
        if (isFacility) return (provider as Facility).facility_address;
        if (isLegacyProvider) return (provider as LegacyProvider).address;
        return '';
    };

    const getPhone = () => {
        if (basic_info?.facilities?.[0]?.phone?.[0]) return basic_info.facilities[0].phone[0];
        if (isApiProvider) return (provider as Provider).provider_phone || (provider as Provider).phone;
        if (isFacility) return (provider as Facility).facility_phone;
        return null;
    };

    const getLanguages = () => {
        if (basic_info?.languages && basic_info.languages.length > 0) return basic_info.languages.join(', ');
        if (isApiProvider) return (provider as Provider).provider_languages || null;
        if (isLegacyProvider) return (provider as LegacyProvider).languages?.join(', ') || null;
        return null;
    };

    const getImage = () => {
        if (basic_info?.image) return basic_info.image;
        if (isApiProvider) return (provider as Provider).provider_image || (provider as Provider).image;
        if (isFacility) return (provider as Facility).facility_image;
        if (isLegacyProvider) return (provider as LegacyProvider).avatar;
        return '';
    };

    const getDegrees = () => {
        if (basic_info?.degrees && basic_info.degrees.length > 0) return basic_info.degrees.join(', ');
        if (isApiProvider) return (provider as Provider).provider_degree || null;
        return null;
    };

    const getSpecialtyLabel = () => {
        if (basic_info?.specialties && basic_info.specialties.length > 0) {
            return basic_info.specialties.map((s) => s.display_name).filter(Boolean).join(', ');
        }
        return getSpecialty();
    };

    const getDistance = () => {
        if (basic_info?.distance != null) return `${basic_info.distance} mi`;
        const dist = (provider as Provider).provider_distance;
        if (dist != null) return `${dist} mi`;
        return null;
    };

    const getAcceptsNewPatients = () => {
        if (basic_info?.accepts_new_patients !== undefined) return basic_info.accepts_new_patients ? 'Yes' : 'No';
        return null;
    };

    const getInsuranceCount = () => {
        if (basic_info?.insurances && basic_info.insurances.length > 0) return basic_info.insurances.length;
        return null;
    };

    const getTopConditions = (): Array<{ condition: string; pct: number }> => {
        if (isLegacyProvider && (provider as LegacyProvider).topConditions) {
            return (provider as LegacyProvider).topConditions.map((c) => ({ condition: c.condition, pct: parseFloat(c.percentage) || 0 }));
        }
        return focus_areas?.conditions?.conditions?.slice(0, 10) || [];
    };

    const getTopProcedures = (): Array<{ procedure: string; pct: number }> => {
        if (isLegacyProvider && (provider as LegacyProvider).topProcedures) {
            return (provider as LegacyProvider).topProcedures.map((p) => ({ procedure: p.procedure, pct: parseFloat(p.percentage) || 0 }));
        }
        return focus_areas?.procedures?.procedures?.slice(0, 10) || [];
    };

    useEffect(() => {
        set_image_load_error(false);
    }, [provider, basic_info?.image]);

    useEffect(() => {
        const provider_id = isApiProvider
            ? (provider as Provider).provider_id
            : null;
        const facility_id = isFacility
            ? (provider as Facility).facility_id
            : null;
        const id = provider_id || facility_id;

        if (!id || !fetchProviderCareDetails) return;

        set_is_loading_details(true);
        fetchProviderCareDetails(id, !!facility_id)
            .then((result) => {
                if (result) {
                    set_details(result);
                    set_basic_info(result.basic_info || {});
                    set_focus_areas(result.focus_areas || {});
                    set_reviews(result.reviews || { Count: 0, Review: [] });
                }
            })
            .finally(() => set_is_loading_details(false));
    }, []);

    const name = getName();
    const specialty = getSpecialtyLabel();
    const rating = getRating();
    const reviewCount = getReviewCount();
    const address = getAddress();
    const phone = getPhone();
    const languages = getLanguages();
    const image = getImage();
    const degrees = getDegrees();
    const distance = getDistance();
    const accepts_new_patients = getAcceptsNewPatients();
    const insurance_count = getInsuranceCount();
    const topConditions = getTopConditions();
    const topProcedures = getTopProcedures();

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
            }}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Provider Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Provider Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mr-4">
                                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gray-200 overflow-hidden">
                                        {image && !image_load_error ? (
                                            <img
                                                src={image}
                                                alt={name}
                                                className="w-full h-full object-cover"
                                                onError={() => set_image_load_error(true)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                                                <span className="text-2xl font-bold">{name?.charAt(0) || 'P'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                                        {name || 'Provider Name'}
                                    </h1>
                                    <p className="text-gray-600">{specialty}</p>

                                    {address && (
                                        <div className="flex items-center mt-2 text-gray-500">
                                            <MapPin size={16} className="mr-1" />
                                            <span className="text-sm">{address}</span>
                                        </div>
                                    )}

                                    {rating != null && Number(reviewCount) > 0 && (
                                        <div className="flex items-center mt-1 text-gray-500">
                                            <Star size={16} className="mr-1 text-yellow-400" fill="currentColor" />
                                            <span className="text-sm">{rating}</span>
                                            <span className="text-sm ml-1">({reviewCount} reviews)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Provider Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Provider Information</h2>
                            {is_loading_details ? (
                                <div className="flex items-center space-x-2 py-4 text-gray-400 text-sm">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                    <span className="ml-1">Loading details…</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {accepts_new_patients != null && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-600">Accepts New Patients</span>
                                            <span className="font-medium text-gray-800">{accepts_new_patients}</span>
                                        </div>
                                    )}
                                    {specialty && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-600">Specialty</span>
                                            <span className="font-medium text-gray-800 text-right max-w-[60%]">{specialty}</span>
                                        </div>
                                    )}
                                    {degrees && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-600">Degree</span>
                                            <span className="font-medium text-gray-800">{degrees}</span>
                                        </div>
                                    )}
                                    {languages && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-600">Languages Spoken</span>
                                            <span className="font-medium text-gray-800">{languages}</span>
                                        </div>
                                    )}
                                    {distance && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-600">Distance</span>
                                            <span className="font-medium text-gray-800">{distance} away</span>
                                        </div>
                                    )}
                                    {insurance_count != null && (
                                        <div className="flex justify-between border-b border-gray-100 pb-2">
                                            <span className="text-gray-600">Insurance Plans Accepted</span>
                                            <span className="font-medium text-gray-800">{insurance_count}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Focus Areas Section */}
                        {!is_loading_details && (topConditions.length > 0 || topProcedures.length > 0) && (
                            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mt-2">
                                <div className="flex flex-col lg:flex-col gap-4">
                                    {/* Top Conditions Treated */}
                                    {topConditions.length > 0 && (
                                        <div>
                                            <h3 className="text-md font-semibold text-gray-800 flex items-center mb-3">
                                                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                                Top Conditions Treated
                                            </h3>
                                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                                                {(() => {
                                                    const max_pct = Math.max(...topConditions.map((i) => i.pct || 0), 0);
                                                    return topConditions.map((item, index) => (
                                                        <div key={`condition-${index}`} className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex justify-between text-sm mb-1.5">
                                                                <span className="text-gray-700 font-medium truncate pr-2">{item.condition}</span>
                                                                <span className="text-blue-600 font-semibold whitespace-nowrap">{typeof item.pct === 'number' ? item.pct.toFixed(2) : '0.00'}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${max_pct > 0 ? (item.pct / max_pct) * 100 : 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Procedures Performed */}
                                    {topProcedures.length > 0 && (
                                        <div>
                                            <h3 className="text-md font-semibold text-gray-800 flex items-center mb-3">
                                                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                Top Procedures Performed
                                            </h3>
                                            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                                                {(() => {
                                                    const max_pct = Math.max(...topProcedures.map((i) => i.pct || 0), 0);
                                                    return topProcedures.map((item, index) => (
                                                        <div key={`procedure-${index}`} className="bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex justify-between text-sm mb-1.5">
                                                                <span className="text-gray-700 font-medium truncate pr-2">{item.procedure}</span>
                                                                <span className="text-green-600 font-semibold whitespace-nowrap">{typeof item.pct === 'number' ? item.pct.toFixed(2) : '0.00'}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                                                    style={{ width: `${max_pct > 0 ? (item.pct / max_pct) * 100 : 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviews Section - only when there is at least one review */}
                        {!is_loading_details && Number(reviewCount) > 0 && reviews.Review && reviews.Review.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Patient Reviews</h2>
                                    <span className="text-sm text-gray-600">{reviews.Count} ratings</span>
                                </div>
                                <div className="space-y-4">
                                    {reviews.Review.slice(0, 5).map((review, index) => (
                                        <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                                            <div className="flex items-start justify-between mb-2">
                                                {review.rating != null && (
                                                    <div className="flex items-center">
                                                        <div className="flex items-center mr-3">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star key={star} size={14} className={`${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{review.rating}/5</span>
                                                    </div>
                                                )}
                                                <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{review.review}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Actions & Contact */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => onBookAppointment?.(provider)}
                                className="w-full py-4 rounded-lg font-medium hover:opacity-80 transition-colors flex items-center justify-center space-x-2 font-nav bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white">
                                <Calendar size={20} />
                                <span>Book Appointment</span>
                            </button>

                            <div className="space-y-3">
                                {address && MAPS_API_KEY && (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                                        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Location</h2>
                                        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                                            <iframe
                                                title="Provider Location"
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                style={{ border: 0 }}
                                                src={`https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${encodeURIComponent(address)}&zoom=15`}
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    disabled={!address}
                                    onClick={() => {
                                        if (address) {
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank', 'noopener,noreferrer');
                                        }
                                    }}
                                    className="bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 w-full disabled:opacity-50 disabled:cursor-not-allowed">
                                    <MapPin size={18} />
                                    <span>Navigate</span>
                                </button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                            <div className="space-y-3">
                                {address && (
                                    <div className="flex items-start">
                                        <MapPin size={18} className="text-gray-500 mr-3 mt-0.5" />
                                        <span className="text-gray-700 text-sm">{address}</span>
                                    </div>
                                )}
                                {phone && (
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
                                        </svg>
                                        <a href={`tel:${phone}`} className="text-blue-600 hover:underline text-sm">{phone}</a>
                                    </div>
                                )}
                                {!address && !phone && <p className="text-sm text-gray-400">No contact information available.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDetailsModal;
