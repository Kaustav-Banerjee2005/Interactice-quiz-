import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio dev environment requires port 3000
const port = 3000;

app.use(express.json());

function isValidApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed === '' || trimmed === 'MY_GEMINI_API_KEY' || trimmed.startsWith('MY_')) {
    return false;
  }
  return true;
}

function getAIClient() {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!isValidApiKey(currentKey)) return null;
  return new GoogleGenAI({
    apiKey: currentKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timed out')), ms)
    ),
  ]);
}

// Built-in educational answers for Unit I & Unit II syllabus
function getSmartFallbackAnswer(query: string, contextTopic?: string): string {
  const q = query.toLowerCase();

  if (q.includes('bfs') && (q.includes('space') || q.includes('memory') || q.includes('b^d'))) {
    return `### Breadth-First Search (BFS) Space Complexity Analysis:
- **Complexity:** $O(b^d)$, where $b$ is the branching factor and $d$ is the shallowest solution depth.
- **Why it consumes so much memory:** BFS explores the tree level by level using a FIFO queue. At depth $d$, the queue must hold all leaf nodes at that level ($b^d$) plus all unexplored nodes at level $d-1$.
- **Practical Implication:** In practice, BFS exhausts available RAM long before it runs out of CPU time.
- **Solution from Slides (Ch-01 Part 3, Slide 37):** Techniques like **Iterative Deepening Search (IDDFS)** and **Simplified Memory-Bounded A* (SMA*)** are used to solve this exact memory limitation while keeping completeness and optimality.`;
  }

  if (q.includes('operator subgoaling') || (q.includes('mea') && q.includes('subgoal'))) {
    return `### Operator Subgoaling in Means-Ends Analysis (MEA):
- **Definition (Ch-02 Part 2, Slide 52):** In MEA, we detect differences between the CURRENT state and GOAL state and pick an operator $O$ to reduce that difference.
- **The Problem:** Often, operator $O$ cannot be directly applied to the CURRENT state because its **preconditions** are not yet satisfied.
- **The Solution:** The agent creates a subproblem whose goal is to achieve a state ($O\\text{-Start}$) where all preconditions of operator $O$ are satisfied.
- **Algorithm (Slide 53):**
  1. $\\text{FIRST-PART} \\leftarrow \\text{MEA}(\\text{CURRENT}, O\\text{-START})$
  2. Apply operator $O$ to reach $O\\text{-Result}$
  3. $\\text{LAST-PART} \\leftarrow \\text{MEA}(O\\text{-Result}, \\text{GOAL})$
  4. Final Plan = Concatenation of [FIRST-PART, $O$, LAST-PART].`;
  }

  if (q.includes('admissible') || q.includes('admissibility') || q.includes('h(n)')) {
    return `### Heuristic Admissibility (Ch-02 Part 2, Slide 5 & 29):
- **Condition:** $h(n) \\le h^*(n)$ for all nodes $n$, where $h(n)$ is the estimated heuristic cost to reach the goal, and $h^*(n)$ is the true minimal cost.
- **Meaning:** An admissible heuristic is optimistic—it never overestimates the true remaining cost to the goal.
- **Significance for $A^*$ Search:** If $h(n)$ is admissible, $A^*$ search using evaluation function $f(n) = g(n) + h(n)$ is **guaranteed to return an optimal (lowest cost) solution**.`;
  }

  if (q.includes('ignorable') || q.includes('recoverable') || q.includes('irrecoverable')) {
    return `### Problem Characteristics: Recoverability Categories (Ch-01 Part 3, Slides 17-18):
1. **Ignorable (e.g., Theorem Proving):** Solution steps that do not work out can be ignored. Nothing is lost, and the proof continues with another rule without needing complex backtracking.
2. **Recoverable (e.g., 8-Puzzle):** Wrong moves can be undone and backtracked to return to a previous valid state.
3. **Irrecoverable (e.g., Playing Chess):** Moves cannot be retracted or taken back once played. Mistakes are permanent, requiring careful multi-step lookahead planning.`;
  }

  if (q.includes('peas')) {
    return `### The PEAS Framework (Ch-01 Part 2, Slide 35-37):
PEAS defines the task environment for an intelligent rational agent:
- **P — Performance Measure:** The criterion for success (e.g., safety, time, comfort for a self-driving car; clean floor for a vacuum cleaner).
- **E — Environment:** The world where the agent operates (e.g., roads, traffic, pedestrians, road signs).
- **A — Actuators:** The mechanisms used to exert actions (e.g., steering, accelerator, brakes, signal, horn).
- **S — Sensors:** The devices used to perceive the world (e.g., cameras, LiDAR, GPS, speedometer, odometer, sonar).`;
  }

  if (q.includes('turing test') || q.includes('alan turing')) {
    return `### The Turing Test (Ch-01 Part 1, Slides 16, 33-42):
- **Introduced by:** Alan Turing in his 1950 paper "Computing Machinery and Intelligence" (The Imitation Game).
- **Setup:** Three participants: two humans (one interrogator/judge C, one human respondent B) and one AI machine A, communicating via an isolated text terminal.
- **Criteria for Passing (Slide 34):**
  1. *Natural Language Processing (NLP)* to communicate fluently.
  2. *Knowledge Representation* to store facts and relationships.
  3. *Automated Reasoning* to draw conclusions from stored information.
  4. *Machine Learning* to adapt and improve from past interactions.
- **Key Insight:** The test is fundamentally about deception (imitating human conversation) rather than mathematical perfection.`;
  }

  if (q.includes('hill climbing') || q.includes('local max') || q.includes('plateau') || q.includes('ridge')) {
    return `### Hill Climbing Landscapes & Challenges (Ch-02 Part 2, Slides 15-23):
- **Local Maximum:** A state that is better than all its immediate neighbors, but suboptimal compared to the global peak.
- **Global Maximum:** The absolute highest peak representing the optimal solution.
- **Plateau / Flat Local Max:** A flat region where all neighbor states share the same heuristic evaluation, leaving no uphill gradient.
- **Shoulder:** A flat plateau with an uphill continuation edge.
- **Ridge:** A steep narrow slope resembling a peak that causes simple hill climbing to terminate prematurely.`;
  }

  if (q.includes('csp') || q.includes('constraint')) {
    return `### Constraint Satisfaction Problems (CSP) (Ch-02 Part 2, Slides 41-48):
- **Triple Definition:** $(X, D, C)$
  - $X$: Variables $\\{X_1, X_2, \\dots, X_n\\}$
  - $D$: Domains $\\{D_1, D_2, \\dots, D_n\\}$ of allowable values
  - $C$: Constraints $\\{C_1, C_2, \\dots, C_m\\}$ specifying allowable value combinations
- **Solution Criteria:** Complete assignment (every variable has a value) that is consistent (zero violated constraints).
- **Examples:** Map Coloring, Sudoku, University Timetable Scheduling, Job Scheduling, and Exam Scheduling.`;
  }

  // Default syllabus synthesis
  return `### AI Conceptual Guidance (${contextTopic || 'Units I & II'}):
- In Artificial Intelligence, problems are formalized as a quadruplet: **Initial State, Successor Function (Actions), Goal Test, and Path Cost Function**.
- Rational agents select actions expected to maximize their performance measure based on current percept sequences and built-in knowledge.
- In search algorithms, uninformed methods (BFS, DFS, IDDFS) search blindly without domain information, whereas informed methods ($A^*$, Greedy Best-First) leverage a heuristic function $h(n)$ estimating the remaining distance to the goal.`;
}

