import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, getToolName, UIMessage } from 'ai';
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputProvider, PromptInputSubmit, PromptInputTextarea, usePromptInputController } from '@/components/ai-elements/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { SpeechInput } from '@/components/ai-elements/speech-input';
import { Transcription, TranscriptionSegment } from '@/components/ai-elements/transcription';
import { AudioPlayer, AudioPlayerControlBar, AudioPlayerDurationDisplay, AudioPlayerElement, AudioPlayerMuteButton, AudioPlayerPlayButton, AudioPlayerSeekBackwardButton, AudioPlayerSeekForwardButton, AudioPlayerTimeDisplay, AudioPlayerTimeRange, AudioPlayerVolumeRange } from '@/components/ai-elements/audio-player';
import { BASE_URL, generateSpeech, transcribeAudio } from '@/services/api';
import type { MessageMetadata } from '@/services/types/chat/message-metadata';
import { useSpeechWebSocket } from '@/hooks/use-speech-websocket';
import { useThemeConfig } from '@/hooks/useThemeConfig';
import { getDomain, getBrandName } from '@/config/theme-config';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Volume2, VolumeX } from 'lucide-react';
import styles from '../unified-modal.module.scss';

type MyUIMessage = UIMessage<MessageMetadata>;

interface VoiceChatStepProps {
    onClose: () => void;
}

const renderMessagePart = (part: any, part_index: number, message_id: string, is_streaming: boolean, is_last_part?: boolean): React.ReactNode => {
    if (part.type === 'text') {
        return (
            <div
                key={`${message_id}-text-${part_index}`}
                className="prose prose-sm max-w-none 
                    prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-4
                    prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
                    prose-p:my-4 prose-p:leading-relaxed
                    prose-ul:my-4 prose-ol:my-4 prose-li:my-1
                    prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
                    prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4
                    prose-blockquote:border-l-4 prose-blockquote:border-muted prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
                    prose-hr:my-6 prose-hr:border-border
                    prose-img:rounded-lg prose-img:my-4
                    prose-table:w-full prose-table:my-4
                    prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-a:underline
                    prose-strong:font-semibold
                    prose-em:italic">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Table components using shadcn Table
                        table: ({ node, ...props }) => (
                            <div className="my-4 w-full overflow-x-auto rounded-md border">
                                <Table {...props} />
                            </div>
                        ),
                        thead: ({ node, ...props }) => <TableHeader {...props} />,
                        tbody: ({ node, ...props }) => <TableBody {...props} />,
                        tr: ({ node, ...props }) => <TableRow {...props} />,
                        th: ({ node, ...props }) => <TableHead {...props} />,
                        td: ({ node, ...props }) => <TableCell {...props} />,
                        // Headings
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold mt-6 mb-4 first:mt-0" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-6 mb-4 first:mt-0" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-6 mb-4 first:mt-0" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-4 mb-3 first:mt-0" {...props} />,
                        h5: ({ node, ...props }) => <h5 className="text-sm font-semibold mt-4 mb-3 first:mt-0" {...props} />,
                        h6: ({ node, ...props }) => <h6 className="text-sm font-semibold mt-4 mb-3 first:mt-0" {...props} />,
                        // Paragraphs
                        p: ({ node, ...props }) => <p className="my-4 leading-relaxed first:mt-0 last:mb-0" {...props} />,
                        // Lists
                        ul: ({ node, ...props }) => <ul className="my-4 ml-6 list-disc space-y-1" {...props} />,
                        ol: ({ node, ...props }) => <ol className="my-4 ml-6 list-decimal space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="my-1" {...props} />,
                        // Code blocks
                        code: ({ node, inline, className, children, ...props }: any) => {
                            if (inline) {
                                return (
                                    <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono" {...props}>
                                        {children}
                                    </code>
                                );
                            }
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                        pre: ({ node, ...props }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm" {...props} />,
                        // Blockquotes
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-muted pl-4 italic my-4 text-muted-foreground" {...props} />,
                        // Horizontal rule
                        hr: ({ node, ...props }) => <hr className="my-6 border-border" {...props} />,
                        // Links
                        a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
                        // Images
                        img: ({ node, ...props }) => <img className="rounded-lg my-4 max-w-full h-auto" {...props} />,
                        // Strong and emphasis
                        strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                    }}>
                    {part.text || ''}
                </ReactMarkdown>
            </div>
        );
    }

    if (part.type === 'reasoning') {
        const is_reasoning_streaming = is_streaming && is_last_part;
        return (
            <Reasoning key={`${message_id}-reasoning-${part_index}`} isStreaming={is_reasoning_streaming} defaultOpen={is_reasoning_streaming}>
                <ReasoningTrigger />
                <ReasoningContent>{part.text || part.reasoning || ''}</ReasoningContent>
            </Reasoning>
        );
    }

    if (part.type.startsWith('tool-') || part.type === 'dynamic-tool') {
        const tool_name = getToolName(part);
        const has_output = part.state === 'output-available';
        const is_tool_streaming = has_output && part.preliminary === true;

        return (
            <Tool key={`${message_id}-tool-${part_index}`}>
                <ToolHeader type={part.type} state={part.state} toolName={tool_name} title={tool_name} />
                <ToolContent>
                    {part.input && <ToolInput input={part.input} />}
                    {part.output !== undefined && (
                        <div className="space-y-2">
                            {/* Render subagent output recursively if it's a UIMessage */}
                            {part.output?.parts ? (
                                <>
                                    {part.output.parts.map((nested_part: any, nested_index: number) => {
                                        const is_last_nested_part = nested_index === part.output.parts.length - 1;
                                        return renderMessagePart(nested_part, nested_index, `${message_id}-nested-${part_index}`, is_tool_streaming, is_last_nested_part);
                                    })}
                                </>
                            ) : (
                                <ToolOutput output={part.output} errorText={part.errorText} />
                            )}
                        </div>
                    )}
                </ToolContent>
            </Tool>
        );
    }

    return null;
};

