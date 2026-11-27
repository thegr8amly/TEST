/** Writing & Speaking tasks. Tasks escalate in demand (A2 → C1) so the full range can be observed. */
export interface WritingTask {
  id: string;
  title: string;
  targetLevel: string;
  prompt: string;
  bullets?: string[];
  minWords: number;
  maxWords: number;
}
export interface SpeakingTask {
  id: string;
  title: string;
  targetLevel: string;
  prompt: string;
  bullets?: string[];
  prepSeconds: number;
  speakSeconds: number;
}

export const WRITING_TASKS: WritingTask[] = [
  {
    id: "W1",
    title: "Email",
    targetLevel: "A2–B1",
    prompt:
      "You can't attend an important meeting at work next week. Write an email to your supervisor.",
    bullets: ["Apologise and explain why you can't attend", "Suggest a different day or a solution", "Ask what you should do to prepare"],
    minWords: 60,
    maxWords: 120,
  },
  {
    id: "W2",
    title: "Opinion essay",
    targetLevel: "B1–C2",
    prompt:
      "\"Artificial intelligence will create more jobs than it destroys.\" To what extent do you agree or disagree? Give reasons and examples from your own experience or your country.",
    minWords: 150,
    maxWords: 250,
  },
];

export const SPEAKING_TASKS: SpeakingTask[] = [
  {
    id: "S1",
    title: "About you",
    targetLevel: "A1–A2",
    prompt: "Introduce yourself.",
    bullets: ["Your name and where you're from", "What you do (work or studies)", "Why you want to improve your English"],
    prepSeconds: 15,
    speakSeconds: 45,
  },
  {
    id: "S2",
    title: "Tell a story",
    targetLevel: "B1",
    prompt: "Describe a difficult situation you faced at work or in your studies.",
    bullets: ["What happened", "What you did", "What you learned from it"],
    prepSeconds: 25,
    speakSeconds: 75,
  },
  {
    id: "S3",
    title: "Give your opinion",
    targetLevel: "B2–C1",
    prompt:
      "Some people say that companies and government institutions should require all employees to speak English. Do you agree? Explain your position and consider the opposite view.",
    prepSeconds: 30,
    speakSeconds: 90,
  },
];
