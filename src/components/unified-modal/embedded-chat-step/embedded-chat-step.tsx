import React, { RefObject, useState, useEffect, useRef, useCallback } from 'react';
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
    is_streaming = false,
}) => {
    // State to control input visibility
    const [show_input, set_show_input] = useState<boolean>(true);
    // Chat mode state (input or mcq)
    const [chat_mode, set_chat_mode] = useState<'input' | 'mcq'>('input');
    const [mcq_options, set_mcq_options] = useState<{ text: string; type?: string }[]>([]);
    const [mcq_loading, set_mcq_loading] = useState(false);

    // Ref to track if we've generated quick replies for disabled input state
    const quickRepliesGeneratedForDisabledInput = useRef<boolean>(false);

    // Generate quick replies when input is disabled
    useEffect(() => {
        if (!show_input && chat_mode === 'input') {
            // Reset the flag when input becomes disabled
            if (!quickRepliesGeneratedForDisabledInput.current) {
                quickRepliesGeneratedForDisabledInput.current = true;

                const generateQuickReplies = async () => {
                    try {
                        console.log('🔄 Generating quick replies because input is disabled', {
                            isChatActive,
                            messagesLength: messages.length,
                            currentQuickRepliesLength: currentQuickReplies.length,
                        });

                        // Use messages if available, otherwise use empty array (API will handle it)
                        const currentMessages = isLearnFlow && messages.length > 2 ? messages.slice(2) : messages;
                        const quickReplies = await AIService.generateQuickReplies(currentMessages.length > 0 ? currentMessages : []);
                        const replyTexts = quickReplies.map((reply) => reply.text);
                        console.log('✨ Generated quick replies:', replyTexts);

                        // Always update when input is disabled
                        if (replyTexts.length > 0) {
                            onSetCurrentQuickReplies(replyTexts);
                            onSetShowQuickReplies(true);
                            console.log('✅ Quick replies set and shown');
                        } else {
                            // Fallback if no replies generated
                            console.log('⚠️ No quick replies generated, using fallback');
                            const fallbackReplies = ['Tell me more', 'What else?', 'Any concerns?', 'How can I help?'];
                            onSetCurrentQuickReplies(fallbackReplies);
                            onSetShowQuickReplies(true);
                        }
                    } catch (error) {
                        console.error('❌ Error generating quick replies when input is disabled:', error);
                        // Set fallback replies on error
                        const fallbackReplies = ['Tell me more', 'What else?', 'Any concerns?', 'How can I help?'];
                        onSetCurrentQuickReplies(fallbackReplies);
                        onSetShowQuickReplies(true);
                    }
                };

                // Generate immediately without delay
                generateQuickReplies();
            }
        } else if (show_input) {
            // Reset flag when input becomes visible again
            quickRepliesGeneratedForDisabledInput.current = false;
        }
    }, [show_input, chat_mode, isChatActive, messages.length, isLearnFlow, onSetCurrentQuickReplies, onSetShowQuickReplies]);

    // Clear MCQ options when switching modes
    useEffect(() => {
        if (chat_mode === 'input') {
            set_mcq_options([]);
        }
    }, [chat_mode]);

    useEffect(() => {
        console.log('is_streaming', is_streaming);
    }, [is_streaming]);

    // Hide quick replies when streaming starts
    useEffect(() => {
        if (is_streaming && showQuickReplies) {
            onSetShowQuickReplies(false);
        }
    }, [is_streaming, showQuickReplies, onSetShowQuickReplies]);

    // Auto-scroll to bottom when quick replies are generated and shown
    useEffect(() => {
        if (showQuickReplies && currentQuickReplies.length > 0) {
            // Small delay to ensure quick replies are rendered before scrolling
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end',
                        inline: 'nearest',
                    });
                }
            }, 100);
        }
    }, [showQuickReplies, currentQuickReplies.length, messagesEndRef]);

    // Ref to store the debounce timeout for auto-search in MCQ mode
    const searchDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle search in MCQ mode - called on Enter, search icon click, or after debounce
    const handle_search = useCallback(async (search_text: string) => {
        if (chat_mode === 'mcq' && search_text.trim()) {
            set_mcq_loading(true);

            try {
                // In MCQ mode, send both messages and search_text
                const currentMessages = isLearnFlow && messages.length > 2 ? messages.slice(2) : messages;
                const quickReplies = await AIService.generateQuickReplies(currentMessages, search_text.trim());
                set_mcq_options(quickReplies);
            } catch (error) {
                console.error('Error searching quick replies:', error);
                set_mcq_options([]);
                onSetInputMessage('');
            } finally {
                set_mcq_loading(false);
            }
        }
    }, [chat_mode, isLearnFlow, messages, onSetInputMessage]);

    // Debounced search in MCQ mode - triggers after 600ms of idle typing
    useEffect(() => {
        // Only in MCQ mode
        if (chat_mode !== 'mcq') {
            // Clear any pending timeout if switching away from MCQ mode
            if (searchDebounceTimeoutRef.current) {
                clearTimeout(searchDebounceTimeoutRef.current);
                searchDebounceTimeoutRef.current = null;
            }
            return;
        }

        // Clear previous timeout if user is still typing
        if (searchDebounceTimeoutRef.current) {
            clearTimeout(searchDebounceTimeoutRef.current);
            searchDebounceTimeoutRef.current = null;
        }

        // Only trigger search if there's text in the input
        if (inputMessage.trim()) {
            searchDebounceTimeoutRef.current = setTimeout(() => {
                handle_search(inputMessage);
            }, 600);
        } else {
            set_mcq_options([]);
        }

        return () => {
            if (searchDebounceTimeoutRef.current) {
                clearTimeout(searchDebounceTimeoutRef.current);
                searchDebounceTimeoutRef.current = null;
            }
        };
    }, [inputMessage, chat_mode, handle_search]);

    // Handle MCQ option selection
    const handle_mcq_select = async (option: string) => {
        set_mcq_options([]); // Clear MCQ options after selection
        onSetInputMessage(''); // Clear input field after selection
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
                <ChatHeader onClose={onClose} chat_mode={chat_mode} on_mode_change={set_chat_mode} show_input={show_input} on_toggle_input={set_show_input} />
                <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                    {isChatActive ? <ChatBody key={chatResetKey} messages={isLearnFlow && messages.length > 2 ? messages.slice(2) : messages} loading={loading} is_reconnecting={isReconnecting} messages_end_ref={messagesEndRef as any} handle_button_click={(t: string) => onSendMessage(t)} chat_mode={chat_mode} mcq_options={mcq_options} mcq_loading={mcq_loading} on_mcq_select={handle_mcq_select} streaming_message={streaming_message} is_streaming={is_streaming} /> : null}
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
                    {/* Quick Replies - Show in input mode, or always show when input is hidden, but not while streaming */}
                    {!is_streaming && ((chat_mode === 'input' && currentQuickReplies.length > 0 && showQuickReplies) || (showQuickReplies && !show_input)) ? (
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
                                            // Always hide quick replies immediately when clicked (before sending message)
                                            onSetShowQuickReplies(false);
                                            onSendMessage(reply);
                                            onSetUsedQuickReplies((prev) => [...prev, reply]);
                                        }}>
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {!showLearnOverlay && show_input && (
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
