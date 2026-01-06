import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import './../../styles/chat.css';

const MessageList = ({ messages, isTyping, children }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="message-list">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {children}
      {isTyping && (
        <div className="chat-message bot-message">
          <div className="message-content">
            <div className="message-sender">Lavalier</div>
            <div className="message-bubble">
              <TypingIndicator />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
