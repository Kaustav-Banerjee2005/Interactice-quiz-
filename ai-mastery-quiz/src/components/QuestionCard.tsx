import React, { useState } from 'react';
import { Question } from '../types/quiz';
import { CheckCircle2, XCircle, Sparkles, Lightbulb, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswer?: any;
  onAnswer: (answer: any) => void;
  isAnswerSubmitted: boolean;
  onSubmitAnswer?: () => void;
  eliminatedOptions?: string[];
  onUseFiftyFifty?: () => void;
  hasFiftyFiftyAvailable?: boolean;
  onUseAIHint?: () => void;
  activeHint?: string | null;
  isLoadingHint?: boolean;
  onAskAITutor?: () => void;
  onNext?: () => void;
  mode: 'exam' | 'practice';
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  userAnswer,
  onAnswer,
  isAnswerSubmitted,
  onSubmitAnswer,
  eliminatedOptions = [],
  onUseFiftyFifty,
  hasFiftyFiftyAvailable = false,
  onUseAIHint,
  activeHint,
  isLoadingHint = false,
  onAskAITutor,
  onNext,
  mode,
}) => {
  // Local state for interactive Match the Following
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [currentMatches, setCurrentMatches] = useState<Record<string, string>>(
    (userAnswer as Record<string, string>) || {}
  );

  const isCorrect = isAnswerSubmitted && checkAnswerCorrectness(question, userAnswer);

  function checkAnswerCorrectness(q: Question, ans: any): boolean {
    if (ans === undefined || ans === null) return false;
    if (q.format === 'match_following') {
      const correct = q.correctAnswer as Record<string, string>;
      const user = (ans as Record<string, string>) || {};
      const keys = Object.keys(correct);
      return keys.length > 0 && keys.every((k) => user[k] === correct[k]);
    }
    return String(ans).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
  }

  const handleMatchSelect = (leftId: string, rightId: string) => {
    if (isAnswerSubmitted) return;
    const updated = { ...currentMatches, [leftId]: rightId };
    setCurrentMatches(updated);
    onAnswer(updated);
  };

  const handleResetMatches = () => {
    if (isAnswerSubmitted) return;
    setCurrentMatches({});
    onAnswer({});
    setSelectedLeft(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Metadata Row: Zero-pill discipline with clean typographic separators */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-500 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-indigo-700 tracking-wide uppercase">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-slate-700">{question.unit}</span>
          <span aria-hidden="true">·</span>
          <span>{question.topic}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="capitalize">{question.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums font-medium text-slate-900">{question.points} Marks</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-400 font-mono text-[11px]">{question.slideRef}</span>
        </div>
      </div>

      {/* Scenario / Context Box if present */}
      {question.context && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Case Context / Problem Description
          </div>
          <p className="whitespace-pre-line leading-relaxed">{question.context}</p>
        </div>
      )}

      {/* Code or ASCII Tree Diagram if present */}
      {question.codeOrDiagram && (
        <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
          {question.codeOrDiagram}
        </div>
      )}

      {/* Question Title */}
      <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
        {question.question}
      </h2>

      {/* Lifeline / Hint Controls (if not yet submitted) */}
      {!isAnswerSubmitted && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-2">
          <div className="flex items-center gap-2">
            {question.format !== 'match_following' && onUseFiftyFifty && hasFiftyFiftyAvailable && (
              <button
                type="button"
                onClick={onUseFiftyFifty}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
              >
                <span>50:50 Lifeline</span>
              </button>
            )}

            {onUseAIHint && (
              <button
                type="button"
                onClick={onUseAIHint}
                disabled={isLoadingHint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isLoadingHint ? 'Generating Hint...' : 'AI Hint'}</span>
              </button>
            )}
          </div>

          {onAskAITutor && (
            <button
              type="button"
              onClick={onAskAITutor}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Ask AI Tutor</span>
            </button>
          )}
        </div>
      )}

      {/* Active AI Hint Banner */}
      {activeHint && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block text-amber-800">Pedagogical Hint:</span>
            <p className="leading-relaxed">{activeHint}</p>
          </div>
        </div>
      )}

      {/* RENDER OPTIONS BASED ON FORMAT */}

      {/* 1. MATCH THE FOLLOWING FORMAT */}
      {question.format === 'match_following' && question.matchPairs && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Click a component on the left, then click its corresponding definition on the right.</span>
            {!isAnswerSubmitted && Object.keys(currentMatches).length > 0 && (
              <button
                type="button"
                onClick={handleResetMatches}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset pairings</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Column A (Component / Concept)
              </span>
              {question.matchPairs.map((pair) => {
                const isMatched = !!currentMatches[pair.id];
                const isSelected = selectedLeft === pair.id;
                return (
                  <button
                    key={pair.id}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedLeft(isSelected ? null : pair.id)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200'
                        : isMatched
                        ? 'border-indigo-200 bg-slate-50 text-slate-800'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="font-medium">{pair.left}</span>
                    {isMatched && (
                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                        Paired
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Column B (Responsibility / Definition)
              </span>
              {question.matchPairs.map((pair) => {
                // Find which left is matched to this right pair id
                const matchedLeftId = Object.keys(currentMatches).find(
                  (lKey) => currentMatches[lKey] === (question.correctAnswer as Record<string, string>)[pair.id] ||
                            currentMatches[lKey] === pair.id ||
                            currentMatches[lKey] === Object.values(question.correctAnswer as Record<string, string>).find(v => v === (question.correctAnswer as any)[lKey])
                );

                return (
                  <button
                    key={`right-${pair.id}`}
                    type="button"
                    disabled={isAnswerSubmitted || !selectedLeft}
                    onClick={() => {
                      if (selectedLeft) {
                        const correctTargetValue = (question.correctAnswer as Record<string, string>)[pair.id] || pair.id;
                        handleMatchSelect(selectedLeft, correctTargetValue);
                        setSelectedLeft(null);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                      selectedLeft
                        ? 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 cursor-pointer'
                        : 'border-slate-200 cursor-default opacity-90'
                    }`}
                  >
                    <span className="text-slate-800 text-xs sm:text-sm">{pair.right}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current matches review */}
          {Object.keys(currentMatches).length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-slate-700 block">Your Matched Pairings:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                {Object.entries(currentMatches).map(([lKey, rVal]) => {
                  const leftLabel = question.matchPairs?.find((p) => p.id === lKey)?.left || lKey;
                  return (
                    <div key={lKey} className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="font-semibold text-slate-800">{leftLabel}</span>
                      <span>→</span>
                      <span className="text-indigo-600 truncate">{rVal}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. STANDARD CHOICES (MCQ, TRUE_FALSE, ASSERTION_REASON, FILL_BLANK, SCENARIO, PROBLEM_SOLVING) */}
      {question.options && question.format !== 'match_following' && (
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const optionLetter = String.fromCharCode(65 + idx);
            const isSelected = userAnswer === option;
            const isEliminated = eliminatedOptions.includes(option);

            // Post-submission styling
            let buttonStyle = 'border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50';
            if (isEliminated && !isAnswerSubmitted) {
              buttonStyle = 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed line-through';
            } else if (isSelected && !isAnswerSubmitted) {
              buttonStyle = 'border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-200';
            } else if (isAnswerSubmitted) {
              const isOptionCorrect = option === question.correctAnswer;
              if (isOptionCorrect) {
                buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200 font-medium';
              } else if (isSelected && !isOptionCorrect) {
                buttonStyle = 'border-rose-400 bg-rose-50 text-rose-950 line-through';
              } else {
                buttonStyle = 'border-slate-200 text-slate-400 opacity-60';
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={isAnswerSubmitted || isEliminated}
                onClick={() => onAnswer(option)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${buttonStyle}`}
              >
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                    isSelected && !isAnswerSubmitted
                      ? 'bg-indigo-600 text-white'
                      : isAnswerSubmitted && option === question.correctAnswer
                      ? 'bg-emerald-600 text-white'
                      : isAnswerSubmitted && isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {optionLetter}
                </span>
                <span className="text-sm sm:text-base leading-relaxed flex-1">{option}</span>
                {isAnswerSubmitted && option === question.correctAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {isAnswerSubmitted && isSelected && option !== question.correctAnswer && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* FEEDBACK & EXPLANATION PANEL AFTER SUBMISSION */}
      {isAnswerSubmitted && (
        <div
          className={`p-5 rounded-xl border space-y-3 ${
            isCorrect
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/40 border-rose-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-emerald-700 text-sm">Correct Answer (+{question.points} Marks)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span className="font-bold text-rose-700 text-sm">Incorrect Answer</span>
                </>
              )}
            </div>
            <span className="text-xs font-mono text-slate-500">Slide Citation: {question.slideRef}</span>
          </div>

          <div className="text-sm leading-relaxed text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">Explanation & Slide Grounding:</p>
            <p>{question.explanation}</p>
          </div>

          {onAskAITutor && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <button
                type="button"
                onClick={onAskAITutor}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deep Dive with AI Teaching Assistant</span>
              </button>

              {onNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <span>{currentIndex + 1 === totalQuestions ? 'View Results' : 'Next Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBMISSION / NEXT ACTION FOOTER */}
      {!isAnswerSubmitted && onSubmitAnswer && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={
              userAnswer === undefined ||
              (question.format === 'match_following' && Object.keys(userAnswer || {}).length === 0)
            }
            onClick={onSubmitAnswer}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {mode === 'exam' ? 'Confirm & Record Answer' : 'Submit & Check Answer'}
          </button>
        </div>
      )}
    </div>
  );
};