// Component to watch input value and auto-submit after 3 seconds of no changes
// This must be inside PromptInputProvider to access the controller
const AutoSubmitWatcher = ({ sendMessage, is_streaming }: { sendMessage: (message: { text: string }) => Promise<void>; is_streaming: boolean }) => {
    const controller = usePromptInputController();
    const submit_timeout_ref = useRef<NodeJS.Timeout | null>(null);
    const input_value = controller.textInput.value;

    useEffect(() => {
        // Clear existing timeout
        if (submit_timeout_ref.current) {
            clearTimeout(submit_timeout_ref.current);
        }

        // If there's text, set timeout to auto-submit after 3s
        if (input_value.trim() && !is_streaming) {
            submit_timeout_ref.current = setTimeout(async () => {
                const current_text = controller.textInput.value;
                if (current_text.trim() && !is_streaming) {
                    await sendMessage({ text: current_text });
                    controller.textInput.setInput('');
                }
            }, 3000);
        }

        return () => {
            if (submit_timeout_ref.current) {
                clearTimeout(submit_timeout_ref.current);
            }
        };
    }, [input_value, is_streaming, sendMessage, controller]);

    return null;
};

interface MessageAudioData {
    audio?: {
        base64: string;
        mediaType: string;
    };
    transcription?: {
        text: string;
        segments: Array<{
            text: string;
            startSecond: number;
            endSecond: number;
        }>;
    };
}

// Helper function to get greeting message based on domain and brand name
const getGreetingMessage = (domain: string, brandName: string): MyUIMessage => {
    let greeting_text: string;
    
    if (domain === 'onapgo') {
        greeting_text = `Hi, I am your ONAPGO Concierge. Do you consent to our [Terms of Use](https://www.supernus.com/terms-of-use) and [Privacy Policy](https://www.supernus.com/privacy-policy)?`;
    } else {
        // Default to diabetrix greeting
        greeting_text = `Hi, I am Alex your Diabetrix Concierge. Do you consent to our terms and conditions and privacy policy?`;
    }

    return {
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        parts: [{ type: 'text', text: greeting_text }],
        metadata: {
            created_at: Date.now(),
            model: 'greeting',
        },
    };
};

