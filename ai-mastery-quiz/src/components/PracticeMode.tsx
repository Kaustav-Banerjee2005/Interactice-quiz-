import React, { useState, useMemo } from 'react';
import { Question, QuestionFormat, DifficultyLevel, UnitType } from '../types/quiz';
import { QUESTIONS_BANK } from '../data/questions';
import { QuestionCard } from './QuestionCard';
import { Filter, RotateCcw, ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface PracticeModeProps {
  onOpenAITutorForQuestion: (q: Question, userAns: any) => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({
  onOpenAITutorForQuestion,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitType | 'All'>('All');
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Filtered pool
  const filteredQuestions = useMemo(() => {
    return QUESTIONS_BANK.filter((q) => {
      if (selectedUnit !== 'All' && q.unit !== selectedUnit) return false;
      if (selectedFormat !== 'all' && q.format !== selectedFormat) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      return true;
    });
  }, [selectedUnit, selectedFormat, selectedDifficulty, selectedTopic]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [submittedStatus, setSubmittedStatus] = useState<Record<string, boolean>>({});
  const [hasUsedFiftyFifty, setHasUsedFiftyFifty] = useState<Record<string, boolean>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, string[]>>({});
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  // Topics available in currently selected unit
  const availableTopics = useMemo(() => {
    const list = Array.from(new Set(QUESTIONS_BANK.filter(q => selectedUnit === 'All' || q.unit === selectedUnit).map(q => q.topic)));
    return list.sort();
  }, [selectedUnit]);

  // Handle filter change
  const handleResetFilters = () => {
    setSelectedUnit('All');
    setSelectedFormat('all');
    setSelectedDifficulty('all');
    setSelectedTopic('all');
    setCurrentIndex(0);
  };

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredQuestions.length - 1));
  const currentQ = filteredQuestions[safeIndex];

  const handleSelectAnswer = (ans: any) => {
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: ans,
    }));
  };

  const handleSubmitCurrent = () => {
    if (!currentQ) return;
    setSubmittedStatus((prev) => ({
      ...prev,
      [currentQ.id]: true,
    }));
  };

  const handleNext = () => {
    if (safeIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setActiveHint(null);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setActiveHint(null);
    }
  };

  const handleUseFiftyFifty = () => {
    if (!currentQ || !currentQ.options || currentQ.options.length <= 2 || hasUsedFiftyFifty[currentQ.id]) return;
    const correct = currentQ.correctAnswer;
    const wrongOptions = currentQ.options.filter((opt) => opt !== correct);
    const shuffledWrong = [...wrongOptions].sort(() => Math.random() - 0.5);
    const toEliminate = shuffledWrong.slice(0, 2);

    setEliminatedOptions((prev) => ({
      ...prev,
      [currentQ.id]: toEliminate,
    }));
    setHasUsedFiftyFifty((prev) => ({
      ...prev,
      [currentQ.id]: true,
    }));
  };

  const handleUseAIHint = async () => {
    if (!currentQ || activeHint) return;
    setIsLoadingHint(true);
    try {
      const res = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: currentQ.question,
          options: currentQ.options,
          topic: currentQ.topic,
          unit: currentQ.unit,
        }),
      });
      const data = await res.json();
      setActiveHint(data.hint || currentQ.hint);
    } catch {
      setActiveHint(currentQ.hint);
    } finally {
      setIsLoadingHint(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Interactive Practice & Mastery Hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Drill down into specific topics, question formats, and problem scenarios with immediate slide feedback.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            <span>Pool Size:</span>
            <strong className="text-indigo-600">{filteredQuestions.length} Questions</strong>
          </div>
        </div>

        {/* Filter Toolbar (Segmented Controls) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Unit Filter */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Unit</label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['All', 'Unit I', 'Unit II'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    setSelectedUnit(u);
                    setSelectedTopic('all');
                    setCurrentIndex(0);
                  }}
                  className={`flex-1 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    selectedUnit === u
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Format Filter */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Question Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value as any);
                setCurrentIndex(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Formats (7 Types)</option>
              <option value="mcq">Standard MCQs</option>
              <option value="true_false">True / False</option>
              <option value="assertion_reason">Assertion – Reason</option>
              <option value="fill_blank">Fill in the Blanks</option>
              <option value="match_following">Match the Following</option>
              <option value="scenario">Real-World Scenarios (10+)</option>
              <option value="problem_solving">Problem-Solving / Search (5+)</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Difficulty</label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => {
                    setSelectedDifficulty(diff);
                    setCurrentIndex(0);
                  }}
                  className={`flex-1 py-1 rounded text-xs font-medium capitalize transition-colors cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Topic Module</label>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Topics in {selectedUnit}</option>
              {availableTopics.map((top) => (
                <option key={top} value={top}>
                  {top}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Clear Button if modified */}
        {(selectedUnit !== 'All' || selectedFormat !== 'all' || selectedDifficulty !== 'all' || selectedTopic !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Filters active. Showing {filteredQuestions.length} matched questions.</span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Question Display */}
      {filteredQuestions.length > 0 && currentQ ? (
        <div className="space-y-6">
          <QuestionCard
            question={currentQ}
            currentIndex={safeIndex}
            totalQuestions={filteredQuestions.length}
            userAnswer={userAnswers[currentQ.id]}
            onAnswer={handleSelectAnswer}
            isAnswerSubmitted={!!submittedStatus[currentQ.id]}
            onSubmitAnswer={handleSubmitCurrent}
            eliminatedOptions={eliminatedOptions[currentQ.id] || []}
            onUseFiftyFifty={handleUseFiftyFifty}
            hasFiftyFiftyAvailable={!hasUsedFiftyFifty[currentQ.id] && (currentQ.options?.length || 0) > 2}
            onUseAIHint={handleUseAIHint}
            activeHint={activeHint}
            isLoadingHint={isLoadingHint}
            onAskAITutor={() => onOpenAITutorForQuestion(currentQ, userAnswers[currentQ.id])}
            onNext={handleNext}
            mode="practice"
          />

          {/* Stepper Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={safeIndex === 0}
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Question</span>
            </button>

            <span className="text-xs font-mono text-slate-500">
              {safeIndex + 1} of {filteredQuestions.length}
            </span>

            <button
              type="button"
              disabled={safeIndex + 1 >= filteredQuestions.length}
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-800">No questions match the selected filter combination.</p>
          <p className="text-xs text-slate-500">Try choosing a different topic or resetting filters.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
