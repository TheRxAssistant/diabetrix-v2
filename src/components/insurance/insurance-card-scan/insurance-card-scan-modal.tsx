import React from 'react';

interface InsuranceCardScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (data: any) => void;
}

export const InsuranceCardScanModal: React.FC<InsuranceCardScanModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Scan Insurance Card</h2>
        <p className="text-gray-600 mb-4">
          This feature is coming soon. Please enter your insurance information manually.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InsuranceCardScanModal;

