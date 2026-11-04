export type Skill = 'listening' | 'speaking' | 'reading' | 'writing';
export interface Word { id: string; word: string; ipa: string; meaning: string; example: string; translation: string; }
export interface ChoiceExercise { text: string; prompt: string; options: string[]; answerIndex: number; explanation: string; }
export interface Lesson { id: string; title: string; subtitle: string; scene: string; emoji: string; phonicsId: string; words: Word[]; listening: ChoiceExercise; reading: ChoiceExercise; writing: { prompt: string; answers: string[]; hint: string }; speaking: { prompt: string; example: string; translation: string }; }
export interface PhonicsUnit { id: string; title: string; sound: string; spelling: string; description: string; mouthTip: string; words: { word: string; ipa: string; meaning: string; chunks: string[] }[]; challenge: { audio: string; prompt: string; options: string[]; answerIndex: number; explanation: string }; }
