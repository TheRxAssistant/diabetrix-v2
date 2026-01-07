import { useState, useEffect } from 'react';
import { MODAL_CONSTANTS } from '../utils/constants';

export const usePharmacyCheck = (checkingPharmacies: string[], phoneNumber: string, drugName: string) => {
    const [currentCheckIndex, setCurrentCheckIndex] = useState<number>(0);
    const [currentSubStep, setCurrentSubStep] = useState<number>(0);
    const [notifiedMap, setNotifiedMap] = useState<boolean[]>([]);
    const [pharmacyCheckDone, setPharmacyCheckDone] = useState<boolean>(false);

    // Reset when checkingPharmacies changes
    useEffect(() => {
        if (checkingPharmacies.length > 0) {
            setCurrentCheckIndex(0);
            setCurrentSubStep(0);
            setNotifiedMap(new Array(checkingPharmacies.length).fill(false));
            setPharmacyCheckDone(false);
        }
    }, [checkingPharmacies]);

    // Pharmacy checking animation effect
    useEffect(() => {
        if (checkingPharmacies.length === 0 || pharmacyCheckDone) return;

        const timer = setTimeout(() => {
            if (currentSubStep < 2) {
                setCurrentSubStep(currentSubStep + 1);
            } else {
                // Move to next pharmacy
                if (currentCheckIndex < checkingPharmacies.length - 1) {
                    setCurrentCheckIndex(currentCheckIndex + 1);
                    setCurrentSubStep(0);
                } else {
                    setPharmacyCheckDone(true);
                }
            }
        }, MODAL_CONSTANTS.PHARMACY_CHECK_DELAY);

        return () => clearTimeout(timer);
    }, [checkingPharmacies, currentCheckIndex, currentSubStep, pharmacyCheckDone]);

    return {
        currentCheckIndex,
        currentSubStep,
        pharmacyCheckDone,
    };
};
