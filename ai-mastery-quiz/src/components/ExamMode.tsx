import React, { useState, useEffect } from 'react';
import { Question } from '../types/quiz';
import { sampleRandomExamQuestions, formatTime } from '../utils/quizHelpers';
import { QuestionCard } from './QuestionCard';
import { Timer, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Shuffle } from 'lucide-react';

interface ExamModeProps {
  onCompleteExam: (results: {
    questions: Question[];
    userAnswers: Record<string, any>;
    score: number;
    timeSpentSeconds: number;
  }) => void;
  onOpenAITutorForQuestion: (q: Question, userAns: any) => void;
}

export const ExamMode: React.FC<ExamModeProps> = ({
  onCompleteExam,
  onOpenAITutorForQuestion,
}) => {
  const [examQuestions, setExamQuestions] = useState<Question[]>(() => sampleRandomExamQuestions(10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes (600s)
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});

  // Lifelines in Exam Mode:
  const [hasUsedFiftyFifty, setHasUsedFiftyFifty] = useState<Record<string, boolean>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, string[]>>({});
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isTimerPaused || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, timeRemaining]);

  const currentQ = examQuestions[currentIndex];

  const handleRestartNewSample = () => {
    const newQs = sampleRandomExamQuestions(10);
    setExamQuestions(newQs);
    setCurrentIndex(0);
    setUserAnswers({});
    setTimeRemaining(600);
    setFlaggedQuestions({});
    setHasUsedFiftyFifty({});
    setEliminatedOptions({});
    setActiveHint(null);
    setShowSubmitConfirm(false);
  };

  const handleSelectAnswer = (ans: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: ans,
    }));
  };

  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  // 50:50 Lifeline logic
  const handleUseFiftyFifty = () => {
    if (!currentQ.options || currentQ.options.length <= 2 || hasUsedFiftyFifty[currentQ.id]) return;
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

  // AI Hint via backend
  const handleUseAIHint = async () => {
    if (activeHint) return;
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

  const handleSubmitFinal = () => {
    // Calculate total score out of 25 marks (2.5 marks each)
    let totalScore = 0;
    examQuestions.forEach((q) => {
      const uAns = userAnswers[q.id];
      if (uAns !== undefined && uAns !== null) {
        if (q.format === 'match_following') {
          const correctMap = q.correctAnswer as Record<string, string>;
          const userMap = uAns as Record<string, string>;
          const keys = Object.keys(correctMap);
          const isAllMatch = keys.length > 0 && keys.every((k) => userMap[k] === correctMap[k]);
          if (isAllMatch) totalScore += q.points;
        } else {
          if (String(uAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
            totalScore += q.points;
          }
        }
      }
    });

    onCompleteExam({
      questions: examQuestions,
      userAnswers,
      score: totalScore,
      timeSpentSeconds: 600 - timeRemaining,
    });
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Exam Header Dashboard */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Official Assessment Mode
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              Max Marks: 25
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Randomly selected 10 questions covering Units I & II (2.5 marks each) as mandated by the course rubric.
          </p>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Timer className={`w-4 h-4 ${timeRemaining < 120 ? 'text-rose-600 animate-pulse' : 'text-slate-600'}`} />
            <span className={`font-mono tabular-nums text-sm font-semibold ${timeRemaining < 120 ? 'text-rose-600' : 'text-slate-800'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRestartNewSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Generate a new randomized 10-question set"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Random 10</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSubmitConfirm(true)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            Submit Assessment
          </button>
        </div>
      </div>

      {/* Question Stepper Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span>Question Navigation Grid</span>
          <span>
            Progress: <strong className="text-slate-900 font-mono">{answeredCount}</strong> / 10 Answered
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {examQuestions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = userAnswers[q.id] !== undefined;
            const isFlagged = flaggedQuestions[q.id];

            let btnClass = 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white';
            if (isCurrent) {
              btnClass = 'border-indigo-600 ring-2 ring-indigo-200 text-indigo-700 font-bold bg-indigo-50/50';
            } else if (isAnswered) {
              btnClass = 'border-indigo-500 bg-indigo-600 text-white font-medium';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setActiveHint(null);
                }}
                className={`h-10 rounded-lg border text-xs font-mono transition-all flex flex-col items-center justify-center relative cursor-pointer ${btnClass}`}
              >
                <span>{idx + 1}</span>
                {isFlagged && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Card */}
      <QuestionCard
        question={currentQ}
        currentIndex={currentIndex}
        totalQuestions={examQuestions.length}
        userAnswer={userAnswers[currentQ.id]}
        onAnswer={handleSelectAnswer}
        isAnswerSubmitted={false}
        eliminatedOptions={eliminatedOptions[currentQ.id] || []}
        onUseFiftyFifty={handleUseFiftyFifty}
        hasFiftyFiftyAvailable={!hasUsedFiftyFifty[currentQ.id] && (currentQ.options?.length || 0) > 2}
        onUseAIHint={handleUseAIHint}
        activeHint={activeHint}
        isLoadingHint={isLoadingHint}
        onAskAITutor={() => onOpenAITutorForQuestion(currentQ, userAnswers[currentQ.id])}
        mode="exam"
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => {
            setCurrentIndex((prev) => Math.max(0, prev - 1));
            setActiveHint(null);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleToggleFlag(currentQ.id)}
            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              flaggedQuestions[currentQ.id]
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {flaggedQuestions[currentQ.id] ? 'Flagged for Review ★' : 'Flag Question'}
          </button>

          {currentIndex + 1 < examQuestions.length ? (
            <button
              type="button"
              onClick={() => {
                setCurrentIndex((prev) => prev + 1);
                setActiveHint(null);
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <span>Finish Assessment</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Submit Exam for Grading?</h3>
                <p className="text-xs text-slate-500">Maximum Marks: 25.0</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              You have answered <strong className="text-slate-900 font-mono">{answeredCount}</strong> of 10 questions.
              {answeredCount < 10 && (
                <span className="block mt-1 text-amber-700 font-medium">
                  Notice: {10 - answeredCount} question(s) remain unanswered and will be marked as 0.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Back to Test
              </button>
              <button
                type="button"
                onClick={handleSubmitFinal}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
