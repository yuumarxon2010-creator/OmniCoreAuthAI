/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Square,
  BookOpen,
  GitFork,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Download,
  Code2,
  RefreshCw,
  Cpu,
  Trophy,
  Sliders,
  ChevronRight,
  Copy,
  Check,
  User,
  AlertTriangle,
  Smile,
  Mic,
  Settings2,
  Layers,
  GraduationCap
} from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#070a12',
    primaryColor: '#0c1527',
    primaryBorderColor: '#06b6d4',
    primaryTextColor: '#f1f5f9',
    lineColor: '#818cf8',
    secondaryColor: '#172554',
    tertiaryColor: '#1e1b4b',
    fontFamily: 'Plus Jakarta Sans',
  },
});

export type SubjectType = 'Informatika/AI' | 'Matematika' | 'Fizika' | 'Kimyo' | 'Tarix' | 'Ingliz Tili';
export type VoicePersona = 'jasur' | 'malika';
export type AvatarMood = 'idle' | 'speaking' | 'strict' | 'happy';
export type AudioEngine = 'google_natural' | 'web_speech';

interface LessonData {
  topic: string;
  category: string;
  subject: string;
  simpleExplanation: string;
  mermaidDiagram: string;
  speechScript: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  keyPoints: string[];
  strictFeedback?: string;
  happyFeedback?: string;
}

const SUBJECT_CONFIGS: Record<SubjectType, {
  icon: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  defaultTopic: string;
  topics: string[];
}> = {
  'Informatika/AI': {
    icon: '💻',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    badgeBg: 'bg-cyan-950/50 text-cyan-300',
    defaultTopic: 'Informatika - Sun\'iy Neyron Tarmoqlari',
    topics: ['Neyron Tarmoqlari', 'Blokcheyn Texnologiyasi', 'Algoritmlar Murakkabligi', 'Kiberxavfsizlik Asoslari']
  },
  'Matematika': {
    icon: '📐',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    badgeBg: 'bg-blue-950/50 text-blue-300',
    defaultTopic: 'Matematika - Pifagor Teoremasi va Geometriya',
    topics: ['Pifagor Teoremasi', 'Ehtimollar Nazariyasi', 'Hosila va Integral', 'Matritsalar va Determinant']
  },
  'Fizika': {
    icon: '⚛️',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
    badgeBg: 'bg-indigo-950/50 text-indigo-300',
    defaultTopic: 'Fizika - Gravitatsiya Qonuni',
    topics: ['Gravitatsiya Qonuni', 'Kvant Superpozitsiyasi', 'Termodinamika va Entropiya', 'Nisbiylik Nazariyasi']
  },
  'Kimyo': {
    icon: '🧪',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-950/50 text-emerald-300',
    defaultTopic: 'Kimyo - Mendeleyev Davriy Qonuni va Atom',
    topics: ['Mendeleyev Qonuni', 'Kovalent Bog\'lanish', 'Kislota va Asoslar', 'Elektroliz Jarayoni']
  },
  'Tarix': {
    icon: '🏛️',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    badgeBg: 'bg-amber-950/50 text-amber-300',
    defaultTopic: 'Tarix - Amir Temur va Markazlashgan Davlat',
    topics: ['Amir Temur Saltanati', 'Buyuk Ipak Yo\'li', 'Temuriylar Renessansi', 'Qadimgi Bobil Qonunlari']
  },
  'Ingliz Tili': {
    icon: '🇬🇧',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    badgeBg: 'bg-rose-950/50 text-rose-300',
    defaultTopic: 'Ingliz Tili - Present Perfect Tense va Natijaviylik',
    topics: ['Present Perfect Tense', 'Conditional Sentences', 'Passive Voice', 'Essential Phrasal Verbs']
  }
};

