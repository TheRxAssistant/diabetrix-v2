import { useState, useCallback } from 'react';

export const usePharmacyState = () => {
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
  const [selectedPharmacies, setSelectedPharmacies] = useState<string[]>([]);
  const [pharmacyCheckDone, setPharmacyCheckDone] = useState<boolean>(false);
  const [checkingPharmacies, setCheckingPharmacies] = useState<string[]>([]);
  const [currentCheckIndex, setCurrentCheckIndex] = useState<number>(0);
  const [currentSubStep, setCurrentSubStep] = useState<number>(0);
  const [notifiedMap, setNotifiedMap] = useState<boolean[]>([]);

  const resetPharmacySelection = useCallback(() => {
    setSelectedPharmacy('');
    setSelectedPharmacies([]);
    setPharmacyCheckDone(false);
    setCheckingPharmacies([]);
    setCurrentCheckIndex(0);
    setCurrentSubStep(0);
    setNotifiedMap([]);
  }, []);

  const startPharmacyCheck = useCallback((pharmacies: string[]) => {
    setCheckingPharmacies(pharmacies);
    setCurrentCheckIndex(0);
    setCurrentSubStep(0);
    setNotifiedMap(new Array(pharmacies.length).fill(false));
    setPharmacyCheckDone(false);
  }, []);

  return {
    selectedPharmacy,
    setSelectedPharmacy,
    selectedPharmacies,
    setSelectedPharmacies,
    pharmacyCheckDone,
    setPharmacyCheckDone,
    checkingPharmacies,
    setCheckingPharmacies,
    currentCheckIndex,
    setCurrentCheckIndex,
    currentSubStep,
    setCurrentSubStep,
    notifiedMap,
    setNotifiedMap,
    resetPharmacySelection,
    startPharmacyCheck,
  };
};

