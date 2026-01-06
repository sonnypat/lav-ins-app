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

const ChatInput = () => {
  const { addUserMessage } = useChat();
  const { userData } = useChatContext();
  const { currentQuestion, processAnswer, isComplete, isLoading } = useQuoteFlow();

  if (isComplete || isLoading || !currentQuestion || currentQuestion.skipInput || currentQuestion.type === 'bot_message') {
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

  const renderInput = () => {
    // In test mode, pass the testValue as defaultValue
    const defaultValue = TEST_MODE && currentQuestion.testValue ? currentQuestion.testValue : undefined;

    // Get the validation function from the validators object
    const validationFn = currentQuestion.validator ? validators[currentQuestion.validator] : null;

    // Check if this is a jewelry type question - use rich cards instead
    const isJewelryTypeQuestion = currentQuestion.id?.includes('item') &&
                                   currentQuestion.id?.includes('type') &&
                                   currentQuestion.inputType === 'select';

    // Check if this is a value question - use slider instead
    const isValueQuestion = currentQuestion.id?.includes('value') &&
                            currentQuestion.inputType === 'number';

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

    // Handle image upload
    if (currentQuestion.inputType === 'image_upload') {
      return (
        <ImageUpload
          onUpload={handleSubmit}
          onSkip={() => handleSubmit(null)}
        />
      );
    }

    // Handle coverage comparison
    if (currentQuestion.inputType === 'coverage_comparison') {
      const items = userData.jewelry?.items || [];
      const totalValue = items.reduce((sum, item) => sum + (item?.value || 0), 0);

      return (
        <CoverageComparison
          totalValue={totalValue}
          onSelect={handleSubmit}
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
        // Convert string array to {value, label} format if needed
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

  return (
    <div className="chat-input-container">
      {renderInput()}
    </div>
  );
};

export default ChatInput;
