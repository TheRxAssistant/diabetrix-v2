import React from "react";
import avatar from "../../../assets/images/avatar.png";
import "./chat-button.scss";
import { useLocation } from "react-router-dom";

interface ChatButtonProps {
    toggle_chat: () => void;
    show_chat: boolean;
    new_url: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ toggle_chat, show_chat, new_url }) => {
    const location = useLocation();
    const isGoodRx = location?.pathname?.includes('goodrx');
    
    const buttonText = new_url.includes('hcp-resources') 
        ? 'Chat with Alex (HCP Support)'
        : 'Chat with Alex';

    return (
        <button 
            className={`chat-button ${isGoodRx ? 'goodrx-theme' : ''}`}
            onClick={toggle_chat} 
            style={{ display: show_chat ? "none" : "block" }} 
            aria-label={`Open chat with ${buttonText}`}
        >
            <div className="button-content">
                <div className="avatar-container-chat-button">
                    <img src={avatar} alt="" className="avatar" />
                    <div className="status-badge">
                        <span>LIVE</span>
                    </div>
                </div>
                <span className="button-text">{buttonText}</span>
            </div>
        </button>
    );
};

export default ChatButton;
