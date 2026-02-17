'use client';

import type { ComponentProps } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { MicIcon, SquareIcon } from 'lucide-react';

type SpeechInputMode = 'media-recorder' | 'none';

export type SpeechInputProps = ComponentProps<typeof Button> & {
    onTranscriptionChange?: (text: string) => void;
    /**
     * Callback for when audio is recorded using MediaRecorder.
     * The callback receives an audio Blob that should be sent to a transcription service.
     * Return the transcribed text, which will be passed to onTranscriptionChange.
     */
    onAudioRecorded?: (audioBlob: Blob) => Promise<string>;
    /**
     * Callback for streaming transcript updates (interim and final results).
     * This is called when using WebSocket streaming mode.
     */
    onStreamingTranscript?: (text: string, isFinal: boolean) => void;
    /**
     * Function to send audio chunks via WebSocket for real-time transcription.
     * If provided, audio chunks will be sent immediately instead of waiting for recording to stop.
     */
    sendAudioChunk?: (chunk: Blob) => void;
};

const detectSpeechInputMode = (): SpeechInputMode => {
    if (typeof window === 'undefined') {
        return 'none';
    }

    if ('MediaRecorder' in window && 'mediaDevices' in navigator) {
        return 'media-recorder';
    }

    return 'none';
};

export const SpeechInput = ({ className, onTranscriptionChange, onAudioRecorded, onStreamingTranscript, sendAudioChunk, ...props }: SpeechInputProps) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mode] = useState<SpeechInputMode>(detectSpeechInputMode);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const onTranscriptionChangeRef = useRef<SpeechInputProps['onTranscriptionChange']>(onTranscriptionChange);
    const onAudioRecordedRef = useRef<SpeechInputProps['onAudioRecorded']>(onAudioRecorded);
    const onStreamingTranscriptRef = useRef<SpeechInputProps['onStreamingTranscript']>(onStreamingTranscript);
    const sendAudioChunkRef = useRef<SpeechInputProps['sendAudioChunk']>(sendAudioChunk);

    // Keep refs in sync
    onTranscriptionChangeRef.current = onTranscriptionChange;
    onAudioRecordedRef.current = onAudioRecorded;
    onStreamingTranscriptRef.current = onStreamingTranscript;
    sendAudioChunkRef.current = sendAudioChunk;

    // Cleanup MediaRecorder and stream on unmount
    useEffect(
        () => () => {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                for (const track of streamRef.current.getTracks()) {
                    track.stop();
                }
            }
        },
        [],
    );

    // Start MediaRecorder recording
    const startMediaRecorder = useCallback(async () => {
        if (!onAudioRecordedRef.current) {
            return;
        }

        console.log('startMediaRecorder');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            audioChunksRef.current = [];

            console.log('audioChunksRef', audioChunksRef.current);

            const handleDataAvailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);

                    // If WebSocket streaming is enabled, send chunk immediately
                    if (sendAudioChunkRef.current) {
                        sendAudioChunkRef.current(event.data);
                    }
                }
            };

            const handleStop = async () => {
                for (const track of stream.getTracks()) {
                    track.stop();
                }
                streamRef.current = null;

                // If WebSocket streaming was used, don't send the blob again
                // The transcription should have been received via streaming callbacks
                if (sendAudioChunkRef.current) {
                    // WebSocket streaming mode - transcription handled via onStreamingTranscript
                    // Clear chunks for next recording
                    audioChunksRef.current = [];
                    return;
                }

                // Fallback to HTTP transcription if WebSocket not available
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: 'audio/webm',
                });

                if (audioBlob.size > 0 && onAudioRecordedRef.current) {
                    setIsProcessing(true);
                    try {
                        const transcript = await onAudioRecordedRef.current(audioBlob);
                        if (transcript) {
                            onTranscriptionChangeRef.current?.(transcript);
                        }
                    } catch {
                        // Error handling delegated to the onAudioRecorded caller
                    } finally {
                        setIsProcessing(false);
                    }
                }
            };

            const handleError = () => {
                setIsListening(false);
                for (const track of stream.getTracks()) {
                    track.stop();
                }
                streamRef.current = null;
            };

            mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
            mediaRecorder.addEventListener('stop', handleStop);
            mediaRecorder.addEventListener('error', handleError);

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(2500);
            setIsListening(true);
        } catch {
            console.log('error starting media recorder');
            setIsListening(false);
        }
    }, []);

    // Stop MediaRecorder recording
    const stopMediaRecorder = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsListening(false);
    }, []);

    const toggleListening = useCallback(() => {
        console.log('toggleListening', mode, isListening);
        if (mode === 'media-recorder') {
            if (isListening) {
                stopMediaRecorder();
            } else {
                startMediaRecorder();
            }
        }
    }, [mode, isListening, startMediaRecorder, stopMediaRecorder]);

    // Determine if button should be disabled
    const isDisabled = mode === 'none' || (mode === 'media-recorder' && !onAudioRecorded) || isProcessing;

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* Animated pulse rings */}
            {isListening &&
                [0, 1, 2].map((index) => (
                    <div
                        className="absolute inset-0 animate-ping rounded-full border-2 border-red-400/30"
                        key={index}
                        style={{
                            animationDelay: `${index * 0.3}s`,
                            animationDuration: '2s',
                        }}
                    />
                ))}

            {/* Main record button */}
            <Button className={cn('relative z-10 rounded-full transition-all duration-300', isListening ? 'bg-destructive text-white hover:bg-destructive/80 hover:text-white' : 'bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground', className)} disabled={isDisabled} onClick={toggleListening} {...props}>
                {isProcessing && <Spinner />}
                {!isProcessing && isListening && <SquareIcon className="size-4" />}
                {!(isProcessing || isListening) && <MicIcon className="size-4" />}
            </Button>
        </div>
    );
};
