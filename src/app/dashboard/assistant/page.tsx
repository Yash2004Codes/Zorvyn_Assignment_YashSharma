'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: "Hello! I am your internal Financial Assistant. Ask me anything about your records, totals, or users!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat/query', { message: currentInput }) as any;
      const botMessage: Message = { 
        role: 'bot', 
        text: res.data.answer, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      toast.error(err.message || "Failed to talk to assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-2">
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Financial Assistant</h1>
          <p className="text-gray-500 text-sm">Real-time insights for Administrators.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end space-x-2 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${
                  m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-5 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm animate-pulse">
                 <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                 <span className="text-xs text-gray-400 font-medium italic">Assistant is calculating...</span>
               </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
          <form onSubmit={handleSend} className="relative flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finance records... (e.g. What is my total profit?)"
              className="flex-1 bg-white px-6 py-4 pr-14 border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className={`absolute right-3 p-3 rounded-xl transition-all shadow-md group ${
                input.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Send className={`w-5 h-5 ${input.trim() ? 'group-hover:translate-x-1 group-hover:-translate-y-0.5' : ''} transition-transform`} />
            </button>
          </form>
          <div className="mt-2 flex justify-center space-x-4">
             <button onClick={() => setInput('What was my net balance?')} className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 hover:text-indigo-600 transition-colors">Balance</button>
             <button onClick={() => setInput('Total income')} className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 hover:text-indigo-600 transition-colors">Income</button>
             <button onClick={() => setInput('How many users?')} className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 hover:text-indigo-600 transition-colors">Users</button>
          </div>
        </div>
      </div>
    </div>
  );
}
