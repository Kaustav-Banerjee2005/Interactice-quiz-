import React, { useState } from 'react';
import { Question } from '../types/quiz';
import { calculateGrade, formatTime, saveLeaderboardEntry } from '../utils/quizHelpers';
import { Award, CheckCircle2, XCircle, Printer, RotateCcw, Share2, Sparkles, BookOpen } from 'lucide-react';

interface ScorecardModalProps {
  score: number;
  totalMarks: number;
  timeSpentSeconds: number;
  questions: Question[];
  userAnswers: Record<string, any>;
  onRetakeExam: () => void;
  onGoToBank: () => void;
  onGoToLeaderboard: () => void;
}

export const ScorecardModal: React.FC<ScorecardModalProps> = ({
  score,
  totalMarks = 25,
  timeSpentSeconds,
  questions,
  userAnswers,
  onRetakeExam,
  onGoToBank,
  onGoToLeaderboard,
}) => {
  const percentage = Math.round((score / totalMarks) * 100);
  const gradeInfo = calculateGrade(percentage);

  const [studentName, setStudentName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [isSavedToLeaderboard, setIsSavedToLeaderboard] = useState(false);
  const [showReviewList, setShowReviewList] = useState(false);

  // Compute breakdown by unit
  const unit1Questions = questions.filter((q) => q.unit === 'Unit I');
  const unit2Questions = questions.filter((q) => q.unit === 'Unit II');

  const calcUnitScore = (qs: Question[]) => {
    let s = 0;
    qs.forEach((q) => {
      const u = userAnswers[q.id];
      if (u !== undefined && u !== null) {
        if (q.format === 'match_following') {
          const c = q.correctAnswer as Record<string, string>;
          const user = u as Record<string, string>;
          if (Object.keys(c).every((k) => user[k] === c[k])) s += q.points;
        } else if (String(u).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          s += q.points;
        }
      }
    });
    return s;
  };

  const unit1Score = calcUnitScore(unit1Questions);
  const unit1Total = unit1Questions.reduce((acc, q) => acc + q.points, 0);

  const unit2Score = calcUnitScore(unit2Questions);
  const unit2Total = unit2Questions.reduce((acc, q) => acc + q.points, 0);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    saveLeaderboardEntry({
      id: 'entry-' + Date.now(),
      studentName: studentName.trim(),
      registerNumber: registerNumber.trim() || '23BCS-EXAM',
      score: score,
      totalMarks: totalMarks,
      percentage: percentage,
      timeSpentSeconds: timeSpentSeconds,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      mode: 'Exam Mode (10 Qs)',
    });

    setIsSavedToLeaderboard(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Official Assessment Scorecard Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Certificate / University Header */}
        <div className="border-b border-slate-200 pb-6 text-center space-y-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
            Christ University · Department of Computer Science & Engineering
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            AI Units I & II Assessment Report
          </h1>
          <p className="text-xs text-slate-500">
            Foundations & Applications of AI, Intelligent Agents, State Space Search, Informed Search, CSP, & MEA
          </p>
        </div>

        {/* Hero Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center items-center">
            <span className="text-xs font-medium uppercase text-slate-500 tracking-wider">Score Achieved</span>
            <div className="mt-2 text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
              {score.toFixed(1)} <span className="text-lg font-normal text-slate-500">/ {totalMarks}</span>
            </div>
            <span className="text-xs font-mono text-slate-500 mt-1">{percentage}% Aggregate</span>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center items-center">
            <span className="text-xs font-medium uppercase text-slate-500 tracking-wider">Awarded Grade</span>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {gradeInfo.grade.split(' ')[0]}
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium mt-1 ${gradeInfo.badgeColor}`}>
              {gradeInfo.grade}
            </span>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center items-center">
            <span className="text-xs font-medium uppercase text-slate-500 tracking-wider">Time Completed</span>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {formatTime(timeSpentSeconds)}
            </div>
            <span className="text-xs text-slate-500 mt-1">10 Random Questions</span>
          </div>
        </div>

        {/* Unit-wise Mastery Breakdown */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Curricular Unit Mastery
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Unit I: Agents, PEAS & Problems</span>
                <span className="font-mono text-slate-600">
                  {unit1Score.toFixed(1)} / {unit1Total.toFixed(1)} Marks
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${unit1Total > 0 ? (unit1Score / unit1Total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                Foundations, Turing Test, 5 Agent Types, PEAS, Nature of Environments
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Unit II: Search Strategies, CSP & MEA</span>
                <span className="font-mono text-slate-600">
                  {unit2Score.toFixed(1)} / {unit2Total.toFixed(1)} Marks
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${unit2Total > 0 ? (unit2Score / unit2Total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                BFS, DFS, IDDFS, Heuristic Search, A*, Hill Climbing, CSP, Means-Ends Analysis
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard Submission Form */}
        {!isSavedToLeaderboard ? (
          <form
            onSubmit={handleSaveScore}
            className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3 print:hidden"
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Register on Class Leaderboard
              </span>
            </div>
            <p className="text-xs text-indigo-800">
              Record your score and completion time on the classroom roster for student evaluation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Student Full Name (e.g., Kaustab Banerjee)"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                className="bg-white border border-slate-300 text-xs rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Register Number (e.g., 23BCS188)"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                className="bg-white border border-slate-300 text-xs rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Save Score to Leaderboard
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Score recorded successfully for <strong>{studentName}</strong>!</span>
            </div>
            <button
              type="button"
              onClick={onGoToLeaderboard}
              className="font-semibold text-emerald-800 hover:underline cursor-pointer"
            >
              View Roster
            </button>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRetakeExam}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Randomized 10 Qs</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF Report</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowReviewList(!showReviewList)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showReviewList ? 'Hide Question Review' : 'Review All 10 Questions'}</span>
            </button>
          </div>
        </div>

        {/* Question Review Drawer */}
        {showReviewList && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Detailed Question Review & Slide Explanations
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const uAns = userAnswers[q.id];
                let isQCorrect = false;
                if (uAns !== undefined && uAns !== null) {
                  if (q.format === 'match_following') {
                    const c = q.correctAnswer as Record<string, string>;
                    const user = uAns as Record<string, string>;
                    isQCorrect = Object.keys(c).every((k) => user[k] === c[k]);
                  } else {
                    isQCorrect = String(uAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                  }
                }

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      isQCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isQCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600" />
                        )}
                        <span className="font-bold text-slate-900">Question {idx + 1} ({q.points} Marks)</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">{q.topic}</span>
                      </div>
                      <span className="font-mono text-slate-400">{q.slideRef}</span>
                    </div>

                    <p className="text-sm font-medium text-slate-800">{q.question}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500">Your Answer: </span>
                        <strong className={isQCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                          {q.format === 'match_following'
                            ? JSON.stringify(uAns || {})
                            : String(uAns || 'Unanswered')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Correct Answer: </span>
                        <strong className="text-emerald-700">
                          {q.format === 'match_following'
                            ? JSON.stringify(q.correctAnswer)
                            : String(q.correctAnswer)}
                        </strong>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
