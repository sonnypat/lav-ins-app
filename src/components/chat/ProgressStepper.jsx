import { useChatContext } from '../../context/ChatContext';
import { QUESTIONS } from '../../constants/questions';
import './../../styles/progress-stepper.css';

const ProgressStepper = () => {
  const { flowState, userData } = useChatContext();

  // Define the main steps (excluding conditional questions)
  const steps = [
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'items', label: 'Items', icon: '💎' },
    { id: 'details', label: 'Details', icon: '📋' },
    { id: 'quote', label: 'Quote', icon: '✨' }
  ];

  // Calculate current step based on flow state
  const getCurrentStepIndex = () => {
    const currentQuestion = QUESTIONS[flowState.currentStep];
    if (!currentQuestion) return steps.length - 1;

    const questionId = currentQuestion.id;

    if (questionId === 'welcome' || questionId === 'zip_code') return 0;
    if (questionId === 'has_multiple_items') return 1;
    if (questionId.includes('item') && questionId.includes('type')) return 1;
    if (questionId.includes('item') && questionId.includes('value')) return 2;
    if (questionId === 'has_more_items') return 2;
    if (questionId === 'summary' || flowState.isComplete) return 3;

    return 0;
  };

  const currentStepIndex = getCurrentStepIndex();
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="progress-stepper">
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="steps-container">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step ${index <= currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
          >
            <div className="step-icon">
              {index < currentStepIndex ? '✓' : step.icon}
            </div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStepper;
