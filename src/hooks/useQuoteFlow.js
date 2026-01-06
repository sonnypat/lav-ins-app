import { useCallback, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import { QUESTIONS } from '../constants/questions';
import { useChat } from './useChat';
import { generateJewelryQuote } from '../services/socotraAPI';
import { getStateFromZip } from '../utils/zipToState';

export const useQuoteFlow = () => {
  const {
    flowState,
    setFlowState,
    updateUserData,
    userData,
    setQuoteResult,
    currentQuestion,
    setCurrentQuestion
  } = useChatContext();

  const { addBotMessage } = useChat();
  const processingRef = useRef(false);

  // Keep a ref to userData so we always have the latest value
  const userDataRef = useRef(userData);
  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  const getCurrentQuestion = useCallback(() => {
    if (flowState.currentStep >= QUESTIONS.length) {
      return null;
    }
    return QUESTIONS[flowState.currentStep];
  }, [flowState.currentStep]);

  const processNextStep = useCallback(async (stepIndex, latestUserData = null) => {
    if (processingRef.current) return;
    processingRef.current = true;

    // Use passed userData if available (to avoid race conditions), otherwise use ref
    const currentUserData = latestUserData || userDataRef.current;

    try {
      if (stepIndex >= QUESTIONS.length) {
        setFlowState(prev => ({ ...prev, isComplete: true, currentStep: stepIndex }));
        setCurrentQuestion(null);
        processingRef.current = false;
        return;
      }

      const nextQuestion = QUESTIONS[stepIndex];

      // Check if this question has a condition that isn't met
      if (nextQuestion.condition && !nextQuestion.condition(currentUserData)) {
        // Skip this question and move to the next one
        processingRef.current = false;
        processNextStep(stepIndex + 1, currentUserData);
        return;
      }

      setFlowState(prev => ({ ...prev, currentStep: stepIndex }));
      setCurrentQuestion(nextQuestion);

      // Handle bot messages (transitions, greetings, etc.)
      if (nextQuestion.type === 'bot_message') {
        const message = typeof nextQuestion.message === 'function'
          ? nextQuestion.message(currentUserData)
          : nextQuestion.message;

        await addBotMessage(message, 800);

        // If this is the quote generation trigger
        if (nextQuestion.triggerQuote) {
          setFlowState(prev => ({ ...prev, isLoading: true }));

          // Add a small delay to ensure all state updates have completed
          await new Promise(resolve => setTimeout(resolve, 200));

          try {
            // Use currentUserData which has the latest values
            console.log('📊 Generating quote with userData:', JSON.stringify(currentUserData, null, 2));
            const quote = await generateJewelryQuote(currentUserData);
            setQuoteResult(quote);
            setFlowState(prev => ({ ...prev, isLoading: false, isComplete: true }));

            // Add a follow-up message asking if they want to proceed
            await addBotMessage(
              "Your personalized quote is ready! Take a look at the details on the right. Would you like to proceed with purchasing this policy?",
              1000
            );
          } catch (error) {
            console.error('Error generating quote:', error);
            setFlowState(prev => ({ ...prev, isLoading: false, error: error.message }));
          }
        } else {
          // Move to next question automatically if it's just a message
          processingRef.current = false;
          setTimeout(() => processNextStep(stepIndex + 1, currentUserData), 100);
          return;
        }
      } else {
        // Display the question
        await addBotMessage(nextQuestion.question, 800);
      }

      processingRef.current = false;
    } catch (error) {
      console.error('Error processing step:', error);
      processingRef.current = false;
    }
  }, [addBotMessage, setFlowState, setCurrentQuestion, setQuoteResult]);

  const goToNextQuestion = useCallback(() => {
    const nextStep = flowState.currentStep + 1;
    processNextStep(nextStep);
  }, [flowState.currentStep, processNextStep]);

  const processAnswer = useCallback(async (answer) => {
    const question = getCurrentQuestion();
    if (!question || question.type === 'bot_message') return;

    // Compute the updated userData immediately to avoid race conditions
    let updatedUserData = { ...userDataRef.current };
    if (question.field) {
      const keys = question.field.split('.');

      // Handle nested array items (e.g., jewelry.items.0.type)
      if (keys.length === 4 && keys[1] === 'items') {
        const itemIndex = parseInt(keys[2]);
        const itemField = keys[3];
        const newItems = [...(updatedUserData[keys[0]]?.items || [])];
        while (newItems.length <= itemIndex) {
          newItems.push({});
        }
        newItems[itemIndex] = { ...newItems[itemIndex], [itemField]: answer };
        updatedUserData = {
          ...updatedUserData,
          [keys[0]]: { ...updatedUserData[keys[0]], items: newItems }
        };
      } else if (keys.length === 2) {
        // Handle simple nested fields (e.g., owner.zipCode)
        updatedUserData = {
          ...updatedUserData,
          [keys[0]]: { ...updatedUserData[keys[0]], [keys[1]]: answer }
        };

        // If this is a ZIP code, automatically determine and set the state
        if (keys[1] === 'zipCode') {
          const state = getStateFromZip(answer);
          if (state) {
            updatedUserData = {
              ...updatedUserData,
              [keys[0]]: { ...updatedUserData[keys[0]], state: state }
            };
            // Also update the state in the actual state
            updateUserData('owner.state', state);
          }
        }
      }

      // Also update the actual state
      updateUserData(question.field, answer);
    }

    // Move to next question with the computed userData (no race condition)
    const nextStep = flowState.currentStep + 1;
    setTimeout(() => {
      processNextStep(nextStep, updatedUserData);
    }, 50);
  }, [getCurrentQuestion, updateUserData, flowState.currentStep, processNextStep]);

  const startFlow = useCallback(() => {
    if (flowState.currentStep === 0 && QUESTIONS.length > 0) {
      processNextStep(0);
    }
  }, [flowState.currentStep, processNextStep]);

  return {
    currentQuestion: getCurrentQuestion(),
    processAnswer,
    goToNextQuestion,
    startFlow,
    isComplete: flowState.isComplete,
    isLoading: flowState.isLoading,
    error: flowState.error
  };
};
