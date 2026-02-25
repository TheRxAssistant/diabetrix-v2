import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaSpinner, FaRobot, FaUser, FaHeadset, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { useEscalatedChat, EscalatedMessage } from '../../services/crm/hooks-escalated-chat';
import { ApprovedRequest } from '../../services/crm/types-approved-requests';
import { postAPI, CAPABILITIES_API_URLS } from '../../services/api';
import { useThemeConfig } from '../../hooks/useThemeConfig';
import { getDomain } from '../../config/theme-config';

const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const getPhoneNumber = (request: ApprovedRequest): string =>
    request.request_json?.user_phone_number || request.user_phone || 'N/A';

const getUserName = (request: ApprovedRequest): string =>
    request.user_name || 'Anonymous User';

const getEscalationReason = (request: ApprovedRequest): string =>
    request.request_json?.escalation_reason || 'No reason provided';

// ─── Request List Card ───────────────────────────────────────────────────────

interface RequestCardProps {
    request: ApprovedRequest;
    is_selected: boolean;
    onClick: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, is_selected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors hover:bg-gray-50 focus:outline-none ${
            is_selected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
        }`}
    >
        <div className="flex items-start justify-between gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900 truncate max-w-[160px]">{getUserName(request)}</span>
            <span className="text-xs text-gray-400 shrink-0">{formatTime(request.created_at)}</span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2 mb-1">{request.request_details}</p>
        <div className="flex items-center gap-1.5">
            <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${
                    request.request_status_name === 'Requested'
                        ? 'border-orange-300 text-orange-600 bg-orange-50'
                        : 'border-green-300 text-green-600 bg-green-50'
                }`}
            >
                {request.request_status_name}
            </Badge>
            <span className="text-[10px] text-gray-400">{getPhoneNumber(request)}</span>
        </div>
    </button>
);

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

