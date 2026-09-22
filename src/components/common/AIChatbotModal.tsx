import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Phone, 
  GraduationCap, 
  Clock, 
  MapPin, 
  RotateCcw,
  Loader2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import Logo from '../Logo';
import { SCHOOL_DETAILS } from '../../data/content';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AIChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApplyModal?: () => void;
}

const QUICK_PROMPTS = [
  'Admissions 2026-27 eligibility & documents?',
  'What curriculum and classes are offered?',
  'What are the school hours and transport facilities?',
  'Are there any current admission fee offers?',
  'Where is the GP Academy campus located?',
];

export default function AIChatbotModal({ isOpen, onClose, onOpenApplyModal }: AIChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Namaste! 🙏 Welcome to GP Academy, Noida. I am **GP Shiksha AI**, your virtual school assistant.\n\nHow can I help you today? You can ask about our CBSE curriculum (Nursery to 12th), admissions, smart facilities, transport, or special fee offers!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          userMessage: text,
        }),
      });

      const data = await response.json();
      const reply = data.reply || 'Thank you for reaching out. Please contact GP Academy at 9818776563 for further assistance.';

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.warn('AI Chat request error:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `We are glad you are interested in GP Academy! For immediate assistance, please call our admissions desk at **${SCHOOL_DETAILS.phone}** or visit us in Bhangel, Salarpur Khadar, Noida.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'ai',
        text: `Conversation restarted. Namaste! 🙏 How can I assist you with GP Academy admissions or campus details today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to render markdown-like bold text nicely
  const renderFormattedText = (txt: string) => {
    const parts = txt.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-[#001c46]">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Container / Window */}
      <div 
        className="bg-white w-full sm:max-w-lg md:max-w-xl h-[88vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-slideUp font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#001c46] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Logo size={32} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#001c46]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">GP Shiksha AI</h3>
                <span className="bg-[#FFC907] text-[#001c46] text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Virtual Assistant
                </span>
              </div>
              <p className="text-[11px] text-gray-300 flex items-center gap-1 mt-0.5">
                <span>GP Academy Official AI</span> • <span className="text-emerald-300 font-bold">Online</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              title="Restart Conversation"
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close Chat"
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action / Quick Contact Sub-bar */}
        <div className="bg-[#FFC907]/15 border-b border-[#FFC907]/30 px-4 py-2 flex items-center justify-between text-[11px] font-bold text-[#001c46] shrink-0">
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-[#001c46]" />
            <span>Admissions Open: Nursery – Class 12</span>
          </span>
          <a
            href={`tel:${SCHOOL_DETAILS.phone}`}
            className="inline-flex items-center gap-1 text-[#001c46] hover:underline"
          >
            <Phone className="w-3 h-3" />
            <span>{SCHOOL_DETAILS.phone}</span>
          </a>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#001c46] text-[#FFC907] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-[#001c46] text-white rounded-tr-none font-medium'
                      : 'bg-white text-gray-800 border border-gray-200/80 rounded-tl-none font-normal'
                  }`}
                >
                  {renderFormattedText(m.text)}
                  <div
                    className={`text-[9px] mt-1.5 text-right font-mono ${
                      isUser ? 'text-gray-300' : 'text-gray-400'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 text-xs py-2">
              <div className="w-7 h-7 rounded-xl bg-[#001c46] text-[#FFC907] flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200/80 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 bg-[#001c46] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#001c46] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-[#001c46] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] font-medium text-gray-500 ml-1.5">GP Shiksha is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-gray-100 shrink-0">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Quick Questions:
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 hover:bg-[#001c46] hover:text-[#FFC907] text-gray-700 text-[11px] font-bold transition-all shrink-0 cursor-pointer border border-gray-200/80 active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about GP Academy (Hindi or English)..."
              disabled={loading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white transition-all"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className={`p-3 rounded-2xl transition-all shadow-xs flex items-center justify-center cursor-pointer ${
                input.trim() && !loading
                  ? 'bg-[#001c46] hover:bg-[#002d6b] text-[#FFC907] active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="Send Message"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick External Actions */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 text-[11px]">
            <span className="text-gray-400 text-[10px]">
              Powered by GP Academy AI & Gemini
            </span>
            {onOpenApplyModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenApplyModal();
                }}
                className="text-[#001c46] hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <span>Admission Enquiry Form</span>
                <ExternalLink className="w-3 h-3 text-[#001c46]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
