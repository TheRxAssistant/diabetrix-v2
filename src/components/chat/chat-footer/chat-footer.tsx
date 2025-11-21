// ChatFooter.tsx
import React from "react";
import "./chat-footer.scss";

interface ChatFooterProps {
  input_message: string;
  set_input_message: (message: string) => void;
  send_message: () => void;
  is_reconnecting: boolean;
  chat_mode?: 'input' | 'mcq';
  on_search?: (search_text: string) => void;
}

const ChatFooter = ({
  input_message,
  set_input_message,
  send_message,
  is_reconnecting,
  chat_mode = 'input',
  on_search,
}: ChatFooterProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chat_mode === 'mcq' && on_search && input_message.trim()) {
      // In MCQ mode, trigger search instead of sending message
      on_search(input_message.trim());
    } else if (input_message.trim()) {
      // In input mode, send message normally
      send_message();
    }
  };

  // Search icon SVG
  const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.35-4.35"></path>
    </svg>
  );

  return (
    <form
      className="message-input-form"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        value={input_message}
        onChange={(e) => set_input_message(e.target.value)}
        placeholder={chat_mode === 'mcq' ? 'Search for questions...' : 'Message...'}
        className="message-input"
        disabled={is_reconnecting}
        aria-label={chat_mode === 'mcq' ? 'Search input' : 'Message input'}
      />
      <button
        type="submit"
        className={`send-button ${chat_mode === 'mcq' ? 'search-button' : ''}`}
        disabled={is_reconnecting || !input_message.trim()}
        aria-label={chat_mode === 'mcq' ? 'Search' : 'Send message'}
      >
        {chat_mode === 'mcq' ? (
          <SearchIcon />
        ) : (
          <img
            src={"https://rxa-assets.s3.us-west-2.amazonaws.com/send.svg"}
            alt="Send"
          />
        )}
      </button>
    </form>
  );
};

export default ChatFooter;
