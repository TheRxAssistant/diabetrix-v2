import React, { RefObject, useState, useEffect, useRef, useCallback } from 'react';
import styles from '../unified-modal.module.scss';
import ChatHeader from '../../chat/chat-header/chat-header';
import ChatBody from '../../chat/chat-body/chat-body';
import ChatFooter from '../../chat/chat-footer/chat-footer';
import { AIService } from '../../../services/ai-service';
import { ThemeConfig } from '../../../config/theme-config';

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
    themeConfig: ThemeConfig;
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
    onSetMessages?: (messages: any[] | ((prev: any[]) => any[])) => void;
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
    themeConfig,
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
    onSetMessages,
    streaming_message = '',
    is_streaming = false,
}) => {
    // State to control input visibility
    const [show_input, set_show_input] = useState<boolean>(true);
    // Chat mode state (input or mcq)
    const [chat_mode, set_chat_mode] = useState<'input' | 'mcq'>('input');
    const [mcq_options, set_mcq_options] = useState<{ text: string; type?: string }[]>([]);
    const [mcq_loading, set_mcq_loading] = useState(false);

    // Intelligent options state (for when input is disabled or in mcq mode)
    const [intelligent_options, set_intelligent_options] = useState<{ text: string; type?: string }[]>([]);
    const [intelligent_input_fields, set_intelligent_input_fields] = useState<{ field_type: string; label: string; placeholder: string }[]>([]);
    const [intelligent_action_link, set_intelligent_action_link] = useState<{ url: string; label: string; open_in_new_tab: boolean } | null>(null);
    const [intelligent_options_loading, set_intelligent_options_loading] = useState(false);
    const [intelligent_option_type, set_intelligent_option_type] = useState<string>('generic');

    // Ref to track if we've generated quick replies for disabled input state
    const quickRepliesGeneratedForDisabledInput = useRef<boolean>(false);
    // Ref to track if we've generated intelligent options
    const intelligentOptionsGeneratedRef = useRef<boolean>(false);
    // Ref to track the last message count when intelligent options were generated
    const lastMessageCountForIntelligentOptions = useRef<number>(0);

    // Generate intelligent options when input is disabled or in MCQ mode
    useEffect(() => {
        const shouldGenerateOptions = (!show_input || chat_mode === 'mcq') && 
                                       !is_streaming && 
                                       !loading && 
                                       messages.length > 0 &&
                                       isChatActive;

        if (shouldGenerateOptions) {
            // Check if the last assistant message contains "upload" and "insurance card"
            // If so, skip calling intelligent options API (insurance upload button will be shown instead)
            const currentMessages = isLearnFlow && messages.length > 2 ? messages.slice(2) : messages;
            const lastAssistantMessage = [...currentMessages].reverse().find(m => m.role === 'assistant');
            const messageContent = (lastAssistantMessage?.content || '').toLowerCase();
            const shouldSkipIntelligentOptions = messageContent.includes('upload') && messageContent.includes('insurance card');
            
            if (shouldSkipIntelligentOptions) {
                console.log('⏭️ Skipping intelligent options API - insurance upload detected');
                intelligentOptionsGeneratedRef.current = true;
                lastMessageCountForIntelligentOptions.current = messages.length;
                set_intelligent_options([]);
                set_intelligent_input_fields([]);
                set_intelligent_action_link(null);
                set_intelligent_options_loading(false);
                return;
            }
            
            // Check if we need to regenerate (new message arrived or first time)
            const currentMessageCount = messages.length;
            const needsRegeneration = !intelligentOptionsGeneratedRef.current || 
                                       lastMessageCountForIntelligentOptions.current !== currentMessageCount;

            if (needsRegeneration) {
                intelligentOptionsGeneratedRef.current = true;
                lastMessageCountForIntelligentOptions.current = currentMessageCount;

                const generateIntelligentOptions = async () => {
                    try {
                        set_intelligent_options_loading(true);
                        console.log('🔄 Generating intelligent options', {
                            show_input,
                            chat_mode,
                            messagesLength: messages.length,
                        });

                        // Get the last assistant message
                        if (!lastAssistantMessage) {
                            console.log('⚠️ No assistant message found');
                            set_intelligent_options_loading(false);
                            return;
                        }

                        const result = await AIService.generateIntelligentOptions(
                            currentMessages,
                            lastAssistantMessage.content || lastAssistantMessage.message
                        );
                        
                        console.log('✨ Generated intelligent options:', result);
                        set_intelligent_options(result.options);
                        set_intelligent_input_fields(result.input_fields || []);
                        set_intelligent_action_link(result.action_link || null);
                        set_intelligent_option_type(result.option_type);
                    } catch (error) {
                        console.error('❌ Error generating intelligent options:', error);
                        // Set fallback options
                        set_intelligent_options([
                            { text: 'Yes', type: 'action' },
                            { text: 'No', type: 'action' },
                            { text: 'Tell me more', type: 'question' },
                            { text: 'Skip', type: 'action' },
                        ]);
                        set_intelligent_input_fields([]);
                        set_intelligent_action_link(null);
                        set_intelligent_option_type('generic');
                    } finally {
                        set_intelligent_options_loading(false);
                    }
                };

                generateIntelligentOptions();
            }
        } else if (show_input && chat_mode === 'input') {
            // Reset when input becomes visible again in input mode
            intelligentOptionsGeneratedRef.current = false;
            set_intelligent_options([]);
            set_intelligent_input_fields([]);
            set_intelligent_action_link(null);
        }
    }, [show_input, chat_mode, is_streaming, loading, messages.length, isChatActive, isLearnFlow, messages]);

    // Clear intelligent options when streaming starts
    useEffect(() => {
        if (is_streaming) {
            set_intelligent_options([]);
            set_intelligent_input_fields([]);
            set_intelligent_action_link(null);
            intelligentOptionsGeneratedRef.current = false;
        }
    }, [is_streaming]);

    // Generate quick replies when input is disabled (legacy - keeping for fallback)
    useEffect(() => {
        if (!show_input && chat_mode === 'input') {
            // Check if the last assistant message contains "upload" and "insurance card"
            // If so, skip generating quick replies (intelligent options will handle it)
            const currentMessages = isLearnFlow && messages.length > 2 ? messages.slice(2) : messages;
            const lastAssistantMessage = [...currentMessages].reverse().find(m => m.role === 'assistant');
            const messageContent = (lastAssistantMessage?.content || '').toLowerCase();
            const shouldSkipQuickReplies = messageContent.includes('upload') && messageContent.includes('insurance card');
            
            // Also skip if intelligent options are already being shown
            const hasIntelligentOptions = intelligent_options.length > 0 || intelligent_input_fields.length > 0 || intelligent_action_link;
            
            if (shouldSkipQuickReplies || hasIntelligentOptions) {
                console.log('⏭️ Skipping quick replies - intelligent options detected');
                quickRepliesGeneratedForDisabledInput.current = false;
                onSetShowQuickReplies(false);
                return;
            }
            
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
    }, [show_input, chat_mode, isChatActive, messages.length, isLearnFlow, onSetCurrentQuickReplies, onSetShowQuickReplies, intelligent_options.length, intelligent_input_fields.length, intelligent_action_link, messages]);

    // Clear MCQ options when switching modes
    useEffect(() => {
        if (chat_mode === 'input') {
            set_mcq_options([]);
        }
    }, [chat_mode]);

    useEffect(() => {
        console.log('is_streaming', is_streaming);
    }, [is_streaming]);

    // Hide quick replies when streaming starts (input is disabled during streaming)
    useEffect(() => {
        if (is_streaming && showQuickReplies) {
            onSetShowQuickReplies(false);
        }
    }, [is_streaming, showQuickReplies, onSetShowQuickReplies]);

    // Show quick replies once they're available after streaming ends
    useEffect(() => {
        // Check if we should skip quick replies due to intelligent options
        const currentMessages = isLearnFlow && messages.length > 2 ? messages.slice(2) : messages;
        const lastAssistantMessage = [...currentMessages].reverse().find(m => m.role === 'assistant');
        const messageContent = (lastAssistantMessage?.content || '').toLowerCase();
        const shouldSkipQuickReplies = messageContent.includes('upload') && messageContent.includes('insurance card');
        const hasIntelligentOptions = intelligent_options.length > 0 || intelligent_input_fields.length > 0 || intelligent_action_link;
        
        if (!is_streaming && currentQuickReplies.length > 0 && !showQuickReplies && !shouldSkipQuickReplies && !hasIntelligentOptions) {
            // Show quick replies after streaming ends if they're available
            onSetShowQuickReplies(true);
        } else if ((shouldSkipQuickReplies || hasIntelligentOptions) && showQuickReplies) {
            // Hide quick replies if intelligent options should be shown instead
            onSetShowQuickReplies(false);
        }
    }, [is_streaming, currentQuickReplies.length, showQuickReplies, onSetShowQuickReplies, messages, isLearnFlow, intelligent_options.length, intelligent_input_fields.length, intelligent_action_link]);

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

    // Handle Start Again - keep first 3 messages and regenerate intelligent options
    const handle_start_again = useCallback(async () => {
        if (!onSetMessages) return;
        
        // Keep only first 3 messages
        onSetMessages((prev: any[]) => prev.slice(0, 3));
        
        // Clear current intelligent options
        set_intelligent_options([]);
        set_intelligent_input_fields([]);
        set_intelligent_action_link(null);
        intelligentOptionsGeneratedRef.current = false;
        lastMessageCountForIntelligentOptions.current = 0;
        
        // Regenerate intelligent options after state update
        setTimeout(async () => {
            // Check if we should skip intelligent options API (insurance upload case)
            const currentMessages = messages.slice(0, 3);
            const lastAssistantMessage = [...currentMessages].reverse().find(m => m.role === 'assistant');
            const messageContent = (lastAssistantMessage?.content || '').toLowerCase();
            const shouldSkipIntelligentOptions = messageContent.includes('upload') && messageContent.includes('insurance card');
            
            if (shouldSkipIntelligentOptions) {
                console.log('⏭️ Skipping intelligent options API in start again - insurance upload detected');
                intelligentOptionsGeneratedRef.current = true;
                lastMessageCountForIntelligentOptions.current = 3;
                set_intelligent_options([]);
                set_intelligent_input_fields([]);
                set_intelligent_action_link(null);
                set_intelligent_options_loading(false);
                return;
            }
            
            try {
                set_intelligent_options_loading(true);
                
                if (lastAssistantMessage) {
                    const result = await AIService.generateIntelligentOptions(
                        currentMessages,
                        lastAssistantMessage.content || lastAssistantMessage.message
                    );
                    
                    set_intelligent_options(result.options);
                    set_intelligent_input_fields(result.input_fields || []);
                    set_intelligent_action_link(result.action_link || null);
                    set_intelligent_option_type(result.option_type);
                    intelligentOptionsGeneratedRef.current = true;
                    lastMessageCountForIntelligentOptions.current = 3;
                }
            } catch (error) {
                console.error('Error regenerating intelligent options:', error);
                set_intelligent_options([
                    { text: 'Yes', type: 'action' },
                    { text: 'No', type: 'action' },
                    { text: 'Tell me more', type: 'question' },
                    { text: 'Skip', type: 'action' },
                ]);
                set_intelligent_input_fields([]);
                set_intelligent_action_link(null);
                set_intelligent_option_type('generic');
            } finally {
                set_intelligent_options_loading(false);
            }
        }, 100);
    }, [messages, onSetMessages]);

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
                <ChatHeader onClose={onClose} chat_mode={chat_mode} on_mode_change={set_chat_mode} show_input={show_input} on_toggle_input={set_show_input} themeConfig={themeConfig} />
                <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                    {isChatActive ? <ChatBody key={chatResetKey} messages={isLearnFlow && messages.length > 2 ? messages.slice(2) : messages} loading={loading} is_reconnecting={isReconnecting} messages_end_ref={messagesEndRef as any} handle_button_click={(t: string) => onSendMessage(t)} chat_mode={chat_mode} mcq_options={mcq_options} mcq_loading={mcq_loading} on_mcq_select={handle_mcq_select} streaming_message={streaming_message} is_streaming={is_streaming} intelligent_options={intelligent_options} intelligent_input_fields={intelligent_input_fields} intelligent_action_link={intelligent_action_link} intelligent_options_loading={intelligent_options_loading} intelligent_option_type={intelligent_option_type} on_intelligent_option_select={(option) => { set_intelligent_options([]); set_intelligent_input_fields([]); set_intelligent_action_link(null); onSendMessage(option); }} on_intelligent_input_submit={(values) => { set_intelligent_options([]); set_intelligent_input_fields([]); set_intelligent_action_link(null); const message = Object.values(values).join(', '); onSendMessage(message); }} show_intelligent_options={(!show_input || chat_mode === 'mcq') && !is_streaming} show_start_again={!show_input && !is_streaming && messages.length > 4} on_start_again={handle_start_again} show_input={show_input} /> : null}
                    {showLearnOverlay && (
                        <div 
                            className={`${styles.learn_overlay} ${themeConfig.domain !== 'default' ? styles.custom_theme : ''}`}
                            style={themeConfig.domain !== 'default' ? {
                                background: themeConfig.learn_overlay_bg,
                            } : undefined}
                        >
                            <div className={styles.learn_overlay_header}>
                                <h3 
                                    className={styles.learn_overlay_title}
                                    style={themeConfig.domain !== 'default' ? {
                                        background: themeConfig.learn_overlay_title_gradient,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    } : undefined}
                                >💡 Learn About Diabetrix®</h3>
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
                                        style={themeConfig.domain !== 'default' ? {
                                            border: `1px solid ${themeConfig.learn_question_card_border}`,
                                            boxShadow: themeConfig.learn_question_card_shadow,
                                        } : undefined}
                                        onMouseEnter={(e) => {
                                            if (themeConfig.domain !== 'default') {
                                                e.currentTarget.style.borderColor = themeConfig.learn_question_card_border.replace('0.3', '0.5');
                                                e.currentTarget.style.boxShadow = `0 12px 40px ${themeConfig.learn_question_card_border.replace('0.3', '0.2')}, 0 4px 12px rgba(0, 0, 0, 0.1)`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (themeConfig.domain !== 'default') {
                                                e.currentTarget.style.borderColor = themeConfig.learn_question_card_border;
                                                e.currentTarget.style.boxShadow = themeConfig.learn_question_card_shadow;
                                            }
                                        }}
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
                    {/* Quick Replies - Only show when input is enabled (not disabled), not in MCQ mode, and not streaming */}
                    {/* Also hide if intelligent options (like insurance upload) are present */}
                    {show_input && chat_mode !== 'mcq' && !is_streaming && showQuickReplies && currentQuickReplies.length > 0 && 
                     !(intelligent_options.length > 0 || intelligent_input_fields.length > 0 || intelligent_action_link) ? (
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
