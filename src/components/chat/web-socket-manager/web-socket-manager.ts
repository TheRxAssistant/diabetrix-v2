// WebSocketManager.ts (utility for WebSocket operations)
import { useEffect, useRef, useState } from 'react';

interface Message {
    id: number;
    content: string;
    role: 'user' | 'assistant';
    buttons?: string[];
    timestamp: Date;
}

// Utility function to resolve WebSocket API URL
const resolve_ws_api_url = (api_name: string, drugName: string = 'diabetrix') => {
    const drugNameLower = drugName.toLowerCase() || 'diabetrix';
    const hcp_url = `wss://rxc-be-dev.healthbackend.com/chat-employee/hcp/${drugNameLower}`;
    const chat_url = `wss://rxc-be-dev.healthbackend.com/chat/${drugNameLower}`;

    let url = '';
    const currentUrl: any = window.location.href;

    // Check if the URL contains "hcp-resources"
    if (currentUrl?.includes('hcp-resources')) {
        url = hcp_url;
    } else {
        url = chat_url;
    }

    // @ts-ignore
    if (window.location.hostname === 'localhost') {
        return url;
    } else {
        // @ts-ignore
        if (window.location.hostname.includes('stage')) {
            return url;
        } else {
            // @ts-ignore
            if (window.location.hostname.includes('dev')) {
                return url;
            }
        }
    }

    return url;
};

