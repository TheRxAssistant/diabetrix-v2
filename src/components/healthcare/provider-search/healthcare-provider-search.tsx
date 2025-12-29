import React, { useEffect, useState } from 'react';
import useProviderSearch, { Facility, Provider, SearchCategory } from '../../../services/provider-search/useProviderSearch';
import { sendSMS } from '../../../services/smsService';
import BookAppointmentModal from './book-appointment';
import EarliestAppointmentModal from './earliest-appointment-modal';
import PlotMap from './plot-map';
import SearchModal from './search-modal';
import ProviderDetailsModal from './provider-details-modal';
import InsuranceSearchModal from './insurance-search-modal';

import { ArrowLeft, MapPin, Search, Star, User, Zap } from 'lucide-react';
// Interface for providers with map coordinates
interface MapProvider extends Provider {
    provider_lat?: number;
    provider_lng?: number;
}

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

// Using SearchCategory interface from useProviderSearch hook

interface HealthcareProviderSearchProps {
    onClose: () => void;
    userData: any;
    searchQuery?: string;
    embedded?: boolean; // Whether component is embedded in another modal
}

export const HealthcareProviderSearch: React.FC<HealthcareProviderSearchProps> = ({ onClose, userData, searchQuery = 'endocrinologist', embedded = false }) => {
    const { providers: apiProviders, facilities, isLoading, error, handleCategorySelection } = useProviderSearch();

    // Legacy state for backward compatibility
    const [legacyProviders] = useState<LegacyProvider[]>([]);
    const [filteredLegacyProviders, setFilteredLegacyProviders] = useState<LegacyProvider[]>([]);

    const [selectedProvider, setSelectedProvider] = useState<LegacyProvider | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchQuery);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [categorySelected, setCategorySelected] = useState(false);
    const [userLocation, setUserLocation] = useState<string>('');
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBookingProvider, setSelectedBookingProvider] = useState<Provider | Facility | null>(null);
    const [showEarliestAppointmentModal, setShowEarliestAppointmentModal] = useState(false);
    const [showProviderDetailsModal, setShowProviderDetailsModal] = useState(false);
    const [selectedProviderForDetails, setSelectedProviderForDetails] = useState<Provider | Facility | LegacyProvider | null>(null);
    const [showInsuranceSearchModal, setShowInsuranceSearchModal] = useState(false);

    // Insurance providers with detailed payor and plan information
    const insuranceProviders = [
        { id: 1, payor: 'Blue Cross Blue Shield', plan: 'BCBS PPO Gold 1000' },
        { id: 2, payor: 'Blue Cross Blue Shield', plan: 'BCBS HMO Silver Advantage' },
        { id: 3, payor: 'Blue Cross Blue Shield', plan: 'BCBS Bronze Essential' },
        { id: 4, payor: 'Blue Cross Blue Shield', plan: 'Blue Choice PPO Plus' },
        { id: 5, payor: 'Blue Cross Blue Shield', plan: 'Blue Advantage HMO Direct' },
        { id: 6, payor: 'Aetna', plan: 'Aetna Open Choice PPO' },
        { id: 7, payor: 'Aetna', plan: 'Aetna Select HMO' },
        { id: 8, payor: 'Aetna', plan: 'Aetna Whole Health EPO' },
        { id: 9, payor: 'Aetna', plan: 'Aetna Gold Preferred PPO' },
        { id: 10, payor: 'Aetna', plan: 'Aetna Silver Value HMO' },
        { id: 11, payor: 'UnitedHealthcare', plan: 'UHC Choice Plus PPO' },
        { id: 12, payor: 'UnitedHealthcare', plan: 'UHC Navigate HMO' },
        { id: 13, payor: 'UnitedHealthcare', plan: 'UHC Compass EPO' },
        { id: 14, payor: 'UnitedHealthcare', plan: 'UHC Charter Balanced PPO' },
        { id: 15, payor: 'UnitedHealthcare', plan: 'UHC Silver Advantage HMO' },
        { id: 16, payor: 'Cigna', plan: 'Cigna LocalPlus HMO' },
        { id: 17, payor: 'Cigna', plan: 'Cigna Open Access Plus PPO' },
        { id: 18, payor: 'Cigna', plan: 'Cigna Connect Network' },
        { id: 19, payor: 'Cigna', plan: 'Cigna SureFit HMO' },
        { id: 20, payor: 'Cigna', plan: 'Cigna Silver Choice PPO' },
        { id: 21, payor: 'Humana', plan: 'Humana National POS' },
        { id: 22, payor: 'Humana', plan: 'Humana Preferred PPO' },
        { id: 23, payor: 'Humana', plan: 'Humana HMOx Gold' },
        { id: 24, payor: 'Humana', plan: 'Humana Basic EPO' },
        { id: 25, payor: 'Humana', plan: 'Humana ChoiceCare PPO' },
        { id: 26, payor: 'Kaiser Permanente', plan: 'Kaiser HMO Silver 2000' },
        { id: 27, payor: 'Kaiser Permanente', plan: 'Kaiser Gold Advantage HMO' },
        { id: 28, payor: 'Kaiser Permanente', plan: 'Kaiser Bronze Deductible HMO' },
        { id: 29, payor: 'Kaiser Permanente', plan: 'Kaiser Flex Choice PPO' },
        { id: 30, payor: 'Kaiser Permanente', plan: 'Kaiser Platinum Direct HMO' },
        { id: 31, payor: 'Medicare', plan: 'Original Medicare Part A & B' },
        { id: 32, payor: 'Medicare', plan: 'Medicare Advantage PPO' },
        { id: 33, payor: 'Medicare', plan: 'Medicare Advantage HMO' },
        { id: 34, payor: 'Medicare', plan: 'Medicare Advantage Special Needs Plan (SNP)' },
        { id: 35, payor: 'Medicare', plan: 'Medicare Advantage Dual Eligible' },
        { id: 36, payor: 'Medicaid', plan: 'State Medicaid Basic' },
        { id: 37, payor: 'Medicaid', plan: 'Medicaid Managed Care HMO' },
        { id: 38, payor: 'Medicaid', plan: "Children's Health Insurance Program (CHIP)" },
        { id: 39, payor: 'Medicaid', plan: 'Medicaid Expansion Silver' },
        { id: 40, payor: 'Medicaid', plan: 'Medicaid Dual Special Needs Plan' },
        { id: 41, payor: 'Oscar Health', plan: 'Oscar Classic Gold PPO' },
        { id: 42, payor: 'Oscar Health', plan: 'Oscar Simple Bronze HMO' },
        { id: 43, payor: 'Oscar Health', plan: 'Oscar Silver Saver EPO' },
        { id: 44, payor: 'Molina Healthcare', plan: 'Molina Marketplace Silver' },
        { id: 45, payor: 'Molina Healthcare', plan: 'Molina Medicaid Managed Care' },
        { id: 46, payor: 'Molina Healthcare', plan: 'Molina Medicare Advantage' },
        { id: 47, payor: 'Centene / Ambetter', plan: 'Ambetter Balanced Care Silver' },
        { id: 48, payor: 'Centene / Ambetter', plan: 'Ambetter Essential Care Bronze' },
        { id: 49, payor: 'Centene / Ambetter', plan: 'Ambetter Secure Care Gold' },
        { id: 50, payor: 'WellCare', plan: 'WellCare Medicare Advantage HMO' },
        { id: 51, payor: 'WellCare', plan: 'WellCare Value PPO' },
        { id: 52, payor: 'WellCare', plan: 'WellCare Medicaid Managed Care' },
    ];

    const [selectedInsurance, setSelectedInsurance] = useState<{ id: number; payor: string; plan: string } | null>(null);

    // Map view state
    const [showMapView, setShowMapView] = useState(false);
    const [selectedMapProvider, setSelectedMapProvider] = useState<MapProvider | null>(null);

    // Store original API providers and facilities for filtering
    const [originalApiProviders, setOriginalApiProviders] = useState<Provider[]>([]);
    const [originalFacilities, setOriginalFacilities] = useState<Facility[]>([]);

    // Store API providers when they change
    useEffect(() => {
        if (apiProviders.length > 0) {
            setOriginalApiProviders(apiProviders);
        }
        if (facilities.length > 0) {
            setOriginalFacilities(facilities);
        }
    }, [apiProviders, facilities]);

    useEffect(() => {
        setFilteredLegacyProviders(legacyProviders);

        // Restore original API providers and facilities
        if (originalApiProviders.length > 0) {
            apiProviders.splice(0, apiProviders.length, ...originalApiProviders);
        }

        if (originalFacilities.length > 0) {
            facilities.splice(0, facilities.length, ...originalFacilities);
        }
    }, [legacyProviders, originalApiProviders, originalFacilities]);

    // Use API providers if available, otherwise use legacy providers
    const displayProviders = apiProviders.length > 0 ? apiProviders : [];
    const shouldShowLegacyProviders = apiProviders.length === 0 && facilities.length === 0;

    // Show search modal when search term is entered (but not if category was just selected)
    useEffect(() => {
        if (searchTerm.trim() && !categorySelected) {
            setShowSearchModal(true);
        }
    }, [searchTerm, categorySelected]);

    // Handle back to list from map view
    const handleBackToList = () => {
        setShowMapView(false);
        setSelectedMapProvider(null);
    };

    // Prepare all providers for map view
    const getAllProvidersForMap = () => {
        const allProviders: MapProvider[] = [];

        // Add API providers
        displayProviders.forEach((p) => {
            const provider = p as any;
            // Support both new API format (latitude/longitude from find-nearby-care-v2) and legacy format
            const lat = provider.latitude || provider.provider_lat || provider.provider_full_address_obj?.lat;
            const lng = provider.longitude || provider.provider_lng || provider.provider_full_address_obj?.long;

            // Only use fallback coordinates if no valid coordinates found
            const finalLat = (typeof lat === 'number' && !isNaN(lat)) ? lat : (lat !== undefined && lat !== null ? parseFloat(lat) : null);
            const finalLng = (typeof lng === 'number' && !isNaN(lng)) ? lng : (lng !== undefined && lng !== null ? parseFloat(lng) : null);

            if (finalLat !== null && finalLng !== null && !isNaN(finalLat) && !isNaN(finalLng)) {
                allProviders.push({
                    ...provider,
                    latitude: finalLat,
                    longitude: finalLng,
                    provider_lat: finalLat,
                    provider_lng: finalLng,
                    provider_full_address_obj: provider.provider_full_address_obj || {
                        lat: finalLat,
                        long: finalLng,
                    },
                });
            }
        });

        // Add facilities
        facilities.forEach((facility) => {
            // Extract coordinates from facility
            const facilityAny = facility as any;
            const lat = facility.facility_full_address_obj?.lat || facilityAny.latitude;
            const lng = facility.facility_full_address_obj?.long || facilityAny.longitude;

            const finalLat = (typeof lat === 'number' && !isNaN(lat)) ? lat : (lat !== undefined && lat !== null ? parseFloat(lat) : null);
            const finalLng = (typeof lng === 'number' && !isNaN(lng)) ? lng : (lng !== undefined && lng !== null ? parseFloat(lng) : null);

            if (finalLat !== null && finalLng !== null && !isNaN(finalLat) && !isNaN(finalLng)) {
                allProviders.push({
                    provider_id: facility.facility_id,
                    provider_name: facility.facility_name,
                    provider_address: facility.facility_address,
                    provider_phone: facility.facility_phone || '',
                    provider_lat: finalLat,
                    provider_lng: finalLng,
                    latitude: finalLat,
                    longitude: finalLng,
                    facility_full_address_obj: facility.facility_full_address_obj || {
                        lat: finalLat,
                        long: finalLng,
                    },
                } as MapProvider);
            }
        });

        // Add legacy providers if needed
        if (shouldShowLegacyProviders) {
            filteredLegacyProviders.forEach((provider) => {
                // Use consistent random coordinates for legacy providers
                const lat = 39.3643 + Math.random() * 0.05;
                const lng = -74.4229 + Math.random() * 0.05;

                allProviders.push({
                    provider_id: provider.id,
                    provider_name: provider.name,
                    provider_specialty: provider.specialty,
                    provider_address: provider.address,
                    provider_phone: '',
                    provider_rating: provider.rating,
                    provider_review_count: provider.reviewCount,
                    provider_lat: lat,
                    provider_lng: lng,
                } as MapProvider);
            });
        }

        return allProviders;
    };

    // Render map view if showMapView is true
    if (showMapView) {
        // Get providers for map
        const providersForMap = selectedMapProvider ? [selectedMapProvider] : getAllProvidersForMap();

        // Convert to PlotMap component compatible format
        // PlotMap expects Provider[] | Facility[] from types/healthcare/types.ts
        const providersForMapConverted = providersForMap.map((provider) => {
            const reviewCount = provider.review_count || provider.provider_review_count;
            const reviewCountNum = typeof reviewCount === 'string' ? parseInt(reviewCount, 10) : reviewCount;

            const languages = provider.languages || provider.provider_languages;
            const languagesStr = Array.isArray(languages) ? languages.join(', ') : languages;

            // Extract coordinates from various sources (API response has latitude/longitude)
            const lat = provider.latitude || provider.provider_lat || provider.provider_full_address_obj?.lat;
            const lng = provider.longitude || provider.provider_lng || provider.provider_full_address_obj?.long;

            // Ensure provider_full_address_obj has coordinates if they exist
            const addressObj = provider.provider_full_address_obj || {};
            if (lat !== undefined && lng !== undefined) {
                addressObj.lat = typeof lat === 'number' ? lat : parseFloat(lat);
                addressObj.long = typeof lng === 'number' ? lng : parseFloat(lng);
            }

            return {
                provider_id: provider.provider_id !== undefined ? String(provider.provider_id) : undefined,
                provider_name: provider.name || provider.provider_name,
                provider_specialty: provider.provider_specialty,
                provider_address: provider.address || provider.provider_address,
                provider_phone: provider.phone || provider.provider_phone || '',
                provider_email: provider.email || provider.provider_email,
                provider_website: provider.website || provider.provider_website,
                provider_image: provider.image || provider.provider_image,
                provider_rating: provider.rating || provider.provider_rating,
                provider_distance: provider.provider_distance,
                provider_next_available: provider.provider_next_available,
                provider_accepts_insurance: provider.provider_accepts_insurance,
                provider_review_count: reviewCountNum,
                provider_degree: provider.provider_degree,
                provider_languages: languagesStr,
                provider_facilities: provider.provider_facilities,
                provider_full_address_obj: addressObj,
                // Include latitude/longitude directly for PlotMap compatibility
                latitude: typeof lat === 'number' ? lat : (lat !== undefined ? parseFloat(lat) : undefined),
                longitude: typeof lng === 'number' ? lng : (lng !== undefined ? parseFloat(lng) : undefined),
                is_bookmarked: provider.is_bookmarked,
            };
        });

        console.log('providersForMap', providersForMap);
        return (
            <div
                className={embedded ? '' : 'fixed inset-0 z-50 flex items-center justify-center'}
                style={
                    embedded
                        ? {
                              height: '100vh',
                              width: '100vw',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                          }
                        : {
                              height: '100vh',
                              width: '100vw',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: 'rgba(0, 0, 0, 0.6)',
                              backdropFilter: 'blur(2px)',
                              WebkitBackdropFilter: 'blur(2px)',
                          }
                }>
                <div
                    className="h-screen w-full max-w-full flex flex-col"
                    style={{
                        height: '100vh',
                        width: '100%',
                        maxWidth: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                    <div
                        style={{
                            flex: 1,
                            height: '100vh',
                            position: 'relative',
                        }}>
                        <PlotMap list={providersForMapConverted} selected_id={selectedMapProvider?.provider_id !== undefined ? String(selectedMapProvider.provider_id) : undefined} on_provider_select={(provider) => setSelectedMapProvider(provider as MapProvider)} />
                        {/* Show List button - floating at bottom */}
                        <button className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white py-3 px-6 rounded-full font-medium hover:shadow-lg transition-all duration-200 shadow-lg z-40 flex items-center space-x-2" onClick={handleBackToList}>
                            <ArrowLeft size={16} />
                            <span>Show List</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleBookAppointment = (provider: LegacyProvider) => {
        setSelectedProvider(provider);
        setIsBooking(true);

        // Simulate booking process
        setTimeout(() => {
            setIsBooking(false);
            alert(`Appointment booking initiated with ${provider.name}. You will receive a confirmation shortly.`);
        }, 2000);
    };

    const handleCategoryClick = async (category: SearchCategory, insurance?: { plan_name: string; payer_name: string } | null) => {
        setShowSearchModal(false);
        setCategorySelected(true);

        // Update search term with the selected category name
        const categoryName = category.category_name || category.care_category_name || searchTerm;
        setSearchTerm(categoryName);

        // Extract user information from userData
        const first_name = userData?.first_name || userData?.user?.first_name;
        const last_name = userData?.last_name || userData?.user?.last_name;

        // Convert insurance format if needed
        const insuranceOption = insurance
            ? {
                  plan_name: insurance.plan_name,
                  payer_name: insurance.payer_name,
              }
            : null;

        // Call API based on category type with new parameters
        await handleCategorySelection(category, userLocation, first_name, last_name, insuranceOption);
    };

    // Generate mock distance for demo
    const generateDistance = () => {
        const distances = ['0.5 mi', '1.2 mi', '2.1 mi', '3.4 mi', '4.8 mi', '5.3 mi'];
        return distances[Math.floor(Math.random() * distances.length)];
    };

    // Convert provider to new API format (only for doctors/providers, not facilities)
    const convertProviderToApiFormat = (provider: Provider): Provider => {
        return {
            ...provider,
            provider_id: provider.provider_id,
            provider_name: provider.name || provider.provider_name,
            provider_specialty: provider.description || provider.provider_specialty,
            provider_address: provider.address || provider.provider_address,
            provider_phone: provider.phone || provider.provider_phone,
            provider_email: provider.email || provider.provider_email,
            provider_website: provider.website || provider.provider_website,
            provider_image: provider.image || provider.provider_image,
            provider_rating: provider.rating !== null && provider.rating !== undefined ? provider.rating : provider.provider_rating,
            provider_review_count: provider.review_count !== undefined ? (typeof provider.review_count === 'string' ? parseInt(provider.review_count) || 0 : provider.review_count) : provider.provider_review_count,
            provider_full_address_obj:
                provider.provider_full_address_obj ||
                (provider.latitude && provider.longitude
                    ? {
                          lat: provider.latitude,
                          long: provider.longitude,
                      }
                    : undefined),
            languages: provider.languages || (provider.provider_languages ? (typeof provider.provider_languages === 'string' ? provider.provider_languages.split(', ') : []) : []),
            insurance_accepted: provider.insurance_accepted || [],
        } as Provider;
    };

    // Render API provider
    const renderApiProvider = (provider: Provider) => {
        // Support both new API format and legacy format
        const providerName = provider.name || provider.provider_name;
        const providerImage = provider.image || provider.provider_image;
        const providerRating = provider.rating !== undefined && provider.rating !== null ? provider.rating : provider.provider_rating;
        const reviewCount = provider.review_count !== undefined ? (typeof provider.review_count === 'string' ? parseInt(provider.review_count) || 0 : provider.review_count) : provider.provider_review_count;
        const providerAddress = provider.address || provider.provider_address;
        const providerPhone = provider.phone || provider.provider_phone;
        const providerSpecialty = provider.description || provider.provider_specialty;
        const providerId = provider.provider_id;

        // Don't render if provider name is missing
        if (!providerName) {
            return null;
        }

        const distance = generateDistance();

        return (
            <div key={providerId} className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {providerImage ? (
                            <img src={providerImage} alt={providerName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                                <User size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{providerName}</h3>
                        <p className="text-gray-600 text-sm mb-2">{providerSpecialty}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            {providerRating !== null && providerRating !== undefined && (
                                <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{providerRating}</span>
                                    {reviewCount !== undefined && reviewCount !== null && <span>({reviewCount} reviews)</span>}
                                </div>
                            )}
                            <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{distance}</span>
                            </div>
                        </div>
                        {providerAddress && <p className="text-sm text-gray-600 mb-1">{providerAddress}</p>}
                        {provider.languages && provider.languages.length > 0 && <p className="text-sm text-gray-600">Languages: {provider.languages.join(', ')}</p>}
                        {provider.insurance_accepted && provider.insurance_accepted.length > 0 && <p className="text-sm text-gray-500 mt-1">Accepts: {provider.insurance_accepted.join(', ')}</p>}
                    </div>
                </div>

                <div className="flex space-x-2 mt-4">
                    <button
                        className="flex-1 bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                        onClick={() => {
                            setSelectedBookingProvider(convertProviderToApiFormat(provider));
                            setShowBookingModal(true);
                        }}>
                        Book Now
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        onClick={() => {
                            console.log(provider);
                            setSelectedProviderForDetails(provider);
                            setShowProviderDetailsModal(true);
                        }}>
                        Details
                    </button>
                    <button
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => {
                            const lat = provider.latitude || provider.provider_full_address_obj?.lat;
                            const lng = provider.longitude || provider.provider_full_address_obj?.long;
                            setSelectedMapProvider({
                                ...provider,
                                latitude: typeof lat === 'number' ? lat : (lat !== undefined ? parseFloat(lat) : undefined),
                                longitude: typeof lng === 'number' ? lng : (lng !== undefined ? parseFloat(lng) : undefined),
                                provider_lat: typeof lat === 'number' ? lat : (lat !== undefined ? parseFloat(lat) : undefined),
                                provider_lng: typeof lng === 'number' ? lng : (lng !== undefined ? parseFloat(lng) : undefined),
                                provider_full_address_obj: provider.provider_full_address_obj || (lat !== undefined && lng !== undefined ? {
                                    lat: typeof lat === 'number' ? lat : parseFloat(lat),
                                    long: typeof lng === 'number' ? lng : parseFloat(lng),
                                } : undefined),
                            });
                            setShowMapView(true);
                        }}>
                        <MapPin size={16} className="mr-2" /> Map
                    </button>
                </div>
            </div>
        );
    };

    // Render API facility
    const renderFacility = (facility: Facility) => {
        // Don't render if facility name is missing
        if (!facility.facility_name) {
            return null;
        }

        const distance = generateDistance();

        return (
            <div key={facility.facility_id} className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {facility.facility_image ? (
                            <img src={facility.facility_image} alt={facility.facility_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600">
                                <User size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{facility.facility_name}</h3>
                        <p className="text-gray-600 text-sm mb-2">Type: {facility.facility_type}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{facility.facility_rating || 4.8}</span>
                                <span>({facility.facility_review_count || 0} reviews)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{distance}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-2 mt-4">
                    <button
                        className="flex-1 bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                        onClick={() => {
                            setSelectedBookingProvider(facility);
                            setShowBookingModal(true);
                        }}>
                        Book Appointment
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        onClick={() => {
                            setSelectedProviderForDetails(facility);
                            setShowProviderDetailsModal(true);
                        }}>
                        Details
                    </button>
                    <button
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => {
                            const facilityAny = facility as any;
                            const lat = facility.facility_full_address_obj?.lat || facilityAny.latitude;
                            const lng = facility.facility_full_address_obj?.long || facilityAny.longitude;
                            setSelectedMapProvider({
                                ...facility,
                                provider_id: facility.facility_id,
                                provider_name: facility.facility_name,
                                provider_address: facility.facility_address,
                                latitude: typeof lat === 'number' ? lat : (lat !== undefined ? parseFloat(lat) : undefined),
                                longitude: typeof lng === 'number' ? lng : (lng !== undefined ? parseFloat(lng) : undefined),
                                provider_lat: typeof lat === 'number' ? lat : (lat !== undefined ? parseFloat(lat) : undefined),
                                provider_lng: typeof lng === 'number' ? lng : (lng !== undefined ? parseFloat(lng) : undefined),
                                facility_full_address_obj: facility.facility_full_address_obj || (lat !== undefined && lng !== undefined ? {
                                    lat: typeof lat === 'number' ? lat : parseFloat(lat),
                                    long: typeof lng === 'number' ? lng : parseFloat(lng),
                                } : undefined),
                            } as MapProvider);
                            setShowMapView(true);
                        }}>
                        <MapPin size={16} className="mr-2" /> Map
                    </button>
                </div>
            </div>
        );
    };

    // Render legacy provider
    const renderLegacyProvider = (provider: LegacyProvider) => {
        // Don't render if provider name is missing
        if (!provider.name) {
            return null;
        }

        return (
            <div key={provider.id} className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {provider.avatar ? (
                            <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                                <User size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{provider.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{provider.specialty}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{provider.rating}</span>
                                <span>({provider.reviewCount} reviews)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{provider.distance}</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">Languages: {provider.languages.join(', ')}</p>
                    </div>
                </div>

                <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white py-2 px-4 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => handleBookAppointment(provider)} disabled={isBooking && selectedProvider?.id === provider.id}>
                        {isBooking && selectedProvider?.id === provider.id ? (
                            <>
                                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                Booking...
                            </>
                        ) : (
                            <>Book Appointment</>
                        )}
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        onClick={() => {
                            setSelectedProviderForDetails(provider);
                            setShowProviderDetailsModal(true);
                        }}>
                        Details
                    </button>
                    <button
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => {
                            // For legacy providers, we'll use mock coordinates
                            setSelectedMapProvider({
                                provider_id: provider.id,
                                provider_name: provider.name,
                                provider_specialty: provider.specialty,
                                provider_address: provider.address,
                                provider_phone: '',
                                provider_rating: provider.rating,
                                provider_review_count: provider.reviewCount,
                                provider_lat: 39.3643 + Math.random() * 0.05,
                                provider_lng: -74.4229 + Math.random() * 0.05,
                            });
                            setShowMapView(true);
                        }}>
                        <MapPin size={16} className="mr-2" /> Map
                    </button>
                </div>
            </div>
        );
    };

    // Main content of the component
    const searchContent = (
        <div className={'bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col'}>
            {/* Header - Fixed */}
            <div className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={onClose} aria-label="Back">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Find Healthcare Services</h1>
            </div>

            {/* Search Section - Fixed */}
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
                <p className="text-gray-600 mb-4">Search for doctors, hospitals, and healthcare services in your area</p>

                <div className="mb-4">
                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" value={searchTerm} onChange={(e) => { setCategorySelected(false); setSearchTerm(e.target.value); }} placeholder="Search specialty (e.g., Dermatology)" />
                </div>
                {/* 
                <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2" onClick={() => setShowEarliestAppointmentModal(true)}>
                    <Zap size={20} />
                    <span>Book Earliest Appointment</span>
                </button> */}

                <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 mt-4" onClick={() => setShowInsuranceSearchModal(true)}>
                    <Search size={20} />
                    <span>Filter Insurance Provider</span>
                </button>
            </div>

            {/* Results Section - Scrollable */}
            <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-6">
                    {isLoading ? (
                        <h2 className="text-lg font-semibold text-gray-900">Loading...</h2>
                    ) : error ? (
                        <h2 className="text-lg font-semibold text-red-600">Error: {error}</h2>
                    ) : displayProviders.length > 0 ? (
                        <h2 className="text-lg font-semibold text-gray-900">Providers ({displayProviders.filter((provider) => provider.name || provider.provider_name).length})</h2>
                    ) : facilities.length > 0 ? (
                        <h2 className="text-lg font-semibold text-gray-900">Facilities ({facilities.filter((facility) => facility.facility_name).length})</h2>
                    ) : shouldShowLegacyProviders ? (
                        <h2 className="text-lg font-semibold text-gray-900">Providers ({filteredLegacyProviders.filter((provider) => provider.name).length})</h2>
                    ) : (
                        <h2 className="text-lg font-semibold text-gray-900">No results found</h2>
                    )}
                </div>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading providers...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">{error}</div>
                    ) : displayProviders.length > 0 ? (
                        displayProviders.filter((provider) => provider.name || provider.provider_name).map(renderApiProvider)
                    ) : facilities.length > 0 ? (
                        facilities.filter((facility) => facility.facility_name).map(renderFacility)
                    ) : shouldShowLegacyProviders ? (
                        filteredLegacyProviders.filter((provider) => provider.name).map(renderLegacyProvider)
                    ) : (
                        <div className="text-center py-8 text-gray-500">No providers or facilities found</div>
                    )}
                </div>
            </div>

            {/* Search Results Modal */}
            {showSearchModal && <SearchModal searchTerm={searchTerm} setSearchTerm={setSearchTerm} onClose={() => setShowSearchModal(false)} onCategoryClick={handleCategoryClick} userLocation={userLocation} />}

            {/* Booking Modal */}
            {showBookingModal && (
                <BookAppointmentModal
                    provider={selectedBookingProvider}
                    onClose={() => setShowBookingModal(false)}
                    onRequestAppointment={async (provider, reason, availability) => {
                        setShowBookingModal(false);
                    }}
                />
            )}

            {/* Earliest Appointment Modal */}
            {showEarliestAppointmentModal && <EarliestAppointmentModal onClose={() => setShowEarliestAppointmentModal(false)} />}

            {/* Provider Details Modal */}
            {showProviderDetailsModal && (
                <ProviderDetailsModal
                    provider={selectedProviderForDetails}
                    onClose={() => {
                        setShowProviderDetailsModal(false);
                        setSelectedProviderForDetails(null);
                    }}
                />
            )}

            {/* Insurance Search Modal */}
            {showInsuranceSearchModal && (
                <InsuranceSearchModal
                    insurances={insuranceProviders}
                    onClose={() => setShowInsuranceSearchModal(false)}
                    onSelect={(insurance) => {
                        setSelectedInsurance(insurance);
                        setShowInsuranceSearchModal(false);
                        console.log('Selected insurance:', insurance);
                    }}
                />
            )}
        </div>
    );

    // Show Map button that appears above the bottom navigation
    const showMapButton = (
        <button
            className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-[#0077cc] to-[#0099dd] text-white py-3 px-6 rounded-full font-medium hover:shadow-lg transition-all duration-200 shadow-lg z-40 flex items-center space-x-2"
            onClick={() => {
                // Show all providers on map
                setSelectedMapProvider(null);
                setShowMapView(true);
            }}>
            <MapPin size={16} />
            <span>Show on Map</span>
        </button>
    );

    if (embedded) {
        return (
            <>
                {searchContent}
                {(apiProviders.filter((provider) => provider.name || provider.provider_name).length > 0 || facilities.filter((facility) => facility.facility_name).length > 0 || filteredLegacyProviders.filter((provider) => provider.name).length > 0) && showMapButton}
            </>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
            }}>
            {searchContent}
            {(apiProviders.filter((provider) => provider.name || provider.provider_name).length > 0 || facilities.filter((facility) => facility.facility_name).length > 0 || filteredLegacyProviders.filter((provider) => provider.name).length > 0) && showMapButton}
        </div>
    );
};

export default HealthcareProviderSearch;
