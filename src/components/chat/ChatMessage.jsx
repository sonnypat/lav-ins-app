import { MESSAGE_TYPES } from '../../constants/messageTypes';
import './../../styles/chat.css';

const ChatMessage = ({ message }) => {
  const isBot = message.type === MESSAGE_TYPES.BOT;

  return (
    <div className={`chat-message ${isBot ? 'bot-message' : 'user-message'}`}>
      {isBot && (
        <div className="message-avatar">
          <div className="avatar-emoji">💎</div>
        </div>
      )}
      <div className="message-content">
        {isBot && <div className="message-sender">Lavalier</div>}
        <div className="message-bubble">
          {typeof message.content === 'string' ? (
            message.content.split('\n').map((line, index) => (
              <span key={index}>
                {line}
                {index < message.content.split('\n').length - 1 && <br />}
              </span>
            ))
          ) : (
            message.content
          )}
        </div>
        <div className="message-timestamp">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
