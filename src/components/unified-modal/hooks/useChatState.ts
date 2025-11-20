import { useState, useCallback } from 'react';

export const useChatState = () => {
  const [chatResetKey, setChatResetKey] = useState<number>(0);
  const [isChatActive, setIsChatActive] = useState<boolean>(false);
  const [pendingMessages, setPendingMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLearnFlow, setIsLearnFlow] = useState<boolean>(false);
  const [showQuickReplies, setShowQuickReplies] = useState<boolean>(false);
  const [currentQuickReplies, setCurrentQuickReplies] = useState<string[]>([]);
  const [lastLearnTopic, setLastLearnTopic] = useState<string>('');
  const [usedQuickReplies, setUsedQuickReplies] = useState<string[]>([]);
  const [showLearnOverlay, setShowLearnOverlay] = useState<boolean>(false);

  const resetChat = useCallback(() => {
    setChatResetKey((k) => k + 1);
    setPendingMessages([]);
    setInputMessage('');
    setShowQuickReplies(false);
    setCurrentQuickReplies([]);
    setUsedQuickReplies([]);
  }, []);

  return {
    chatResetKey,
    setChatResetKey,
    isChatActive,
    setIsChatActive,
    pendingMessages,
    setPendingMessages,
    inputMessage,
    setInputMessage,
    isLearnFlow,
    setIsLearnFlow,
    showQuickReplies,
    setShowQuickReplies,
    currentQuickReplies,
    setCurrentQuickReplies,
    lastLearnTopic,
    setLastLearnTopic,
    usedQuickReplies,
    setUsedQuickReplies,
    showLearnOverlay,
    setShowLearnOverlay,
    resetChat,
  };
};

