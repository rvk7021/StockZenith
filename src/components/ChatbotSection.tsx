import { useState, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';

interface Lot {
  id?: string;
  ticker: string;
  quantity: number;
  pricePaid: number;
  date?: string;
}

interface Portfolio {
  id: string;
  name: string;
  cash: number;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SMART_SHARED';
  lots: Lot[];
  user?: { name?: string };
}

export default function ChatbotSection({ portfolio, messages: externalMessages, setMessages: setExternalMessages }: { portfolio: Portfolio, messages?: Array<{ id: string; content: string; isUser: boolean; timestamp: Date }>, setMessages?: React.Dispatch<React.SetStateAction<Array<{ id: string; content: string; isUser: boolean; timestamp: Date }>>> }) {
  const [messages, setMessages] = useState<Array<{ id: string; content: string; isUser: boolean; timestamp: Date }>>(externalMessages || [
    {
      id: '1',
      content: `Hello! I'm your AI portfolio assistant. I can help you analyze "${portfolio.name}" and answer questions about your investments.`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Sync with external state if provided
  useEffect(() => {
    if (externalMessages && setExternalMessages) {
      setMessages(externalMessages);
    }
    // eslint-disable-next-line
  }, [externalMessages]);

  useEffect(() => {
    if (setExternalMessages) setExternalMessages(messages);
    // eslint-disable-next-line
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/insights-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio, question: userMessage.content }),
      });
      const data = await res.json();
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: data.answer || data.error || 'No answer.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 2).toString(),
        content: 'Sorry, there was an error getting a response from the AI assistant.',
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-t-xl sm:rounded-xl overflow-hidden min-h-[400px] max-h-[60vh] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-blue-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 shadow-sm ${message.isUser
                ? 'bg-white text-blue-700 border border-blue-200'
                : 'bg-blue-100 text-indigo-900 border border-blue-200'
                } font-medium`}
            >
              <p className="text-base">{message.content}</p>
              <p className="text-xs opacity-70 mt-1 text-blue-400">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-blue-100 bg-blue-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your portfolio..."
            className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-blue-900 text-base placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-blue-200 hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed text-blue-900 p-2 rounded-lg transition-colors font-bold shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-xs font-medium">
            AI responses are simulated and for demonstration purposes
          </span>
        </div>
      </div>
    </div>
  );
} 