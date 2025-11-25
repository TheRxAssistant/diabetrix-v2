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
}

const ChatBody: React.FC<ChatBodyProps> = ({ messages, loading, is_reconnecting, messages_end_ref, handle_button_click, chat_mode = 'input', mcq_options = [], mcq_loading = false, on_mcq_select, streaming_message = '', is_streaming = false }) => {
    const [allow_chat, set_allow_chat] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            set_allow_chat(true);
        }, 2000);
    }, []);

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

                    <div ref={messages_end_ref} />
                </>
            ) : (
                <ConnectingAnimation />
            )}
        </div>
    );
};

export default ChatBody;
