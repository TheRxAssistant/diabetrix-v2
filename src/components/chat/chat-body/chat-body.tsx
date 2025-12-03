import React, { RefObject, useEffect, useState } from 'react';
import ChatMessage from './chat-message';
import ChatLoader from './chat-loader';
import './chat-body.scss';
import ConnectingAnimation from '../../shared/connecting-animation/ConnectingAnimation';

interface Message {
    id: number;
    content: string;
    role: 'user' | 'assistant';
    buttons?: string[];
    timestamp: Date;
}

interface QuickReply {
    text: string;
    type?: string;
}

interface InputField {
    field_type: 'zipcode' | 'personal_name' | 'phone' | 'email' | 'dob' | 'address' | 'member_id' | 'group_number';
    label: string;
    placeholder: string;
}

interface ChatBodyProps {
    messages: Message[];
    loading: boolean;
    is_reconnecting: boolean;
    messages_end_ref: RefObject<HTMLDivElement | null>;
    handle_button_click: (button_text: string) => void;
    chat_mode?: 'input' | 'mcq';
    mcq_options?: QuickReply[];
    mcq_loading?: boolean;
    on_mcq_select?: (option: string) => void;
    streaming_message?: string;
    is_streaming?: boolean;
    // Intelligent options props
    intelligent_options?: QuickReply[];
    intelligent_input_fields?: any[];
    intelligent_options_loading?: boolean;
    intelligent_option_type?: string;
    on_intelligent_option_select?: (option: string) => void;
    on_intelligent_input_submit?: (values: Record<string, string>) => void;
    show_intelligent_options?: boolean;
    show_start_again?: boolean;
    on_start_again?: () => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({ messages, loading, is_reconnecting, messages_end_ref, handle_button_click, chat_mode = 'input', mcq_options = [], mcq_loading = false, on_mcq_select, streaming_message = '', is_streaming = false, intelligent_options = [], intelligent_input_fields = [], intelligent_options_loading = false, intelligent_option_type = 'generic', on_intelligent_option_select, on_intelligent_input_submit, show_intelligent_options = false, show_start_again = false, on_start_again }) => {
    const [allow_chat, set_allow_chat] = useState(false);
    const [input_field_values, set_input_field_values] = useState<Record<string, string>>({});

    // Reset input field values when input_fields change - use index as key for uniqueness
    useEffect(() => {
        if (intelligent_input_fields.length > 0) {
            const initial_values: Record<string, string> = {};
            intelligent_input_fields.forEach((field, index) => {
                // Use index-based key to ensure uniqueness even if field_types are same
                initial_values[`field_${index}`] = '';
            });
            set_input_field_values(initial_values);
        }
    }, [intelligent_input_fields]);

    const handle_input_change = (field_key: string, value: string) => {
        set_input_field_values(prev => ({
            ...prev,
            [field_key]: value
        }));
    };

    const handle_input_submit = () => {
        // Check if all fields have values
        const all_filled = intelligent_input_fields.every((_, index) => input_field_values[`field_${index}`]?.trim());
        if (all_filled && on_intelligent_input_submit) {
            // Build result object with field_type as key and user-entered value
            const result: Record<string, string> = {};
            intelligent_input_fields.forEach((field, index) => {
                result[field.label] = input_field_values[`field_${index}`];
            });
            on_intelligent_input_submit(result);
            // Reset values after submit
            const reset_values: Record<string, string> = {};
            intelligent_input_fields.forEach((_, index) => {
                reset_values[`field_${index}`] = '';
            });
            set_input_field_values(reset_values);
        }
    };

    const is_submit_disabled = !intelligent_input_fields.every((_, index) => input_field_values[`field_${index}`]?.trim());

    useEffect(() => {
        setTimeout(() => {
            set_allow_chat(true);
        }, 2000);
    }, []);

    // Auto-scroll when streaming message updates
    useEffect(() => {
        if (is_streaming && streaming_message) {
            // Scroll to bottom when streaming message updates
            if (messages_end_ref.current) {
                messages_end_ref.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest',
                });
            }
        }
    }, [streaming_message, is_streaming, messages_end_ref]);

    // Auto-scroll when MCQ options appear or finish loading
    useEffect(() => {
        if (chat_mode === 'mcq') {
            if (mcq_options.length > 0) {
                // Scroll when options are loaded
                setTimeout(() => {
                    if (messages_end_ref.current) {
                        messages_end_ref.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'end',
                            inline: 'nearest',
                        });
                    }
                }, 200);
            } else if (mcq_loading) {
                // Scroll when loading starts
                setTimeout(() => {
                    if (messages_end_ref.current) {
                        messages_end_ref.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'end',
                            inline: 'nearest',
                        });
                    }
                }, 100);
            }
        }
    }, [mcq_options.length, mcq_loading, chat_mode]);

    // Auto-scroll when intelligent options or input fields appear or finish loading
    useEffect(() => {
        if (show_intelligent_options) {
            if (intelligent_options.length > 0 || intelligent_input_fields.length > 0 || intelligent_options_loading) {
                setTimeout(() => {
                    if (messages_end_ref.current) {
                        messages_end_ref.current.scrollIntoView({
                            behavior: 'smooth',
                            block: 'end',
                            inline: 'nearest',
                        });
                    }
                }, 200);
            }
        }
    }, [intelligent_options.length, intelligent_input_fields.length, intelligent_options_loading, show_intelligent_options, messages_end_ref]);

    return (
        <div className="messages-container">
            {allow_chat ? (
                <>
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} handle_button_click={handle_button_click} />
                    ))}

                    {/* Streaming message */}
                    {is_streaming && streaming_message && (
                        <div className="message system-message">
                            <div className="message-content">
                                <div className="md-content">
                                    {streaming_message}
                                    <span className="inline-block ml-0.5 animate-blink text-[#007aff] font-bold">|</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading indicator */}
                    {loading && !is_streaming && <ChatLoader />}

                    {/* Reconnecting indicator */}
                    {is_reconnecting && <ChatLoader is_reconnecting={true} />}

                    {/* MCQ Options Display - Right Side */}
                    {chat_mode === 'mcq' && (mcq_options.length > 0 || mcq_loading) && (
                        <div className="mcq-options-container mcq-right-side">
                            <div className="mcq-options-content">
                                {mcq_loading ? (
                                    <div className="mcq-loading">
                                        <div className="mcq-loading-indicator">
                                            <span className="mcq-loading-dot"></span>
                                            <span className="mcq-loading-dot"></span>
                                            <span className="mcq-loading-dot"></span>
                                        </div>
                                        <span className="mcq-loading-text">Searching...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mcq-title">Select an option:</div>
                                        <div className="mcq-options-list">
                                            {mcq_options.map((option, index) => (
                                                <button key={`mcq-option-${index}`} onClick={() => on_mcq_select && on_mcq_select(option.text)} className="mcq-option-button">
                                                    {option.text}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Intelligent Options Display - Right Side (when input is disabled or MCQ mode) */}
                    {show_intelligent_options && (intelligent_options.length > 0 || intelligent_input_fields.length > 0 || intelligent_options_loading) && !(chat_mode === 'mcq' && mcq_options.length > 0) && (
                        <div className="mcq-options-container mcq-right-side">
                            <div className="mcq-options-content">
                                {intelligent_options_loading ? (
                                    <div className="mcq-loading">
                                        <div className="mcq-loading-indicator">
                                            <span className="mcq-loading-dot"></span>
                                            <span className="mcq-loading-dot"></span>
                                            <span className="mcq-loading-dot"></span>
                                        </div>
                                        <span className="mcq-loading-text">Loading options...</span>
                                    </div>
                                ) : intelligent_input_fields.length > 0 ? (
                                    /* Input Fields for user-input types (zipcode, phone, email, etc.) */
                                    <div className="intelligent-input-fields">
                                        {intelligent_input_fields.map((field, index) => (
                                            <div key={`input-field-${index}`} className="intelligent-input-group">
                                                <label className="intelligent-input-label">{field.label}</label>
                                                <input
                                                    type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
                                                    className="intelligent-input-field"
                                                    placeholder={field.placeholder}
                                                    value={input_field_values[`field_${index}`] || ''}
                                                    onChange={(e) => handle_input_change(`field_${index}`, e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !is_submit_disabled) {
                                                            handle_input_submit();
                                                        }
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <button 
                                            className="intelligent-input-submit"
                                            onClick={handle_input_submit}
                                            disabled={is_submit_disabled}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                ) : (
                                    /* Clickable Buttons for selection types (consent, doctor_type, etc.) */
                                    <>
                                        <div className={`mcq-options-list ${intelligent_option_type === 'consent' ? 'mcq-options-row' : ''}`}>
                                            {intelligent_options.map((option, index) => (
                                                <button 
                                                    key={`intelligent-option-${index}`} 
                                                    onClick={() => on_intelligent_option_select && on_intelligent_option_select(option.text)} 
                                                    className="mcq-option-button"
                                                >
                                                    {option.text}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Start Again Button - shows when input is disabled */}
                    {show_start_again && !is_streaming && !loading && !intelligent_options_loading && (
                        <div className="start-again-container">
                            <button 
                                className="start-again-button"
                                onClick={on_start_again}
                            >
                                Start Again
                            </button>
                        </div>
                    )}

                    <div ref={messages_end_ref} />
                </>
            ) : (
                <ConnectingAnimation />
            )}
        </div>
    );
};

export default ChatBody;
