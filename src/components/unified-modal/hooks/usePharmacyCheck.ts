import { useState, useEffect } from 'react';
import { sendMedicationAvailability } from '../../../services/smsService';
import { MODAL_CONSTANTS } from '../utils/constants';

export const usePharmacyCheck = (
  checkingPharmacies: string[],
  phoneNumber: string,
  drugName: string
) => {
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

  // SMS notification effect
  useEffect(() => {
    if (pharmacyCheckDone && checkingPharmacies.length > 0 && phoneNumber) {
      const hasNotifiedAll = notifiedMap.every((val) => val);
      if (hasNotifiedAll) return;

      const timer = setTimeout(() => {
        try {
          // Send SMS for each pharmacy being checked
          checkingPharmacies.forEach((pharmacyName) => {
            sendMedicationAvailability(drugName, pharmacyName, 'checking');
          });
          console.log('Medication availability SMS sent successfully');
          setNotifiedMap(new Array(checkingPharmacies.length).fill(true));
        } catch (error) {
          console.error('Failed to send medication availability SMS:', error);
        }
      }, MODAL_CONSTANTS.PHARMACY_COMPLETE_DELAY);

      return () => clearTimeout(timer);
    }
  }, [pharmacyCheckDone, checkingPharmacies, phoneNumber, drugName, notifiedMap]);

  return {
    currentCheckIndex,
    currentSubStep,
    pharmacyCheckDone,
  };
};

