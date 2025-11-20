import React, { RefObject } from 'react';
import styles from '../unified-modal.module.scss';
import ChatHeader from '../../chat/chat-header/chat-header';
import ChatBody from '../../chat/chat-body/chat-body';
import ChatFooter from '../../chat/chat-footer/chat-footer';

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
    onSendMessage
}) => {
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
                <ChatHeader onClose={onClose} />
                <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                    {isChatActive ? (
                        <ChatBody
                            key={chatResetKey}
                            messages={isLearnFlow && messages.length > 2 ? messages.slice(2) : messages}
                            loading={loading}
                            is_reconnecting={isReconnecting}
                            messages_end_ref={messagesEndRef as any}
                            handle_button_click={(t: string) => onSendMessage(t)}
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
                                            
                                            if (!messages.length || isReconnecting) {
                                                onCreateWebsocketConnection();
                                            }
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
                    {/* Quick Replies */}
                    {showQuickReplies && currentQuickReplies.length > 0 && (
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
                                        onSendMessage(inputMessage);
                                        onSetInputMessage('');
                                        onSetShowQuickReplies(false);
                                        onSetShowLearnOverlay(false);
                                    }
                                }}
                                is_reconnecting={isReconnecting}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

