import { QUESTION_TYPES } from '../../constants/messageTypes';
import { TEST_MODE } from '../../constants/questions';
import { validators } from '../../services/validators';
import { useChatContext } from '../../context/ChatContext';
import TextInput from '../forms/TextInput';
import NumberInput from '../forms/NumberInput';
import SelectInput from '../forms/SelectInput';
import QuickReplyButtons from '../forms/QuickReplyButtons';
import JewelryTypeCards from '../forms/JewelryTypeCards';
import ValueSlider from '../forms/ValueSlider';
import ImageUpload from '../forms/ImageUpload';
import CoverageComparison from './CoverageComparison';
import { useChat } from '../../hooks/useChat';
import { useQuoteFlow } from '../../hooks/useQuoteFlow';

const ChatInput = ({ showRichMedia = null }) => {
  const { addUserMessage } = useChat();
  const { userData } = useChatContext();
  const { currentQuestion, processAnswer, isComplete, isLoading } = useQuoteFlow();

  if (isComplete || isLoading || !currentQuestion || currentQuestion.skipInput || currentQuestion.type === 'bot_message') {
    return null;
  }

  // Check if this is a rich media question
  const isJewelryTypeQuestion = currentQuestion.id?.includes('item') &&
                                 currentQuestion.id?.includes('type') &&
                                 currentQuestion.inputType === 'select';
  const isValueQuestion = currentQuestion.id?.includes('value') &&
                          currentQuestion.inputType === 'number';
  const isCoverageQuestion = currentQuestion?.inputType === 'coverage_comparison' &&
                              currentQuestion?.id === 'coverage_tier';
  const isRichMediaQuestion = isJewelryTypeQuestion || isValueQuestion || isCoverageQuestion;

  // If showRichMedia is specified, only render if it matches
  if (showRichMedia === true && !isRichMediaQuestion) {
    return null;
  }
  if (showRichMedia === false && isRichMediaQuestion) {
    return null;
  }

  const handleSubmit = async (value) => {
    // Add user's answer to chat
    let displayValue = value;

    // Special handling for different input types
    if (currentQuestion.inputType === 'coverage_comparison') {
      displayValue = `${value.charAt(0).toUpperCase() + value.slice(1)} Coverage`;
    } else if (currentQuestion.inputType === 'image_upload') {
      displayValue = value ? 'Photo uploaded' : 'Skipped photo upload';
    } else if (currentQuestion.type === QUESTION_TYPES.SELECT && currentQuestion.options) {
      const selectedOption = currentQuestion.options.find(opt => opt.value === value);
      displayValue = selectedOption ? selectedOption.label : value;
    } else if (currentQuestion.type === QUESTION_TYPES.QUICK_REPLY) {
      const selectedOption = currentQuestion.options.find(opt => opt.value === value);
      displayValue = selectedOption ? selectedOption.label : value.toString();
    }

    addUserMessage(displayValue);

    // Process the answer
    await processAnswer(value);
  };

  const renderRichMediaInput = () => {
    const defaultValue = TEST_MODE && currentQuestion.testValue ? currentQuestion.testValue : undefined;
    const validationFn = currentQuestion.validator ? validators[currentQuestion.validator] : null;

    if (isJewelryTypeQuestion) {
      return (
        <JewelryTypeCards
          onSubmit={handleSubmit}
          defaultValue={defaultValue}
        />
      );
    }

    if (isValueQuestion) {
      return (
        <ValueSlider
          onSubmit={handleSubmit}
          defaultValue={defaultValue}
          validation={validationFn}
        />
      );
    }

    if (isCoverageQuestion) {
      const items = userData.jewelry?.items || [];
      const totalValue = items.reduce((sum, item) => sum + (item?.value || 0), 0);

      return (
        <CoverageComparison
          key="coverage-tier-selector"
          totalValue={totalValue}
          onSelect={handleSubmit}
        />
      );
    }

    return null;
  };

  const renderSimpleInput = () => {
    const defaultValue = TEST_MODE && currentQuestion.testValue ? currentQuestion.testValue : undefined;
    const validationFn = currentQuestion.validator ? validators[currentQuestion.validator] : null;

    // Handle image upload
    if (currentQuestion.inputType === 'image_upload') {
      return (
        <ImageUpload
          onUpload={handleSubmit}
          onSkip={() => handleSubmit(null)}
        />
      );
    }

    switch (currentQuestion.inputType) {
      case 'text':
        return (
          <TextInput
            placeholder={currentQuestion.placeholder || 'Enter your answer...'}
            onSubmit={handleSubmit}
            validation={validationFn}
            defaultValue={defaultValue}
          />
        );

      case 'number':
        return (
          <NumberInput
            placeholder={currentQuestion.placeholder || 'Enter amount...'}
            onSubmit={handleSubmit}
            validation={validationFn}
            min={currentQuestion.min}
            max={currentQuestion.max}
            defaultValue={defaultValue}
          />
        );

      case 'select':
        const selectOptions = currentQuestion.options.map(opt =>
          typeof opt === 'string' ? { value: opt, label: opt } : opt
        );
        return (
          <SelectInput
            options={selectOptions}
            onSubmit={handleSubmit}
            validation={validationFn}
            defaultValue={defaultValue}
          />
        );

      case 'quick_reply':
        return (
          <QuickReplyButtons
            options={currentQuestion.options}
            onSubmit={handleSubmit}
          />
        );

      default:
        return null;
    }
  };

  // If showing in rich media panel
  if (showRichMedia === true) {
    return (
      <div className="rich-media-content" key={currentQuestion.id}>
        <div className="rich-media-header">
          <h3>{currentQuestion.question}</h3>
        </div>
        {renderRichMediaInput()}
      </div>
    );
  }

  // If showing in chat input area when showRichMedia=false
  // Only render simple inputs (rich media goes to the panel)
  if (showRichMedia === false) {
    // Rich media questions are handled by the right panel
    if (isRichMediaQuestion) {
      return null;
    }
    // Render simple inputs in the chat area
    return (
      <div className="chat-input-container" key={currentQuestion.id}>
        {renderSimpleInput()}
      </div>
    );
  }

  // Default behavior (no showRichMedia prop) - render everything in chat input
  return (
    <div className="chat-input-container" key={currentQuestion.id}>
      {isRichMediaQuestion ? renderRichMediaInput() : renderSimpleInput()}
    </div>
  );
};

export default ChatInput;
