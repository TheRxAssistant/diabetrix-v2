import React, { RefObject, useState, useEffect } from 'react';
import styles from '../unified-modal.module.scss';
import ChatHeader from '../../chat/chat-header/chat-header';
import ChatBody from '../../chat/chat-body/chat-body';
import ChatFooter from '../../chat/chat-footer/chat-footer';
import { AIService } from '../../../services/ai-service';

interface EmbeddedChatStepProps {
    chatResetKey: number;
    isChatActive: boolean;
    isLearnFlow: boolean;
    showLearnOverlay: boolean;
    showQuickReplies: boolean;
    currentQuickReplies: string[];
    inputMessage: string;
    messages: any[];
    loading: boolean;
    isReconnecting: boolean;
    messagesEndRef: RefObject<HTMLDivElement | null>;
    isGoodRx: boolean;
    onClose: () => void;
    onSetShowLearnOverlay: (show: boolean) => void;
    onSetIsChatActive: (active: boolean) => void;
    onSetIsLearnFlow: (isLearn: boolean) => void;
    onSetLastLearnTopic: (topic: string) => void;
    onSetShowQuickReplies: (show: boolean) => void;
    onSetCurrentQuickReplies: (replies: string[]) => void;
    onCreateWebsocketConnection: () => void;
    onSetChatResetKey: (key: number | ((prev: number) => number)) => void;
    onSetPendingMessages: (messages: string[]) => void;
    onSetUsedQuickReplies: (replies: string[] | ((prev: string[]) => string[])) => void;
    onSetInputMessage: (message: string) => void;
    onSendMessage: (message: string) => void;
    streaming_message?: string;
    is_streaming?: boolean;
}

