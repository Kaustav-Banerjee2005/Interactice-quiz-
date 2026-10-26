export type QuestionFormat =
  | 'mcq'
  | 'true_false'
  | 'assertion_reason'
  | 'fill_blank'
  | 'match_following'
  | 'scenario'
  | 'problem_solving';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type UnitType = 'Unit I' | 'Unit II';

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  unit: UnitType;
  topic: string;
  format: QuestionFormat;
  difficulty: DifficultyLevel;
  question: string;
  context?: string; // Scenario or problem-solving state setup
  codeOrDiagram?: string; // ASCII or structured formula/table
  options?: string[]; // For MCQ, TF, AR, Scenario, Problem-Solving, FIB
  correctAnswer: string | number | Record<string, string>; // format-dependent
  explanation: string;
  slideRef: string; // Exact slide reference from lecture PPTs
  hint: string;
  matchPairs?: MatchPair[]; // For 'match_following'
  points: number; // For score calculations (e.g. 2.5 marks in standard exam mode)
}

export interface QuizSessionState {
  mode: 'exam' | 'practice' | 'topic_drill';
  selectedTopic?: string;
  selectedUnit?: UnitType | 'All';
  selectedDifficulty?: DifficultyLevel | 'all';
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<string, any>; // questionId -> answer
  lifelinesUsed: {
    fiftyFifty: Record<string, boolean>;
    aiHint: Record<string, boolean>;
    skip: Record<string, boolean>;
  };
  eliminatedOptions: Record<string, string[]>; // questionId -> removed option strings
  startTime: number;
  endTime?: number;
  timeRemaining: number; // in seconds
  isComplete: boolean;
  score: number; // out of 25 in exam mode
  totalPossibleMarks: number;
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  registerNumber: string;
  score: number; // out of 25
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  date: string;
  mode: string;
}
