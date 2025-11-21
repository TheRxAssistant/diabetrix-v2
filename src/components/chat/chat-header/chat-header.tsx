import React from "react";
import avatar from "../../../assets/images/avatar.png";
import "./chat-header.scss";

interface ChatHeaderProps {
    onClose: () => void;
    chat_mode?: 'input' | 'mcq';
    on_mode_change?: (mode: 'input' | 'mcq') => void;
    show_input?: boolean;
    on_toggle_input?: (show: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, chat_mode = 'input', on_mode_change, show_input = true, on_toggle_input }) => {
    return (
        <div className="chat-header">
            <div className="concierge-info">
                <div className="avatar">
                    <img 
                        src={avatar}
                        alt="Alex - Diabetrix Concierge"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `data:image/svg+xml,${encodeURIComponent('<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#0066FF"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">A</text></svg>')}`;
                        }}
                    />
                </div>
                <div className="concierge-details">
                    <div className="concierge-name">
                        Alex
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#0066FF">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                    <div className="online-status">
                        Diabetrix Concierge
                    </div>
                </div>
            </div>
            <div className="chat-header-actions">
                {/* Chat Mode Toggle - Only show when input is visible */}
                {on_mode_change && show_input && (
                    <div className="chat-mode-toggle">
                        <span className={`toggle-label ${chat_mode === 'input' ? 'active' : ''}`}>Input</span>
                        <button
                            onClick={() => on_mode_change(chat_mode === 'input' ? 'mcq' : 'input')}
                            className={`toggle-switch ${chat_mode === 'mcq' ? 'active' : ''}`}
                            aria-label="Toggle chat mode"
                            type="button"
                        >
                            <span className="toggle-slider" />
                        </button>
                        <span className={`toggle-label ${chat_mode === 'mcq' ? 'active' : ''}`}>MCQ</span>
                    </div>
                )}
                {/* Hide/Show Input Toggle */}
                {on_toggle_input && (
                    <button 
                        className="input-toggle-button" 
                        onClick={() => on_toggle_input(!show_input)}
                        aria-label={show_input ? "Hide input" : "Show input"}
                        type="button"
                        title={show_input ? "Hide input" : "Show input"}
                    >
                        {show_input ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="6" width="20" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 14h12" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="6" width="20" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 14h12" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 2l20 20" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </button>
                )}
                <button className="close-button" onClick={onClose} aria-label="Close chat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
