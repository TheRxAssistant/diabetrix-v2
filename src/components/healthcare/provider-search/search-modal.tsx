import { Camera, CreditCard, Hospital, Microscope, Search, Stethoscope, Syringe, User2, X } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { SearchCategory, useProviderSearch } from '../../../services/provider-search/useProviderSearch';
import { InsuranceCardScanModal } from '../../insurance/insurance-card-scan/insurance-card-scan-modal';
import { postAPI, CAPABILITIES_API_URLS } from '../../../services/api';

interface InsuranceProvider {
    id: number;
    payor: string;
    plan: string;
    logo?: string;
}

interface InsuranceCardData {
    effective_date: string;
    group_number: string;
    images: Record<string, string>;
    insured_name: string;
    member_id: string;
    plan_name: string;
    policy_number: string;
    provider: string;
}


interface InsuranceOption {
    plan_name: string;
    payer_name: string;
}

interface SearchModalProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onClose: () => void;
    onCategoryClick: (category: SearchCategory, insurance?: InsuranceOption | null) => void;
    userLocation: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ searchTerm, setSearchTerm, onClose, onCategoryClick, userLocation }) => {
    // Step management
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [selectedSpecialty, setSelectedSpecialty] = useState<SearchCategory | null>(null);
    const [selectedInsurance, setSelectedInsurance] = useState<InsuranceProvider | null>(null);
    const [showInsuranceCardModal, setShowInsuranceCardModal] = useState(false);
    const [scannedInsuranceData, setScannedInsuranceData] = useState<InsuranceCardData | null>(null);

    // API-based category search
    const [filteredCategories, setFilteredCategories] = useState<SearchCategory[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Insurance providers with detailed payor and plan information
    const insuranceProviders: InsuranceProvider[] = [
        { id: 1, payor: "Blue Cross Blue Shield", plan: "BCBS PPO Gold 1000" },
        { id: 2, payor: "Blue Cross Blue Shield", plan: "BCBS HMO Silver Advantage" },
        { id: 3, payor: "Blue Cross Blue Shield", plan: "BCBS Bronze Essential" },
        { id: 4, payor: "Blue Cross Blue Shield", plan: "Blue Choice PPO Plus" },
        { id: 5, payor: "Blue Cross Blue Shield", plan: "Blue Advantage HMO Direct" },
        { id: 6, payor: "Aetna", plan: "Aetna Open Choice PPO" },
        { id: 7, payor: "Aetna", plan: "Aetna Select HMO" },
        { id: 8, payor: "Aetna", plan: "Aetna Whole Health EPO" },
        { id: 9, payor: "Aetna", plan: "Aetna Gold Preferred PPO" },
        { id: 10, payor: "Aetna", plan: "Aetna Silver Value HMO" },
        { id: 11, payor: "UnitedHealthcare", plan: "UHC Choice Plus PPO" },
        { id: 12, payor: "UnitedHealthcare", plan: "UHC Navigate HMO" },
        { id: 13, payor: "UnitedHealthcare", plan: "UHC Compass EPO" },
        { id: 14, payor: "UnitedHealthcare", plan: "UHC Charter Balanced PPO" },
        { id: 15, payor: "UnitedHealthcare", plan: "UHC Silver Advantage HMO" },
        { id: 16, payor: "Cigna", plan: "Cigna LocalPlus HMO" },
        { id: 17, payor: "Cigna", plan: "Cigna Open Access Plus PPO" },
        { id: 18, payor: "Cigna", plan: "Cigna Connect Network" },
        { id: 19, payor: "Cigna", plan: "Cigna SureFit HMO" },
        { id: 20, payor: "Cigna", plan: "Cigna Silver Choice PPO" },
        { id: 21, payor: "Humana", plan: "Humana National POS" },
        { id: 22, payor: "Humana", plan: "Humana Preferred PPO" },
        { id: 23, payor: "Humana", plan: "Humana HMOx Gold" },
        { id: 24, payor: "Humana", plan: "Humana Basic EPO" },
        { id: 25, payor: "Humana", plan: "Humana ChoiceCare PPO" },
        { id: 26, payor: "Kaiser Permanente", plan: "Kaiser HMO Silver 2000" },
        { id: 27, payor: "Kaiser Permanente", plan: "Kaiser Gold Advantage HMO" },
        { id: 28, payor: "Kaiser Permanente", plan: "Kaiser Bronze Deductible HMO" },
        { id: 29, payor: "Kaiser Permanente", plan: "Kaiser Flex Choice PPO" },
        { id: 30, payor: "Kaiser Permanente", plan: "Kaiser Platinum Direct HMO" },
        { id: 31, payor: "Medicare", plan: "Original Medicare Part A & B" },
        { id: 32, payor: "Medicare", plan: "Medicare Advantage PPO" },
        { id: 33, payor: "Medicare", plan: "Medicare Advantage HMO" },
        { id: 34, payor: "Medicare", plan: "Medicare Advantage Special Needs Plan (SNP)" },
        { id: 35, payor: "Medicare", plan: "Medicare Advantage Dual Eligible" },
        { id: 36, payor: "Medicaid", plan: "State Medicaid Basic" },
        { id: 37, payor: "Medicaid", plan: "Medicaid Managed Care HMO" },
        { id: 38, payor: "Medicaid", plan: "Children's Health Insurance Program (CHIP)" },
        { id: 39, payor: "Medicaid", plan: "Medicaid Expansion Silver" },
        { id: 40, payor: "Medicaid", plan: "Medicaid Dual Special Needs Plan" },
        { id: 41, payor: "Oscar Health", plan: "Oscar Classic Gold PPO" },
        { id: 42, payor: "Oscar Health", plan: "Oscar Simple Bronze HMO" },
        { id: 43, payor: "Oscar Health", plan: "Oscar Silver Saver EPO" },
        { id: 44, payor: "Molina Healthcare", plan: "Molina Marketplace Silver" },
        { id: 45, payor: "Molina Healthcare", plan: "Molina Medicaid Managed Care" },
        { id: 46, payor: "Molina Healthcare", plan: "Molina Medicare Advantage" },
        { id: 47, payor: "Centene / Ambetter", plan: "Ambetter Balanced Care Silver" },
        { id: 48, payor: "Centene / Ambetter", plan: "Ambetter Essential Care Bronze" },
        { id: 49, payor: "Centene / Ambetter", plan: "Ambetter Secure Care Gold" },
        { id: 50, payor: "WellCare", plan: "WellCare Medicare Advantage HMO" },
        { id: 51, payor: "WellCare", plan: "WellCare Value PPO" },
        { id: 52, payor: "WellCare", plan: "WellCare Medicaid Managed Care" }
    ];

    // Fetch categories from API
    const fetchCategories = useCallback(async (query: string, payer_name?: string) => {
        if (!query.trim()) {
            setFilteredCategories([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const payload: { query: string; payer_name?: string } = { query: query.trim() };
            if (payer_name || selectedInsurance?.payor) {
                payload.payer_name = payer_name || selectedInsurance?.payor || '';
            }

            const result = await postAPI(CAPABILITIES_API_URLS.GET_CARE_CATEGORY_V2, payload);
            
            if (result.statusCode === 200) {
                const categories_data = result.data || [];
                // Convert API response to SearchCategory format
                const categories: SearchCategory[] = categories_data.map((item: any) => ({
                    care_category_id: item.care_category_id,
                    care_category_name: item.care_category_name,
                    care_category_type: item.care_category_type || 'specialty',
                    // Keep old format for backward compatibility
                    reference_third_party_id: item.care_category_id,
                    category_name: item.care_category_name,
                    category_type: item.care_category_type || 'specialty',
                }));
                setFilteredCategories(categories);
            } else {
                setFilteredCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setFilteredCategories([]);
        } finally {
            setIsSearching(false);
        }
    }, [selectedInsurance]);

    // Debounced search for categories
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, fetchCategories]);

    // Re-fetch categories when insurance changes
    useEffect(() => {
        if (selectedInsurance && searchTerm.trim()) {
            fetchCategories(searchTerm, selectedInsurance.payor);
        }
    }, [selectedInsurance, fetchCategories]);

    // Handle specialty selection and move to step 2
    const handleSpecialtySelect = (specialty: SearchCategory) => {
        setSelectedSpecialty(specialty);
        setCurrentStep(2);
    };

    // Handle insurance selection
    const handleInsuranceSelect = (insurance: InsuranceProvider) => {
        setSelectedInsurance(insurance);
    };

    // Handle insurance card scan
    const handleInsuranceCardScanned = (cardData: InsuranceCardData) => {
        setScannedInsuranceData(cardData);
        setShowInsuranceCardModal(false);
        // Auto-select insurance provider based on scanned data
        const matchingProvider = insuranceProviders.find((p) => p.payor.toLowerCase().includes(cardData.provider.toLowerCase()) || cardData.provider.toLowerCase().includes(p.payor.toLowerCase()));
        if (matchingProvider) {
            setSelectedInsurance(matchingProvider);
        } else {
            // Create a new provider entry from scanned data
            setSelectedInsurance({
                id: parseInt(cardData.provider) || 999,
                payor: cardData.provider,
                plan: cardData.plan_name || 'Unknown',
            });
        }
    };

    // Handle final search
    const handleSearch = () => {
        if (selectedSpecialty) {
            // Convert insurance to the format expected by the API
            let insuranceOption: InsuranceOption | null = null;
            if (selectedInsurance) {
                insuranceOption = {
                    plan_name: selectedInsurance.plan,
                    payer_name: selectedInsurance.payor,
                };
            } else if (scannedInsuranceData) {
                insuranceOption = {
                    plan_name: scannedInsuranceData.plan_name || 'Unknown',
                    payer_name: scannedInsuranceData.provider,
                };
            }

            // Pass the selected specialty and insurance information
            onCategoryClick(selectedSpecialty, insuranceOption);

            onClose();
        }
    };

    // Go back to previous step
    const handleGoBack = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        }
    };

    // Render Step 1: Specialty Selection
    const renderStep1 = () => (
        <div className="relative h-full">
            <div className="top-0 left-0 right-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-xl z-10">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Search Healthcare Services</h3>
                    <p className="text-sm text-gray-500 mt-1">Step 1 of 2</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={onClose} aria-label="Close search">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            <div className="top-20 bottom-0 left-0 right-0 p-4 overflow-y-auto">
                <div className="flex items-center border border-gray-300 rounded-lg p-3 mb-6 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <Search size={18} className="text-gray-400 mr-3 flex-shrink-0" />
                    <input
                        type="text"
                        className="w-full outline-none border-none text-gray-900 placeholder-gray-500 bg-transparent"
                        style={{
                            padding: 0,
                            margin: 0,
                            outline: 'none',
                            boxShadow: 'none',
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search specialty, condition, or provider"
                        autoFocus
                    />
                </div>

                {isSearching && (
                    <div className="text-center py-8">
                        <div className="flex justify-center space-x-1 mb-4">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <p className="text-gray-600">Finding the best matches...</p>
                    </div>
                )}

                {!isSearching && (
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-4">Suggestions</p>
                        <div className="space-y-2">
                            {filteredCategories.map((category, index) => {
                                // Determine icon based on category type (check both formats)
                                const categoryType = category.care_category_type || category.category_type || 'specialty';
                                const categoryName = category.care_category_name || category.category_name || '';
                                
                                const iconNode =
                                    categoryType === 'condition' ? (
                                        <Stethoscope size={18} className="text-blue-600" />
                                    ) : categoryType === 'provider' ? (
                                        <User2 size={18} className="text-green-600" />
                                    ) : categoryType === 'facility' ? (
                                        <Hospital size={18} className="text-red-600" />
                                    ) : categoryType === 'procedure' ? (
                                        <Syringe size={18} className="text-purple-600" />
                                    ) : categoryType === 'specialty' ? (
                                        <Microscope size={18} className="text-indigo-600" />
                                    ) : (
                                        <Search size={18} className="text-gray-600" />
                                    );

                                return (
                                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group" onClick={() => handleSpecialtySelect(category)}>
                                        <div className="flex-shrink-0 mr-3">{iconNode}</div>
                                        <div className="flex-1">
                                            <span className="block font-medium text-gray-900 group-hover:text-blue-700">{categoryName}</span>
                                            <span className="text-sm text-gray-500 capitalize">{categoryType}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredCategories.length === 0 && searchTerm.trim() && (
                                <div className="text-center py-8">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Search size={24} className="text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="text-gray-900 font-medium mb-1">No results found</p>
                                    <p className="text-gray-500 text-sm">Try a different search term</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // State for insurance provider search
    const [insuranceSearchTerm, setInsuranceSearchTerm] = useState('');
    const [filteredInsuranceProviders, setFilteredInsuranceProviders] = useState<InsuranceProvider[]>([]);
    const [isInsuranceInputFocused, setIsInsuranceInputFocused] = useState(false);

    // Filter insurance providers based on search term
    useEffect(() => {
        if (!insuranceSearchTerm.trim() && !isInsuranceInputFocused) {
            setFilteredInsuranceProviders([]);
            return;
        }
        
        // If input is focused but empty, show all providers
        if (!insuranceSearchTerm.trim() && isInsuranceInputFocused) {
            setFilteredInsuranceProviders(insuranceProviders);
            return;
        }

        const filtered = insuranceProviders.filter(provider => 
            provider.payor.toLowerCase().includes(insuranceSearchTerm.toLowerCase()) || 
            provider.plan.toLowerCase().includes(insuranceSearchTerm.toLowerCase())
        );
        setFilteredInsuranceProviders(filtered);
    }, [insuranceSearchTerm, isInsuranceInputFocused]);

    // Render Step 2: Insurance Selection
    const renderStep2 = () => (
        <div className="relative h-full">
            <div className="top-0 left-0 right-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-xl z-10">
                <div className="flex items-center space-x-4">
                    {/* <button onClick={handleGoBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Go back">
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button> */}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Insurance Information</h3>
                        <p className="text-sm text-gray-500 mt-1">Step 2 of 2</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={onClose} aria-label="Close search">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>

            <div className="top-20 bottom-0 left-0 right-0 p-4 overflow-y-auto">
                <div className="space-y-6">
                    {/* Insurance Card Scan Option */}
                    <div className="space-y-3">
                        <h4 className="text-lg font-medium text-gray-900">Upload Insurance Card</h4>
                        <p className="text-sm text-gray-600">Scan your insurance card for automatic verification</p>

                        <button
                            onClick={() => setShowInsuranceCardModal(true)}
                            className="w-full flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group">
                            <Camera size={24} className="text-gray-400 group-hover:text-blue-500" />
                            <span className="text-gray-600 group-hover:text-blue-700 font-medium">Scan Insurance Card</span>
                        </button>

                        {scannedInsuranceData && (
                            <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CreditCard size={16} className="text-green-600" />
                                    <span className="text-sm font-medium text-green-800">Card Scanned Successfully</span>
                                </div>
                                <div className="text-sm text-green-700">
                                    <p>
                                        <strong>Provider:</strong> {scannedInsuranceData.provider}
                                    </p>
                                    <p>
                                        <strong>Member:</strong> {scannedInsuranceData.insured_name}
                                    </p>
                                    <p>
                                        <strong>Plan:</strong> {scannedInsuranceData.plan_name}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <div className="px-4 text-sm text-gray-500">or</div>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Searchable Insurance Selection */}
                    <div className="space-y-3">
                        <h4 className="text-lg font-medium text-gray-900">Select Insurance Provider</h4>
                        <p className="text-sm text-gray-600">Search for your insurance provider</p>

                        <div className="relative">
                            <div className="flex items-center border border-gray-300 rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                <Search size={18} className="text-gray-400 mr-3 flex-shrink-0" />
                                <input
                                    type="text"
                                    className="w-full outline-none border-none text-gray-900 placeholder-gray-500 bg-transparent"
                                    style={{
                                        padding: 0,
                                        margin: 0,
                                        outline: 'none',
                                        boxShadow: 'none',
                                    }}
                                    value={insuranceSearchTerm}
                                    onChange={(e) => setInsuranceSearchTerm(e.target.value)}
                                    onFocus={() => setIsInsuranceInputFocused(true)}
                                    onBlur={() => {
                                        // Delay hiding the dropdown to allow for item selection
                                        setTimeout(() => setIsInsuranceInputFocused(false), 200);
                                    }}
                                    placeholder="Type to search for insurance"
                                />
                                {insuranceSearchTerm && (
                                    <button 
                                        onClick={() => setInsuranceSearchTerm('')}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Search Results */}
                            {(insuranceSearchTerm || isInsuranceInputFocused) && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredInsuranceProviders.length > 0 ? (
                                        filteredInsuranceProviders.map((provider) => (
                                            <div
                                                key={provider.id}
                                                className={`p-3 cursor-pointer hover:bg-blue-50 ${selectedInsurance?.id === provider.id ? 'bg-blue-50' : ''}`}
                                                onClick={() => {
                                                    handleInsuranceSelect(provider);
                                                    setInsuranceSearchTerm(`${provider.payor} (${provider.plan})`);
                                                    setIsInsuranceInputFocused(false);
                                                }}
                                                onMouseDown={(e) => e.preventDefault()} // Prevent blur event from firing before click
                                            >
                                                <div className="flex items-center">
                                                    <CreditCard size={16} className="text-blue-600 mr-2" />
                                                    <span className="truncate">{provider.payor} <span className="text-gray-500">({provider.plan})</span></span>
                                                </div>
                                            </div>
                                        ))
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Selected Insurance Display */}
                        {selectedInsurance && !insuranceSearchTerm && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <CreditCard size={16} className="text-blue-600 mr-2" />
                                    <span className="font-medium truncate">{selectedInsurance.payor} <span className="text-gray-500">({selectedInsurance.plan})</span></span>
                                </div>
                                <button 
                                    onClick={() => setSelectedInsurance(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Continue Button */}
                    <div className="pt-4">
                        <button
                            onClick={handleSearch}
                            disabled={!selectedSpecialty || (!selectedInsurance && !scannedInsuranceData)}
                            className={`w-full py-3 px-4 text-white font-medium rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                                !selectedSpecialty || (!selectedInsurance && !scannedInsuranceData)
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-gradient-to-br from-[#0077cc] to-[#0099dd] hover:shadow-lg'
                            }`}>
                            Find Healthcare Providers
                        </button>

                        {!selectedInsurance && !scannedInsuranceData && <p className="text-xs text-gray-500 text-center mt-2">Please select an insurance provider or scan your card to continue</p>}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div 
                className="fixed inset-0 flex items-center justify-center z-50 p-4" 
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                }}
                onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" style={{ height: 'calc(100vh - 300px)', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                    {currentStep === 1 ? renderStep1() : renderStep2()}
                </div>
            </div>

            {/* Insurance Card Scan Modal */}
            {showInsuranceCardModal && <InsuranceCardScanModal isOpen={showInsuranceCardModal} onClose={() => setShowInsuranceCardModal(false)} onScanComplete={handleInsuranceCardScanned} />}
        </>
    );
};

export default SearchModal;
