import React from 'react';
import HealthcareProviderSearch from '../../healthcare/provider-search/healthcare-provider-search';

interface HealthcareSearchStepProps {
    onBack: () => void;
    userData?: any;
}

export const HealthcareSearchStep: React.FC<HealthcareSearchStepProps> = ({ onBack, userData }) => {
    return <HealthcareProviderSearch embedded={true} onClose={onBack} userData={userData} />;
};