export const VoiceChatStep: React.FC<VoiceChatStepProps> = ({ onClose }) => {
    const themeConfig = useThemeConfig();
    const domain = getDomain(themeConfig);
    const brandName = getBrandName(themeConfig);
    const api_url = `${BASE_URL()}/conversation/stream-message/v2`;

    const { messages, sendMessage, status, stop } = useChat<MyUIMessage>({
        transport: new DefaultChatTransport({
            api: api_url,
            headers: {
                domain,
            },
        }),
        messages: [getGreetingMessage(domain, brandName)],
    });

    const is_streaming = status === 'streaming' || status === 'submitted';

    // State for audio data per message
    const [message_audio_data, set_message_audio_data] = useState<Record<string, MessageAudioData>>({});
    const [audio_current_time, set_audio_current_time] = useState<Record<string, number>>({});
    const audio_refs = useRef<Record<string, HTMLAudioElement | null>>({});
    const auto_played_ref = useRef<Set<string>>(new Set());
    const [is_speech_enabled, set_is_speech_enabled] = useState(false);
    const speech_enabled_at_ref = useRef<number | null>(null);

    // WebSocket for real-time speech recognition
    const { connect, disconnect, send_audio_chunk, is_connected, set_on_transcript, set_on_error } = useSpeechWebSocket();

    // Track when speech was enabled to only generate speech for future messages
    useEffect(() => {
        if (is_speech_enabled && speech_enabled_at_ref.current === null) {
            // Record the timestamp when speech was first enabled
            speech_enabled_at_ref.current = Date.now();
        } else if (!is_speech_enabled) {
            // Reset when speech is disabled
            speech_enabled_at_ref.current = null;
        }
    }, [is_speech_enabled]);

    // Generate speech for assistant messages when they complete
    useEffect(() => {
        // Skip if speech is disabled
        if (!is_speech_enabled) {
            return;
        }

        const generate_speech_for_message = async (message_id: string, message_text: string) => {
            // Skip if already generated or if message is from user
            if (message_audio_data[message_id]?.audio) {
                return;
            }

            // Skip if text is too short or empty
            if (!message_text || message_text.trim().length < 10) {
                return;
            }

            try {
                const speech_result = await generateSpeech(message_text);
                set_message_audio_data((prev) => ({
                    ...prev,
                    [message_id]: {
                        ...prev[message_id],
                        audio: speech_result.audio,
                    },
                }));
            } catch (error) {
                console.error('Failed to generate speech:', error);
                // Don't show error toast for speech generation failures - it's optional
                // Speech generation is a nice-to-have feature, not critical
            }
        };

        // Find the last assistant message that doesn't have audio yet
        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if (message.role === 'assistant' && !is_streaming) {
                // Extract text from message parts
                const text_parts = message.parts?.filter((p: any) => p.type === 'text') || [];
                const full_text = text_parts
                    .map((p: any) => p.text || '')
                    .join(' ')
                    .trim();

                if (full_text && !message_audio_data[message.id]?.audio) {
                    // Only generate speech for messages created after speech was enabled
                    const message_created_at = message.metadata?.created_at;
                    const speech_enabled_at = speech_enabled_at_ref.current;

                    if (message_created_at && speech_enabled_at && message_created_at >= speech_enabled_at) {
                        generate_speech_for_message(message.id, full_text);
                        break; // Only generate for the most recent assistant message
                    }
                }
            }
        }
    }, [messages, is_streaming, message_audio_data, is_speech_enabled]);

    // Handle audio time updates for transcription sync
    useEffect(() => {
        const audio_elements = Object.values(audio_refs.current).filter(Boolean) as HTMLAudioElement[];

        const handle_time_update = (event: Event) => {
            const audio = event.target as HTMLAudioElement;
            const message_id = Object.keys(audio_refs.current).find((id) => audio_refs.current[id] === audio);
            if (message_id) {
                set_audio_current_time((prev) => ({
                    ...prev,
                    [message_id]: audio.currentTime,
                }));
            }
        };

        audio_elements.forEach((audio) => {
            audio.addEventListener('timeupdate', handle_time_update);
        });

        return () => {
            audio_elements.forEach((audio) => {
                audio.removeEventListener('timeupdate', handle_time_update);
            });
        };
    }, [message_audio_data]);

    // Auto-play audio when it becomes available
    useEffect(() => {
        // Skip if speech is disabled
        if (!is_speech_enabled) {
            return;
        }

        // Find the most recent assistant message with audio
        let most_recent_message_id: string | null = null;

        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if (message.role === 'assistant' && message_audio_data[message.id]?.audio) {
                most_recent_message_id = message.id;
                break;
            }
        }

        // Only auto-play if we have a message and it hasn't been auto-played yet
        if (most_recent_message_id && !auto_played_ref.current.has(most_recent_message_id)) {
            const audio = audio_refs.current[most_recent_message_id];

            if (audio) {
                // Audio element exists, try to play
                const attempt_play = async () => {
                    try {
                        // Check if audio is ready to play
                        if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                            await audio.play();
                            auto_played_ref.current.add(most_recent_message_id!);
                        } else {
                            // Wait for audio to be ready
                            const handle_canplay = async () => {
                                try {
                                    await audio.play();
                                    auto_played_ref.current.add(most_recent_message_id!);
                                } catch (error) {
                                    // Autoplay was prevented - this is expected in some browsers
                                    // User can still manually play the audio
                                    console.log('Autoplay prevented:', error);
                                }
                                audio.removeEventListener('canplaythrough', handle_canplay);
                            };
                            audio.addEventListener('canplaythrough', handle_canplay);
                        }
                    } catch (error) {
                        // Autoplay was prevented - this is expected in some browsers
                        // User can still manually play the audio
                        console.log('Autoplay prevented:', error);
                    }
                };

                attempt_play();
            }
        }

        // Clean up: remove auto-played api-status for messages that no longer exist
        const current_message_ids = new Set(messages.map((m) => m.id));
        auto_played_ref.current.forEach((message_id) => {
            if (!current_message_ids.has(message_id)) {
                auto_played_ref.current.delete(message_id);
            }
        });
    }, [message_audio_data, messages, is_speech_enabled]);

    const handle_submit = async (message: { text: string; files: any[] }) => {
        if (!message.text.trim() || is_streaming) return;

        await sendMessage({ text: message.text });
    };

    // Handle streaming transcript updates
    const handle_streaming_transcript = useCallback(
        (text: string, is_final: boolean) => {
            // Auto-submit on final result
            // Note: SpeechInput component handles updating the input field directly via PromptInputProvider
            if (is_final && text.trim() && !is_streaming) {
                sendMessage({ text: text.trim() });
            }
        },
        [is_streaming, sendMessage],
    );

    // Handle WebSocket errors
    const handle_websocket_error = useCallback((error: string) => {
        console.error('WebSocket error:', error);
        // Fallback to HTTP transcription is handled automatically
        // by the onAudioRecorded callback in SpeechInput
    }, []);

    // Set up WebSocket callbacks
    useEffect(() => {
        set_on_transcript(handle_streaming_transcript);
        set_on_error(handle_websocket_error);
    }, [set_on_transcript, set_on_error, handle_streaming_transcript, handle_websocket_error]);

    // Connect WebSocket on mount
    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    const handle_audio_recorded = async (audio_blob: Blob): Promise<string> => {
        try {
            console.log('audio_blob_received', audio_blob);
            if (!audio_blob || audio_blob.size === 0) {
                throw new Error('No audio data recorded');
            }

            const result = await transcribeAudio(audio_blob);

            if (!result.text || result.text.trim().length === 0) {
                throw new Error('No speech detected in audio');
            }

            return result.text;
        } catch (error) {
            console.error('Transcription error:', error);
            const error_message = error instanceof Error ? error.message : 'Failed to transcribe audio';

            if (error_message.includes('permission') || error_message.includes('microphone')) {
                toast.error('Microphone permission denied. Please enable microphone access and try again.');
            } else if (error_message.includes('No speech detected')) {
                toast.error('No speech detected. Please try speaking again.');
            } else {
                toast.error(`Transcription failed: ${error_message}`);
            }

            throw error;
        }
    };

    const handle_audio_seek = (message_id: string, time: number) => {
        try {
            const audio = audio_refs.current[message_id];
            if (audio && !isNaN(time) && time >= 0) {
                audio.currentTime = Math.min(time, audio.duration || 0);
            }
        } catch (error) {
            console.error('Error seeking audio:', error);
        }
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
                {/* Header with close button */}
                <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Voice Chat</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '20px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            color: '#666',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = '#f0f0f0')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'none')}>
                        ×
                    </button>
                </div>

                <Conversation className="flex-1 overflow-hidden">
                    <ConversationContent>
                        {messages.length === 0 ? (
                            <ConversationEmptyState title="Start a conversation" description="Send a message or use voice to begin chatting" />
                        ) : (
                            messages.map((message, message_index) => {
                                const is_last_message = message_index === messages.length - 1;
                                const is_message_streaming = is_streaming && is_last_message;
                                const audio_data = message_audio_data[message.id];
                                const current_time = audio_current_time[message.id] || 0;

                                return (
                                    <Message key={message.id} from={message.role}>
                                        <MessageContent>
                                            {message.parts?.map((part: any, part_index: number) => {
                                                const is_last_part = part_index === (message.parts?.length ?? 0) - 1;
                                                return renderMessagePart(part, part_index, message.id, is_message_streaming, is_last_part);
                                            })}

                                            {/* Audio Player and Transcription for Assistant Messages */}
                                            {message.role === 'assistant' && audio_data?.audio && (
                                                <div className="mt-4 space-y-3">
                                                    {/* Transcription */}
                                                    {audio_data.transcription?.segments && audio_data.transcription.segments.length > 0 && (
                                                        <Transcription segments={audio_data.transcription.segments} currentTime={current_time} onSeek={(time) => handle_audio_seek(message.id, time)}>
                                                            {(segment, index) => <TranscriptionSegment key={index} segment={segment} index={index} />}
                                                        </Transcription>
                                                    )}

                                                    {/* Audio Player */}
                                                    <AudioPlayer>
                                                        <AudioPlayerElement
                                                            src={`data:${audio_data.audio.mediaType};base64,${audio_data.audio.base64}`}
                                                            onLoadedMetadata={(e) => {
                                                                const audio = e.currentTarget;
                                                                audio_refs.current[message.id] = audio;
                                                            }}
                                                            onCanPlayThrough={async (e) => {
                                                                const audio = e.currentTarget;
                                                                const message_id = message.id;

                                                                // Only auto-play if this is the most recent assistant message
                                                                // and it hasn't been auto-played yet
                                                                const is_most_recent = message_index === messages.length - 1;
                                                                const is_assistant = message.role === 'assistant';
                                                                const not_auto_played = !auto_played_ref.current.has(message_id);

                                                                if (is_most_recent && is_assistant && not_auto_played) {
                                                                    try {
                                                                        await audio.play();
                                                                        auto_played_ref.current.add(message_id);
                                                                    } catch (error) {
                                                                        // Autoplay was prevented - this is expected in some browsers
                                                                        // User can still manually play the audio
                                                                        console.log('Autoplay prevented:', error);
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <AudioPlayerControlBar>
                                                            <AudioPlayerPlayButton />
                                                            <AudioPlayerSeekBackwardButton seekOffset={10} />
                                                            <AudioPlayerSeekForwardButton seekOffset={10} />
                                                            <AudioPlayerTimeDisplay />
                                                            <AudioPlayerTimeRange />
                                                            <AudioPlayerDurationDisplay />
                                                            <AudioPlayerMuteButton />
                                                            <AudioPlayerVolumeRange />
                                                        </AudioPlayerControlBar>
                                                    </AudioPlayer>
                                                </div>
                                            )}

                                            {/* Display metadata if available */}
                                            {message.metadata && message.metadata.created_at && (
                                                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                                                    <span>{new Date(message.metadata.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            )}
                                        </MessageContent>
                                    </Message>
                                );
                            })
                        )}
                        {is_streaming && messages.length > 0 && (
                            <Message from="assistant">
                                <MessageContent>
                                    <Shimmer>Thinking...</Shimmer>
                                </MessageContent>
                            </Message>
                        )}
                    </ConversationContent>
                    <ConversationScrollButton />
                </Conversation>

                <PromptInputProvider>
                    <AutoSubmitWatcher sendMessage={sendMessage} is_streaming={is_streaming} />
                    <div className="border-t bg-background p-4">
                        <PromptInput onSubmit={handle_submit}>
                            <PromptInputBody>
                                <PromptInputTextarea placeholder="What would you like to know?" />
                            </PromptInputBody>
                            <PromptInputFooter>
                                <div className="flex items-center gap-1">
                                    <SpeechInput onAudioRecorded={handle_audio_recorded} onStreamingTranscript={handle_streaming_transcript} sendAudioChunk={is_connected ? send_audio_chunk : undefined} lang="en-US" size="icon-sm" variant="ghost" />
                                    <Button size="icon-sm" variant="ghost" onClick={() => set_is_speech_enabled(!is_speech_enabled)} className={is_speech_enabled ? 'text-primary' : 'text-muted-foreground'} aria-label={is_speech_enabled ? 'Disable speech output' : 'Enable speech output'}>
                                        {is_speech_enabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                                    </Button>
                                </div>
                                <PromptInputSubmit status={status} onStop={stop} />
                            </PromptInputFooter>
                        </PromptInput>
                    </div>
                </PromptInputProvider>
            </div>
        </div>
    );
};
