import React from 'react';
import HealthcareProviderSearch from '../../healthcare/provider-search/healthcare-provider-search';

interface HealthcareSearchStepProps {
    onBack: () => void;
}

export const HealthcareSearchStep: React.FC<HealthcareSearchStepProps> = ({ onBack }) => {
    return <HealthcareProviderSearch embedded={true} onClose={onBack} userData={null} />;
};