const INITIAL_LESSON: LessonData = {
  topic: 'Fizika: Butunjahon Gravitatsiya Qonuni',
  category: 'Fizika',
  subject: 'Fizika',
  simpleExplanation: "Gravitatsiya — barcha massaga ega jismlarning bir-birini o'zaro tortishish fundamental kuchidir. Jismning massasi qanchalik katta bo'lsa, uning gravitatsiya maydoni shunchalik kuchli bo'ladi va masofa ortishi bilan bu kuch tez pasayadi.",
  mermaidDiagram: `graph TD
  A[Massaga ega jism M1] -->|Gravitatsiya kuchi F| C[O'zaro tortishish markazi]
  B[Massaga ega jism M2] -->|Gravitatsiya kuchi F| C
  C --> D[Masofa kvadrati R² ga teskari proportsional]
  D --> E[Sayyoralar orbital harakati]`,
  speechScript: "Gravitatsiya — barcha massaga ega jismlarning bir-birini o'zaro tortishish fundamental kuchidir. Jismning massasi qanchalik katta bo'lsa, uning tortishish kuchi shunchalik kuchli bo'ladi.",
  quiz: {
    question: "Ikki jism orasidagi masofa 2 barobar oshirilsa, ularning gravitatsion tortishish kuchi qanday o'zgaradi?",
    options: [
      "2 barobar kamayadi",
      "4 barobar kamayadi",
      "2 barobar ortadi"
    ],
    correctIndex: 1,
    explanation: "Gravitatsiya kuchi masofa kvadratiga teskari proportsionaldir (F ~ 1/R²). Shu bois masofa 2 marta ortganda, kuch 4 barobar kamayadi!"
  },
  keyPoints: [
    "Nyuton butunjahon tortishish formulasi: F = G · (m₁ · m₂) / r²",
    "Gravitatsiya doimiysi: G ≈ 6.674 × 10⁻¹¹ N·m²/kg²",
    "Sayyoralar Quyosh atrofida ellips orbitalar bo'ylab harakatlanadi"
  ],
  strictFeedback: "Diqqat! Masofa kvadratiga e'tibor bermadingiz. F = G·m1·m2/r² formulasini qayta ko'rib chiqing!",
  happyFeedback: "Ajoyib! Siz Nyutonning teskari kvadratlar qonunini to'g'ri tushundingiz!"
};

