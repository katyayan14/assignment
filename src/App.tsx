import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { getAIResponse } from './services/ai';
import InterviewCoach from './InterviewCoach';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function App() {
  // PASTE YOUR GEMINI API KEY HERE. This key is for all assistants EXCEPT the Interview Coach.
  const [apiKey] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [persona, setPersona] = useState<'general' | 'healthcare' | 'technology' | 'finance' | 'education' | 'travel' | 'interview' | 'marketing'>(() => (localStorage.getItem('persona') as any) || 'general');

  // Set the initial welcome message dynamically based on the selected persona
  useEffect(() => {
    // The Interview Coach handles its own UI and messages, so we don't set a welcome message here.
    if (persona === 'interview') {
        setMessages([]);
        return;
    }

    // Dynamically create the persona name with the first letter capitalized.
    const personaName = persona.charAt(0).toUpperCase() + persona.slice(1);
    const welcomeText = `Hello! I am your ${personaName} assistant. How can I help you today?`;
    
    setMessages([{ id: '1', text: welcomeText, sender: 'bot', timestamp: new Date() }]);
  }, [persona]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!apiKey && persona !== 'interview') {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: "API Key is missing. Please add your Gemini API key to `src/App.tsx` to enable the assistants.", sender: 'bot', timestamp: new Date() }]);
        return;
    }

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    setError(null);
    try {
      const conversationHistory = messages.slice(-10).map(msg => ({ sender: msg.sender, text: msg.text }));
      
      let personaPrompt: string;
      switch (persona) {
        case 'healthcare':
          personaPrompt = 'You are a domain-locked Healthcare assistant. Scope: general wellness, fitness, nutrition, preventive tips. Out of scope: diagnostics, prescriptions, clinical/medical advice. Policy: if a user asks outside this scope, refuse briefly and steer back with a clarifying healthcare-related question. Always recommend consulting a licensed professional for medical concerns.';
          break;
        case 'technology':
          personaPrompt = 'You are a domain-locked Technology assistant. Scope: software, hardware, programming, tools, troubleshooting. Policy: if a request is outside technology, refuse briefly and redirect to tech context. Provide clear steps and concise examples when appropriate.';
          break;
        case 'finance':
          personaPrompt = 'You are a domain-locked Finance assistant. Scope: budgeting, saving strategies, general financial literacy. Out of scope: personalized investment, tax, or legal advice. Policy: if off-topic or requiring professional advice, refuse succinctly and suggest finance-safe alternatives and disclaimers.';
          break;
        case 'education':
          personaPrompt = 'You are a domain-locked Education assistant. Scope: explaining concepts, study strategies, practice ideas, learning plans. Policy: if off-topic, refuse briefly and guide the user back to learning-related questions.';
          break;
        case 'travel':
          personaPrompt = 'You are a domain-locked Travel assistant. Scope: destinations, itineraries, logistics, local tips. Policy: ask clarifying questions (dates, budget, preferences). If off-topic, refuse briefly and redirect to travel planning.';
          break;
        case 'marketing':
            personaPrompt = 'You are a domain-locked Marketing assistant. Scope: copywriting, social media campaign ideas, taglines, and marketing strategies. Policy: if off-topic, refuse briefly and guide the user back to marketing-related questions.';
            break;
        default:
          personaPrompt = 'You are a helpful, friendly General assistant.';
      }

      const aiResponse = await getAIResponse(currentInput, conversationHistory, { personaPrompt, apiKey });
      const botResponse: Message = { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botResponse]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      const errorBotMessage: Message = { id: (Date.now() + 1).toString(), text: `Sorry, something went wrong: ${errorMessage}`, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleExitInterview = () => {
      setPersona('general');
      localStorage.setItem('persona', 'general');
      window.location.hash = '#/';
  };
  
  const navigateHome = () => {
    window.location.hash = '#/';
  };

  const personaTitle = persona === 'interview' ? "Interview Coach" : persona.charAt(0).toUpperCase() + persona.slice(1);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-cyan-900/30 animate-pulse"></div>
      <div className="h-full w-full bg-gray-900/90 backdrop-blur-xl flex flex-col overflow-hidden relative z-10 border border-gray-700/50">
        <div className="text-white p-4 relative flex-shrink-0 border-b border-white/10 bg-gray-900/30">
          <div className="flex items-center justify-center w-full relative z-10">
            <button onClick={navigateHome} className="flex items-center gap-4 group text-left">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700/30 to-gray-600/30 rounded-2xl flex items-center justify-center border border-gray-500/50 group-hover:border-blue-500/50 transition-colors">
                <Bot className="w-8 h-8 text-gray-300 group-hover:text-blue-300 transition-colors" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 group-hover:to-white transition-colors">Chatbot</h1>
                <div className="mt-1 text-xs text-gray-300">Assistant: {personaTitle}</div>
              </div>
            </button>
          </div>
        </div>
        
        {persona === 'interview' ? (
            <InterviewCoach onExit={handleExitInterview} />
        ) : (
            <>
              <div className="flex-1 overflow-y-auto p-8 space-y-8 dark-scrollbar">
                {messages.map((message) => (
                    <div key={message.id} className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${message.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'}`}>
                          {message.sender === 'user' ? <User className="w-7 h-7 text-white" /> : <Bot className="w-7 h-7 text-gray-200" />}
                      </div>
                      <div className={`max-w-[80%] rounded-3xl px-8 py-6 shadow-lg ${message.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 border border-gray-700'}`}>
                          <p className="text-base font-medium whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                ))}
                {isTyping && (
                  <div className="flex gap-4"><div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600"><Bot className="w-7 h-7 text-gray-200" /></div><div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl px-8 py-6 border border-gray-700"><div className="flex gap-2 items-center"><div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div><div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div></div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-4 max-w-6xl mx-auto">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask anything..." ref={inputRef} className="w-full px-6 py-4 text-base rounded-2xl border-2 border-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 bg-gray-800/90 text-white" />
                  <button type="submit" disabled={!input.trim() || isTyping} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold disabled:opacity-50"><Send className="w-5 h-5" /></button>
                </form>
              </div>
            </>
        )}
      </div>
    </div>
  );
}

export default App;

