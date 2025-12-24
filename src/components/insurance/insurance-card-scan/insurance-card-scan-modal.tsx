import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, CreditCard, Loader, Upload, X } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { upload_insurance_card, syncUser } from '../../unified-modal/services/auth-service';

interface InsuranceCardScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete?: (data: any) => void;
  existing_insurance?: InsuranceData | null;
}

interface InsuranceData {
  provider: string;
  member_id: string;
  policy_number: string;
  group_number: string;
}

export const InsuranceCardScanModal: React.FC<InsuranceCardScanModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  existing_insurance,
}) => {
  const authStore = useAuthStore.getState();
  const user = authStore.user;

  const [front_image, set_front_image] = useState<File | null>(null);
  const [back_image, set_back_image] = useState<File | null>(null);
  const [front_preview, set_front_preview] = useState<string>('');
  const [back_preview, set_back_preview] = useState<string>('');
  const [is_processing, set_is_processing] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [extracted_data, set_extracted_data] = useState<InsuranceData | null>(null);
  const [manual_entry, set_manual_entry] = useState(false);
  const [form_data, set_form_data] = useState<InsuranceData>({
    provider: '',
    member_id: '',
    policy_number: '',
    group_number: '',
  });

  const front_input_ref = useRef<HTMLInputElement>(null);
  const back_input_ref = useRef<HTMLInputElement>(null);

  // Pre-populate form with existing insurance data when modal opens
  useEffect(() => {
    if (isOpen && existing_insurance) {
      set_form_data(existing_insurance);
      set_manual_entry(true); // Skip upload step and go directly to form
    }
  }, [isOpen, existing_insurance]);

  const handle_front_file_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const is_image = file.type.startsWith('image/');
    const is_pdf = file.type === 'application/pdf';
    const is_valid_size = file.size <= 10 * 1024 * 1024; // 10MB limit

    if (!is_image && !is_pdf) {
      console.error(`${file.name} is not a supported file type. Please upload images or PDF files.`);
      return;
    }

    if (!is_valid_size) {
      console.error(`${file.name} is too large. Please upload files smaller than 10MB.`);
      return;
    }

    set_front_image(file);
    if (file.type.startsWith('image/')) {
      set_front_preview(URL.createObjectURL(file));
    }
  };

  const handle_back_file_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const is_image = file.type.startsWith('image/');
    const is_pdf = file.type === 'application/pdf';
    const is_valid_size = file.size <= 10 * 1024 * 1024; // 10MB limit

    if (!is_image && !is_pdf) {
      console.error(`${file.name} is not a supported file type. Please upload images or PDF files.`);
      return;
    }

    if (!is_valid_size) {
      console.error(`${file.name} is too large. Please upload files smaller than 10MB.`);
      return;
    }

    set_back_image(file);
    if (file.type.startsWith('image/')) {
      set_back_preview(URL.createObjectURL(file));
    }
  };

  const process_images = async (front: File, back?: File) => {
    set_is_processing(true);
    try {
      const extracted = await upload_insurance_card(front, back);
      if (extracted) {
        set_extracted_data(extracted);
        set_form_data(extracted);
        console.log('Insurance card information extracted successfully!');
      } else {
        console.error('Failed to extract information from insurance card');
      }
    } catch (error) {
      console.error('Error processing insurance card:', error);
    } finally {
      set_is_processing(false);
    }
  };

  const handle_input_change = (field: keyof InsuranceData, value: string) => {
    set_form_data((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handle_manual_entry = () => {
    set_manual_entry(true);
    set_form_data({
      provider: '',
      member_id: '',
      policy_number: '',
      group_number: '',
    });
  };

  const handle_save = async () => {
    try {
      if (!form_data.provider || !form_data.member_id) {
        console.error('Please provide at least insurance provider and member ID');
        return;
      }

      if (!user || !user.userData) {
        console.error('User not authenticated');
        return;
      }

      set_is_loading(true);
      const userData = user.userData;

      // Prepare payload with insurance details and address
      const payload = {
        ...userData,
        insurance_details: {
          provider: form_data.provider,
          member_id: form_data.member_id,
          policy_number: form_data.policy_number,
          group_number: form_data.group_number,
        },
      };

      // sync_user now handles both backend sync AND store update
      const phoneNumber = user.phoneNumber || userData.phone_number || '';
      const result = await syncUser(payload, phoneNumber);

      if (result.statusCode === 200) {
        console.log('Insurance information Updated!');

        // Call success callback if provided
        if (onScanComplete) {
          onScanComplete(form_data);
        }

        handle_close();
      } else {
        console.error(result.error || 'Failed to save insurance information');
      }
    } catch (error: any) {
      console.error(error.message || 'Failed to save insurance information');
    } finally {
      set_is_loading(false);
    }
  };

  const handle_close = () => {
    // Clean up preview URLs
    if (front_preview) URL.revokeObjectURL(front_preview);
    if (back_preview) URL.revokeObjectURL(back_preview);

    // Reset state
    set_front_image(null);
    set_back_image(null);
    set_front_preview('');
    set_back_preview('');
    set_is_processing(false);
    set_extracted_data(null);
    set_manual_entry(false);
    set_form_data({
      provider: '',
      member_id: '',
      policy_number: '',
      group_number: '',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handle_close} />
      <div className="relative bg-white w-full h-full max-w-none rounded-none shadow-xl overflow-y-auto lg:overflow-hidden lg:h-auto lg:max-w-3xl lg:rounded-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Upload size={18} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{existing_insurance ? 'Update Insurance Information' : 'Add Insurance Information'}</h3>
          </div>
          <button onClick={handle_close} className="p-2 hover:bg-gray-100 rounded">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!manual_entry && (
            <div className="space-y-6">
              {/* Front and Back Upload Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front Card Upload */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-900">Front of Card</span>
                    {front_image && <CheckCircle size={16} className="text-green-600" />}
                  </div>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${front_image ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                    onClick={() => front_input_ref.current?.click()}>
                    {front_preview ? (
                      <img src={front_preview} alt="Front of insurance card" className="max-h-32 mx-auto rounded" />
                    ) : (
                      <div>
                        <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-xs text-gray-600">Click to upload front</p>
                      </div>
                    )}
                    <input ref={front_input_ref} type="file" accept="image/*,.pdf" onChange={handle_front_file_change} className="hidden" />
                  </div>
                </div>

                {/* Back Card Upload */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-900">Back of Card</span>
                    <span className="text-xs text-gray-500">(optional)</span>
                    {back_image && <CheckCircle size={16} className="text-green-600" />}
                  </div>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${back_image ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'}`}
                    onClick={() => back_input_ref.current?.click()}>
                    {back_preview ? (
                      <img src={back_preview} alt="Back of insurance card" className="max-h-32 mx-auto rounded" />
                    ) : (
                      <div>
                        <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-xs text-gray-600">Click to upload back</p>
                      </div>
                    )}
                    <input ref={back_input_ref} type="file" accept="image/*,.pdf" onChange={handle_back_file_change} className="hidden" />
                  </div>
                </div>
              </div>

              {/* Processing Status */}
              {front_image && (
                <div className="text-center space-y-3">
                  {is_processing ? (
                    <div className="inline-flex items-center space-x-2 text-blue-600">
                      <Loader size={16} className="animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  ) : extracted_data ? (
                    <div className="inline-flex items-center space-x-2 text-green-600">
                      <CheckCircle size={16} />
                      <span className="text-sm">Information extracted successfully!</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => process_images(front_image!, back_image ?? undefined)}
                        disabled={is_processing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                        {is_processing ? 'Processing...' : 'Continue'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Manual Entry Option */}
              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                <button onClick={handle_manual_entry} className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  Enter Information Manually
                </button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {is_processing && (
            <div className="text-center py-8">
              <Loader size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Insurance Card</h3>
              <p className="text-gray-600">Extracting information from your insurance card...</p>
            </div>
          )}

          {/* Upload Option for Existing Insurance */}
          {existing_insurance && manual_entry && (
            <div className="space-y-4">
              <div className="text-center">
                <button
                  onClick={() => {
                    set_manual_entry(false);
                    set_form_data({
                      provider: '',
                      member_id: '',
                      policy_number: '',
                      group_number: '',
                    });
                    set_front_image(null);
                    set_back_image(null);
                    set_front_preview('');
                    set_back_preview('');
                    set_extracted_data(null);
                  }}
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                  Upload Insurance Card Instead
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or update manually below</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          {(manual_entry || extracted_data) && (
            <div className="space-y-4">
              {extracted_data && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">Information retrieved successfully! Please review and edit if needed.</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider *</label>
                  <input
                    type="text"
                    value={form_data.provider}
                    onChange={(e) => handle_input_change('provider', e.target.value)}
                    placeholder="e.g., Blue Cross Blue Shield"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member ID *</label>
                  <input
                    type="text"
                    value={form_data.member_id}
                    onChange={(e) => handle_input_change('member_id', e.target.value)}
                    placeholder="e.g., BC123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                  <input
                    type="text"
                    value={form_data.policy_number}
                    onChange={(e) => handle_input_change('policy_number', e.target.value)}
                    placeholder="e.g., POL987654321"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Number</label>
                  <input
                    type="text"
                    value={form_data.group_number}
                    onChange={(e) => handle_input_change('group_number', e.target.value)}
                    placeholder="e.g., GRP456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t flex justify-end space-x-3">
          <button onClick={handle_close} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
            Cancel
          </button>
          {(manual_entry || extracted_data) && (
            <button
              onClick={handle_save}
              disabled={is_loading || !form_data.provider || !form_data.member_id}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {is_loading ? 'Saving...' : 'Save Insurance Information'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsuranceCardScanModal;
