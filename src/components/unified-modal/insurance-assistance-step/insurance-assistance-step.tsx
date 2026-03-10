import React from 'react';
import InsuranceAssistance from '../../insurance/insurance-assistance/insurance-assistance';

interface InsuranceAssistanceStepProps {
    requestInsuranceOnInit: boolean;
    onBack: () => void;
    onChatOpen?: () => void;
}

export const InsuranceAssistanceStep: React.FC<InsuranceAssistanceStepProps> = ({
    requestInsuranceOnInit,
    onBack,
    onChatOpen,
}) => {
    return (
        <InsuranceAssistance
            embedded={true}
            onClose={onBack}
            requestOnInit={requestInsuranceOnInit}
            onChatOpen={onChatOpen}
        />
    );
};

