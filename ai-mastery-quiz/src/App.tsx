import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ExamMode } from './components/ExamMode';
import { PracticeMode } from './components/PracticeMode';
import { QuestionBankView } from './components/QuestionBankView';
import { LeaderboardView } from './components/LeaderboardView';
import { ScorecardModal } from './components/ScorecardModal';
import { AITutorModal } from './components/AITutorModal';
import { Question } from './types/quiz';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'exam' | 'practice' | 'bank' | 'leaderboard'>('exam');
  
  // Completed exam state
  const [lastExamResult, setLastExamResult] = useState<{
    questions: Question[];
    userAnswers: Record<string, any>;
    score: number;
    timeSpentSeconds: number;
  } | null>(null);

  // AI Tutor modal state
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [tutorQuestionContext, setTutorQuestionContext] = useState<{
    question: Question;
    userAnswer: any;
  } | null>(null);

  const handleOpenAITutorGlobal = () => {
    setTutorQuestionContext(null);
    setIsAITutorOpen(true);
  };

  const handleOpenAITutorForQuestion = (q: Question, userAns: any) => {
    setTutorQuestionContext({ question: q, userAnswer: userAns });
    setIsAITutorOpen(true);
  };

  const handleExamComplete = (result: {
    questions: Question[];
    userAnswers: Record<string, any>;
    score: number;
    timeSpentSeconds: number;
  }) => {
    setLastExamResult(result);
  };

  const handleRetakeExam = () => {
    setLastExamResult(null);
    setCurrentTab('exam');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar Contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'exam' && lastExamResult) {
            setLastExamResult(null); // allow retaking if tab clicked
          }
          setCurrentTab(tab);
        }}
        onOpenAITutor={handleOpenAITutorGlobal}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'exam' && (
          <>
            {lastExamResult ? (
              <ScorecardModal
                score={lastExamResult.score}
                totalMarks={25}
                timeSpentSeconds={lastExamResult.timeSpentSeconds}
                questions={lastExamResult.questions}
                userAnswers={lastExamResult.userAnswers}
                onRetakeExam={handleRetakeExam}
                onGoToBank={() => setCurrentTab('bank')}
                onGoToLeaderboard={() => setCurrentTab('leaderboard')}
              />
            ) : (
              <ExamMode
                onCompleteExam={handleExamComplete}
                onOpenAITutorForQuestion={handleOpenAITutorForQuestion}
              />
            )}
          </>
        )}

        {currentTab === 'practice' && (
          <PracticeMode onOpenAITutorForQuestion={handleOpenAITutorForQuestion} />
        )}

        {currentTab === 'bank' && (
          <QuestionBankView onOpenAITutorForQuestion={handleOpenAITutorForQuestion} />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardView
            onStartExam={() => {
              setLastExamResult(null);
              setCurrentTab('exam');
            }}
          />
        )}
      </main>

      {/* Footer: Quiet copyright and university accreditation */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>Christ University · Artificial Intelligence Assessment Framework</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Units I & II · Maximum Marks: 25</span>
            <span aria-hidden="true">·</span>
            <span>56 Question Bank with Slide Grounding</span>
          </div>
        </div>
      </footer>

      {/* AI Tutor Assistant Modal */}
      <AITutorModal
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        focusedQuestion={tutorQuestionContext?.question}
        focusedUserAnswer={tutorQuestionContext?.userAnswer}
      />
    </div>
  );
}
