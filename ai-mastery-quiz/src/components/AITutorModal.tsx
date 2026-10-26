import React, { useState, useEffect } from 'react';
import { Question } from '../types/quiz';
import { Sparkles, X, Send, Bot, User, BookOpen } from 'lucide-react';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusedQuestion?: Question | null;
  focusedUserAnswer?: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  focusedQuestion,
  focusedUserAnswer,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // When focusedQuestion changes, load an initial tailored explanation
  useEffect(() => {
    if (!isOpen) return;

    if (focusedQuestion) {
      const initialGreeting = `Hello! I am your AI Teaching Assistant for Units I & II.
Looking at Question: "${focusedQuestion.question}" (${focusedQuestion.topic})
Slide Ref: ${focusedQuestion.slideRef}

Would you like a step-by-step conceptual walkthrough of why "${focusedQuestion.correctAnswer}" is correct, or do you have a question about ${focusedQuestion.topic}?`;

      setMessages([
        {
          role: 'assistant',
          content: initialGreeting,
        },
      ]);

      // If user had selected an answer, automatically request deep-dive explanation
      fetchDeepDiveExplanation(focusedQuestion, focusedUserAnswer);
    } else {
      setMessages([
        {
          role: 'assistant',
          content:
            'Hello! I am your AI Teaching Assistant for Artificial Intelligence (Units I & II). Ask me anything about Turing Test, Agents, PEAS, Search Algorithms (BFS/DFS/A*), Hill Climbing, CSP, or Means-Ends Analysis!',
        },
      ]);
    }
  }, [isOpen, focusedQuestion]);

  const fetchDeepDiveExplanation = async (q: Question, uAns: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.question,
          selectedAnswer: uAns ? String(uAns) : 'None / Skipped',
          correctAnswer: String(q.correctAnswer),
          officialExplanation: q.explanation,
          topic: q.topic,
        }),
      });
      const data = await res.json();
      if (data.deepDive) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.deepDive,
          },
        ]);
      }
    } catch {
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Concept Breakdown from ${q.slideRef}: ${q.explanation}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: text.trim(),
          contextTopic: focusedQuestion ? focusedQuestion.topic : 'General AI Units I & II',
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'Review the state space and problem characteristics from the lecture slides.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'The AI assistant is momentarily busy. Please review the question bank cards or try asking again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Teaching Assistant</h3>
              <p className="text-[11px] text-slate-500 font-mono">Gemini 3.8 Flash · Unit I & II Tutor</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Prompt Suggestions */}
        <div className="p-3 bg-indigo-50/40 border-b border-indigo-100 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
          <span className="text-indigo-900 font-semibold shrink-0">Quick Queries:</span>
          <button
            type="button"
            onClick={() => handleSendMessage('Why is BFS space complexity O(b^d)?')}
            className="px-2 py-1 bg-white border border-indigo-200 rounded text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer shrink-0"
          >
            BFS Space O(b^d)?
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Explain Operator Subgoaling in MEA.')}
            className="px-2 py-1 bg-white border border-indigo-200 rounded text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer shrink-0"
          >
            MEA Operator Subgoaling?
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('What makes a heuristic admissible?')}
            className="px-2 py-1 bg-white border border-indigo-200 rounded text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer shrink-0"
          >
            Admissible Heuristic?
          </button>
        </div>

        {/* Chat Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 justify-start items-center text-slate-400 font-mono text-[11px] p-2">
              <Bot className="w-4 h-4 text-indigo-500 animate-spin" />
              <span>AI Tutor is reasoning over Unit I & II lecture slides...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask an AI concept question (e.g., A* vs Greedy, CSP, PEAS)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
