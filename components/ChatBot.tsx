import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { FileData, ChatMessage, MeetingData } from '../types';

interface ChatBotProps {
  files: FileData[];
  contextData?: MeetingData | null;
  chatService: (history: any[], msg: string, files: FileData[], context: MeetingData | null) => AsyncGenerator<string>;
  isDemoMode: boolean;
}

const SUGGESTIONS = [
  "Summarize the key decisions",
  "Who are the main stakeholders?",
  "What are the risks mentioned?",
  "Draft an email summary"
];

const ChatBot: React.FC<ChatBotProps> = ({ files, contextData, chatService, isDemoMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    try {
      const stream = chatService(history, userMsg.text, files, contextData || null);
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
          id: botMsgId,
          role: 'model',
          text: '',
          timestamp: Date.now()
      }]);

      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => 
            prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m)
        );
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "Sorry, I encountered an error. Please check your connection.",
          timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Simple formatter for bold text (**text**)
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all z-50 flex items-center space-x-2 group
          ${isDemoMode ? 'bg-orange-500 text-white' : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'}
        `}
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="font-bold pr-1">{isDemoMode ? 'Demo Chat' : 'Ask AI'}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[85vh] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b bg-zinc-50/80 dark:bg-zinc-800/80
          ${isDemoMode ? 'border-orange-200 dark:border-orange-900/50' : 'border-zinc-100 dark:border-zinc-800'}
      `}>
        <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                 ${isDemoMode ? 'bg-orange-500' : 'bg-gradient-to-tr from-blue-500 to-purple-500'}
            `}>
                <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    {isDemoMode ? 'Demo Assistant' : 'Assistant'}
                </h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {isDemoMode ? 'Simulated AI Response' : 'Powered by Gemini 3.0'}
                </p>
            </div>
        </div>
        <button 
           onClick={() => setIsOpen(false)}
           className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
        >
           <X className="w-5 h-5 text-zinc-500" />
       </button>
      </div>

      {isDemoMode && (
          <div className="bg-orange-50 dark:bg-orange-900/20 px-4 py-2 text-[10px] text-orange-700 dark:text-orange-300 flex items-center justify-center text-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Responses are simulated. Real content analysis is disabled.
          </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-transparent">
        {messages.length === 0 && (
            <div className="mt-8 space-y-6">
                <div className="text-center text-zinc-400">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">How can I help with this meeting?</p>
                </div>
                <div className="grid gap-2">
                    {SUGGESTIONS.map((sug, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSend(sug)}
                            className="text-left text-xs p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300"
                        >
                            {sug}
                        </button>
                    ))}
                </div>
            </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-br-none'
                  : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 rounded-bl-none'
              }`}
            >
              {formatText(msg.text)}
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1.5 items-center h-10 shadow-sm">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
        <div className="flex items-center space-x-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1 py-1 pl-4 shadow-sm focus-within:ring-2 focus-within:ring-zinc-200 dark:focus-within:ring-zinc-700 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isDemoMode ? "Ask a demo question..." : "Ask a question..."}
            className="flex-1 bg-transparent border-none text-sm focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 py-2"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all disabled:opacity-50 disabled:scale-90"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;