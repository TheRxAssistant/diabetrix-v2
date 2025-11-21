import React from 'react';
import { X, Star, MapPin, Phone, Calendar } from 'lucide-react';
import { Provider, Facility } from '../../../services/provider-search/useProviderSearch';
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
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({ provider, onClose }) => {
    console.log(provider)
    if (!provider) return null;

    // Determine provider type
    const isApiProvider = 'provider_name' in provider;
    const isFacility = 'facility_name' in provider;
    const isLegacyProvider = 'name' in provider && !('provider_name' in provider) && !('facility_name' in provider);

    // Extract common fields based on provider type
    const getName = () => {
        let name = '';
        if (isApiProvider) {
            name = (provider as Provider).provider_name || '';
            console.log('API Provider name:', name);
        } else if (isFacility) {
            name = (provider as Facility).facility_name || '';
            console.log('Facility name:', name);
        } else if (isLegacyProvider) {
            name = (provider as LegacyProvider).name;
            console.log('Legacy provider name:', name);
        }
        console.log('Final extracted name:', name);
        return name || '';
    };

    const getSpecialty = () => {
        if (isApiProvider) return (provider as Provider).provider_specialty;
        if (isFacility) return (provider as Facility).facility_type;
        if (isLegacyProvider) return (provider as LegacyProvider).specialty;
        return '';
    };

    const getRating = () => {
        if (isApiProvider) return (provider as Provider).provider_rating || 4.8;
        if (isFacility) return (provider as Facility).facility_rating || 4.8;
        if (isLegacyProvider) return (provider as LegacyProvider).rating;
        return 4.8;
    };

    const getReviewCount = () => {
        if (isApiProvider) return (provider as Provider).provider_review_count || 0;
        if (isFacility) return (provider as Facility).facility_review_count || 0;
        if (isLegacyProvider) return (provider as LegacyProvider).reviewCount;
        return 0;
    };

    const getAddress = () => {
        if (isApiProvider) return (provider as Provider).provider_address;
        if (isFacility) return (provider as Facility).facility_address;
        if (isLegacyProvider) return (provider as LegacyProvider).address;
        return '';
    };

    const getPhone = () => {
        if (isApiProvider) return (provider as Provider).provider_phone;
        if (isFacility) return (provider as Facility).facility_phone;
        return '';
    };

    const getLanguages = () => {
        if (isApiProvider) return (provider as Provider).provider_languages || 'English';
        if (isLegacyProvider) return (provider as LegacyProvider).languages.join(', ');
        return 'English';
    };

    const getImage = () => {
        if (isApiProvider) return (provider as Provider).provider_image;
        if (isFacility) return (provider as Facility).facility_image;
        if (isLegacyProvider) return (provider as LegacyProvider).avatar;
        return '';
    };

    // Generate mock distance for display
    const getDistance = () => {
        const distances = ['0.5 mi', '1.2 mi', '2.1 mi', '3.4 mi', '4.8 mi', '5.3 mi'];
        return distances[Math.floor(Math.random() * distances.length)];
    };

    const distance = getDistance();
    const name = getName();
    const specialty = getSpecialty();
    const rating = getRating();
    const reviewCount = getReviewCount();
    const address = getAddress();
    const phone = getPhone();
    const languages = getLanguages();
    const image = getImage();

    // Get conditions and procedures data
    const getTopConditions = () => {
        if (isLegacyProvider && (provider as LegacyProvider).topConditions) {
            return (provider as LegacyProvider).topConditions;
        }
        // Endocrine-focused conditions
        return [
            'Type 2 Diabetes Mellitus',
            'Hypothyroidism',
            'Hyperthyroidism',
            'Thyroid Nodules',
            'Osteoporosis',
            'PCOS (Polycystic Ovary Syndrome)',
            'Metabolic Syndrome',
            'Adrenal Disorders',
            'Pituitary Disorders',
            'Hyperlipidemia'
        ];
    };

    const getTopProcedures = () => {
        if (isLegacyProvider && (provider as LegacyProvider).topProcedures) {
            return (provider as LegacyProvider).topProcedures;
        }
        // Endocrine-focused procedures
        return [
            'Thyroid Fine Needle Aspiration',
            'Continuous Glucose Monitor Placement',
            'Insulin Pump Management',
            'Bone Density Interpretation',
            'Hormone Stimulation Testing',
            'Thyroid Ultrasound',
            'Diabetic Foot Examination',
            'Endocrine Function Testing'
        ];
    };

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
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    {/* Left Column - Provider Info & Contact */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Provider Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mr-4">
                                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gray-200 overflow-hidden">
                                        {image ? (
                                            <img src={image} alt={name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                                                <span className="text-2xl font-bold">{name?.charAt(0) || 'P'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                                            {name || 'Provider Name'}
                                        </h1>
                                    </div>
                                    <p className="text-gray-600">{specialty}</p>

                                    {address && (
                                        <div className="flex items-center mt-2 text-gray-500">
                                            <MapPin size={16} className="mr-1" />
                                            <span className="text-sm">{address}</span>
                                        </div>
                                    )}

                                    {phone && (
                                        <div className="flex items-center mt-1 text-gray-500">
                                            <Phone size={16} className="mr-1" />
                                            <span className="text-sm">{phone}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center mt-1 text-gray-500">
                                        <Star size={16} className="mr-1 text-yellow-400" fill="currentColor" />
                                        <span className="text-sm">{rating}</span>
                                        <span className="text-sm">({reviewCount} reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Provider Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Provider Information</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-600">Accepts Insurance</span>
                                    <span className="font-medium text-gray-800">Yes</span>
                                </div>

                                {specialty && (
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-600">Specialty</span>
                                        <span className="font-medium text-gray-800">{specialty}</span>
                                    </div>
                                )}

                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-600">Degree</span>
                                    <span className="font-medium text-gray-800">DO</span>
                                </div>

                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-600">Languages Spoken</span>
                                    <span className="font-medium text-gray-800">{languages}</span>
                                </div>

                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="text-gray-600">Distance</span>
                                    <span className="font-medium text-gray-800">{distance} away</span>
                                </div>

                                {/*<div className="flex justify-between border-b border-gray-100 pb-2">*/}
                                {/*    <span className="text-gray-600">Next Available</span>*/}
                                {/*    <span className="font-medium text-gray-800">Tomorrow at 2:00 PM</span>*/}
                                {/*</div>*/}
                            </div>
                        </div>

                        {/* Focus Areas Section */}
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-2 lg:p-2 mt-2 transition-all duration-300 hover:shadow-lg">
                            {/* Responsive container for both sections */}
                            <div className="flex flex-col lg:flex-row lg:gap-2">
                                {/* Top Conditions Treated */}
                                <div className="lg:flex-1 mb-2 lg:mb-0 p-2 rounded-xl">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-md font-semibold text-gray-800 flex items-center">
                                                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                                Top Conditions Treated
                                            </h3>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {topConditions.map((condition, index) => {
                                                const conditionText = typeof condition === 'string' ? condition : (condition as any).condition || '';
                                                const conditionPercent = typeof condition === 'string' ? `${Math.floor(Math.random() * 15 + 10)}.${Math.floor(Math.random() * 99)}%` : (condition as any).percentage || `${Math.floor(Math.random() * 15 + 10)}.${Math.floor(Math.random() * 99)}%`;
                                                return (
                                                <div key={`condition-${index}`} className="mb-4 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-gray-700 font-medium truncate pr-2" title={conditionText}>{conditionText}</span>
                                                        <span className="text-blue-600 font-semibold whitespace-nowrap">{conditionPercent}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                        <div 
                                                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                                                            style={{ width: `${Math.floor(Math.random() * 80 + 20)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Top Procedures Performed */}
                                <div className="lg:flex-1 p-2 rounded-xl">
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-md font-semibold text-gray-800 flex items-center">
                                                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                                Top Procedures Performed
                                            </h3>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {topProcedures.map((procedure, index) => {
                                                const procedureText = typeof procedure === 'string' ? procedure : (procedure as any).procedure || '';
                                                const procedurePercent = typeof procedure === 'string' ? `${Math.floor(Math.random() * 15 + 10)}.${Math.floor(Math.random() * 99)}%` : (procedure as any).percentage || `${Math.floor(Math.random() * 15 + 10)}.${Math.floor(Math.random() * 99)}%`;
                                                return (
                                                <div key={`procedure-${index}`} className="mb-4 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-gray-700 font-medium truncate pr-2" title={procedureText}>{procedureText}</span>
                                                        <span className="text-green-600 font-semibold whitespace-nowrap">{procedurePercent}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                        <div 
                                                            className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                                                            style={{ width: `${Math.floor(Math.random() * 80 + 20)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions & Contact */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button className="w-full py-4 rounded-lg font-medium hover:opacity-80 transition-colors flex items-center justify-center space-x-2 font-nav bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white">
                                <Calendar size={20} />
                                <span>Book Appointment</span>
                            </button>

                            <div className="space-y-3">
                                {/* Location Map */}
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
                                                allowFullScreen></iframe>
                                        </div>
                                    </div>
                                )}
                                <button className="bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 w-full">
                                    <MapPin size={18} />
                                    <span>Navigate</span>
                                </button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                            <div className="space-y-3">
                                {phone && (
                                    <div className="flex items-center">
                                        <Phone size={18} className="text-gray-500 mr-3" />
                                        <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                                            {phone}
                                        </a>
                                    </div>
                                )}
                                {address && (
                                    <div className="flex items-start">
                                        <MapPin size={18} className="text-gray-500 mr-3 mt-0.5" />
                                        <span className="text-gray-700">{address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDetailsModal;
