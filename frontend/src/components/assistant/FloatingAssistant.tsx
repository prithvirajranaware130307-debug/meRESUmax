import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, MessageSquare, X, Send, RotateCcw, 
  Bot, User as UserIcon, AlertCircle, Minimize2, Maximize2,
  ChevronDown, Check, Copy, ArrowUpRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isDemo?: boolean;
  disclaimer?: string | null;
}

const QUICK_ACTIONS = [
  'Improve my resume',
  'Explain my score',
  'Prepare interview questions',
  'Find matching jobs'
];

export const FloatingAssistant: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your meRESUmax Career Intelligence Assistant. How can I help sharpen your resume, prepare for interviews, or optimize your job search today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemo: false
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  if (!isAuthenticated) return null;

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setError(null);
    setLastFailedMessage(null);
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage({
        message: text,
        target_role: user?.target_role || 'Software Developer'
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: !response.is_live_ai,
        disclaimer: response.disclaimer
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg = err.message || 'Unable to connect to AI assistant. Please try again.';
      setError(errorMsg);
      setLastFailedMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      sendMessage(lastFailedMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. What would you like to explore regarding your ${user?.target_role || 'technical career'}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Expanded / Minimized Chat Panel */}
      {isOpen && (
        <div 
          className={`pointer-events-auto mb-3 w-[370px] sm:w-[420px] max-w-[calc(100vw-2rem)] transition-all duration-300 ease-out origin-bottom-right ${
            isMinimized 
              ? 'h-14 overflow-hidden rounded-2xl liquid-glass border border-white/20 shadow-2xl'
              : 'h-[520px] max-h-[calc(100vh-6rem)] rounded-3xl liquid-glass-elevated border border-white/25 shadow-2xl flex flex-col overflow-hidden'
          }`}
          role="dialog"
          aria-label="meRESUmax AI Assistant"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-white/[0.04] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan text-white flex items-center justify-center shadow-glass-sm shrink-0">
                <Bot size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
                  <span>meRESUmax AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-mint animate-pulse" />
                </div>
                <div className="text-[10px] text-brand-cyan/80 font-medium">
                  Career & Resume Coach
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Clear Conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-text-muted hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="Close Assistant"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Action Chips Bar */}
              <div className="px-3 py-2 bg-black/20 border-b border-white/5 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(action)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 hover:bg-brand-blue/20 text-text-secondary hover:text-white border border-white/10 transition-all shrink-0 flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>{action}</span>
                    <ArrowUpRight size={10} className="text-brand-cyan" />
                  </button>
                ))}
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto text-xs leading-relaxed">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={12} />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-1.5 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3 rounded-2xl relative group ${
                          m.sender === 'user'
                            ? 'bg-gradient-to-r from-brand-blue to-brand-cyan text-white rounded-tr-sm shadow-md'
                            : 'bg-white/[0.06] border border-white/10 text-text-primary rounded-tl-sm'
                        }`}
                      >
                        <div className="whitespace-pre-wrap select-text">{m.text}</div>

                        {m.sender === 'assistant' && (
                          <button
                            type="button"
                            onClick={() => copyText(m.id, m.text)}
                            className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-md bg-black/70 border border-white/20 text-text-secondary hover:text-white transition-opacity"
                            title="Copy reply"
                          >
                            {copiedId === m.id ? <Check size={11} className="text-brand-mint" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>

                      {/* Demo disclaimer badge if message was generated in fallback */}
                      {m.isDemo && (
                        <div className="text-[10px] text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 inline-flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>Demo assistant mode</span>
                          {m.disclaimer && <span className="text-amber-300/70 font-normal">• {m.disclaimer}</span>}
                        </div>
                      )}

                      <div className={`text-[10px] text-text-muted px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {m.timestamp}
                      </div>
                    </div>

                    {m.sender === 'user' && (
                      <div className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <UserIcon size={12} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 items-center text-text-muted">
                    <div className="w-6 h-6 rounded-lg bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center justify-center shrink-0">
                      <Sparkles size={12} className="animate-spin" />
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-brand-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {/* Error Banner with Retry */}
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
                      <div className="text-[11px] leading-tight">{error}</div>
                    </div>
                    {lastFailedMessage && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="text-[10px] uppercase font-bold text-white bg-rose-500/30 hover:bg-rose-500/50 px-2 py-1 rounded transition-colors shrink-0"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white/[0.03] border-t border-white/10 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your resume, score, or interview..."
                    disabled={isLoading}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-brand-cyan/60 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white hover:opacity-90 disabled:opacity-40 transition-all shrink-0 shadow-glass-sm"
                    title="Send Message"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`pointer-events-auto group relative flex items-center gap-2.5 px-4 py-3 rounded-full liquid-glass-elevated border border-white/25 shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-brand-blue/30 border-brand-cyan/40 scale-95' : 'hover:scale-105 hover:border-brand-cyan/50'
        }`}
        aria-label="Open AI Career Assistant"
      >
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue via-brand-cyan to-purple-400 flex items-center justify-center text-white shadow-glow-sm">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          {/* Subtle online pulse */}
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-mint border-2 border-[#0B1020]" />
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
            AI Assistant
          </span>
          <span className="text-[10px] text-text-secondary leading-none">
            Resume & Careers
          </span>
        </div>
      </button>
    </div>
  );
};