// Endpoint: AI Hint Generation
app.post('/api/ai/hint', async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionText, options, topic, unit } = req.body;
    const aiClient = getAIClient();

    if (!aiClient) {
      // Smart tailored hint based on question content
      let fallbackHint = `Focus on the formal definition of ${topic} from ${unit || 'Unit I & II'}.`;
      if (questionText.toLowerCase().includes('turing')) {
        fallbackHint = 'Remember that the Turing Test is evaluated through an isolated text interface and measures human imitation.';
      } else if (questionText.toLowerCase().includes('admissible')) {
        fallbackHint = 'An admissible heuristic is optimistic—it never overestimates the actual cost to reach the goal.';
      } else if (questionText.toLowerCase().includes('queue') || questionText.toLowerCase().includes('bfs')) {
        fallbackHint = 'Breadth-First Search traverses level by level, meaning newly discovered children wait at the back of the queue.';
      } else if (questionText.toLowerCase().includes('operator subgoaling')) {
        fallbackHint = 'When preconditions are missing, the agent sets a subgoal to fulfill the preconditions of the desired action.';
      } else if (questionText.toLowerCase().includes('csp') || questionText.toLowerCase().includes('map')) {
        fallbackHint = 'Adjacent regions share an edge, meaning they are strictly forbidden from having the same color.';
      }

      res.json({ hint: fallbackHint, fallback: true });
      return;
    }

    const prompt = `You are a university professor teaching Artificial Intelligence (Units I & II).
A student is taking an assessment quiz and needs a helpful hint for the following question.
DO NOT reveal the direct answer or option letter. Instead, give a concise (1-2 sentences), crystal-clear conceptual clue that guides their thinking according to AI principles.

Question: "${questionText}"
Topic: ${topic}
Options: ${JSON.stringify(options)}

Your concise hint:`;

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      }),
      8000
    );

    res.json({
      hint: response.text?.trim() || 'Focus on the definition of state spaces and rational decision criteria.',
      fallback: false,
    });
  } catch (err: unknown) {
    console.error('Gemini Hint Error:', err);
    res.json({
      hint: 'Notice the specific constraints and goal definition given in the problem statement.',
      fallback: true,
    });
  }
});

