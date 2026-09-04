import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Leaf, MapPin, CloudSun, Target, Info, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askAdvisory, getAdvisoryHistory, getCropRecommendations } from '@/lib/api';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface CropRecommendation {
  name: string;
  reason: string;
  icon: string;
}

interface CropRecData {
  location: string;
  weather: {
    temp: number;
    humidity: number;
    condition: string;
  } | null;
  recommendations: CropRecommendation[];
  expertAdvice: string;
  cached?: boolean;
}

export default function Advisory() {
  const [activeTab, setActiveTab] = useState<'chat' | 'recommendation'>('chat');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your AI Crop Advisor. I can help you with questions about fertilizers, pests, diseases, and general crop management (especially for wheat, rice, and tomatoes). What can I help you with today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Recommendation State
  const [locationInput, setLocationInput] = useState('');
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [recData, setRecData] = useState<CropRecData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getAdvisoryHistory();
        if (res.messages && res.messages.length > 0) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.error('Failed to fetch advisory history:', err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsChatLoading(true);

    try {
      const res = await askAdvisory(userMessage.text);
      if (res.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'ai',
          text: res.answer
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error while processing your request. Please try again later.'
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationInput.trim() || isRecLoading) return;

    setIsRecLoading(true);
    setErrorMsg('');
    try {
      const res = await getCropRecommendations(locationInput.trim());
      if (res.success) {
        setRecData({
          location: res.location,
          weather: res.weather,
          recommendations: res.recommendations,
          expertAdvice: res.expertAdvice,
          cached: res.cached
        });
      } else {
        setErrorMsg('Failed to get recommendations.');
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please check your connection and try again.');
    } finally {
      setIsRecLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center p-4 sm:p-6 lg:p-8 overflow-hidden">

      {/* Header and Tabs */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/60 p-4 rounded-3xl backdrop-blur-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-lime-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
              <Sparkles className="h-6 w-6 text-lime-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-950 tracking-tight">AI Services</h1>
              <p className="text-gray-600 text-sm">Powered by AgriGenius</p>
            </div>
          </div>

          <div className="flex bg-green-50/50 p-1 rounded-2xl border border-green-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'chat'
                  ? 'bg-green-600 text-zinc-950 shadow-lg'
                  : 'text-gray-600 hover:text-green-950'
                }`}
            >
              Virtual Agronomist
            </button>
            <button
              onClick={() => setActiveTab('recommendation')}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'recommendation'
                  ? 'bg-emerald-500 text-zinc-950 shadow-lg'
                  : 'text-gray-600 hover:text-green-950'
                }`}
            >
              Crop Recommender
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl flex-1 flex flex-col bg-white/40 backdrop-blur-xl border border-green-200/50 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px]">
        <AnimatePresence mode="wait">

          {/* TAB 1: Chat */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col h-full"
            >
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar scroll-smooth">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {msg.sender === 'ai' ? (
                          <div className="w-8 h-8 rounded-full bg-green-50 border border-green-300 flex items-center justify-center shadow-lg">
                            <Bot className="h-4 w-4 text-lime-400" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center shadow-lg">
                            <User className="h-4 w-4 text-lime-400" />
                          </div>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <Card className={`p-4 border-none shadow-lg ${msg.sender === 'user'
                          ? 'bg-gradient-to-br from-lime-500 to-emerald-600 text-green-950 rounded-2xl rounded-tr-sm'
                          : 'bg-green-100/80 text-green-900 rounded-2xl rounded-tl-sm backdrop-blur-md border border-green-300/50'
                        }`}>
                        {msg.sender === 'user' ? (
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                        ) : (
                          <div className="text-[15px] leading-relaxed space-y-4">
                            <ReactMarkdown
                              components={{
                                strong: ({ node, ...props }) => <span className="font-bold text-lime-400" {...props} />,
                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-green-950 mt-4 mb-2" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-green-950 mt-4 mb-2" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-base font-bold text-green-950 mt-3 mb-1" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="text-green-800" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        )}
                      </Card>
                    </div>
                  </motion.div>
                ))}

                {isChatLoading && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex justify-start w-full"
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-50 border border-green-300 flex items-center justify-center shadow-lg">
                        <Bot className="h-4 w-4 text-lime-400" />
                      </div>
                      <Card className="p-4 bg-green-100/80 border-none rounded-2xl rounded-tl-sm flex items-center gap-3">
                        <Loader2 className="h-4 w-4 text-lime-400 animate-spin" />
                        <span className="text-sm text-gray-600 font-medium">Analyzing...</span>
                      </Card>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 sm:p-6 bg-green-50/80 border-t border-green-200/80 backdrop-blur-xl">
                <form onSubmit={handleChatSubmit} className="relative flex items-center">
                  <div className="absolute left-4 text-gray-500 pointer-events-none">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about crops, pests, fertilizers..."
                    disabled={isChatLoading}
                    className="w-full pl-12 pr-14 py-4 bg-white border border-green-200 focus:border-green-500/50 focus:ring-1 focus:ring-lime-500/50 rounded-2xl text-green-950 placeholder-zinc-500 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isChatLoading}
                    className="absolute right-2 p-2.5 bg-green-600 hover:bg-lime-400 disabled:bg-green-50 disabled:text-gray-500 text-zinc-950 rounded-xl transition-colors shadow-lg group"
                  >
                    <Send className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Crop Recommendation */}
          {activeTab === 'recommendation' && (
            <motion.div
              key="rec"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-6 space-y-6"
            >
              <div className="bg-gradient-to-br from-emerald-900/30 to-yellow-600 border border-emerald-500/20 p-6 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold text-green-950 mb-2 flex items-center gap-2">
                  <Target className="h-6 w-6 text-emerald-400" />
                  Smart Crop Recommendations
                </h2>
                <p className="text-gray-600 mb-6">Enter your location to get AI-analyzed crop suggestions based on live weather and regional climate data.</p>

                <form onSubmit={handleRecSubmit} className="relative flex items-center max-w-xl">
                  <div className="absolute left-4 text-gray-500 pointer-events-none">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="Enter location (e.g., Kanpur, UP)"
                    disabled={isRecLoading}
                    className="w-full pl-12 pr-14 py-4 bg-green-50 border border-green-300 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 rounded-2xl text-green-950 placeholder-zinc-500 transition-all shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!locationInput.trim() || isRecLoading}
                    className="absolute right-2 p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-green-50 disabled:text-gray-500 text-zinc-950 rounded-xl transition-colors shadow-lg group flex items-center justify-center min-w-[44px]"
                  >
                    {isRecLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                  </button>
                </form>
                {errorMsg && <p className="text-red-400 text-sm mt-3">{errorMsg}</p>}
              </div>

              {recData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Weather Info */}
                  <div className="flex items-center justify-between bg-green-200/20 p-5 rounded-2xl border border-green-300/50">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl">
                        <CloudSun className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-green-950 font-medium text-lg">Live Weather in {recData.location}</h3>
                        {recData.weather ? (
                          <p className="text-gray-600">
                            {recData.weather.temp}°C, {recData.weather.humidity}% Humidity, {recData.weather.condition}
                          </p>
                        ) : (
                          <p className="text-gray-500">Weather data unavailable</p>
                        )}
                      </div>
                    </div>
                    {recData.cached && (
                      <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-medium">Cached Result</span>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recData.recommendations.map((crop, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="p-5 bg-green-100/80 border-green-300/50 h-full flex flex-col hover:border-emerald-500/50 transition-colors">
                          <div className="text-4xl mb-3">{crop.icon}</div>
                          <h4 className="text-lg font-bold text-emerald-400 mb-2">{crop.name}</h4>
                          <p className="text-sm text-green-800 flex-1 leading-relaxed">{crop.reason}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Expert Advice */}
                  <Card className="p-6 bg-yellow-100/60 border-l-4 border-l-green-500 border-y-green-200 border-r-green-200 shadow-sm">
                    <div className="flex gap-4">
                      <div className="mt-1">
                        <Info className="h-6 w-6 text-green-700" />
                      </div>
                      <div>
                        <h4 className="text-green-950 font-bold mb-2">Expert Advice</h4>
                        <p className="text-green-800 leading-relaxed text-sm sm:text-base">
                          {recData.expertAdvice}
                        </p>
                      </div>
                    </div>
                  </Card>

                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
