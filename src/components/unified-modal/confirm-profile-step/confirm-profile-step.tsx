import React, { useEffect, useState } from 'react';

const avatar = '/assets/images/avatar.png';

interface ConfirmProfileStepProps {
    userData: any;
    onConfirm: (confirmedData: any) => void;
    onBack: () => void;
    isLoading: boolean;
    editMode?: boolean;
}

export const ConfirmProfileStep: React.FC<ConfirmProfileStepProps> = ({
    userData,
    onConfirm,
    onBack,
    isLoading,
    editMode = false
}) => {
    const [isEditing, setIsEditing] = useState(editMode);
    const [editedData, setEditedData] = useState(userData || {});
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);

    useEffect(() => {
        if (userData) {
            setEditedData(userData);
            if (Array.isArray(userData.address) && userData.address.length > 0) {
                setSelectedAddressIndex(0);
            }
        }
        if (editMode) {
            setIsEditing(true);
        }
    }, [userData, editMode]);

    const handleEditChange = (field: string, value: string) => {
        setEditedData((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddressChange = (field: string, value: string) => {
        setEditedData((prev: any) => {
            if (Array.isArray(prev.address)) {
                const updatedAddresses = [...prev.address];
                updatedAddresses[selectedAddressIndex] = {
                    ...updatedAddresses[selectedAddressIndex],
                    [field]: value,
                };
                return {
                    ...prev,
                    address: updatedAddresses,
                };
            } else {
                return {
                    ...prev,
                    address: { ...prev.address, [field]: value },
                };
            }
        });
    };

    const handleAddressSelect = (index: number) => {
        setSelectedAddressIndex(index);
    };

    const handleConfirm = async () => {
        // Validate required fields
        if (!editedData.first_name || !editedData.last_name || !editedData.date_of_birth) {
            return;
        }

        // Prepare the final data with the selected address
        const finalData = {
            ...editedData,
            address: Array.isArray(editedData.address) 
                ? editedData.address[selectedAddressIndex] || editedData.address[0] 
                : editedData.address,
        };

        onConfirm(finalData);
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return '';
        // If it's in YYYY-MM-DD format, convert to MM/DD/YYYY for display
        if (dateString.includes('-') && dateString.length === 10) {
            const [year, month, day] = dateString.split('-');
            return `${month}/${day}/${year}`;
        }
        return dateString;
    };

    const formatDateUS = (dateString: string) => {
        if (!dateString) return '';
        // If it's already in MM/DD/YYYY format, return as is
        if (dateString.includes('/') && dateString.length === 10) {
            return dateString;
        }
        // If it's in YYYY-MM-DD format (from date input), convert to MM/DD/YYYY
        if (dateString.includes('-') && dateString.length === 10) {
            const [year, month, day] = dateString.split('-');
            return `${month}/${day}/${year}`;
        }
        return dateString;
    };

    const handleDateChange = (value: string) => {
        // Remove any non-digit characters except slashes
        let cleaned = value.replace(/[^\d/]/g, '');

        // Auto-format as user types
        if (cleaned.length >= 2 && !cleaned.includes('/')) {
            cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length >= 5 && cleaned.split('/').length === 2) {
            cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
        }

        // Limit to MM/DD/YYYY format
        if (cleaned.length > 10) {
            cleaned = cleaned.slice(0, 10);
        }

        handleEditChange('date_of_birth', cleaned);
    };

    const getAddress = () => {
        if (Array.isArray(editedData.address)) {
            return editedData.address[selectedAddressIndex] || editedData.address[0] || {};
        }
        return editedData.address || {};
    };

    const getAddressesArray = () => {
        if (Array.isArray(editedData.address)) {
            return editedData.address;
        }
        return editedData.address ? [editedData.address] : [];
    };

    const addresses = getAddressesArray();
    const currentAddress = getAddress();

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex flex-col items-center px-6 pt-4 pb-3">
                <button 
                    className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors" 
                    onClick={onBack}
                >
                    <i className="fas fa-arrow-left text-lg"></i>
                </button>
                <div className="w-12 h-12 rounded-full overflow-hidden mb-3">
                    <img src={avatar} alt="Alex" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-1">
                    {isEditing ? 'Enter Your Information' : 'Confirm Your Profile'}
                </h3>
                <p className="text-sm text-gray-600 text-center">
                    {isEditing ? 'Please enter your information to continue' : 'Please review your information and confirm it\'s correct'}
                </p>
            </div>

            {/* Form */}
            <div className="flex-1 px-6 overflow-y-auto">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4 mb-4">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editedData.first_name || ''}
                                        onChange={(e) => handleEditChange('first_name', e.target.value)}
                                        placeholder="Enter your first name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editedData.last_name || ''}
                                        onChange={(e) => handleEditChange('last_name', e.target.value)}
                                        placeholder="Enter your last name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editedData.email || ''}
                                    onChange={(e) => handleEditChange('email', e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                
                                {/* Address Dropdown - Only show if multiple addresses available */}
                                {addresses.length > 1 && (
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Select from verified addresses:</label>
                                        <select
                                            value={selectedAddressIndex}
                                            onChange={(e) => handleAddressSelect(parseInt(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        >
                                            {addresses.map((addr: any, idx: number) => (
                                                <option key={idx} value={idx}>
                                                    {addr.street}, {addr.city}, {addr.state} {addr.zip_code}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                                    <input
                                        type="text"
                                        value={currentAddress.street || ''}
                                        onChange={(e) => handleAddressChange('street', e.target.value)}
                                        placeholder="Street Address"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                    <div className="grid grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            value={currentAddress.city || ''}
                                            onChange={(e) => handleAddressChange('city', e.target.value)}
                                            placeholder="City"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                        <input
                                            type="text"
                                            value={currentAddress.state || ''}
                                            onChange={(e) => handleAddressChange('state', e.target.value)}
                                            placeholder="State"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                        <input
                                            type="text"
                                            value={currentAddress.zip_code || ''}
                                            onChange={(e) => handleAddressChange('zip_code', e.target.value)}
                                            placeholder="ZIP"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formatDateUS(editedData.date_of_birth || '')}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    placeholder="MM/DD/YYYY"
                                    maxLength={10}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {editedData.ssn && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SSN</label>
                                    <input
                                        type="text"
                                        value={editedData.ssn || ''}
                                        readOnly
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                        placeholder="****"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">SSN cannot be edited for security reasons</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Name:</span>
                                <span className="text-sm text-gray-900">
                                    {editedData.first_name} {editedData.last_name}
                                </span>
                            </div>

                            {editedData.email && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Email:</span>
                                    <span className="text-sm text-gray-900">{editedData.email}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Phone:</span>
                                <span className="text-sm text-gray-900">{editedData.phone_number}</span>
                            </div>

                            {(currentAddress.street || addresses.length > 0) && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium text-gray-700">Address:</span>
                                        <div className="text-sm text-gray-900 text-right flex-1 ml-4">
                                            {addresses.length > 1 ? (
                                                <select
                                                    value={selectedAddressIndex}
                                                    onChange={(e) => handleAddressSelect(parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                >
                                                    {addresses.map((addr: any, idx: number) => (
                                                        <option key={idx} value={idx}>
                                                            {addr.street}, {addr.city}, {addr.state} {addr.zip_code}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div>
                                                    {currentAddress.street}
                                                    <br />
                                                    {currentAddress.city}, {currentAddress.state} {currentAddress.zip_code}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editedData.date_of_birth && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Date of Birth:</span>
                                    <span className="text-sm text-gray-900">{formatDateDisplay(editedData.date_of_birth)}</span>
                                </div>
                            )}

                            {editedData.ssn && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">SSN:</span>
                                    <span className="text-sm text-gray-900">{editedData.ssn}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-center mb-4">
                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <i className={`fas fa-${isEditing ? 'eye' : 'edit'} text-sm`}></i>
                        <span>{isEditing ? 'View Mode' : 'Edit Information'}</span>
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 pb-6">
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading || !editedData.first_name || !editedData.last_name || !editedData.date_of_birth}
                    className="w-full bg-gradient-to-br from-[#0077cc] to-[#0099dd] hover:shadow-lg hover:-translate-y-0.5 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Confirming...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-check-circle"></i>
                            <span>Confirm & Continue</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

