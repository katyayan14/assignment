import { Bot, HeartPulse, Cpu, ArrowRight, Banknote, GraduationCap, Plane, Search, ChevronDown, Briefcase, Megaphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Persona = 'general' | 'healthcare' | 'technology' | 'finance' | 'education' | 'travel' | 'interview' | 'marketing';

export default function Home() {
  const [query, setQuery] = useState('');
  const headerRef = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 0, y: 0 });
  const [selectedPersona, setSelectedPersona] = useState<Persona>(() => (localStorage.getItem('persona') as Persona) || 'general');
  const gridRef = useRef<HTMLDivElement>(null);
  const [pickerFocused, setPickerFocused] = useState(false);
  const [pickerValue, setPickerValue] = useState<string>(''); // empty shows placeholder "Assistants"
  useEffect(() => {
    document.title = 'Chatbot - Choose Assistant';
  }, []);

  const choose = (p: Persona) => {
    localStorage.setItem('persona', p);
    window.location.hash = '#/chat';
  };

  const tryPrompt = (p: Persona, prompt: string) => {
    localStorage.setItem('persona', p);
    localStorage.setItem('prefill_prompt', prompt);
    window.location.hash = '#/chat';
  };

  const browseAssistants = () => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Catalog of assistants. When query is empty, show only core ones (hidden=false).
  const assistantsAll: Array<{
    key: string;
    title: string;
    desc: string;
    Icon: any;
    samples: string[];
    routePersona: Persona;
    hidden?: boolean; // hidden from default view
  }> = [
    { key: 'general', title: 'General', desc: 'Friendly helper for everyday tasks.', Icon: Bot, samples: ['Plan my day with 3 tasks', 'Summarize this pasted text', 'Draft a polite email'], routePersona: 'general' },
    { key: 'interview', title: 'Interview Coach', desc: 'Practice for your next job interview.', Icon: Briefcase, samples: ['Start a SWE interview', 'Mock PM interview', 'Practice behavioral questions'], routePersona: 'interview' },
    { key: 'healthcare', title: 'Healthcare', desc: 'Wellness info, not medical advice.', Icon: HeartPulse, samples: ['20‑min home workout', 'Balanced breakfast ideas', 'Sleep hygiene tips'], routePersona: 'healthcare' },
    { key: 'technology', title: 'Technology', desc: 'Explain tech, code, and tools.', Icon: Cpu, samples: ['Explain React hooks simply', 'Fix this error', 'Pros/cons of TypeScript'], routePersona: 'technology' },
    { key: 'finance', title: 'Finance', desc: 'Budgeting and money habits.', Icon: Banknote, samples: ['50/30/20 budget example', 'Save on groceries', 'Emergency fund plan'], routePersona: 'finance' },
    { key: 'education', title: 'Education', desc: 'Study help and strategies.', Icon: GraduationCap, samples: ['Study plan for algebra', 'Explain photosynthesis', 'Active recall ideas'], routePersona: 'education' },
    { key: 'travel', title: 'Travel', desc: 'Itineraries and local tips.', Icon: Plane, samples: ['3‑day Goa itinerary', 'Cheapest way to Udaipur', 'Must‑see in Jaipur'], routePersona: 'travel' },

    // Extended assistants (only appear when searching)
    { key: 'cooking', title: 'Cooking', desc: 'Recipes and meal planning.', Icon: Bot, samples: ['Easy paneer dinner', '5‑day veg meal prep', 'Healthy snacks list'], routePersona: 'education', hidden: true },
    { key: 'fitness', title: 'Fitness', desc: 'Workouts and habit building.', Icon: HeartPulse, samples: ['Beginner 3‑day split', '10‑min stretch routine', 'Steps to build consistency'], routePersona: 'healthcare', hidden: true },
    { key: 'career', title: 'Career', desc: 'Resume, interviews, growth.', Icon: Bot, samples: ['Rewrite my resume bullet', 'Mock interview questions', '30‑60‑90 day plan'], routePersona: 'education', hidden: true },
    { key: 'marketing', title: 'Marketing', desc: 'Copy and campaign ideas.', Icon: Megaphone, samples: ['Taglines for a bakery', 'Instagram post ideas', 'Email subject lines'], routePersona: 'marketing', hidden: true },
    { key: 'math', title: 'Math Tutor', desc: 'Step‑by‑step solutions.', Icon: GraduationCap, samples: ['Solve: 2x+5=17', 'Explain derivatives', 'Practice problems for ratios'], routePersona: 'education', hidden: true },
    { key: 'history', title: 'History', desc: 'Events and timelines.', Icon: GraduationCap, samples: ['Causes of WWI', 'Mughal empire overview', 'Timeline of Indian independence'], routePersona: 'education', hidden: true },
  ];

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-cyan-900/30 animate-pulse"></div>
      <div className="h-full w-full bg-gray-900/90 backdrop-blur-xl flex flex-col overflow-hidden relative z-10 border border-gray-700/50">
        <header
          ref={headerRef}
          onMouseMove={(e) => {
            const el = headerRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            setGlow({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          onMouseLeave={() => setGlow({ x: 0, y: 0 })}
          className="text-white p-6 overflow-hidden sticky top-0 z-20 border-b border-white/10 bg-gray-900/30 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
        >
          {/* Parallax glow that follows the cursor */}
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ left: glow.x, top: glow.y, width: 260, height: 260, background: 'radial-gradient(closest-side, rgba(59,130,246,0.18), transparent 70%)' }}
          />
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ left: glow.x * 0.85, top: glow.y * 0.85, width: 200, height: 200, background: 'radial-gradient(closest-side, rgba(168,85,247,0.12), transparent 70%)' }}
          />
          <div className="flex items-center gap-4 max-w-6xl mx-auto justify-center relative px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700/30 to-gray-600/30 border border-gray-500/50 flex items-center justify-center backdrop-blur-sm shadow-lg animate-glow">
              <Bot className="w-7 h-7 text-gray-300" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">Chatbot</h1>
              <p className="text-xs md:text-sm text-gray-300 mt-1">Choose a specialized assistant to begin</p>
            </div>
            {/* Right side controls */}
            <div className="w-full md:w-auto md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 flex items-center gap-3 mt-3 md:mt-0">
              <div className="relative group">
                {/* Gradient glow on focus */}
                <div className={`pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-blue-500/40 blur-md transition-opacity ${pickerFocused ? 'opacity-100' : 'opacity-0'}`}></div>
                <select
                  value={pickerValue}
                  onChange={(e) => {
                    const key = e.target.value;
                    const found = assistantsAll.find(a => a.key === key);
                    const personaToSet = (found?.routePersona || 'general') as Persona;
                    setSelectedPersona(personaToSet);
                    localStorage.setItem('persona', personaToSet);
                    if (found) {
                      setQuery(found.title);
                    }
                    setPickerValue(key);
                  }}
                  onFocus={() => setPickerFocused(true)}
                  onBlur={() => setPickerFocused(false)}
                  className="appearance-none pl-3 pr-9 py-2 rounded-2xl bg-gray-900/60 backdrop-blur border border-gray-600 text-gray-200 text-sm shadow-lg hover:bg-gray-900/70 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-colors min-w-[12rem] w-full md:w-auto"
                >
                  <option value="" disabled hidden>Assistants</option>
                  <optgroup label="Core assistants">
                    {assistantsAll.filter(a => !a.hidden).map(a => (
                      <option key={a.key} value={a.key}>{a.title}</option>
                    ))}
                  </optgroup>
                  <optgroup label="More">
                    {assistantsAll.filter(a => a.hidden).map(a => (
                      <option key={a.key} value={a.key}>{a.title}</option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="pointer-events-none w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 group-hover:text-gray-200" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto min-h-[70vh] flex flex-col items-center justify-center">

            <div className="mb-5 w-full max-w-md relative mx-auto px-4 md:px-0">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search assistants..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div ref={gridRef} className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mx-auto px-4 md:px-0 w-full">
              {(assistantsAll
                .filter(c => (c.title + ' ' + c.desc).toLowerCase().includes(query.toLowerCase()))
                .filter(c => query.trim() ? true : !c.hidden)
              ).map(c => (
                <div
                  key={c.key}
                  className="group relative text-left p-6 md:p-8 min-h-40 rounded-2xl border border-gray-700 bg-gray-800/60 md:hover:bg-gray-800/80 transition text-gray-200 will-change-transform duration-200 ease-out transform md:hover:scale-[1.02] md:hover:-translate-y-0.5 md:hover:shadow-xl md:hover:shadow-blue-900/20 md:hover:rotate-[0.25deg]"
                >
                  <div className="flex items-center gap-2 text-xl font-semibold">
                    <c.Icon className="w-5 h-5" /> {c.title}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{c.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.samples.map((s, i) => (
                      <button key={i} onClick={() => tryPrompt(c.routePersona, s)} className="px-3 py-1.5 rounded-full text-xs bg-gray-700/70 hover:bg-gray-700 border border-gray-600 text-gray-200">{s}</button>
                    ))}
                  </div>
                  <button onClick={() => choose(c.routePersona)} className="mt-4 inline-flex items-center gap-2 text-blue-300 text-sm">Start <ArrowRight className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

