import React from 'react';
import styles from '../unified-modal.module.scss';
import PharmacyMultiSelect from '../../pharmacy/pharmacy-multi-select/PharmacyMultiSelect';
import type { Pharmacy } from '../../../data/pharmacies/pharmacies';

interface PharmacySelectStepProps {
    pharmacies: Pharmacy[];
    selectedPharmacies: string[];
    drugName: string;
    onPharmaciesChange: (selected: string[]) => void;
    onSubmit: () => void;
    onBack: () => void;
}

export const PharmacySelectStep: React.FC<PharmacySelectStepProps> = ({
    pharmacies,
    selectedPharmacies,
    drugName,
    onPharmaciesChange,
    onSubmit,
    onBack
}) => {
    return (
        <div className={styles.verification_step}>
            {/* Header Section */}
            <div className={styles.pharmacy_header_section}>
                <div className={styles.pharmacy_header_container}>
                    <div className={styles.pharmacy_header_content}>
                        <button className={styles.back_button} onClick={onBack} aria-label="Go back">
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div className={styles.pharmacy_header_text}>
                            <h2>Select Pharmacies</h2>
                            <p>Pick one or more pharmacies. We'll check {drugName} availability.</p>
                        </div>
                    </div>
                    <div className={styles.pharmacy_header_actions}>
                        <div className={styles.selection_counter}>{selectedPharmacies.length} selected</div>
                    </div>
                </div>
            </div>

            {/* Pharmacy Selection Content */}
            <div className={styles.pharmacy_content}>
                <PharmacyMultiSelect 
                    pharmacies={pharmacies} 
                    selected={selectedPharmacies} 
                    onChange={onPharmaciesChange} 
                />
            </div>

            <div className={styles.actions}>
                <button 
                    className={`${styles.button} ${styles.primary_button}`} 
                    disabled={selectedPharmacies.length === 0} 
                    onClick={onSubmit}>
                    Check availability ({selectedPharmacies.length})
                </button>
            </div>
        </div>
    );
};

