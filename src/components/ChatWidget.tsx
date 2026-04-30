'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_GREETING: ChatMessage = {
  role: 'assistant',
  content:
    "I'm Jesse — your guide through the Legacy Path. Ask me about the four domains, your readiness score, or how the Final Playbook compiles itself. I'm here when you're ready.",
};

const QUICK_QUESTIONS = [
  'What does my readiness score mean?',
  'How does the Final Playbook work?',
  'What\'s the difference between domains?',
  'Who can see my answers?',
];

const RESPONSE_LIBRARY: { match: string[]; reply: string }[] = [
  {
    match: ['readiness', 'score'],
    reply:
      'Your readiness score (0–1000) reflects how prepared your loved ones would be if something happened to you. It strengthens as you complete actions across the four domains. Each domain you touch lifts the whole picture.',
  },
  {
    match: ['playbook', 'final', 'compile'],
    reply:
      'The Final Playbook compiles itself as you complete domains. Each domain you finish adds a chapter — Legal, Financial, Digital, Physical. The full document only exists once all four are complete, and it stays yours alone.',
  },
  {
    match: ['domain', 'four', 'legal', 'financial', 'digital', 'physical'],
    reply:
      'Four domains shape the Legacy Path:\n• 01 LEGAL — will, executor, healthcare proxy\n• 02 FINANCIAL — accounts, beneficiaries, obligations\n• 03 DIGITAL — logins, devices, online identity\n• 04 PHYSICAL — belongings, ceremony, location of papers\n\nTake them in any order — the Path adapts to where you are.',
  },
  {
    match: ['private', 'privacy', 'see', 'employer', 'admin'],
    reply:
      'Your answers, reflections, and Final Playbook are yours alone. Your Org Admin only sees that you completed something — never the contents. Endevo never sees your individual answers either.',
  },
  {
    match: ['streak', 'shield', 'xp', 'level', 'badge'],
    reply:
      'Small daily moments build a streak. After 7 consecutive days you earn the Week One badge. Streak Shield protects one missed day so a busy week doesn\'t reset you. XP unlocks Levels (L1 Foundation → L4 Legacy) which gate the Letter Vault.',
  },
  {
    match: ['letter', 'vault'],
    reply:
      'The Letter Vault holds sealed letters to your executor, partner, children, and future-self. They unlock as you complete the matching domain — a private moment of reflection earned by the work you\'ve already done.',
  },
];

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (text?: string) => {
    const userText = (text ?? inputMessage).trim();
    if (!userText) return;

    setInputMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    setTimeout(() => {
      const lower = userText.toLowerCase();
      const matched = RESPONSE_LIBRARY.find((entry) => entry.match.some((m) => lower.includes(m)));
      const reply =
        matched?.reply ??
        'I can help with the four domains, your readiness score, the Final Playbook, streaks and badges, the Letter Vault, or what\'s private vs visible to your Org Admin. What would you like to explore?';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setIsTyping(false);
    }, 700);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col overflow-hidden rounded-[16px]"
      style={{
        width: 'min(96vw, 400px)',
        height: 'min(85vh, 620px)',
        background: 'linear-gradient(180deg, var(--lr-navy-deep) 0%, var(--lr-midnight) 100%)',
        border: '1px solid var(--border-gold)',
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.55)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-navy-deep) 100%)',
          borderBottom: '1px solid var(--border-gold)',
        }}
      >
        <div className="flex items-center gap-3">
          <JesseAvatar size={40} />
          <div>
            <p className="font-(family-name:--font-italiana) text-(--lr-gold) text-lg tracking-[0.06em] leading-tight">
              Ask Jesse
            </p>
            <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase text-(--lr-gold-soft) mt-0.5">
              Your guide on the path
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="p-2 rounded-lg transition-colors"
          style={{
            background: 'rgba(212,190,148,0.08)',
            color: 'var(--lr-gold)',
            border: '1px solid var(--border-gold)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((message, idx) => {
          const isUser = message.role === 'user';
          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="mr-2 flex-shrink-0">
                  <JesseAvatar size={28} />
                </div>
              )}
              <div
                className="max-w-[78%] rounded-[12px] px-4 py-2.5"
                style={
                  isUser
                    ? {
                        background: 'var(--lr-gold)',
                        color: 'var(--lr-navy-deep)',
                        border: '1px solid var(--lr-gold)',
                      }
                    : {
                        background: 'rgba(212,190,148,0.06)',
                        color: 'var(--lr-pearl)',
                        border: '1px solid var(--border-subtle)',
                      }
                }
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="mr-2 flex-shrink-0">
              <JesseAvatar size={28} />
            </div>
            <div
              className="rounded-[12px] px-4 py-3"
              style={{
                background: 'rgba(212,190,148,0.06)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex space-x-1.5">
                <Dot delay="0s" />
                <Dot delay="0.15s" />
                <Dot delay="0.3s" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions — only on first turn */}
      {messages.length === 1 && (
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <p className="font-(family-name:--font-jura) text-[0.6rem] tracking-[0.22em] uppercase text-(--lr-gold-soft) mb-2">
            Quick questions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: 'rgba(212,190,148,0.06)',
                  color: 'var(--lr-pearl)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-gold)' }}
      >
        <div className="flex items-end gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Jesse anything…"
            rows={2}
            className="flex-1 resize-none rounded-[10px] px-3 py-2 text-sm focus:outline-none transition-colors"
            style={{
              background: 'rgba(28,38,68,0.7)',
              color: 'var(--lr-pearl)',
              border: '1px solid var(--border-subtle)',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim()}
            aria-label="Send message"
            className="px-3 py-2.5 rounded-[10px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--lr-gold)',
              color: 'var(--lr-navy-deep)',
              border: '1px solid var(--lr-gold)',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 12l14-7-7 14-2-5-5-2z" />
            </svg>
          </button>
        </div>
        <p className="font-(family-name:--font-jura) text-[0.55rem] tracking-[0.18em] uppercase text-(--lr-lavender-dust) mt-2">
          Demo · responses are illustrative
        </p>
      </div>
    </div>
  );
}

/* ──────────── primitives ──────────── */

function JesseAvatar({ size }: { size: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-(family-name:--font-italiana) tracking-[0.05em]"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, var(--lr-navy-mid) 0%, var(--lr-midnight) 100%)',
        color: 'var(--lr-gold)',
        border: '1px solid var(--lr-gold)',
        fontSize: size * 0.45,
      }}
    >
      J
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{
        background: 'var(--lr-gold)',
        animation: 'lr-bounce 1.2s infinite ease-in-out',
        animationDelay: delay,
      }}
    />
  );
}
