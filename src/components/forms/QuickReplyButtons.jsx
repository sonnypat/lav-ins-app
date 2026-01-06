import './../../styles/forms.css';

const QuickReplyButtons = ({ options, onSubmit }) => {
  const handleClick = (value) => {
    onSubmit(value);
  };

  return (
    <div className="quick-reply-buttons">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleClick(option.value)}
          className="quick-reply-button"
        >
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickReplyButtons;
