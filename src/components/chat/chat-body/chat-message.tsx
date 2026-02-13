// ChatMessage.tsx
import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { MediaRenderer } from '../media-renderer';
import { isVideoUrl, isImageUrl, getYouTubeEmbedUrl, getVimeoEmbedUrl, extractUrls } from '../../../lib/media-utils';
import './chat-body.scss';

interface Message_Props {
    id: number;
    content: string;
    role: 'user' | 'assistant';
    buttons?: string[];
    timestamp: Date;
    is_multiselect?: boolean;
}

interface Chat_Message_Props {
    message: Message_Props;
    handle_button_click: (button_text: string) => void;
    chat_mode?: 'input' | 'mcq';
    show_input?: boolean;
    is_first_message?: boolean;
}

const ChatMessage: React.FC<Chat_Message_Props> = ({ message, handle_button_click, chat_mode = 'input', show_input = true, is_first_message = false }) => {
    const [isNew, setIsNew] = useState(true);
    const [selected_options, set_selected_options] = useState<string[]>([]);

    useEffect(() => {
        // Remove new message animation class after animation completes
        const timer = setTimeout(() => {
            setIsNew(false);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const handle_checkbox_change = (option: string) => {
        set_selected_options((prev) => {
            if (prev.includes(option)) {
                return prev.filter((item) => item !== option);
            } else {
                return [...prev, option];
            }
        });
    };

    const submit_selected_options = () => {
        if (selected_options.length > 0) {
            const selected_options_str = selected_options.join(',');
            handle_button_click(selected_options_str);
            set_selected_options([]);
        }
    };

    return (
        <div className={`message ${message.role === 'user' ? 'user-message' : 'system-message'} ${isNew ? 'new-message' : ''}`}>
            <div className="message-content">
                {message.role === 'assistant' ? (
                    <>
                        <MDEditor.Markdown
                            source={message.content}
                            components={{
                                a: (props: any) => {
                                    const url = props.href || '';
                                    // Check if it's a media URL
                                    if (isVideoUrl(url) || isImageUrl(url) || getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url)) {
                                        return <MediaRenderer key={url} url={url} />;
                                    }
                                    // Regular link
                                    return <a {...props} target="_blank" rel="noopener noreferrer" />;
                                },
                                h1: (props: any) => <h1 {...props} style={{ fontSize: 20, marginBottom: '0.5rem' }} />,
                                h2: (props: any) => <h2 {...props} style={{ fontSize: 18, marginBottom: '0.5rem' }} />,
                                h3: (props: any) => <h3 {...props} style={{ fontSize: 16, marginBottom: '0.5rem' }} />,
                                p: (props: any) => <p {...props} />,
                                ul: (props: any) => <ul {...props} style={{ paddingLeft: '1.2rem' }} />,
                                ol: (props: any) => <ol {...props} style={{ paddingLeft: '1.2rem' }} />,
                                li: (props: any) => <li {...props} style={{ marginBottom: '0.25rem', listStyleType: 'disc' }} />,
                            }}
                            className="md-content"
                        />
                        {/* Yes/No buttons for first AI message when input is enabled and not MCQ mode */}
                        {is_first_message && chat_mode === 'input' && show_input && (
                            <div className="yes-no-buttons-container">
                                <button className="yes-no-button yes-button" onClick={() => handle_button_click('Yes')}>
                                    Yes
                                </button>
                                <button className="yes-no-button no-button" onClick={() => handle_button_click('No')}>
                                    No
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: message.content }} />
                )}

                {/* {message.buttons && message.buttons.length > 0 && (
          <div className="message-buttons">
            {message.is_multiselect ? (
              <>
                <div className="checkbox-container">
                  {message.buttons.map((button, idx) => (
                    <label key={idx} className="option-checkbox">
                      <input
                        type="checkbox"
                        checked={selected_options.includes(button)}
                        onChange={() => handle_checkbox_change(button)}
                      />
                      {button}
                    </label>
                  ))}
                  <button
                    className="option-button"
                    onClick={submit_selected_options}
                    disabled={selected_options.length === 0}
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              message.buttons.map((button, idx) => (
                <button
                  key={idx}
                  className="option-button"
                  onClick={() => handle_button_click(button)}
                >
                  {button}
                </button>
              ))
            )}
          </div>
        )} */}
            </div>
        </div>
    );
};

export default ChatMessage;
