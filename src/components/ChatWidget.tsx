'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { 
      role: 'assistant', 
      content: "Hi! I'm Jesse, your AI assistant. I can help you navigate the ENDevo platform, explain terms, and guide you through your learning journey. What would you like to know?" 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const responses: { [key: string]: string } = {
        'navigation': 'To navigate the platform, use the left sidebar menu. Click on Dashboard to see your overview, Progress Summary to track your learning, and My Learning to access your modules.',
        'progress': 'Your progress is tracked automatically as you complete modules. You can view detailed progress reports by clicking "Progress Summary" in the sidebar.',
        'modules': 'Modules are structured learning units. Each module contains 5 lessons with videos, reflection notes, and assessments. Complete all lessons to finish a module.',
        'export': 'You can export your progress and module summaries anytime. Look for the "Export" or "Save PDF" buttons on the Progress Summary page.',
        'terms': 'Common terms: Module = learning unit, Lesson = individual topic, Reflection = personal notes, Competency = skill area, Progress = completion percentage.',
      };

      let response = "I'm here to help! You can ask me about:\n\n• Navigation and using the platform\n• Understanding your progress\n• Module structure and lessons\n• Exporting reports\n• Common terms and concepts\n\nWhat specific topic would you like to know more about?";

      // Simple keyword matching (replace with actual AI)
      const lowerMessage = userMessage.toLowerCase();
      for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How do I navigate the platform?",
    "What are modules?",
    "How do I track my progress?",
    "Can I export my results?",
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Chat Widget */}
      <div className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200" style={{ height: '600px' }}>
        {/* Header */}
        <div 
          className="p-4 text-white flex items-center justify-between"
          style={{ 
            background: 'linear-gradient(135deg, var(--endevo-open-seas) 0%, var(--endevo-deep-space) 100%)'
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image 
                src="/asset/jesse-image.png" 
                alt="Jesse AI Assistant" 
                width={48} 
                height={48}
                className="w-12 h-12 rounded-full border-2 border-white object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Ask Jesse</h3>
              <p className="text-xs text-white/80">AI Assistant • Online</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Image 
                  src="/asset/jesse-image.png" 
                  alt="Jesse" 
                  width={32} 
                  height={32}
                  className="w-8 h-8 rounded-full mr-2 object-cover shrink-0"
                />
              )}
              <div 
                className={`max-w-[75%] p-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'text-white' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
                style={message.role === 'user' ? { 
                  background: 'linear-gradient(135deg, var(--endevo-open-seas) 0%, var(--endevo-deep-space) 100%)'
                } : {}}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <Image 
                src="/asset/jesse-image.png" 
                alt="Jesse" 
                width={32} 
                height={32}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <div className="bg-white p-3 rounded-2xl border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="px-4 py-2 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(question);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-end space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              rows={2}
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--endevo-open-seas)'
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