interface ChatBubbleProps {
    msg: EscalatedMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ msg }) => {
    if (msg.role === 'user') {
        return (
            <div className="flex items-end justify-end gap-2 mb-3">
                <div className="max-w-[70%]">
                    <div className="bg-blue-500 text-white text-sm px-3 py-2 rounded-2xl rounded-br-sm shadow-sm">
                        {msg.message}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 text-right">{formatTime(msg.created_at)}</p>
                </div>
                <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        <FaUser className="w-3 h-3" />
                    </AvatarFallback>
                </Avatar>
            </div>
        );
    }

    if (msg.role === 'ai') {
        return (
            <div className="flex items-end gap-2 mb-3">
                <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className="bg-gray-100 text-gray-500 text-xs">
                        <FaRobot className="w-3 h-3" />
                    </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%]">
                    <div className="bg-gray-100 text-gray-800 text-sm px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                        {msg.message}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatTime(msg.created_at)}</p>
                </div>
            </div>
        );
    }

    // crm_agent
    return (
        <div className="flex items-end justify-end gap-2 mb-3">
            <div className="max-w-[70%]">
                <div className="bg-teal-50 border border-teal-200 text-teal-900 text-sm px-3 py-2 rounded-2xl rounded-br-sm shadow-sm">
                    {msg.message}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                    {msg.created_by_name || 'Agent'} · {formatTime(msg.created_at)}
                </p>
            </div>
            <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="bg-teal-100 text-teal-600 text-xs">
                    <FaHeadset className="w-3 h-3" />
                </AvatarFallback>
            </Avatar>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EscalatedRequests() {
    const themeConfig = useThemeConfig();
    const [search_text, set_search_text] = useState('');
    const [reply_text, set_reply_text] = useState('');
    const [send_error, set_send_error] = useState<string | null>(null);
    const [is_resolving, set_is_resolving] = useState(false);
    const messages_bottom_ref = useRef<HTMLDivElement>(null);

    const {
        escalated_requests,
        selected_request,
        messages,
        is_loading_requests,
        is_loading_messages,
        is_sending,
        requests_error,
        messages_error,
        fetch_escalated_requests,
        send_crm_reply,
        select_request,
        stop_polling,
    } = useEscalatedChat();

    useEffect(() => {
        fetch_escalated_requests();
        return () => stop_polling();
    }, [fetch_escalated_requests, stop_polling]);

    // Auto-scroll to latest message
    useEffect(() => {
        messages_bottom_ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filtered_requests = escalated_requests.filter((r) => {
        if (!search_text) return true;
        const q = search_text.toLowerCase();
        return (
            r.request_details.toLowerCase().includes(q) ||
            r.request_name.toLowerCase().includes(q) ||
            (r.user_name && r.user_name.toLowerCase().includes(q)) ||
            getPhoneNumber(r).includes(search_text)
        );
    });

    const handleSendReply = useCallback(async () => {
        if (!selected_request || !reply_text.trim() || is_sending) return;
        set_send_error(null);
        const success = await send_crm_reply(selected_request.request_id, reply_text.trim());
        if (success) {
            set_reply_text('');
        } else {
            set_send_error('Failed to send message. Please try again.');
        }
    }, [selected_request, reply_text, is_sending, send_crm_reply]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSendReply();
        }
    };

    const handleMarkResolved = async () => {
        if (!selected_request) return;
        set_is_resolving(true);
        try {
            await postAPI(CAPABILITIES_API_URLS.SYNC_APPROVED_REQUEST, {
                request_id: selected_request.request_id,
                request_status: 2,
                is_assigned_to_human: false,
            });
            await fetch_escalated_requests();
            stop_polling();
        } catch {
            // silently ignore — reload will reflect the current state
        } finally {
            set_is_resolving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* ── Left Panel: Request List ──────────────────────────── */}
                <div className="w-[340px] shrink-0 flex flex-col border-r border-gray-200 bg-white">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <FaHeadset className="text-blue-500 text-lg" />
                            <h2 className="text-base font-semibold text-gray-900">User Support</h2>
                            <span className="ml-auto text-xs font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                {filtered_requests.length}
                            </span>
                        </div>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                            <input
                                type="text"
                                placeholder="Search requests..."
                                value={search_text}
                                onChange={(e) => set_search_text(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <ScrollArea className="flex-1">
                        {is_loading_requests ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <FaSpinner className="animate-spin text-2xl mb-2 text-blue-400" />
                                <span className="text-sm">Loading...</span>
                            </div>
                        ) : requests_error ? (
                            <div className="px-4 py-6 text-center text-sm text-red-500">{requests_error}</div>
                        ) : filtered_requests.length === 0 ? (
                            <div className="px-4 py-12 text-center text-sm text-gray-400">No user queries found</div>
                        ) : (
                            filtered_requests.map((req) => (
                                <RequestCard
                                    key={req.request_id}
                                    request={req}
                                    is_selected={selected_request?.request_id === req.request_id}
                                    onClick={() => select_request(req)}
                                />
                            ))
                        )}
                    </ScrollArea>
                </div>

                {/* ── Right Panel: Chat Window ───────────────────────────── */}
                {selected_request ? (
                    <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
                        {/* Chat Header */}
                        <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="w-9 h-9 shrink-0">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                                        {getUserName(selected_request).charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 truncate">{getUserName(selected_request)}</p>
                                    <p className="text-xs text-gray-500">{getPhoneNumber(selected_request)}</p>
                                </div>
                                <Separator orientation="vertical" className="h-8 mx-1" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Escalation Reason</p>
                                    <p className="text-xs text-gray-700 truncate max-w-[280px]">{getEscalationReason(selected_request)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                        selected_request.request_status_name === 'Requested'
                                            ? 'border-orange-300 text-orange-600 bg-orange-50'
                                            : 'border-green-300 text-green-600 bg-green-50'
                                    }`}
                                >
                                    {selected_request.request_status_name}
                                </Badge>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs gap-1.5 border-green-300 text-green-700 hover:bg-green-50"
                                    onClick={handleMarkResolved}
                                    disabled={is_resolving}
                                >
                                    {is_resolving ? (
                                        <FaSpinner className="animate-spin w-3 h-3" />
                                    ) : (
                                        <FaCheckCircle className="w-3 h-3" />
                                    )}
                                    Mark Resolved
                                </Button>
                            </div>
                        </div>

                        {/* Original Query Banner */}
                        <div className="mx-5 mt-4 mb-2 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-[10px] text-orange-500 uppercase tracking-wide font-medium mb-0.5">Original Query</p>
                            <p className="text-sm text-orange-900">{selected_request.request_details}</p>
                            <p className="text-[10px] text-orange-400 mt-1">{formatDate(selected_request.created_at)}</p>
                        </div>

                        {/* Messages Thread */}
                        <ScrollArea className="flex-1 px-5 py-2">
                            {is_loading_messages ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                    <FaSpinner className="animate-spin text-2xl mb-2 text-blue-400" />
                                    <span className="text-sm">Loading messages...</span>
                                </div>
                            ) : messages_error ? (
                                <div className="text-center py-8 text-sm text-red-500">{messages_error}</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-12 text-sm text-gray-400">
                                    No conversation history found. Send a message to start the conversation.
                                </div>
                            ) : (
                                messages.map((msg) => <ChatBubble key={msg.message_id} msg={msg} />)
                            )}
                            <div ref={messages_bottom_ref} />
                        </ScrollArea>

                        {/* Reply Input */}
                        <div className="px-5 py-3 bg-white border-t border-gray-200">
                            {send_error && (
                                <p className="text-xs text-red-500 mb-1.5">{send_error}</p>
                            )}
                            <div className="flex items-end gap-2">
                                <Textarea
                                    placeholder="Type a message and press Cmd+Enter to send…"
                                    value={reply_text}
                                    onChange={(e) => set_reply_text(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={2}
                                    className="resize-none text-sm flex-1"
                                    disabled={is_sending}
                                />
                                <Button
                                    onClick={handleSendReply}
                                    disabled={!reply_text.trim() || is_sending}
                                    className="shrink-0 gap-1.5 h-[56px] px-4 bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    {is_sending ? (
                                        <FaSpinner className="animate-spin w-4 h-4" />
                                    ) : (
                                        <FaPaperPlane className="w-4 h-4" />
                                    )}
                                    <span className="text-xs">Send</span>
                                </Button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Replies are sent via SMS · ⌘+Enter to send</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <FaHeadset className="text-5xl mb-4 opacity-20" />
                        <p className="text-sm font-medium">Select a request to view the conversation</p>
                        <p className="text-xs mt-1 opacity-70">User queries escalated by the AI assistant will appear here</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