export const useWebSocketManager = (topic_name: string) => {
    const [socket, set_socket] = useState<WebSocket | null>(null);
    const [messages, set_messages] = useState<Message[]>([]);
    const [loading, set_loading] = useState(false);
    const [is_reconnecting, set_is_reconnecting] = useState(false);

    const reconnect_attempt_ref = useRef(0);
    const max_reconnect_attempts = 10;
    const base_reconnect_delay = 1000;
    const last_activity_ref = useRef<number>(Date.now());

    // @ts-ignore
    const ping_interval_ref = useRef<NodeJS.Timeout | null>(null);

    // Setup ping interval function
    const setup_ping_interval = (ws: WebSocket) => {
        // Clear any existing ping interval
        if (ping_interval_ref.current) {
            clearInterval(ping_interval_ref.current);
        }

        // Set up new ping interval
        ping_interval_ref.current = setInterval(() => {
            if (Date.now() - last_activity_ref.current >= 5000) {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }));
                }
            }
        }, 5000);
    };

    const create_websocket_connection = () => {
        // Close existing connection if any
        if (socket && socket.readyState !== WebSocket.CLOSED) {
            console.log('Closing existing WebSocket connection');
            socket.close();
        }

        // Clear existing ping interval
        if (ping_interval_ref.current) {
            clearInterval(ping_interval_ref.current);
            ping_interval_ref.current = null;
        }

        const conversation_id = sessionStorage.getItem('conversation_id');
        const diabetrix_auth_session = sessionStorage.getItem('diabetrix_auth_session');
        const user_phone_number = diabetrix_auth_session ? JSON.parse(diabetrix_auth_session).phone_number : null;
        const user_consent = 'Yes';
        // Build URL parameters
        const url_params = new URLSearchParams();
        if (conversation_id) {
            url_params.append('conversation_id', conversation_id);
        }
        if (user_phone_number) {
            url_params.append('user_phone_number', user_phone_number);
        }
        if (user_consent) {
            url_params.append('user_consent', user_consent);
        }

        // Use provided apiUrl or fallback to internal resolve_ws_api_url function
        const base_url = resolve_ws_api_url(`chat/${topic_name}`, topic_name);
        const ws_url = url_params.toString() ? `${base_url}?${url_params.toString()}` : base_url;

        console.log('Creating new WebSocket connection to:', ws_url);
        const new_socket = new WebSocket(ws_url);

        new_socket.onmessage = (event) => {
            const event_data = JSON.parse(event.data);

            if (event_data.type === 'ping') {
                return;
            }

            if (event_data.conversation_id) {
                sessionStorage.setItem('conversation_id', event_data.conversation_id);
            }

            if (event_data.messages) {
                // Convert to our message format
                const formatted_messages = event_data.messages.map((msg: any, index: number) => {
                    let message = {
                        id: Date.now() + index,
                        content: msg.content,
                        role: msg.role,
                        buttons: msg.buttons || [],
                        timestamp: new Date(),
                    };

                    // Apply attachQuizOptions to detect and attach buttons
                    message = attachQuizOptions(message);

                    return message;
                });
                set_messages(formatted_messages);
            }

            if (event_data.loading === true) {
                set_loading(true);
            }

            if (event_data.loading === false) {
                set_loading(false);
            }

            last_activity_ref.current = Date.now();
        };

        new_socket.onopen = () => {
            console.log('WebSocket connection opened successfully');
            set_is_reconnecting(false);
            reconnect_attempt_ref.current = 0;

            // Setup ping interval when connection is established
            setup_ping_interval(new_socket);
        };

        new_socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        new_socket.onclose = (event) => {
            console.log('WebSocket Connection Closed', {
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean,
            });

            // Clear ping interval when connection is closed
            if (ping_interval_ref.current) {
                clearInterval(ping_interval_ref.current);
                ping_interval_ref.current = null;
            }

            // Only attempt reconnection if this wasn't a clean close (user initiated)
            // and we haven't exceeded max attempts
            const was_clean_close = event.code === 1000 || event.wasClean;
            const should_attempt_reconnect = !was_clean_close && reconnect_attempt_ref.current < max_reconnect_attempts;

            if (should_attempt_reconnect) {
                set_is_reconnecting(true);
                reconnect_attempt_ref.current += 1;

                // Calculate exponential backoff delay with jitter
                // Formula: min(baseDelay * 2^attempt, maxDelay) + random jitter
                const attempt = reconnect_attempt_ref.current;
                const max_delay = 30000; // 30 seconds maximum delay
                const exponential_delay = Math.min(base_reconnect_delay * Math.pow(2, attempt - 1), max_delay);

                // Add some random jitter (±20%) to prevent thundering herd problem
                const jitter = exponential_delay * 0.2 * (Math.random() - 0.5);
                const delay = exponential_delay + jitter;

                console.log(`Attempting reconnection ${attempt}/${max_reconnect_attempts} in ${Math.round(delay)}ms`);

                setTimeout(() => {
                    // Only reconnect if we don't have an active connection
                    if (!socket || socket.readyState === WebSocket.CLOSED) {
                        create_websocket_connection();
                    }
                }, delay);
            } else if (reconnect_attempt_ref.current >= max_reconnect_attempts && !was_clean_close) {
                // Max attempts reached for non-clean closes
                set_is_reconnecting(false);
                console.log('Max reconnection attempts reached. Please refresh the page to try again.');

                // Show a reconnection failure message to the user
                set_messages((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        content: 'Connection lost. Please close the chat and try again later.',
                        role: 'assistant',
                        timestamp: new Date(),
                    },
                ]);
            } else {
                // Clean close, just reset reconnection state
                set_is_reconnecting(false);
            }
        };

        set_socket(new_socket);
        return new_socket;
    };

    const attachQuizOptions = (message: any) => {
        if (message.role !== 'assistant') return message;

        // Check if this is an initial greeting/help message that should show healthcare options
        const isInitialMessage =
            message.content.toLowerCase().includes('how can i help') ||
            message.content.toLowerCase().includes('what can i help') ||
            message.content.toLowerCase().includes('how may i assist') ||
            message.content.toLowerCase().includes('what would you like to know') ||
            message.content.toLowerCase().includes('hello') ||
            message.content.toLowerCase().includes('hi there') ||
            message.content.toLowerCase().includes('good morning') ||
            message.content.toLowerCase().includes('good afternoon') ||
            message.content.toLowerCase().includes('welcome');

        if (isInitialMessage) {
            // Provide basic healthcare recommendation options
            const basicOptions = [
                'Tell me about diabetes and how medications help manage it',
                "What's the proper dosage and timing for my medication?",
                'How to manage side effects like nausea and headaches?',
                'What diet should I follow while taking medication?',
                'What exercises are safe and beneficial with diabetes?',
                'What support programs are available for patients?',
            ];
            return {
                ...message,
                buttons: basicOptions,
                is_multiselect: false,
            };
        }

        // Legacy hardcoded quiz options for specific conditions
        const quizOptions: Array<{
            question: string;
            options: string[];
            is_multiselect?: boolean;
        }> = [
            {
                question: 'Which of these symptoms of Demodex blepharitis (DB) are you currently experiencing?',
                options: ['Eyelid redness', 'Crusties (collarettes) on eyelashes', 'Eyelid irritation', 'Missing or misdirected eyelashes', 'Eyelid itching', 'Eyelid swelling'],
                is_multiselect: true,
            },
            {
                question: 'What have you used to treat your symptoms and eyelid issues?',
                options: ['Eyelid Cleansers wipes, and/or foams', 'Artificial tears(eye drops)', 'In-office eyelid treatments', 'Warm compresses', 'Baby Shampoo', 'Prescription Eye Drops', 'Other'],
                is_multiselect: true,
            },
            {
                question: 'When do your eyelid issues bother you the most?',
                options: ['When i wake up', 'When I wear makeup', 'When I wear contact lenses', 'When I do office or school work', 'At the end of the day', 'After long periods of screen time'],
                is_multiselect: true,
            },
            {
                question: 'Have you been diagnosed with Demodex blepharitis (DB)?',
                options: ['Yes', 'No'],
            },
        ];

        // Find if the message content contains any of the quiz questions
        for (const quiz of quizOptions) {
            if (message.content.toLowerCase().includes(quiz.question.toLowerCase())) {
                return {
                    ...message,
                    buttons: quiz.options,
                    is_multiselect: quiz.is_multiselect,
                };
            }
        }

        return message;
    };

    const send_message = (message: string) => {
        if (socket && socket.readyState === WebSocket.OPEN && message.trim()) {
            const new_message = {
                id: Date.now(),
                content: message,
                role: 'user' as const,
                timestamp: new Date(),
            };

            set_messages((prev) => [...prev, new_message]);

            const message_data = {
                message: message.trim(),
            };

            socket.send(JSON.stringify(message_data));
            last_activity_ref.current = Date.now();
            return true;
        }
        return false;
    };

    const close_connection = () => {
        console.log('Manually closing WebSocket connection');

        // Clear ping interval first
        if (ping_interval_ref.current) {
            clearInterval(ping_interval_ref.current);
            ping_interval_ref.current = null;
        }

        // Close socket if it exists and is not already closed
        if (socket && socket.readyState !== WebSocket.CLOSED) {
            socket.close(1000, 'User closed connection'); // Clean close with code 1000
        }

        // Reset reconnection attempts since this is a manual close
        reconnect_attempt_ref.current = max_reconnect_attempts;
        set_is_reconnecting(false);
    };

    // Clean up connection on unmount
    useEffect(() => {
        return () => {
            close_connection();
        };
    }, []);

    return {
        messages,
        loading,
        is_reconnecting,
        send_message,
        create_websocket_connection,
        close_connection,
        set_messages,
    };
};
