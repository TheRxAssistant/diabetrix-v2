import React, { useState } from 'react';
import { FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import Button from './ui/Button';

interface SmsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (message: string) => Promise<void>;
    phoneNumber?: string;
    userName?: string;
}

export default function SmsModal({ isOpen, onClose, onSend, phoneNumber, userName }: SmsModalProps) {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const maxLength = 1600; // Standard SMS length limit

    const handleSend = async () => {
        if (!message.trim()) {
            setError('Message cannot be empty');
            return;
        }

        if (message.length > maxLength) {
            setError(`Message is too long (max ${maxLength} characters)`);
            return;
        }

        setSending(true);
        setError(null);

        try {
            await onSend(message);
            setMessage('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send SMS');
        } finally {
            setSending(false);
        }
    };

    const handleClose = () => {
        if (!sending) {
            setMessage('');
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Send SMS</h3>
                    <button
                        onClick={handleClose}
                        disabled={sending}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    {userName && (
                        <div className="mb-2 text-sm text-gray-600">
                            To: <span className="font-medium">{userName}</span>
                        </div>
                    )}
                    {phoneNumber && (
                        <div className="mb-4 text-sm text-gray-600">
                            Phone: <span className="font-medium">{phoneNumber}</span>
                        </div>
                    )}

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#0078D4]"
                        rows={6}
                        maxLength={maxLength}
                        disabled={sending}
                    />

                    <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${message.length > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
                            {message.length} / {maxLength} characters
                        </span>
                        {error && <span className="text-xs text-red-500">{error}</span>}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 p-4 border-t">
                    <Button onClick={handleClose} disabled={sending} className="bg-gray-200 text-gray-700">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        className="bg-[#0078D4] text-white"
                        icon={sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    >
                        {sending ? 'Sending...' : 'Send SMS'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