// Endpoint: AI Explanation & Deep Dive
app.post('/api/ai/explain', async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionText, selectedAnswer, correctAnswer, officialExplanation, topic } = req.body;
    const aiClient = getAIClient();

    if (!aiClient) {
      res.json({
        deepDive: `${officialExplanation}\n\nKey Takeaway: The concept of "${topic}" strictly enforces this principle in AI state space exploration and rational agent architectures.`,
        fallback: true,
      });
      return;
    }

    const prompt = `You are an expert AI professor. Explain this AI quiz question thoroughly to a student.
Question: "${questionText}"
Topic: ${topic}
Student Selected: "${selectedAnswer}"
Correct Answer: "${correctAnswer}"
Official Slide Explanation: "${officialExplanation}"

Provide a concise, 2-3 paragraph breakdown:
1. Why "${correctAnswer}" is correct based on AI Unit 1/Unit 2 concepts.
2. If the student selected "${selectedAnswer}" and it was incorrect, explain the common misconception.
3. A 1-sentence real-world AI application context.`;

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      }),
      8000
    );

    res.json({
      deepDive: response.text?.trim() || officialExplanation,
      fallback: false,
    });
  } catch (err: unknown) {
    console.error('Gemini Explanation Error:', err);
    res.json({
      deepDive: req.body.officialExplanation || 'Explanation unavailable at this moment.',
      fallback: true,
    });
  }
});

// Endpoint: AI Chat Tutor
app.post('/api/ai/ask-tutor', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userQuestion, contextTopic } = req.body;
    const aiClient = getAIClient();

    if (!aiClient) {
      const richAnswer = getSmartFallbackAnswer(userQuestion, contextTopic);
      res.json({
        answer: richAnswer,
        fallback: true,
      });
      return;
    }

    const prompt = `You are a friendly, rigorous AI Teaching Assistant specializing in:
- Unit 1: Foundations of AI, Turing Test, Rational Agents, 5 Agent Architectures, PEAS, Nature of Environments, Problem Formulation, Problem Characteristics, Production Systems, Issues in Search Design.
- Unit 2: Uninformed Search (BFS, DFS, IDDFS), Informed Search (Heuristics, Admissibility, Greedy Best-First, A* Search), Hill Climbing & Landscapes, Constraint Satisfaction Problems (CSP), Means-Ends Analysis (MEA).

Student Query: "${userQuestion}"
Context Topic: "${contextTopic || 'General AI'}"

Respond clearly with accurate definitions, algorithms, time/space complexities, or examples where appropriate. Keep it concise, accessible, and structured with clean formatting and markdown bullet points.`;

    const response = await withTimeout(
      aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      }),
      8000
    );

    res.json({
      answer: response.text?.trim() || 'AI agent design involves formulating appropriate state spaces and selection criteria.',
      fallback: false,
    });
  } catch (err: unknown) {
    console.error('Gemini Tutor Error:', err);
    const richAnswer = getSmartFallbackAnswer(req.body.userQuestion || '', req.body.contextTopic);
    res.json({
      answer: richAnswer,
      fallback: true,
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AI Quiz Game server running on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
