import { Question, LeaderboardEntry } from '../types/quiz';
import { QUESTIONS_BANK } from '../data/questions';

export function sampleRandomExamQuestions(count = 10): Question[] {
  // Balanced sample:
  // At least 4 from Unit I, at least 4 from Unit II
  // At least 2 scenarios, at least 1 problem solving
  const unit1 = QUESTIONS_BANK.filter((q) => q.unit === 'Unit I');
  const unit2 = QUESTIONS_BANK.filter((q) => q.unit === 'Unit II');
  const scenarios = QUESTIONS_BANK.filter((q) => q.format === 'scenario');
  const problems = QUESTIONS_BANK.filter((q) => q.format === 'problem_solving');

  const selectedIds = new Set<string>();
  const examQuestions: Question[] = [];

  function pickRandom(pool: Question[]): Question | null {
    const available = pool.filter((q) => !selectedIds.has(q.id));
    if (available.length === 0) return null;
    const picked = available[Math.floor(Math.random() * available.length)];
    selectedIds.add(picked.id);
    return picked;
  }

  // 1. Ensure 2 scenarios
  for (let i = 0; i < 2; i++) {
    const q = pickRandom(scenarios);
    if (q) examQuestions.push(q);
  }

  // 2. Ensure 1 problem-solving
  const prob = pickRandom(problems);
  if (prob) examQuestions.push(prob);

  // 3. Ensure balanced Unit I & Unit II representation
  while (examQuestions.filter((q) => q.unit === 'Unit I').length < 5 && examQuestions.length < count) {
    const q = pickRandom(unit1);
    if (q) examQuestions.push(q);
    else break;
  }

  while (examQuestions.filter((q) => q.unit === 'Unit II').length < 5 && examQuestions.length < count) {
    const q = pickRandom(unit2);
    if (q) examQuestions.push(q);
    else break;
  }

  // 4. Fill remaining to reach exactly count
  while (examQuestions.length < count) {
    const q = pickRandom(QUESTIONS_BANK);
    if (q) examQuestions.push(q);
    else break;
  }

  // Shuffle order of questions
  return examQuestions.sort(() => Math.random() - 0.5);
}

export function calculateGrade(percentage: number): {
  grade: string;
  verdict: string;
  badgeColor: string;
} {
  if (percentage >= 90) {
    return { grade: 'O (Outstanding)', verdict: 'Mastery of AI Units I & II Concepts', badgeColor: 'text-emerald-700 bg-emerald-50' };
  } else if (percentage >= 80) {
    return { grade: 'A+ (Excellent)', verdict: 'Thorough Understanding of Search & Agents', badgeColor: 'text-indigo-700 bg-indigo-50' };
  } else if (percentage >= 70) {
    return { grade: 'A (Very Good)', verdict: 'Proficient in Most Conceptual Domains', badgeColor: 'text-blue-700 bg-blue-50' };
  } else if (percentage >= 60) {
    return { grade: 'B+ (Good)', verdict: 'Competent; Review State Spaces & MEA', badgeColor: 'text-amber-700 bg-amber-50' };
  } else if (percentage >= 50) {
    return { grade: 'B (Above Average)', verdict: 'Passing; Re-study Slide Complexities', badgeColor: 'text-orange-700 bg-orange-50' };
  } else {
    return { grade: 'RA (Re-Appear)', verdict: 'Needs In-depth Review of Units I & II', badgeColor: 'text-rose-700 bg-rose-50' };
  }
}

const LEADERBOARD_KEY = 'ai_quiz_game_leaderboard_real_v2';

export function getStoredLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const current = getStoredLeaderboard();
  const updated = [entry, ...current].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSpentSeconds - b.timeSpentSeconds;
  });
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated.slice(0, 50)));
  return updated;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
