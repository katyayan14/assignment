import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Type definition for chat messages to prevent TypeScript errors
type ChatMessage = { sender: 'bot' | 'user'; text: string };

// Custom SVG Icon component to maintain visual consistency
const SvgIcon = ({ path, className = 'w-8 h-8' }: { path: string, className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path></svg>
);

// New component to inject custom scrollbar styles
const ScrollbarStyles = () => (
    <style>{`
        .dark-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .dark-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .dark-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
            border-radius: 3px;
        }
        .dark-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #60a5fa, #a78bfa);
        }
    `}</style>
);

const icons: { [key: string]: string } = {
    'Software Engineer': "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    'Product Manager': "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    'Data Scientist': "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    'UX/UI Designer': "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    'Marketing Manager': "M11 5.882V19.24a1.76 1.76 0 01-3.417*.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.332 1.66 18.168 0 17.532 0H14.12a1 1 0 00-1 .66L10.512 7.5H7a4 4 0 00-3.468 2.115l-1.473 3.436a1 1 0 00.52 1.341l3.468 1.473z",
    'General': "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
};

const colorClasses: { [key: string]: { border: string, bg: string, shadow: string, text: string } } = {
    'Software Engineer': { border: 'hover:border-blue-500', bg: 'hover:bg-blue-500/10', shadow: 'hover:shadow-blue-500/20', text: 'group-hover:text-blue-400' },
    'Product Manager': { border: 'hover:border-green-500', bg: 'hover:bg-green-500/10', shadow: 'hover:shadow-green-500/20', text: 'group-hover:text-green-400' },
    'Data Scientist': { border: 'hover:border-purple-500', bg: 'hover:bg-purple-500/10', shadow: 'hover:shadow-purple-500/20', text: 'group-hover:text-purple-400' },
    'UX/UI Designer': { border: 'hover:border-pink-500', bg: 'hover:bg-pink-500/10', shadow: 'hover:shadow-pink-500/20', text: 'group-hover:text-pink-400' },
    'Marketing Manager': { border: 'hover:border-yellow-500', bg: 'hover:bg-yellow-500/10', shadow: 'hover:shadow-yellow-500/20', text: 'group-hover:text-yellow-400' },
    'General': { border: 'hover:border-teal-500', bg: 'hover:bg-teal-500/10', shadow: 'hover:shadow-teal-500/20', text: 'group-hover:text-teal-400' },
};

export default function InterviewCoach({ onExit }: { onExit: () => void }) {
    const [apiKey] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [interviewState, setInterviewState] = useState('awaiting_topic');
    const [interviewTopic, setInterviewTopic] = useState('');
    const [questionCount, setQuestionCount] = useState(0);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
    const [feedbackData, setFeedbackData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);
    const [customRole, setCustomRole] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<Chart | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    // Auto-expand textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [input]);

    const startInterview = (topic: string) => {
        setInterviewTopic(topic);
        setInterviewState('awaiting_question_count');
        setMessages([{ sender: 'bot', text: `You've selected '${topic}'. How many questions would you like (1-7)?` }]);
    };
    
    const handleCustomRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const role = customRole.trim();
        if (role) startInterview(role);
    };

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const userMessage = input.trim();
        if (!userMessage) return;
        
        if (!apiKey) {
            setMessages(prev => [...prev, { sender: 'bot', text: "API Key is missing. Please add your Gemini API key." }]);
            return;
        }

        // Fix: Explicitly type the new messages array to satisfy TypeScript
        const updatedMessages: ChatMessage[] = [...messages, { sender: 'user', text: userMessage }];
        setMessages(updatedMessages);
        setInput('');
        
        if (interviewState === 'awaiting_question_count') {
            const num = parseInt(userMessage, 10);
            if (isNaN(num) || num <= 0 || num > 7) {
                setMessages([...updatedMessages, { sender: 'bot', text: 'Please enter a valid number (1-7).' }]);
                return;
            }
            setQuestionCount(num);
            setInterviewState('in_progress');
            setCurrentQuestionNumber(1);
            
            const initialUserMessage = `Let's start the mock interview for the ${interviewTopic} role. Ask me ${num} questions.`;
            const initialHistory = [{ role: 'user', parts: [{ text: initialUserMessage }] }];
            setChatHistory(initialHistory);
            await callAIApi(num, 1, updatedMessages, initialHistory);
        } else {
            const nextQNumber = currentQuestionNumber + 1;
            setCurrentQuestionNumber(nextQNumber);
            const updatedHistory = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];
            setChatHistory(updatedHistory);
            await callAIApi(questionCount, nextQNumber, updatedMessages, updatedHistory);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isLoading) handleSend();
        }
    };

    const callAIApi = async (totalQuestions: number, nextQuestionNum: number, currentMessages: ChatMessage[], currentHistory: typeof chatHistory) => {
        setIsLoading(true);

        const systemPrompt = `You are an expert interviewer named Alex. Conducting a mock interview for '${interviewTopic}'.
- Ask exactly ${totalQuestions} questions.
- One question at a time.
- After the final answer, provide ONLY a JSON object: { "clarity": 1-5, "technical_knowledge": 1-5, "problem_solving": 1-5, "communication": 1-5, "overall_summary": "...", "areas_of_excellence": "...", "suggestions_for_improvement": "..." }
- No markdown formatting. Plain text only.`;
        
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: currentHistory,
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2000,
                        responseMimeType: nextQuestionNum > totalQuestions ? "application/json" : "text/plain",
                    }
                })
            });

            if (!response.ok) throw new Error("API Failure");

            const result = await response.json();
            const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: aiText }] }]);

            if (nextQuestionNum > totalQuestions) {
                const feedback = JSON.parse(aiText);
                setFeedbackData(feedback);
                setInterviewState('finished');
                setMessages([...currentMessages, { sender: 'bot', text: 'Interview complete! View your report below.' }]);
            } else {
                setMessages([...currentMessages, { sender: 'bot', text: aiText }]);
            }
        } catch (error) {
            setMessages([...currentMessages, { sender: 'bot', text: 'Error connecting to AI. Check API key.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderFeedbackReport = () => {
        if (!feedbackData) return null;
        
        const renderChart = (canvas: HTMLCanvasElement | null) => {
            if (!canvas) return;
            if (chartRef.current) chartRef.current.destroy();
            const ctx = canvas.getContext('2d');
            if (ctx) {
                chartRef.current = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: ['Clarity', 'Technical', 'Problem Solving', 'Communication'],
                        datasets: [{
                            label: 'Score',
                            data: [feedbackData.clarity, feedbackData.technical_knowledge, feedbackData.problem_solving, feedbackData.communication],
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 2,
                        }]
                    },
                    options: {
                        scales: { r: { beginAtZero: true, max: 5, angleLines: { color: 'rgba(255, 255, 255, 0.2)' }, grid: { color: 'rgba(255, 255, 255, 0.2)' }, pointLabels: { color: '#d1d5db' }, ticks: { display: false }}},
                        plugins: { legend: { display: false } },
                        maintainAspectRatio: false
                    }
                });
            }
        };

        return (
            <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-xl z-20 p-8 overflow-y-auto dark-scrollbar">
                <div className="max-w-3xl mx-auto space-y-6 pb-12">
                    <h2 className="text-3xl font-bold text-center text-white border-b border-gray-600 pb-4">Performance Report</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gray-800/50 p-6 rounded-2xl h-80 border border-gray-700 shadow-inner">
                            <canvas ref={renderChart}></canvas>
                        </div>
                        <div className="space-y-4">
                            {['Clarity', 'Technical Knowledge', 'Problem Solving', 'Communication'].map((skill, i) => (
                                <div key={skill} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                    <span className="font-medium text-gray-300">{skill}</span>
                                    <div className="text-amber-400 text-xl font-bold">
                                        {feedbackData[skill.toLowerCase().replace(' ', '_')] || 0}/5
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                            <h3 className="font-bold text-lg text-blue-400 mb-2">Overall Summary</h3>
                            <p className="text-gray-300 leading-relaxed">{feedbackData.overall_summary}</p>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                            <h3 className="font-bold text-lg text-green-400 mb-2">Areas of Excellence</h3>
                            <p className="text-gray-300 leading-relaxed">{feedbackData.areas_of_excellence}</p>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                            <h3 className="font-bold text-lg text-amber-400 mb-2">Suggestions for Improvement</h3>
                            <p className="text-gray-300 leading-relaxed">{feedbackData.suggestions_for_improvement}</p>
                        </div>
                    </div>
                    <div className="text-center pt-8">
                        <button onClick={onExit} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform active:scale-95">Return to Dashboard</button>
                    </div>
                </div>
            </div>
        );
    };

    if (showReport) return renderFeedbackReport();

    return (
        <>
            <ScrollbarStyles />
            <div className="flex flex-col h-full bg-transparent">
                {interviewState === 'awaiting_topic' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-100 mb-2">AI Interview Coach</h2>
                        <p className="text-gray-400 mb-8">Select a target role or enter your own.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl">
                            {Object.entries(icons).map(([topic, path]) => (
                                <button key={topic} onClick={() => startInterview(topic)} className={`group p-4 rounded-2xl font-semibold flex flex-col items-center justify-center space-y-3 bg-gray-800/50 border border-gray-700 hover:-translate-y-1 hover:shadow-xl transition-all ${colorClasses[topic].border} ${colorClasses[topic].bg} ${colorClasses[topic].shadow}`}>
                                    <SvgIcon path={path} className={`w-8 h-8 text-gray-400 transition-colors ${colorClasses[topic].text}`} />
                                    <span className="text-gray-200 text-sm">{topic}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 text-center w-full max-w-sm">
                            <p className="text-gray-400 mb-4">Custom Role Practice</p>
                            <form onSubmit={handleCustomRoleSubmit} className="flex items-center shadow-2xl">
                                <input
                                    type="text"
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                    placeholder="e.g., DevOps Architect"
                                    className="w-full px-5 py-3 text-base rounded-l-2xl border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 bg-gray-800/90 text-white"
                                />
                                <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-r-2xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all active:scale-95">Go</button>
                            </form>
                        </div>
                        <button onClick={onExit} className="mt-12 text-gray-500 text-sm hover:text-white transition-colors">
                            Cancel and go back
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 dark-scrollbar">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse animate-slide-in-right' : 'flex-row animate-slide-in-left'}`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'}`}>
                                        {msg.sender === 'user' ? <SvgIcon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" className="w-6 h-6" /> : <SvgIcon path="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-6 h-6" />}
                                    </div>
                                    <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-md ${msg.sender === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm' : 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 rounded-tl-sm border border-gray-700'}`}>
                                        <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                             {interviewState === 'finished' && (
                                 <div className="flex justify-center p-6">
                                     <button onClick={() => setShowReport(true)} className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 px-10 rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95">View Performance Analysis</button>
                                 </div>
                             )}
                            {isLoading && (
                                <div className="flex gap-4 animate-pulse">
                                    <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700"></div>
                                    <div className="bg-gray-800/50 rounded-2xl px-8 py-5 border border-gray-700 flex gap-1">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        {interviewState !== 'finished' && (
                            <div className="border-t border-gray-700 bg-gray-900/50 p-6">
                                <form onSubmit={handleSend} className="flex items-end gap-4 max-w-5xl mx-auto">
                                    <textarea
                                        ref={textareaRef}
                                        rows={1}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={interviewState === 'awaiting_question_count' ? "Questions count (1-7)..." : "Draft your response..."}
                                        className="w-full px-6 py-4 text-base rounded-2xl border-2 border-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-gray-800/90 text-white resize-none overflow-y-auto dark-scrollbar"
                                        style={{maxHeight: '180px'}}
                                    />
                                    <button type="submit" disabled={!input.trim() || isLoading} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl font-bold disabled:opacity-30 disabled:grayscale transition-all hover:shadow-lg shadow-blue-500/20 active:scale-95">
                                        <SvgIcon path="M5 12h14M12 5l7 7-7 7" className="w-6 h-6" />
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
