import React, { useState, useMemo } from 'react';
import { QUESTIONS_BANK } from '../data/questions';
import { QuestionFormat, UnitType, Question } from '../types/quiz';
import { Search, Printer, Download, Eye, EyeOff, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

interface QuestionBankViewProps {
  onOpenAITutorForQuestion?: (q: Question, userAns: any) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({ onOpenAITutorForQuestion }) => {
  const [activeUnitTab, setActiveUnitTab] = useState<UnitType | 'All'>('Unit I');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [showAllAnswers, setShowAllAnswers] = useState(true);

  // Unit question counts
  const unit1Count = useMemo(() => QUESTIONS_BANK.filter((q) => q.unit === 'Unit I').length, []);
  const unit2Count = useMemo(() => QUESTIONS_BANK.filter((q) => q.unit === 'Unit II').length, []);

  // Available topics for active tab
  const availableTopics = useMemo(() => {
    const list = Array.from(
      new Set(
        QUESTIONS_BANK.filter((q) => activeUnitTab === 'All' || q.unit === activeUnitTab).map(
          (q) => q.topic
        )
      )
    );
    return list.sort();
  }, [activeUnitTab]);

  const filteredQuestions = useMemo(() => {
    return QUESTIONS_BANK.filter((q) => {
      if (activeUnitTab !== 'All' && q.unit !== activeUnitTab) return false;
      if (selectedFormat !== 'all' && q.format !== selectedFormat) return false;
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const inQuestion = q.question.toLowerCase().includes(term);
        const inTopic = q.topic.toLowerCase().includes(term);
        const inExp = q.explanation.toLowerCase().includes(term);
        const inContext = (q.context || '').toLowerCase().includes(term);
        if (!inQuestion && !inTopic && !inExp && !inContext) return false;
      }
      return true;
    });
  }, [activeUnitTab, selectedFormat, selectedTopic, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(QUESTIONS_BANK, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AI_Question_Bank_${activeUnitTab.replace(' ', '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Interactive Question Bank & Learning Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse Unit I and Unit II questions with official answers and slide explanations for study and exam revision.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowAllAnswers(!showAllAnswers)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            {showAllAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{showAllAnswers ? 'Hide Answers' : 'Show Answers'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            title="Export questions in JSON format"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* DISTINCT UNIT TABS FOR LEARNING */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Unit I Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveUnitTab('Unit I');
              setSelectedTopic('all');
            }}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
              activeUnitTab === 'Unit I'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs ring-1 ring-indigo-200'
                : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block text-indigo-700">
                Unit I
              </span>
              <span className="text-sm font-semibold block text-slate-900">
                Foundations, Agents & Problems
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Turing Test, PEAS, 5 Agent Architectures, Environments
              </span>
            </div>
            <span
              className={`font-mono text-xs font-bold px-2 py-1 rounded-md shrink-0 ml-2 ${
                activeUnitTab === 'Unit I'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {unit1Count} Qs
            </span>
          </button>

          {/* Unit II Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveUnitTab('Unit II');
              setSelectedTopic('all');
            }}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
              activeUnitTab === 'Unit II'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs ring-1 ring-indigo-200'
                : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block text-indigo-700">
                Unit II
              </span>
              <span className="text-sm font-semibold block text-slate-900">
                Search, CSP & Means-Ends Analysis
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                BFS/DFS, A* Search, Hill Climbing, CSP, MEA
              </span>
            </div>
            <span
              className={`font-mono text-xs font-bold px-2 py-1 rounded-md shrink-0 ml-2 ${
                activeUnitTab === 'Unit II'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {unit2Count} Qs
            </span>
          </button>

          {/* All Questions Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveUnitTab('All');
              setSelectedTopic('all');
            }}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
              activeUnitTab === 'All'
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs ring-1 ring-indigo-200'
                : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-500">
                Combined Bank
              </span>
              <span className="text-sm font-semibold block text-slate-900">
                Complete Curriculum
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                All 56 questions from Unit I and Unit II
              </span>
            </div>
            <span
              className={`font-mono text-xs font-bold px-2 py-1 rounded-md shrink-0 ml-2 ${
                activeUnitTab === 'All'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {QUESTIONS_BANK.length} Qs
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar for active Unit */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3 print:hidden">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeUnitTab} questions by keyword (e.g., ${
              activeUnitTab === 'Unit I' ? 'Turing, PEAS, Reflex' : 'A*, Heuristic, CSP, BFS'
            })...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Topic filter within unit */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer shrink-0 max-w-xs"
        >
          <option value="all">All Topics in {activeUnitTab}</option>
          {availableTopics.map((top) => (
            <option key={top} value={top}>
              {top}
            </option>
          ))}
        </select>

        {/* Format Selector */}
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer shrink-0"
        >
          <option value="all">All Formats (7 Types)</option>
          <option value="mcq">Standard MCQs</option>
          <option value="true_false">True / False</option>
          <option value="assertion_reason">Assertion – Reason</option>
          <option value="fill_blank">Fill in Blanks</option>
          <option value="match_following">Match Following</option>
          <option value="scenario">Scenarios (10+)</option>
          <option value="problem_solving">Problem Solving (5+)</option>
        </select>
      </div>

      {/* Printable Heading for Paper Submissions */}
      <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Artificial Intelligence ({activeUnitTab}) – Question Bank & Answer Key
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Christ University · Department of Computer Science & Engineering · Questions with Model Answers
        </p>
      </div>

      {/* Questions List with Answers Visible for Learning */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          return (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5 print:border-slate-300 print:shadow-none print:break-inside-avoid"
            >
              {/* Metadata: Clean text with · separators */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Q{idx + 1}.</span>
                  <span className="font-semibold text-indigo-700">{q.unit}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-700">{q.topic}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{q.format.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="capitalize">{q.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{q.points} Marks</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-400 text-[11px]">{q.slideRef}</span>
                </div>
              </div>

              {/* Context if present */}
              {q.context && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <strong className="text-slate-900 block mb-0.5">Problem Context / Real-World Setup:</strong>
                  <p className="whitespace-pre-line leading-relaxed">{q.context}</p>
                </div>
              )}

              {/* Code / ASCII Diagram if present */}
              {q.codeOrDiagram && (
                <div className="p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre leading-relaxed">
                  {q.codeOrDiagram}
                </div>
              )}

              {/* Question Statement */}
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {q.question}
              </p>

              {/* Options */}
              {q.options && q.format !== 'match_following' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isCorrect = showAllAnswers && opt === q.correctAnswer;
                    return (
                      <div
                        key={opt}
                        className={`p-3 rounded-lg border flex items-start gap-2.5 transition-all ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium ring-1 ring-emerald-300'
                            : 'border-slate-200 bg-slate-50/40 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                        {isCorrect && (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Match the Following pairings table */}
              {q.format === 'match_following' && q.matchPairs && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <span className="font-semibold text-slate-800 block">Concept & Responsibility Mapping:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.matchPairs.map((p) => (
                      <div key={p.id} className="p-2 bg-white border border-slate-200 rounded flex items-center justify-between">
                        <span className="font-bold text-slate-800">{p.left}</span>
                        <span className="text-slate-400 mx-2">→</span>
                        <span className="text-slate-600 text-[11px] text-right flex-1">{p.right}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer & Explanation Box (Always shown for study purposes) */}
              {showAllAnswers && (
                <div className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-lg text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-900">Correct Answer:</span>
                      <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                        {q.format === 'match_following'
                          ? JSON.stringify(q.correctAnswer)
                          : String(q.correctAnswer)}
                      </span>
                    </div>

                    {/* Ask AI Tutor button on each question card */}
                    {onOpenAITutorForQuestion && (
                      <button
                        type="button"
                        onClick={() => onOpenAITutorForQuestion(q, q.correctAnswer)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-white hover:bg-indigo-100/60 rounded border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>Explain with AI Tutor</span>
                      </button>
                    )}
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Official Slide Explanation: </strong>
                    {q.explanation}
                  </p>

                  <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-indigo-100/60 flex items-center justify-between">
                    <span>Reference Slide: {q.slideRef}</span>
                    <span>Hint Clue: {q.hint}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-12 bg-white rounded-xl border border-slate-200 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800">No questions found matching your search.</p>
            <p className="text-xs text-slate-500">Try adjusting your keyword or reset filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
