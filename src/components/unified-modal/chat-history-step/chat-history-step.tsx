import React, { useEffect, useState } from 'react';
import { useChat, ConversationThread } from '../../../services/chat/hooks-chat';
import { ArrowLeft, MessageSquare, Clock } from 'lucide-react';

interface ChatHistoryStepProps {
    onBack: () => void;
    onSelectThread: (conversation_id: string) => void;
}

const formatRelativeTime = (date_str?: string): string => {
    if (!date_str) return '';
    const date = new Date(date_str);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diff_ms = now.getTime() - date.getTime();
    const diff_min = Math.floor(diff_ms / 60000);
    if (diff_min < 1) return 'Just now';
    if (diff_min < 60) return `${diff_min}m ago`;
    const diff_hours = Math.floor(diff_min / 60);
    if (diff_hours < 24) return `${diff_hours}h ago`;
    const diff_days = Math.floor(diff_hours / 24);
    if (diff_days < 7) return `${diff_days}d ago`;
    return date.toLocaleDateString();
};

export const ChatHistoryStep: React.FC<ChatHistoryStepProps> = ({ onBack, onSelectThread }) => {
    const { getConversationList } = useChat();
    const [threads, set_threads] = useState<ConversationThread[]>([]);
    const [is_loading, set_is_loading] = useState(true);
    const [error, set_error] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            set_is_loading(true);
            set_error(null);
            try {
                const list = await getConversationList();
                set_threads(list);
            } catch {
                set_error('Failed to load conversations. Please try again.');
            } finally {
                set_is_loading(false);
            }
        };
        load();
    }, [getConversationList]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={onBack}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#0077cc', padding: '4px' }}>
                    <ArrowLeft size={20} />
                </button>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Chat History</h3>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {is_loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', color: '#999' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: '#0077cc',
                                        animation: 'pulse 1s infinite',
                                        animationDelay: `${i * 0.2}s`,
                                    }}
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: '14px' }}>Loading conversations…</span>
                    </div>
                )}

                {!is_loading && error && (
                    <div style={{ padding: '16px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', color: '#856404', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                {!is_loading && !error && threads.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', color: '#999' }}>
                        <MessageSquare size={40} strokeWidth={1.5} />
                        <p style={{ margin: 0, fontSize: '14px', textAlign: 'center' }}>No previous conversations yet.<br />Start a new chat with Alex!</p>
                    </div>
                )}

                {!is_loading && !error && threads.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {threads.map((thread) => (
                            <button
                                key={thread.conversation_id}
                                onClick={() => onSelectThread(thread.conversation_id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    width: '100%',
                                    padding: '12px 14px',
                                    background: '#f9f9f9',
                                    border: '1px solid #eee',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background 0.15s',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                                onMouseOut={(e) => (e.currentTarget.style.background = '#f9f9f9')}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#111', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                                        {thread.title || 'Conversation with Alex'}
                                    </span>
                                    {(thread.updated_at || thread.created_at) && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#999', flexShrink: 0 }}>
                                            <Clock size={11} />
                                            {formatRelativeTime(thread.updated_at || thread.created_at)}
                                        </span>
                                    )}
                                </div>
                                {thread.thread_summary_text && (
                                    <span style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                        {thread.thread_summary_text}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
