'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  corrected?: string;
  hasError?: boolean;
  isNextButton?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 상황별 영어 질문들
  const englishQuestions = [
    "What did you do yesterday?",
    "How was your weekend?",
    "What are your plans for today?",
    "Tell me about your favorite hobby.",
    "What did you eat for breakfast?",
    "How do you usually spend your free time?",
    "What's the weather like today?",
    "What did you learn recently?",
    "Describe your daily routine.",
    "What makes you happy?",
  ];

  // 샘플 답변 문장들 (문법 오류 포함)
  const sampleSentences = [
    "i am go to school",
    "she dont like coffee",
    "he was go yesterday",
    "they is happy",
    "i have a apple",
    "yesterday i go to park",
    "she want to learn english",
    "he dont know the answer",
    "we was at home",
    "it make me happy",
  ];

  const handleMicClick = async () => {
    // 랜덤 질문 선택
    const randomQuestion = englishQuestions[Math.floor(Math.random() * englishQuestions.length)];
    
    // 봇 질문 메시지 추가
    const questionMessage: Message = {
      id: Date.now().toString(),
      text: randomQuestion,
      isUser: false,
    };
    setMessages((prev) => [...prev, questionMessage]);
    
    // 잠시 후 샘플 답변 자동 입력 및 전송
    setTimeout(() => {
      const randomSentence = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
      setInputText(randomSentence);
      
      // 자동으로 전송
      setTimeout(() => {
        handleAutoSubmit(randomSentence);
      }, 500);
    }, 800);
  };

  const handleAutoSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userMessage.text }),
      });

      const data = await response.json();

      if (response.ok) {
        // 사용자 메시지에 교정 정보 추가
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, corrected: data.corrected, hasError: data.hasError }
              : msg
          )
        );

        // 교정 완료 후 Next 버튼 추가
        const nextButtonMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Next!',
          isUser: false,
          isNextButton: true,
        };
        setMessages((prev) => [...prev, nextButtonMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'An error occurred during correction.',
          isUser: false,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'An error occurred during correction.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userMessage.text }),
      });

      const data = await response.json();

      if (response.ok) {
        // 사용자 메시지에 교정 정보 추가
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, corrected: data.corrected, hasError: data.hasError }
              : msg
          )
        );

        // 교정 완료 후 Next 버튼 추가
        const nextButtonMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Next!',
          isUser: false,
          isNextButton: true,
        };
        setMessages((prev) => [...prev, nextButtonMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'An error occurred during correction.',
          isUser: false,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'An error occurred during correction.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 별 애니메이션 생성
    if (nextButtonRef.current) {
      const rect = nextButtonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const newStars = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100,
      }));
      
      setStars(newStars);
      
      // 애니메이션 후 별 제거
      setTimeout(() => {
        setStars([]);
      }, 1000);
    }
    
    // 랜덤 질문 선택
    const randomQuestion = englishQuestions[Math.floor(Math.random() * englishQuestions.length)];
    
    // 봇 질문 메시지 추가
    const questionMessage: Message = {
      id: Date.now().toString(),
      text: randomQuestion,
      isUser: false,
    };
    setMessages((prev) => [...prev, questionMessage]);
    
    // 잠시 후 샘플 답변 자동 입력 및 전송
    setTimeout(() => {
      const randomSentence = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
      setInputText(randomSentence);
      
      // 자동으로 전송
      setTimeout(() => {
        handleAutoSubmit(randomSentence);
      }, 500);
    }, 800);
  };

  const toggleCorrection = (messageId: string) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-fuchsia-100">
      {/* Header - Fixed */}
      <header className="bg-gradient-to-r from-purple-50/90 via-pink-50/90 to-fuchsia-50/90 backdrop-blur-sm border-b border-purple-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">English Conversation </h1>
        <p className="text-base text-gray-700 font-medium">Let's talk with SELENA! </p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 relative">
        {/* 별 애니메이션 */}
        {stars.map((star, index) => {
          const angle = (index / stars.length) * Math.PI * 2;
          const distance = 60 + Math.random() * 40;
          const randomX = Math.cos(angle) * distance;
          const randomY = Math.sin(angle) * distance;
          const starEmojis = ['⭐', '✨', '🌟', '💫'];
          const randomStar = starEmojis[Math.floor(Math.random() * starEmojis.length)];
          
          return (
            <div
              key={star.id}
              className="fixed pointer-events-none z-50"
              style={{
                left: `${star.x}px`,
                top: `${star.y}px`,
                animation: 'starBurst 1s ease-out forwards',
                '--random-x': `${randomX}px`,
                '--random-y': `${randomY}px`,
              } as React.CSSProperties}
            >
              <span className="text-xl star-emoji">
                {randomStar}
              </span>
            </div>
          );
        })}
        {messages.map((message) => {
          // Next 버튼은 별도로 렌더링
          if (message.isNextButton) {
            return null;
          }
          
          return (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? 'bg-magenta-500 text-white cursor-pointer hover:bg-magenta-600 transition-colors'
                    : 'bg-gray-100 text-gray-900'
                }`}
                onClick={() => message.isUser && message.hasError && toggleCorrection(message.id)}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                
                {message.isUser && message.hasError && (
                  <div className="mt-2 text-xs opacity-90">
                    {expandedMessageId === message.id ? (
                      <div className="bg-white/20 rounded-lg p-2 mt-2">
                        <p className="font-semibold mb-1">Corrected:</p>
                        <p className="font-mono">{message.corrected}</p>
                      </div>
                    ) : (
                      <p className="text-xs opacity-80">Click to see correction</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {/* Next 버튼 - 화면 가운데 고정 */}
        {messages.some(m => m.isNextButton) && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
            <button
              ref={nextButtonRef}
              onClick={handleNextClick}
              className="relative bg-gradient-to-r from-purple-300 via-fuchsia-300 to-pink-300 text-white rounded-full w-24 h-24 font-black text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:ring-offset-2 pointer-events-auto flex items-center justify-center"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textShadow: '0 3px 6px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.5)',
                boxShadow: '0 10px 25px rgba(196, 181, 253, 0.4), 0 0 30px rgba(240, 171, 252, 0.3)',
              }}
            >
              <span className="relative z-10">Next!</span>
            </button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-purple-200 bg-white px-4 py-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <button
            type="button"
            onClick={handleMicClick}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-magenta-500 text-white flex items-center justify-center hover:bg-magenta-600 transition-colors focus:outline-none focus:ring-2 focus:ring-magenta-500 focus:ring-offset-2"
            aria-label="Speaker button"
            title="Get a question"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your answer in English..."
              className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-magenta-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex-shrink-0 px-6 py-3 rounded-full bg-magenta-500 text-white font-medium hover:bg-magenta-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-magenta-500 focus:ring-offset-2"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
