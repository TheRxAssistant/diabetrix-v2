import { useCallback, useState } from 'react';
import { postAPI, streamAPI, CORE_ENGINE_API_URLS } from '../api';
import { trackingService } from '../tracking/tracking-service';

interface ConversationMessage {
    message_id: string;
    conversation_id: string;
    role: 'human' | 'assistant';
    message: string;
    created_at: string;
    buttons?: string[];
}

export const useChat = () => {
    const [messages, set_messages] = useState<ConversationMessage[]>([]);
    const [conversation_id, set_conversation_id] = useState<string | null>(null);
    const [is_loading, set_is_loading] = useState(false);
    const [is_waiting_for_response, set_is_waiting_for_response] = useState<boolean>(false);
    const [is_streaming, set_is_streaming] = useState<boolean>(false);
    const [streaming_message, set_streaming_message] = useState<string>('');
    const [error_message, set_error_message] = useState<string | null>(null);

    const createChatThread = async () => {
        set_is_loading(true);
        set_error_message(null);
        
        try {
            const { statusCode, data, message } = await postAPI(CORE_ENGINE_API_URLS.SYNC_CHAT_THREAD, {
                context: {},
            });
            
            set_is_loading(false);

            if (statusCode === 200) {
                const conversationId = data.conversation_id;
                set_conversation_id(conversationId);
                // Load initial messages after creating thread
                const initialMessages = await getChatMessages(conversationId);
                set_messages(initialMessages);
                
                // Sync timeline after conversation sync is done
                try {
                    await trackingService.syncTimeline({
                        event_name: 'conversation_started',
                        title: 'Conversation Started',
                        description: `Chat conversation started with conversation_id: ${conversationId}`,
                        conversation_id: conversationId,
                        event_payload: {
                            conversation_id: conversationId,
                        },
                    });
                } catch (error) {
                    console.error('Error syncing timeline after conversation sync:', error);
                }
                
                return conversationId;
            } else {
                set_error_message(message);
                return null;
            }
        } catch (error) {
            set_is_loading(false);
            set_error_message('Failed to create chat thread');
            return null;
        }
    };

    const getChatMessages = useCallback(async (conversation_id: string): Promise<ConversationMessage[]> => {
        try {
            const { statusCode, data } = await postAPI(CORE_ENGINE_API_URLS.GET_CHAT_MESSAGES, { conversation_id });
            if (statusCode === 200 && Array.isArray(data)) {
                return data.map((msg: any) => ({
                    message_id: msg.message_id || `msg_${Date.now()}_${Math.random()}`,
                    conversation_id: msg.conversation_id || conversation_id,
                    role: msg.role === 'human' ? 'human' : 'assistant',
                    message: msg.message || msg.content || '',
                    created_at: msg.created_at || new Date().toISOString(),
                    buttons: msg.buttons,
                }));
            }
            return [];
        } catch (error) {
            console.error('Failed to get chat messages:', error);
            return [];
        }
    }, []);

    const sendMessage = useCallback(
        async (message: string, onStreamChunk?: (chunk: string) => void): Promise<void> => {
            if (!message.trim() || !conversation_id) return;

            // Add user message immediately to UI
            const userMessage: ConversationMessage = {
                message_id: `temp_${Date.now()}`,
                conversation_id: conversation_id,
                role: 'human',
                message: message.trim(),
                created_at: new Date().toISOString(),
            };

            set_messages((prev) => [...prev, userMessage]);
            set_streaming_message('');
            set_is_streaming(false);

            try {
                let fullResponse = '';

                set_is_waiting_for_response(true);
                await streamAPI(
                    'STREAM_CHAT_MESSAGE',
                    {
                        conversation_id: conversation_id,
                        message: message.trim(),
                    },
                    (chunk) => {
                        set_is_waiting_for_response(false);
                        set_is_streaming(true);
                        fullResponse += chunk;
                        set_streaming_message(fullResponse);
                        if (onStreamChunk) {
                            onStreamChunk(chunk);
                        }
                    },
                );

                set_is_streaming(false);
                set_streaming_message('');

                // Create AI message with streamed response
                const aiMessage: ConversationMessage = {
                    message_id: `ai_${Date.now()}`,
                    conversation_id: conversation_id,
                    role: 'assistant',
                    message: fullResponse,
                    created_at: new Date().toISOString(),
                };

                // Replace temp user message with both user and AI messages
                set_messages((prev) => {
                    const withoutTemp = prev.filter((msg) => msg.message_id !== userMessage.message_id);
                    return [...withoutTemp, userMessage, aiMessage];
                });

                // Sync with server after delay
                setTimeout(async () => {
                    try {
                        const updatedMessages = await getChatMessages(conversation_id);
                        if (updatedMessages && updatedMessages.length > 0) {
                            set_messages(updatedMessages);
                        }
                    } catch (error) {
                        console.warn('Failed to sync messages with server:', error);
                    }
                }, 2000);
            } catch (error) {
                console.error('Failed to send message:', error);
                // Remove temp message on error
                set_messages((prev) => prev.filter((msg) => msg.message_id !== userMessage.message_id));
                set_streaming_message('');
                set_is_streaming(false);
                set_is_waiting_for_response(false);
                throw error;
            } finally {
                set_is_streaming(false);
                set_is_waiting_for_response(false);
            }
        },
        [conversation_id, getChatMessages],
    );

    return {
        // State
        is_loading,
        is_waiting_for_response,
        is_streaming,
        streaming_message,
        messages,
        conversation_id,
        error_message,

        // Actions
        getChatMessages,
        createChatThread,
        sendMessage,

        // Setters for external control if needed
        set_messages,
        set_conversation_id,
    };
};

