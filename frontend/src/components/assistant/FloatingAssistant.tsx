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
          className={`pointer-events-auto mb-3 w-[370px] sm:w-[420px] max-w-[calc(100vw-2rem)] transition-all duration-200 ease-out origin-bottom-right ${
            isMinimized 
              ? 'h-13 overflow-hidden rounded-xl bg-[#0D0F14]/95 border border-white/10 shadow-elevated'
              : 'h-[500px] max-h-[calc(100vh-6rem)] rounded-xl bg-[#0D0F14]/95 border border-white/10 shadow-elevated flex flex-col overflow-hidden'
          }`}
          role="dialog"
          aria-label="meRESUmax AI Assistant"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#161922] border border-white/10 text-zinc-200 flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5 leading-tight">
                  <span>Assistant Engine</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[10px] text-text-muted font-mono">
                  ATS & Career Intelligence
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                title="Clear Conversation"
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-text-muted hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-text-muted hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Action Chips Bar */}
              <div className="px-3 py-2 bg-black/20 border-b border-white/5 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0 font-mono text-[11px]">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => sendMessage(action)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-2.5 py-1 rounded bg-[#161922] hover:bg-[#1D212C] text-text-secondary hover:text-white border border-white/10 transition-all shrink-0 flex items-center gap-1 disabled:opacity-50 cursor-pointer text-[10px]"
                  >
                    <span>{action}</span>
                    <ArrowUpRight size={10} className="text-zinc-400" />
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
                      <div className="w-6 h-6 rounded-md bg-[#161922] text-zinc-300 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={11} />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-1 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-3 rounded-xl relative group ${
                          m.sender === 'user'
                            ? 'bg-white text-[#090A0E] font-medium shadow-sm'
                            : 'bg-[#161922] border border-white/10 text-text-primary'
                        }`}
                      >
                        <div className="whitespace-pre-wrap select-text">{m.text}</div>

                        {m.sender === 'assistant' && (
                          <button
                            type="button"
                            onClick={() => copyText(m.id, m.text)}
                            className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-[#090A0E] border border-white/20 text-text-secondary hover:text-white transition-opacity cursor-pointer"
                            title="Copy reply"
                          >
                            {copiedId === m.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                        )}
                      </div>

                      {/* Demo disclaimer badge if message was generated in fallback */}
                      {m.isDemo && (
                        <div className="text-[10px] text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 inline-flex items-center gap-1.5 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>Demo Engine Fallback</span>
                        </div>
                      )}

                      <div className={`text-[10px] font-mono text-text-muted px-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {m.timestamp}
                      </div>
                    </div>

                    {m.sender === 'user' && (
                      <div className="w-6 h-6 rounded-md bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">
                        <UserIcon size={11} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 items-center text-text-muted">
                    <div className="w-6 h-6 rounded-md bg-[#161922] text-zinc-300 border border-white/10 flex items-center justify-center shrink-0">
                      <Sparkles size={11} className="animate-spin" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#161922] border border-white/10 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {/* Error Banner with Retry */}
                {error && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 flex items-start justify-between gap-2 font-mono">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-400" />
                      <div className="text-[11px] leading-tight font-sans">{error}</div>
                    </div>
                    {lastFailedMessage && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="text-[10px] uppercase font-bold text-white bg-rose-500/30 hover:bg-rose-500/50 px-2 py-1 rounded transition-colors shrink-0 cursor-pointer"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-black/20 border-t border-white/[0.08] shrink-0">
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
                    placeholder="Ask about resume, score, or interview..."
                    disabled={isLoading}
                    className="flex-1 bg-[#090A0E] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-text-muted focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2 rounded-lg bg-white text-[#090A0E] hover:bg-zinc-200 disabled:opacity-40 transition-all shrink-0 cursor-pointer"
                    title="Send Message"
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
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`pointer-events-auto group relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111318]/95 border border-white/12 shadow-card transition-all duration-200 cursor-pointer ${
          isOpen ? 'bg-[#161922] border-white/20' : 'hover:bg-[#161922] hover:border-white/20'
        }`}
        aria-label="Open AI Career Assistant"
      >
        <div className="relative">
          <div className="w-6 h-6 rounded-md bg-[#161922] border border-white/10 flex items-center justify-center text-zinc-200">
            <Bot size={14} />
          </div>
          {/* Status dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#111318]" />
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-white tracking-tight flex items-center gap-1">
            Assistant
          </span>
        </div>
      </button>
    </div>
  );
};
