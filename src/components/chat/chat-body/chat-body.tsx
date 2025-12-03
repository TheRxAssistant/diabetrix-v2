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
    intelligent_options_loading?: boolean;
    intelligent_option_type?: string;
    on_intelligent_option_select?: (option: string) => void;
    show_intelligent_options?: boolean;
    // Restart flow props
    on_restart_flow?: () => void;
    show_restart_button?: boolean;
}

const ChatBody: React.FC<ChatBodyProps> = ({ messages, loading, is_reconnecting, messages_end_ref, handle_button_click, chat_mode = 'input', mcq_options = [], mcq_loading = false, on_mcq_select, streaming_message = '', is_streaming = false, intelligent_options = [], intelligent_options_loading = false, intelligent_option_type = 'generic', on_intelligent_option_select, show_intelligent_options = false, on_restart_flow, show_restart_button = false }) => {
    const [allow_chat, set_allow_chat] = useState(false);

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

    // Auto-scroll when intelligent options appear or finish loading
    useEffect(() => {
        if (show_intelligent_options) {
            if (intelligent_options.length > 0 || intelligent_options_loading) {
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
    }, [intelligent_options.length, intelligent_options_loading, show_intelligent_options, messages_end_ref]);

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
                    {show_intelligent_options && (intelligent_options.length > 0 || intelligent_options_loading) && !(chat_mode === 'mcq' && mcq_options.length > 0) && (
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
                                ) : (
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

                    {/* Restart Flow Button - appears when input is disabled and there are more than 3 messages */}
                    {show_restart_button && on_restart_flow && (
                        <div className="restart-flow-container">
                            <button 
                                className="restart-flow-button"
                                onClick={on_restart_flow}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                    <path d="M3 3v5h5"/>
                                </svg>
                                Start Over
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
