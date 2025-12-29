import React, { useState, useEffect } from 'react';
import { X, Search, ArrowLeft } from 'lucide-react';

interface InsuranceProvider {
    id: number;
    payor: string;
    plan: string;
}

interface InsuranceSearchModalProps {
    onClose: () => void;
    onSelect: (insurance: InsuranceProvider) => void;
    insurances: InsuranceProvider[];
}

const InsuranceSearchModal: React.FC<InsuranceSearchModalProps> = ({ onClose, onSelect, insurances }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredInsurances, setFilteredInsurances] = useState<InsuranceProvider[]>([]);
    const [groupedInsurances, setGroupedInsurances] = useState<Record<string, InsuranceProvider[]>>({});

    // Filter and group insurances by payor when search term changes
    useEffect(() => {
        if (!searchTerm) {
            // Group all insurances by payor when no search term
            const grouped = insurances.reduce((acc, insurance) => {
                if (!acc[insurance.payor]) {
                    acc[insurance.payor] = [];
                }
                acc[insurance.payor].push(insurance);
                return acc;
            }, {} as Record<string, InsuranceProvider[]>);
            setGroupedInsurances(grouped);
            setFilteredInsurances(insurances);
        } else {
            // Filter insurances by search term (payor or plan)
            const filtered = insurances.filter(
                insurance => 
                    insurance.payor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    insurance.plan.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            // Group filtered insurances by payor
            const grouped = filtered.reduce((acc, insurance) => {
                if (!acc[insurance.payor]) {
                    acc[insurance.payor] = [];
                }
                acc[insurance.payor].push(insurance);
                return acc;
            }, {} as Record<string, InsuranceProvider[]>);
            
            setGroupedInsurances(grouped);
            setFilteredInsurances(filtered);
        }
    }, [searchTerm, insurances]);


    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
            style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)',
            }}>
            <div 
                className="bg-white w-full max-w-md rounded-lg shadow-lg overflow-hidden max-h-[450px] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center">
                        <button 
                            onClick={onClose}
                            className="mr-2 p-1 rounded-full hover:bg-gray-100"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-lg font-semibold">Filter Insurance Provider</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search insurance provider..."
                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Insurance List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredInsurances.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No insurance providers found
                        </div>
                    ) : (
                        Object.entries(groupedInsurances).map(([payor, insurances]) => (
                            <div key={payor} className="mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 px-3 py-1">{payor}</h3>
                                <div className="space-y-1">
                                    {(insurances as InsuranceProvider[]).map((insurance) => (
                                        <button
                                            key={insurance.id}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
                                            onClick={() => {
                                                onSelect(insurance);
                                                onClose();
                                            }}
                                        >
                                            <span className="text-sm font-medium">{insurance.plan}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InsuranceSearchModal;
