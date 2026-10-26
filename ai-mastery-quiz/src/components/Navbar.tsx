import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: 'exam' | 'practice' | 'bank' | 'leaderboard';
  onSelectTab: (tab: 'exam' | 'practice' | 'bank' | 'leaderboard') => void;
  onOpenAITutor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAITutor,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onSelectTab('exam')}
          className="text-left flex items-center gap-2.5 text-slate-900 hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
            AI
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              AI Quiz Game
            </span>
            <span className="hidden sm:inline-block text-xs font-normal text-slate-500 ml-2">
              Units I & II · 25 Marks
            </span>
          </div>
        </button>

        {/* Zone 2: 4 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('exam')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer ${
              currentTab === 'exam'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Exam Mode (25M)
          </button>
          <button
            onClick={() => onSelectTab('practice')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer ${
              currentTab === 'practice'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Practice Hub
          </button>
          <button
            onClick={() => onSelectTab('bank')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer ${
              currentTab === 'bank'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Question Bank (56)
          </button>
          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 cursor-pointer ${
              currentTab === 'leaderboard'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Leaderboard
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAITutor}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Ask AI Teaching Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Tutor</span>
          </button>
          <button
            onClick={() => onSelectTab('exam')}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            Start Assessment
          </button>
        </div>
      </div>

      {/* Mobile nav subrow */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-slate-100 bg-slate-50 text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => onSelectTab('exam')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentTab === 'exam' ? 'bg-indigo-600 text-white' : ''}`}
        >
          Exam (25M)
        </button>
        <button
          onClick={() => onSelectTab('practice')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentTab === 'practice' ? 'bg-indigo-600 text-white' : ''}`}
        >
          Practice
        </button>
        <button
          onClick={() => onSelectTab('bank')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentTab === 'bank' ? 'bg-indigo-600 text-white' : ''}`}
        >
          Q-Bank
        </button>
        <button
          onClick={() => onSelectTab('leaderboard')}
          className={`px-3 py-1 rounded whitespace-nowrap ${currentTab === 'leaderboard' ? 'bg-indigo-600 text-white' : ''}`}
        >
          Leaderboard
        </button>
      </div>
    </header>
  );
};
