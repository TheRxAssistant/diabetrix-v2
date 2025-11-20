// ChatFooter.tsx
import React from "react";
import "./chat-footer.scss";

interface ChatFooterProps {
  input_message: string;
  set_input_message: (message: string) => void;
  send_message: () => void;
  is_reconnecting: boolean;
}

const ChatFooter = ({
  input_message,
  set_input_message,
  send_message,
  is_reconnecting,
}: ChatFooterProps) => {
  return (
    <form
      className="message-input-form"
      onSubmit={(e) => {
        e.preventDefault();
        send_message();
      }}
    >
      <input
        type="text"
        value={input_message}
        onChange={(e) => set_input_message(e.target.value)}
        placeholder={"Message..."}
        className="message-input"
        disabled={is_reconnecting}
        aria-label="Message input"
      />
      <button
        type="submit"
        className="send-button"
        disabled={is_reconnecting || !input_message.trim()}
        aria-label="Send message"
      >
        <img
          src={"https://rxa-assets.s3.us-west-2.amazonaws.com/send.svg"}
          alt="Send"
        />
      </button>
    </form>
  );
};

export default ChatFooter;
