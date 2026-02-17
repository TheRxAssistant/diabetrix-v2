import { WS_BASE_URL } from '@/services/api';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface SpeechTranscriptMessage {
    type: 'transcript' | 'error';
    text?: string;
    is_final?: boolean;
    confidence?: number;
    message?: string;
}

export const useSpeechWebSocket = () => {
    const [is_connected, set_is_connected] = useState(false);
    const ws_ref = useRef<WebSocket | null>(null);
    const on_transcript_ref = useRef<((text: string, is_final: boolean) => void) | null>(null);
    const on_error_ref = useRef<((error: string) => void) | null>(null);

    const connect = useCallback(() => {
        // Close existing connection if any
        if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
            ws_ref.current.close();
        }

        const ws_url = `${WS_BASE_URL()}/conversation/stream-speech`;
        const websocket = new WebSocket(ws_url);

        websocket.onopen = () => {
            set_is_connected(true);
            ws_ref.current = websocket;
        };

        websocket.onmessage = (event) => {
            try {
                const message: SpeechTranscriptMessage = JSON.parse(event.data);

                if (message.type === 'transcript' && message.text) {
                    on_transcript_ref.current?.(message.text, message.is_final || false);
                } else if (message.type === 'error') {
                    on_error_ref.current?.(message.message || 'Unknown error');
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            on_error_ref.current?.('WebSocket connection error');
            set_is_connected(false);
        };

        websocket.onclose = () => {
            set_is_connected(false);
            ws_ref.current = null;
        };
    }, []);

    const disconnect = useCallback(() => {
        if (ws_ref.current) {
            ws_ref.current.close();
            ws_ref.current = null;
        }
        set_is_connected(false);
    }, []);

    const send_audio_chunk = useCallback(async (chunk: Blob) => {
        console.log('send_audio_chunk', chunk);
        if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
            const array_buffer = await chunk.arrayBuffer();
            ws_ref.current.send(array_buffer);
        }
    }, []);

    const set_on_transcript = useCallback((callback: (text: string, is_final: boolean) => void) => {
        on_transcript_ref.current = callback;
    }, []);

    const set_on_error = useCallback((callback: (error: string) => void) => {
        on_error_ref.current = callback;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (ws_ref.current) {
                ws_ref.current.close();
            }
        };
    }, []);

    return {
        connect,
        disconnect,
        send_audio_chunk,
        is_connected,
        set_on_transcript,
        set_on_error,
    };
};