export default function App() {
  // Navigation & Subject State
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('Fizika');
  const [topicInput, setTopicInput] = useState('Fizika - Gravitatsiya qonuni');
  const [lesson, setLesson] = useState<LessonData>(INITIAL_LESSON);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  // Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Avatar Mimics State (GoPrep.gg Style)
  const [avatarMood, setAvatarMood] = useState<AvatarMood>('idle');
  const [mouthOpen, setMouthOpen] = useState(0);
  const [avatarSpeechText, setAvatarSpeechText] = useState('Salom! Men sizning AI Lektoringizman. O\'rganishni boshlaymizmi?');

  // Voice & Audio Configuration
  const [voicePersona, setVoicePersona] = useState<VoicePersona>('jasur');
  const [audioEngine, setAudioEngine] = useState<AudioEngine>('google_natural');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // UI Modals & Raw view
  const [showRawCode, setShowRawCode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const mermaidRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mouthIntervalRef = useRef<any>(null);

  // Switch subject helper
  const handleSelectSubject = (subj: SubjectType) => {
    setSelectedSubject(subj);
    const config = SUBJECT_CONFIGS[subj];
    setTopicInput(config.defaultTopic);
    handleGenerate(config.defaultTopic, subj);
  };

  // Render Mermaid diagram whenever diagram changes
  useEffect(() => {
    const renderDiagram = async () => {
      if (mermaidRef.current) {
        try {
          mermaidRef.current.removeAttribute('data-processed');
          mermaidRef.current.innerHTML = lesson.mermaidDiagram;
          await mermaid.run({
            nodes: [mermaidRef.current],
          });
        } catch (err) {
          console.warn('Mermaid rendering notice:', err);
        }
      }
    };
    renderDiagram();
  }, [lesson.mermaidDiagram]);

  // Dynamic Avatar mouth animation when speaking
  useEffect(() => {
    if (avatarMood === 'speaking') {
      mouthIntervalRef.current = setInterval(() => {
        setMouthOpen(Math.floor(Math.random() * 4)); // 0: closed, 1: small, 2: mid, 3: wide
      }, 140);
    } else {
      if (mouthIntervalRef.current) clearInterval(mouthIntervalRef.current);
      setMouthOpen(0);
    }
    return () => {
      if (mouthIntervalRef.current) clearInterval(mouthIntervalRef.current);
    };
  }, [avatarMood]);

  // Natural Uzbek TTS / Web Speech Playback
  const speakLessonText = (customText?: string) => {
    stopPlayback();

    const text = customText || lesson.speechScript || lesson.simpleExplanation;
    setAvatarSpeechText(text);
    setAvatarMood('speaking');
    setIsSpeaking(true);

    if (audioEngine === 'google_natural') {
      // Natural Uzbek Google TTS audio stream
      const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&voice=${voicePersona}&t=${Date.now()}`;
      const audio = new Audio(audioUrl);
      audio.volume = speechVolume;
      audio.playbackRate = speechRate;

      audio.onended = () => {
        setIsSpeaking(false);
        setAvatarMood('idle');
      };
      audio.onerror = () => {
        console.warn('Natural TTS stream fallback to Web Speech API');
        fallbackWebSpeech(text);
      };

      audioRef.current = audio;
      audio.play().catch(() => {
        fallbackWebSpeech(text);
      });
    } else {
      fallbackWebSpeech(text);
    }
  };

  const fallbackWebSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setAvatarMood('idle');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Pick best Uzbek voice or tuned persona
    const voices = window.speechSynthesis.getVoices();
    const uzVoice = voices.find(v => v.lang.toLowerCase().includes('uz'));
    if (uzVoice) {
      utterance.voice = uzVoice;
    } else {
      utterance.lang = 'uz-UZ';
    }

    // Voice Persona Tuning
    if (voicePersona === 'jasur') {
      utterance.pitch = speechPitch * 0.85; // Deep male authority
      utterance.rate = speechRate * 0.95;
    } else {
      utterance.pitch = speechPitch * 1.25; // Warm bright female
      utterance.rate = speechRate * 1.05;
    }
    utterance.volume = speechVolume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setAvatarMood('speaking');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setAvatarMood('idle');
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setAvatarMood('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setAvatarMood('idle');
  };

  // Lesson Generation
  const handleGenerate = async (topicToRun?: string, subjectToRun?: SubjectType) => {
    const topic = topicToRun || topicInput.trim();
    const subject = subjectToRun || selectedSubject;
    if (!topic) return;

    stopPlayback();
    setLoading(true);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setAvatarMood('speaking');
    setAvatarSpeechText(`${subject} fanidan dars tayyorlanmoqda...`);

    try {
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject,
          voicePersona
        }),
      });

      if (!response.ok) throw new Error('Generation error');
      const data: LessonData = await response.json();
      setLesson(data);
      setAvatarSpeechText(data.speechScript || data.simpleExplanation);

      // Auto trigger voice
      setTimeout(() => {
        speakLessonText(data.speechScript || data.simpleExplanation);
      }, 500);
    } catch (e) {
      console.warn('API fallback', e);
      setAvatarMood('idle');
    } finally {
      setLoading(false);
    }
  };

  // Quiz Option Click
  const handleSelectOption = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedOption(idx);
    setQuizSubmitted(true);

    const isCorrect = idx === lesson.quiz.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 100);
      setAvatarMood('happy');
      setAvatarSpeechText(lesson.happyFeedback || "✅ Barakalla! Siz to'g'ri javobni tanladingiz. Diqqat darajasi a'lo!");
      
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#a855f7']
      });

      // Speak happy feedback
      setTimeout(() => {
        speakLessonText(lesson.happyFeedback || "Barakalla! To'g'ri javob. Ballingiz oshirildi!");
      }, 300);
    } else {
      // GoPrep.gg Angry / Strict Mode!
      setAvatarMood('strict');
      const strictMsg = lesson.strictFeedback || "⚠️ Diqqatingizni jamlang! Bu joyda jiddiy xatoga yo'l qo'ydingiz!";
      setAvatarSpeechText(strictMsg);

      // Speak strict warning
      setTimeout(() => {
        speakLessonText(strictMsg);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 cyber-grid flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* TOP BAR: Brand | Links | Diqqat Bali */}
      <header className="border-b border-cyan-500/15 bg-[#070a12]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <Cpu className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
              OmniCore AI — Lecture & Voice Engine v2.0
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
            <a href="#fanlar-tanlovi" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
              Fanlar Ro'yxati
            </a>
            <a href="#avatar-studiya" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
              AI Cyber Avatar
            </a>
            <a href="#ovoz-boshqaruvi" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
              Natural TTS & Voice
            </a>
            <a href="#kognitiv-test" className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0">
              Kognitiv Test
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Diqqat Bali:</span>
              <span className="font-bold text-white text-sm tabular-nums">{score}</span>
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Single-File HTML</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">

        {/* 1. FANLAR RO'YXATI (CATEGORY SELECTOR) */}
        <section id="fanlar-tanlovi" className="cyber-card rounded-2xl p-5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 pb-3 border-b border-cyan-500/20">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                FANLAR RO'YXATI (MULTI-SUBJECT SYSTEM)
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Tanlangan fan: <span className="text-cyan-300 font-bold">{selectedSubject}</span>
            </span>
          </div>

          {/* Subject Pills (Interactive Buttons) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {(Object.keys(SUBJECT_CONFIGS) as SubjectType[]).map((subj) => {
              const cfg = SUBJECT_CONFIGS[subj];
              const isSelected = selectedSubject === subj;
              return (
                <button
                  key={subj}
                  onClick={() => handleSelectSubject(subj)}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? `bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/50 scale-[1.02]`
                      : `bg-[#0a0f1d] border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white`
                  }`}
                >
                  <span className="text-xl">{cfg.icon}</span>
                  <span className="whitespace-nowrap">{subj}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. AVATAR & LESSON HERO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 5 COLS: INTERACTIVE AI CYBER AVATAR (GoPrep.gg Style) */}
          <section id="avatar-studiya" className="lg:col-span-5 cyber-card-purple rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  AI CYBER AVATAR MIMICS
                </h2>
              </div>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${
                avatarMood === 'strict'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : avatarMood === 'happy'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : avatarMood === 'speaking'
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}>
                {avatarMood === 'strict' && '⚠️ JAHL / JIDDIY'}
                {avatarMood === 'happy' && '✨ TABASSUM / MAMNUN'}
                {avatarMood === 'speaking' && '🗣️ O\'QIMOQDA'}
                {avatarMood === 'idle' && '🧘 TUSHUNTIRISHGA TAYYOR'}
              </span>
            </div>

            {/* AVATAR DISPLAY (Dynamic SVG Canvas with GoPrep.gg Expressive Eyebrows, Visor & Mouth) */}
            <div className="flex flex-col items-center">
              
              {/* Reactive Speech Bubble */}
              <div className={`w-full mb-4 p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-300 leading-relaxed shadow-lg ${
                avatarMood === 'strict'
                  ? 'bg-rose-950/50 border-rose-500/60 text-rose-200'
                  : avatarMood === 'happy'
                  ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                  : avatarMood === 'speaking'
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-100 ring-1 ring-cyan-500/30'
                  : 'bg-[#0a0f1d] border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">
                    {voicePersona === 'jasur' ? '👨' : '👩'}
                  </span>
                  <div>
                    <span className="font-bold text-[11px] block opacity-75">
                      {voicePersona === 'jasur' ? 'Ustoz Jasur:' : 'Ustoz Malika:'}
                    </span>
                    <p className="line-clamp-3">{avatarSpeechText}</p>
                  </div>
                </div>
              </div>

              {/* The SVG Avatar */}
              <div className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center p-3 transition-all duration-500 ${
                avatarMood === 'strict'
                  ? 'bg-gradient-to-b from-rose-950/80 via-red-900/40 to-[#070a12] ring-4 ring-rose-500/50 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
                  : avatarMood === 'happy'
                  ? 'bg-gradient-to-b from-emerald-950/80 via-teal-900/40 to-[#070a12] ring-4 ring-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.4)]'
                  : avatarMood === 'speaking'
                  ? 'bg-gradient-to-b from-cyan-950/80 via-blue-900/40 to-[#070a12] ring-4 ring-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.4)]'
                  : 'bg-gradient-to-b from-slate-900 via-indigo-950/40 to-[#070a12] ring-2 ring-slate-700/60'
              }`}>
                
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md select-none">
                  <defs>
                    <linearGradient id="cyberHeadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1a233a" />
                      <stop offset="100%" stopColor="#0b0f1d" />
                    </linearGradient>
                    <linearGradient id="visorGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="visorGradStrict" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                    <linearGradient id="visorGradHappy" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>

                  {/* Cyber Head Chassis */}
                  <rect x="24" y="20" width="52" height="64" rx="26" fill="url(#cyberHeadGrad)" stroke={avatarMood === 'strict' ? '#f43f5e' : avatarMood === 'happy' ? '#10b981' : '#06b6d4'} strokeWidth="1.8" />
                  
                  {/* Neck & Audio Collar */}
                  <path d="M 38,82 L 34,94 L 66,94 L 62,82 Z" fill="#0d1424" stroke="#334155" strokeWidth="1.5" />
                  <line x1="42" y1="88" x2="58" y2="88" stroke={avatarMood === 'strict' ? '#ef4444' : '#06b6d4'} strokeWidth="2" strokeDasharray="2 2" />

                  {/* Ear Antennae / Headset */}
                  <rect x="18" y="42" width="6" height="18" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.2" />
                  <rect x="76" y="42" width="6" height="18" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.2" />

                  {/* DYNAMIC EYEBROWS (GoPrep.gg Stern vs Happy vs Neutral) */}
                  {avatarMood === 'strict' ? (
                    // Goprep.gg Angry / Furrowed Eyebrows (steep angle pointing down to nose)
                    <g stroke="#f43f5e" strokeWidth="3" strokeLinecap="round">
                      <line x1="30" y1="36" x2="47" y2="44" />
                      <line x1="53" y1="44" x2="70" y2="36" />
                      {/* Furrow wrinkle */}
                      <line x1="48" y1="39" x2="52" y2="39" stroke="#fda4af" strokeWidth="1.5" />
                    </g>
                  ) : avatarMood === 'happy' ? (
                    // Happy Raised Arched Eyebrows
                    <g stroke="#34d399" strokeWidth="2.8" strokeLinecap="round" fill="none">
                      <path d="M 30,40 Q 38,32 46,38" />
                      <path d="M 54,38 Q 62,32 70,40" />
                    </g>
                  ) : (
                    // Normal / Speaking Focused Eyebrows
                    <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="31" y1="39" x2="46" y2="40" />
                      <line x1="54" y1="40" x2="69" y2="39" />
                    </g>
                  )}

                  {/* DYNAMIC EYES */}
                  {avatarMood === 'strict' ? (
                    // Strict Squinted Eyes with Crimson Pupils
                    <g>
                      <path d="M 31,48 L 47,48 L 44,52 L 34,52 Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
                      <circle cx="39" cy="50" r="2.2" fill="#fecaca" />
                      <path d="M 53,48 L 69,48 L 66,52 L 56,52 Z" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
                      <circle cx="61" cy="50" r="2.2" fill="#fecaca" />
                    </g>
                  ) : avatarMood === 'happy' ? (
                    // Happy Inverted Smiling Arched Eyes
                    <g stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" fill="none">
                      <path d="M 32,50 Q 39,43 46,50" />
                      <path d="M 54,50 Q 61,43 68,50" />
                    </g>
                  ) : (
                    // Neutral / Focused Glowing Cyber Eyes
                    <g>
                      <circle cx="39" cy="49" r="6" fill="#082f49" stroke="#0ea5e9" strokeWidth="1.2" />
                      <circle cx="39" cy="49" r="2.5" fill="#38bdf8" />
                      <circle cx="61" cy="49" r="6" fill="#082f49" stroke="#0ea5e9" strokeWidth="1.2" />
                      <circle cx="61" cy="49" r="2.5" fill="#38bdf8" />
                    </g>
                  )}

                  {/* DYNAMIC MOUTH (Lip-Sync during Speech & Emotions) */}
                  {avatarMood === 'strict' ? (
                    // Strict Tight Grimace
                    <path d="M 38,72 Q 50,67 62,72" stroke="#f43f5e" strokeWidth="2.8" strokeLinecap="round" fill="none" />
                  ) : avatarMood === 'happy' ? (
                    // Wide Joyful Smile
                    <path d="M 36,68 Q 50,84 64,68 Z" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                  ) : avatarMood === 'speaking' ? (
                    // Phonetic Lip-sync mouth shapes
                    mouthOpen === 3 ? (
                      <ellipse cx="50" cy="71" rx="8" ry="6" fill="#0c1527" stroke="#38bdf8" strokeWidth="2" />
                    ) : mouthOpen === 2 ? (
                      <ellipse cx="50" cy="71" rx="7" ry="4" fill="#0c1527" stroke="#38bdf8" strokeWidth="2" />
                    ) : mouthOpen === 1 ? (
                      <ellipse cx="50" cy="71" rx="6" ry="2.5" fill="#0c1527" stroke="#38bdf8" strokeWidth="2" />
                    ) : (
                      <line x1="42" y1="71" x2="58" y2="71" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
                    )
                  ) : (
                    // Idle Calm Dash
                    <line x1="42" y1="71" x2="58" y2="71" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />
                  )}

                  {/* Cyber Visor Telemetry Accent */}
                  <line x1="30" y1="28" x2="70" y2="28" stroke={avatarMood === 'strict' ? '#f43f5e' : avatarMood === 'happy' ? '#10b981' : '#06b6d4'} strokeWidth="1" strokeDasharray="3 2" />
                </svg>

              </div>

              {/* Manual Emotion Test Bar */}
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-purple-500/20 w-full justify-center text-xs">
                <span className="text-slate-400 text-[11px] mr-1">Mimika:</span>
                <button
                  onClick={() => {
                    setAvatarMood('happy');
                    setAvatarSpeechText("Ajoyib natija! Doimo shunday intiling.");
                  }}
                  className={`px-2 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                    avatarMood === 'happy' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  😊 Tabassum
                </button>
                <button
                  onClick={() => {
                    setAvatarMood('strict');
                    setAvatarSpeechText("Diqqat! Bu qoidani yaxshilab eslab qoling!");
                  }}
                  className={`px-2 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                    avatarMood === 'strict' ? 'bg-rose-950 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  😠 Jiddiylik
                </button>
                <button
                  onClick={() => {
                    setAvatarMood('speaking');
                    setAvatarSpeechText("Dars mazmuni ovozli o'qilmoqda...");
                  }}
                  className={`px-2 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                    avatarMood === 'speaking' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  🗣️ So'zlash
                </button>
                <button
                  onClick={() => {
                    setAvatarMood('idle');
                    setAvatarSpeechText("Tayyorman. Mavzuni boshlashimiz mumkin.");
                  }}
                  className={`px-2 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                    avatarMood === 'idle' ? 'bg-slate-800 border-cyan-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  🧘 Tinch
                </button>
              </div>

            </div>
          </section>

          {/* RIGHT 7 COLS: TOPIC INPUT & VOICE ENGINE SETTINGS */}
          <section id="ovoz-boshqaruvi" className="lg:col-span-7 space-y-6">
            
            {/* Input card */}
            <div className="cyber-card rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    DARS GENERATORI VA MAVZU
                  </h2>
                </div>
                <span className="text-xs font-mono text-cyan-400">
                  {selectedSubject}
                </span>
              </div>

              <div className="space-y-3">
                <label htmlFor="topic-input" className="block text-xs font-semibold text-slate-300">
                  MAVZU NOMINI KIRITING:
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    id="topic-input"
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Masalan: Fizika - Gravitatsiya qonuni"
                    className="flex-1 bg-[#0a0f1d] border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                  <button
                    onClick={() => handleGenerate()}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98] cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Yaratilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>⚡ AI Leksiyani Yaratish va O'qish</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Subject specific recommended topics */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                  <span className="font-medium text-slate-400">Tavsiya mavzular:</span>
                  {SUBJECT_CONFIGS[selectedSubject].topics.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        const fullTopic = `${selectedSubject} - ${t}`;
                        setTopicInput(fullTopic);
                        handleGenerate(fullTopic);
                      }}
                      className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* NATURAL UZBEK TTS & VOICE SELECTOR CARD */}
            <div className="cyber-card-purple rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    NATURAL UZBEK TTS & OVOZ SOZLAMALARI
                  </h2>
                </div>
                <span className="text-xs font-mono text-purple-400">
                  uz-UZ Audio Core
                </span>
              </div>

              <div className="space-y-4">
                
                {/* Voice Persona Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    REPETITOR OVOZINI TANLANG:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setVoicePersona('jasur')}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                        voicePersona === 'jasur'
                          ? 'bg-blue-950/80 border-cyan-400 text-white ring-1 ring-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                          : 'bg-[#0a0f1d] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-900/60 border border-cyan-500/40 flex items-center justify-center text-lg">
                        👨
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-cyan-300">
                          Ustoz Jasur (Erkak Ovoz)
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Vazmin, qat'iy va nufuzli talaffuz
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setVoicePersona('malika')}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                        voicePersona === 'malika'
                          ? 'bg-purple-950/80 border-purple-400 text-white ring-1 ring-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                          : 'bg-[#0a0f1d] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-lg">
                        👩
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-purple-300">
                          Ustoz Malika (Ayol Ovoz)
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Do'stona, iliq va tushunarli ohang
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* TTS Engine Switcher */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0f1d] border border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Ovozli Sintez Motori:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {audioEngine === 'google_natural' 
                        ? 'Google Natural Uzbek TTS (Haqiqiy inson talaffuzi)' 
                        : 'Web Speech API (Brauzer mahalliy sintezi)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setAudioEngine('google_natural')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                        audioEngine === 'google_natural' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Google TTS (Tabiiy)
                    </button>
                    <button
                      onClick={() => setAudioEngine('web_speech')}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                        audioEngine === 'web_speech' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Web Speech
                    </button>
                  </div>
                </div>

                {/* Speed, Pitch & Volume Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Tezlik (Speed):</span>
                      <span className="font-mono text-cyan-300 tabular-nums">{speechRate.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.8"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Ohang (Pitch):</span>
                      <span className="font-mono text-purple-300 tabular-nums">{speechPitch.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.5"
                      step="0.1"
                      value={speechPitch}
                      onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Balandlik (Vol):</span>
                      <span className="font-mono text-emerald-300 tabular-nums">{Math.round(speechVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.1"
                      value={speechVolume}
                      onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Playback Trigger Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => (isSpeaking ? stopPlayback() : speakLessonText())}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
                  >
                    {isSpeaking ? (
                      <>
                        <Square className="w-4 h-4 fill-white" />
                        <span>Ovozni To'xtatish</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {voicePersona === 'jasur' ? "Jasur Ovozida O'qish" : "Malika Ovozida O'qish"}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={stopPlayback}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition cursor-pointer"
                    title="To'xtatish"
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

          </section>

        </div>

        {/* 3. LESSON ENGINE: 3 MAIN BLOCKS + QUIZ */}
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 7 COLS: BLOCK 1 & BLOCK 2 */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* 1. BLOK: 📖 SODDA TUSHUNTIRISH (2 Jumlada) */}
              <section className="cyber-card rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                        SODDA TUSHUNTIRISH (2 Jumlada)
                      </h2>
                      <span className="text-[11px] text-slate-400">Oddiy va kristall darajada tushunarli izoh</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30">
                    BLOK 01
                  </span>
                </div>

                <div className={`p-4 rounded-xl border text-slate-100 text-base sm:text-lg leading-relaxed transition-all duration-300 ${
                  isSpeaking
                    ? 'bg-cyan-950/30 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40'
                    : 'bg-[#090e1c] border-cyan-500/20'
                }`}>
                  {lesson.simpleExplanation}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Asosiy Qoidalar:
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300 font-mono">
                    {lesson.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">▹</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 2. BLOK: 📊 MERMAID.JS DIAGRAMMA */}
              <section className="cyber-card rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
                      <GitFork className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                        MERMAID.JS DIAGRAMMA
                      </h2>
                      <span className="text-[11px] text-slate-400">Vizual oqim sxemasi (Flowchart)</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded-md bg-cyan-950/40 border border-cyan-500/30">
                    BLOK 02
                  </span>
                </div>

                <div className="rounded-xl bg-[#090e1c] border border-cyan-500/20 p-5 overflow-x-auto min-h-[220px] flex items-center justify-center">
                  <div ref={mermaidRef} className="mermaid w-full text-center">
                    {lesson.mermaidDiagram}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <span className="font-mono">Format: SVG Dinamik Sxema</span>
                  <button
                    onClick={() => setShowRawCode(!showRawCode)}
                    className="text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
                  >
                    {showRawCode ? "Sxema kodini yashirish" : "Mermaid kodini ko'rish"}
                  </button>
                </div>

                {showRawCode && (
                  <pre className="mt-3 p-3 bg-black/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
                    {lesson.mermaidDiagram}
                  </pre>
                )}
              </section>

            </div>

            {/* RIGHT 5 COLS: MINI QUIZ (WITH GO-PREP.GG MIMIC REACTION) */}
            <div className="lg:col-span-5 space-y-8">
              
              <section id="kognitiv-test" className="cyber-card rounded-2xl p-6 relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                        COGNITIVE MIND: MINI-TEST
                      </h2>
                      <span className="text-[11px] text-slate-400">O'quvchi diqqatini tekshirish</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30">
                    DIQQAT SINOVI
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {lesson.quiz.question}
                  </p>

                  {/* 3 Variant Options */}
                  <div className="space-y-2.5">
                    {lesson.quiz.options.map((opt, idx) => {
                      const isCorrect = idx === lesson.quiz.correctIndex;
                      const isSelected = selectedOption === idx;

                      let btnStyle = "bg-[#0a0f1d] border-slate-700/80 hover:border-cyan-400 text-slate-200";
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-950/50 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-950/50 border-rose-500 text-rose-200 ring-1 ring-rose-500/40";
                        } else {
                          btnStyle = "bg-[#0a0f1d] border-slate-800 text-slate-500 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={quizSubmitted}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-cyan-400 font-bold">
                              {String.fromCharCode(65 + idx)})
                            </span>
                            <span>{opt}</span>
                          </span>

                          {quizSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {quizSubmitted && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Result & Avatar Reaction Banner */}
                  {quizSubmitted && (
                    <div className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 transition-all ${
                      selectedOption === lesson.quiz.correctIndex
                        ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200'
                        : 'border-rose-500/50 bg-rose-950/40 text-rose-200'
                    }`}>
                      <div className="font-bold flex items-center gap-2">
                        {selectedOption === lesson.quiz.correctIndex ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>✅ Ball +100! Diqqat darajasi a'lo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>
                              ❌ Javob noto'g'ri. To'g'ri variant: {String.fromCharCode(65 + lesson.quiz.correctIndex)}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed font-sans">
                        {lesson.quiz.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </section>

            </div>

          </div>

        </div>

      </main>

      {/* SINGLE-FILE EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="cyber-card rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  Single-File HTML (voice_engine.html)
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Barcha yangi funksiyalar (Natural Uzbek TTS, Erkak/Ayol ovoz tanlash, 6 ta fanlar ro'yxati va GoPrep.gg uslubidagi interaktiv emotsional avatar) <code className="text-cyan-300 font-mono">public/voice_engine.html</code> fayliga to'liq jamlangan.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="/voice_engine.html"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Single-File HTML ni Ochish / Yuklash</span>
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/voice_engine.html');
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2000);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm border border-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                {codeCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{codeCopied ? "Nusxalandi!" : "Havolani nusxalash"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-cyan-500/10 mt-16 py-6 bg-[#05070e] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span className="text-slate-400 font-medium">OmniCore AI Ecosystem · 2-Modul</span>
          </div>
          <p className="font-mono text-slate-500">
            Natural Uzbek TTS · Ustoz Jasur & Malika · 6 Multi-Subject · GoPrep.gg Cyber Avatar
          </p>
          <div className="text-slate-400">
            Holat: <span className="text-emerald-400 font-medium">● Neural Voice Core Faol</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