export const EmbeddedChatStep: React.FC<EmbeddedChatStepProps> = ({
    chatResetKey,
    isChatActive,
    isLearnFlow,
    showLearnOverlay,
    showQuickReplies,
    currentQuickReplies,
    inputMessage,
    messages,
    loading,
    isReconnecting,
    messagesEndRef,
    isGoodRx,
    onClose,
    onSetShowLearnOverlay,
    onSetIsChatActive,
    onSetIsLearnFlow,
    onSetLastLearnTopic,
    onSetShowQuickReplies,
    onSetCurrentQuickReplies,
    onCreateWebsocketConnection,
    onSetChatResetKey,
    onSetPendingMessages,
    onSetUsedQuickReplies,
    onSetInputMessage,
    onSendMessage,
    streaming_message = '',
    is_streaming = false
}) => {
    // Chat mode state (input or mcq)
    const [chat_mode, set_chat_mode] = useState<'input' | 'mcq'>('input');
    const [mcq_options, set_mcq_options] = useState<{ text: string; type?: string }[]>([]);
    const [mcq_loading, set_mcq_loading] = useState(false);

    // Clear MCQ options when switching modes
    useEffect(() => {
        if (chat_mode === 'input') {
            set_mcq_options([]);
        }
    }, [chat_mode]);

    // Handle search in MCQ mode - called only on Enter or search icon click
    const handle_search = async (search_text: string) => {
        if (chat_mode === 'mcq' && search_text.trim()) {
            // Set loading state
            set_mcq_loading(true);

            try {
                // In MCQ mode, send both messages and search_text
                const currentMessages = isLearnFlow && messages.length > 2 ? messages.slice(2) : messages;
                const quickReplies = await AIService.generateQuickReplies(currentMessages, search_text.trim());
                set_mcq_options(quickReplies);
                // Clear search input after successful search
                onSetInputMessage('');
            } catch (error) {
                console.error('Error searching quick replies:', error);
                set_mcq_options([]);
                // Clear search input even on error
                onSetInputMessage('');
            } finally {
                set_mcq_loading(false);
            }
        } else if (chat_mode === 'mcq' && !search_text.trim()) {
            // Clear options if search text is empty
            set_mcq_options([]);
        }
    };

    // Handle MCQ option selection
    const handle_mcq_select = async (option: string) => {
        set_mcq_options([]); // Clear MCQ options after selection
        onSendMessage(option);
    };
    return (
        <div className={styles.healthcare_search_step}>
            <div
                className="embedded-chat"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    background: '#fff',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}>
                <ChatHeader 
                    onClose={onClose}
                    chat_mode={chat_mode}
                    on_mode_change={set_chat_mode}
                />
                <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                    {isChatActive ? (
                        <ChatBody
                            key={chatResetKey}
                            messages={isLearnFlow && messages.length > 2 ? messages.slice(2) : messages}
                            loading={loading}
                            is_reconnecting={isReconnecting}
                            messages_end_ref={messagesEndRef as any}
                            handle_button_click={(t: string) => onSendMessage(t)}
                            chat_mode={chat_mode}
                            mcq_options={mcq_options}
                            mcq_loading={mcq_loading}
                            on_mcq_select={handle_mcq_select}
                            streaming_message={streaming_message}
                            is_streaming={is_streaming}
                        />
                    ) : null}
                    {showLearnOverlay && (
                        <div className={`${styles.learn_overlay} ${isGoodRx ? styles.goodrx_theme : ''}`}>
                            <div className={styles.learn_overlay_header}>
                                <h3 className={styles.learn_overlay_title}>💡 Learn About Diabetrix®</h3>
                            </div>

                            <div className={styles.learn_questions_grid}>
                                {[
                                    {
                                        question: 'How to use Diabetrix',
                                        icon: '📝',
                                        color: 'blue',
                                    },
                                    {
                                        question: 'What is the dosage?',
                                        icon: '💊',
                                        color: 'purple',
                                    },
                                    {
                                        question: 'Side effects',
                                        icon: '⚠️',
                                        color: 'orange',
                                    },
                                    {
                                        question: 'When will it start working?',
                                        icon: '⏰',
                                        color: 'green',
                                    },
                                ].map((item, index) => (
                                    <button
                                        key={item.question}
                                        className={`${styles.learn_question_card} ${styles[`learn_card_${item.color}`]}`}
                                        onClick={() => {
                                            onSetShowLearnOverlay(false);
                                            onSetIsChatActive(true);
                                            onSetIsLearnFlow(true);
                                            onSetLastLearnTopic(item.question);
                                            onSetShowQuickReplies(false);
                                            onSetCurrentQuickReplies([]);
                                            
                                            onCreateWebsocketConnection();
                                            onSetChatResetKey((k) => k + 1);
                                            onSetPendingMessages(['yes', item.question]);
                                        }}
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                        }}>
                                        <div className={styles.learn_card_icon}>{item.icon}</div>
                                        <div className={styles.learn_card_content}>
                                            <h4 className={styles.learn_card_title}>{item.question}</h4>
                                        </div>
                                        <div className={styles.learn_card_arrow}>
                                            <i className="fas fa-arrow-right"></i>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div
                    style={{
                        borderTop: '1px solid #eee',
                        background: '#fff',
                        width: '100%',
                        boxSizing: 'border-box',
                    }}>
                    {/* Quick Replies - Only show in input mode */}
                    {chat_mode === 'input' && showQuickReplies && currentQuickReplies.length > 0 && (
                        <div className={styles.quick_replies_container}>
                            <div className={styles.quick_replies_grid}>
                                {currentQuickReplies.map((reply, index) => (
                                    <button
                                        key={reply}
                                        className={styles.quick_reply_button}
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                        }}
                                        onClick={() => {
                                            onSendMessage(reply);
                                            onSetUsedQuickReplies((prev) => [...prev, reply]);
                                            onSetShowQuickReplies(false);
                                        }}>
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!showLearnOverlay && (
                        <div
                            style={{
                                padding: '0 8px 8px 8px',
                                width: '100%',
                                boxSizing: 'border-box',
                            }}>
                            <ChatFooter
                                input_message={inputMessage}
                                set_input_message={onSetInputMessage}
                                send_message={() => {
                                    if (inputMessage.trim()) {
                                        if (chat_mode === 'mcq') {
                                            // In MCQ mode, trigger search on Enter/icon click
                                            // Input will be cleared in handle_search after search completes
                                            handle_search(inputMessage);
                                        } else {
                                            // In input mode, send message normally
                                            onSendMessage(inputMessage);
                                            onSetShowQuickReplies(false);
                                            onSetShowLearnOverlay(false);
                                            onSetInputMessage('');
                                        }
                                    }
                                }}
                                is_reconnecting={isReconnecting}
                                chat_mode={chat_mode}
                                on_search={handle_search}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

