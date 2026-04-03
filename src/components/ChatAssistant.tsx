'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { Send, Bot, User, Sparkles, Loader2, X, Minimize2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: "Hello! I am your AI Finance Assistant. Ask me anything about your records!",
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
  }, [messages, isOpen]);

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
      toast.error(err.message || "Assistant error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group ${
          isOpen ? 'bg-white text-indigo-600 ring-2 ring-indigo-500 rotate-180' : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
           </span>
        )}
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[999] w-full max-w-[380px] h-[500px] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-5 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                 <h2 className="font-bold text-sm">Finance Assistant</h2>
                 <p className="text-[10px] text-indigo-100 font-medium">Ready to help 🟢</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100 transition-opacity">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30"
          >
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-100 text-black rounded-bl-none shadow-[#00000008]'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-gray-50 shadow-sm">
                   <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Assistant is thinking</span>
                 </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="w-full bg-gray-50 px-4 py-3 pr-10 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-black"
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 rounded-lg text-indigo-600 hover:bg-white transition-all disabled:opacity-30 disabled:text-gray-400"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-2 flex justify-center space-x-3 opacity-60">
               <button onClick={() => setInput('Total income')} className="text-[9px] font-black uppercase text-indigo-700 hover:underline">Income</button>
               <button onClick={() => setInput('How many users')} className="text-[9px] font-black uppercase text-indigo-700 hover:underline">Users</button>
               <button onClick={() => setInput('Net Balance')} className="text-[9px] font-black uppercase text-indigo-700 hover:underline">Balance</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
