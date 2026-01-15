import React, { useState, useEffect, useRef } from 'react';
import { Message, BibleVerse } from '../types';
import { sendMessageStream } from '../services/geminiService';
import { Send, Sparkles, X, BookOpen, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  contextVerse: BibleVerse | null;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, contextVerse }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Greetings. I am Lumina, your study companion. Select a verse to explore its meaning, or ask me any question about the Scriptures.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  // When context verse changes, suggest an action
  useEffect(() => {
    if (contextVerse && isOpen) {
       // Only add a prompt if the last message wasn't about this verse specifically to avoid spam
       // For this demo, we'll just let the UI show the context chip
    }
  }, [contextVerse, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a placeholder for the model response
      const modelMsgId = (Date.now() + 1).toString();
      const modelMsg: Message = {
        id: modelMsgId,
        role: 'model',
        text: '',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, modelMsg]);

      // Call streaming service
      let accumulatedText = '';
      await sendMessageStream(
        messages, 
        userMsg.text, 
        contextVerse ? `Context Verse: ${contextVerse.book_name} ${contextVerse.chapter}:${contextVerse.verse} - "${contextVerse.text}"` : undefined,
        'NIV', 
        'English', 
        undefined,
        (chunk) => {
            accumulatedText += chunk;
            setMessages(prev => prev.map(msg => 
                msg.id === modelMsgId ? { ...msg, text: accumulatedText } : msg
            ));
        },
        () => {
            setIsLoading(false);
        },
        (err) => {
            console.error(err);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: 'I apologize, but I encountered an error connecting to the service. Please try again.',
                timestamp: new Date().toISOString(),
                isError: true
            }]);
            setIsLoading(false);
        }
      );
      
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'I apologize, but I encountered an error connecting to the service. Please try again.',
        timestamp: new Date().toISOString()
      }]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl border-l border-stone-200 transform transition-transform duration-300 z-40 flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-stone-100 bg-paper">
        <div className="flex items-center gap-2 text-amber-700">
          <Sparkles size={18} />
          <h2 className="font-serif font-bold text-lg">Lumina AI</h2>
        </div>
        <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Context Chip */}
      {contextVerse && (
        <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-start gap-3">
          <BookOpen size={16} className="text-amber-600 mt-1 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Context: {contextVerse.book_name} {contextVerse.chapter}:{contextVerse.verse}</p>
            <p className="text-sm text-amber-900 line-clamp-2 italic">"{contextVerse.text}"</p>
          </div>
          <button 
             onClick={() => {/* In a real app, clear context */}}
             className="ml-auto text-amber-400 hover:text-amber-600"
          >
             <X size={14} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-stone-50/30">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-ink text-white rounded-br-none' 
                  : 'bg-white border border-stone-100 text-stone-700 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' ? (
                 <div className="prose prose-sm prose-stone max-w-none">
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                 </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1].role === 'user' && (
           <div className="flex justify-start">
             <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <Loader2 size={18} className="animate-spin text-stone-400" />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-stone-100">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a theological question..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 resize-none h-[52px] max-h-32 overflow-y-auto"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[10px] text-stone-400 mt-2">
          AI can make mistakes. Please verify important theological insights.
        </p>
      </div>
    </div>
  );
};

export default AIChat;