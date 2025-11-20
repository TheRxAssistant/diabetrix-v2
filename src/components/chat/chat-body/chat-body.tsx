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

interface ChatBodyProps {
    messages: Message[];
    loading: boolean;
    is_reconnecting: boolean;
    messages_end_ref: RefObject<HTMLDivElement | null>;
    handle_button_click: (button_text: string) => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({ messages, loading, is_reconnecting, messages_end_ref, handle_button_click }) => {
    const [allow_chat, set_allow_chat] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            set_allow_chat(true);
        }, 2000);
    }, []);

    return (
        <div className="messages-container">
            {allow_chat ? (
                <>
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} handle_button_click={handle_button_click} />
                    ))}

                    {/* Loading indicator */}
                    {loading && <ChatLoader />}

                    {/* Reconnecting indicator */}
                    {is_reconnecting && <ChatLoader is_reconnecting={true} />}

                    <div ref={messages_end_ref} />
                </>
            ) : (
                <ConnectingAnimation />
            )}
        </div>
    );
};

export default ChatBody;
