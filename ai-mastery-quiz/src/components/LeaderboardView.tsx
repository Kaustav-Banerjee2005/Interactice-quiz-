import React, { useState, useMemo } from 'react';
import { LeaderboardEntry } from '../types/quiz';
import { getStoredLeaderboard, formatTime } from '../utils/quizHelpers';
import { Trophy, Medal, Search, RotateCcw, Award, Clock } from 'lucide-react';

interface LeaderboardViewProps {
  onStartExam: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onStartExam }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => getStoredLeaderboard());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.studentName.toLowerCase().includes(q) ||
        e.registerNumber.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  // Computed summary metrics
  const avgScore = useMemo(() => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / entries.length).toFixed(1);
  }, [entries]);

  const topScore = useMemo(() => {
    if (entries.length === 0) return 0;
    return Math.max(...entries.map((e) => e.score)).toFixed(1);
  }, [entries]);

  const handleReset = () => {
    if (window.confirm('Clear all recorded submissions from this browser?')) {
      localStorage.removeItem('ai_quiz_game_leaderboard_real_v2');
      setEntries([]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Assessment Leaderboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real student submissions recorded upon completing the 25-mark examination.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartExam}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          Take Assessment (25 Marks)
        </button>
      </div>

      {/* Classroom Metrics Strip (Only shown when there are real submissions) */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Top Score</span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block">
                {topScore} <span className="text-xs font-normal text-slate-500">/ 25.0</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Average Score</span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block">
                {avgScore} <span className="text-xs font-normal text-slate-500">/ 25.0</span>
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Total Submissions</span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block">
                {entries.length} Recorded
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {entries.length > 0 ? (
          <>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by student name or register number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Records</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3 text-center w-16">Rank</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Register No</th>
                    <th className="px-5 py-3 text-right">Score / 25</th>
                    <th className="px-5 py-3 text-right">Accuracy</th>
                    <th className="px-5 py-3 text-right">Time</th>
                    <th className="px-5 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredEntries.map((entry, index) => {
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 text-center font-mono font-bold">
                          {index === 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700">
                              1
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700">
                              2
                            </span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-500">{index + 1}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {entry.studentName}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-slate-500">
                          {entry.registerNumber}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {entry.score.toFixed(1)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-600 tabular-nums">
                          {entry.percentage}%
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-500 tabular-nums">
                          {formatTime(entry.timeSpentSeconds)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-slate-400 font-mono text-[11px]">
                          {entry.date}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                        No recorded student matches "{searchQuery}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">No Submissions Recorded Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scores only appear here when a student completes the 10-question assessment and submits their name.
              </p>
            </div>
            <button
              type="button"
              onClick={onStartExam}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Start Assessment Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
