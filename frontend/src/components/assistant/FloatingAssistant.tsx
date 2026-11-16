import React, { useState, useRef, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, X, Send, RotateCcw, 
  Bot, User as UserIcon, AlertCircle, Minimize2, Maximize2,
  Check, Copy, ArrowUpRight
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
  'Find matching jobs',
  'ATS formatting tips',
  'Roadmap guidance'
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

  const initialWelcomeText = useMemo(() => {
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    const role = user?.target_role || 'Software Developer';
    return `Hello ${firstName}! I am your meRESUmax Career Intelligence Assistant. I specialize in resume optimization, ATS formatting, interview preparation, and job matching for ${role} roles. How can I help you today?`;
  }, [user?.name, user?.target_role]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: initialWelcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDemo: false
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find index of first message that was generated in demo/fallback mode
  // The requirement says: "If live AI keys are missing, clearly label the response as demo/fallback mode only once per conversation, not repeatedly."
  const firstDemoIndex = messages.findIndex(m => m.isDemo);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
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
      const raw = (err.message || '').toLowerCase();
      let friendlyError = 'Unable to connect to AI assistant. Please try again.';
      if (raw.includes('timeout') || raw.includes('starting') || raw.includes('failed to fetch') || raw.includes('502') || raw.includes('503')) {
        friendlyError = 'The assistant service is warming up on Render. Please wait a moment and click Retry.';
      } else if (raw.includes('rate') || raw.includes('429')) {
        friendlyError = 'Service rate limit reached. Please wait a few seconds and retry.';
      } else if (err.message) {
        friendlyError = err.message;
      }
      setError(friendlyError);
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
        text: `Conversation reset. I am ready to assist with your resume, interviews, or job search for ${user?.target_role || 'technical'} roles.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: false
      }
    ]);
    setError(null);
    setLastFailedMessage(null);
  };

  return (
    <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none">
      {/* Expanded / Minimized Chat Panel */}
      {isOpen && (
        <div 
          className={`pointer-events-auto mb-3 w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[420px] transition-all duration-200 ease-out origin-bottom-right ${
            isMinimized 
              ? 'h-13 overflow-hidden rounded-xl bg-white/98 dark:bg-[#0D0F14]/95 border border-slate-200 dark:border-white/10 shadow-elevated'
              : 'h-[500px] max-h-[calc(100vh-6.5rem)] rounded-xl bg-white/98 dark:bg-[#0D0F14]/95 border border-slate-200 dark:border-white/10 shadow-elevated flex flex-col overflow-hidden'
          }`}
          role="dialog"
          aria-label="meRESUmax AI Career Assistant"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight">
                  <span>Career Intelligence Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-text-muted font-mono truncate max-w-[180px]">
                  {user?.target_role || 'Resume & Career Strategist'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 text-text-muted hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Clear Conversation"
                aria-label="Clear Conversation"
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(prev => !prev)}
                className="p-1.5 text-text-muted hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
                aria-label={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-text-muted hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Action Chips Bar */}
              <div className="px-3 py-2 bg-slate-100/80 dark:bg-black/25 border-b border-slate-200 dark:border-white/5 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0 font-mono text-[11px]">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(action)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 dark:bg-[#161922] dark:hover:bg-[#1D212C] text-slate-700 hover:text-slate-900 dark:text-text-secondary dark:hover:text-white border border-slate-300 dark:border-white/10 transition-all shrink-0 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-[10px] shadow-xs"
                  >
                    <span>{action}</span>
                    <ArrowUpRight size={10} className="text-slate-400 dark:text-zinc-400" />
                  </button>
                ))}
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto text-xs leading-relaxed">
                {messages.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'assistant' && (
                      <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-[#161922] text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={11} />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-1 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3 rounded-xl relative group ${
                          m.sender === 'user'
                            ? 'bg-blue-600 text-white font-medium shadow-sm'
                            : 'bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-text-primary'
                        }`}
                      >
                        <div className="whitespace-pre-wrap select-text">{m.text}</div>

                        {m.sender === 'assistant' && (
                          <button
                            type="button"
                            onClick={() => copyText(m.id, m.text)}
                            className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-white dark:bg-[#090A0E] border border-slate-300 dark:border-white/20 text-slate-600 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-opacity cursor-pointer shadow-sm"
                            title="Copy reply"
                            aria-label="Copy reply"
                          >
                            {copiedId === m.id ? <Check size={11} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>

                      {/* Fallback demo mode badge shown ONLY ONCE per conversation */}
                      {idx === firstDemoIndex && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 inline-flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                          <span>Demo Engine Fallback (Deterministic Mode)</span>
                        </div>
                      )}

                      <div className={`text-[10px] font-mono text-text-muted px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {m.timestamp}
                      </div>
                    </div>

                    {m.sender === 'user' && (
                      <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                        <UserIcon size={11} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading State Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 items-center text-text-muted">
                    <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-[#161922] text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-white/10 flex items-center justify-center shrink-0">
                      <Sparkles size={11} className="animate-spin text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[11px] text-text-muted font-mono ml-2">Consulting career intelligence...</span>
                    </div>
                  </div>
                )}

                {/* Error Banner with Retry */}
                {error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 flex items-start justify-between gap-2 font-mono">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                      <div className="text-[11px] leading-tight font-sans">{error}</div>
                    </div>
                    {lastFailedMessage && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        disabled={isLoading}
                        className="text-[10px] uppercase font-bold text-rose-700 dark:text-white bg-rose-500/20 hover:bg-rose-500/30 dark:bg-rose-500/30 dark:hover:bg-rose-500/50 px-2 py-1 rounded transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-slate-50/90 dark:bg-black/25 border-t border-slate-200 dark:border-white/[0.08] shrink-0">
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
                    placeholder="Ask about resume, score, ATS, or interview..."
                    disabled={isLoading}
                    className="flex-1 bg-white dark:bg-[#090A0E] border border-slate-300 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-text-muted focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-[#090A0E] dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
                    title="Send Message"
                    aria-label="Send Message"
                  >
                    <Send size={14} />
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
          setIsOpen(prev => !prev);
          setIsMinimized(false);
        }}
        className={`pointer-events-auto group relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#111318]/95 border border-slate-200 dark:border-white/12 shadow-card transition-all duration-200 cursor-pointer ${
          isOpen ? 'bg-slate-100 dark:bg-[#161922] border-slate-300 dark:border-white/20' : 'hover:bg-slate-100 dark:hover:bg-[#161922] hover:border-slate-300 dark:hover:border-white/20'
        }`}
        aria-label="Open AI Career Assistant"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-[#161922] border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-zinc-200">
            <Bot size={14} />
          </div>
          {/* Status dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white dark:border-[#111318]" />
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
            Assistant
          </span>
        </div>
      </button>
    </div>
  );
};
