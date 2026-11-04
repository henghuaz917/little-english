import { createEmptyCard, fsrs, Rating, type Card, type Grade } from 'ts-fsrs';
import type { Skill } from '../types';

export const STORAGE_KEY = 'little-english.learning.v1';
export type ReviewMode = 'meaning' | 'listening' | 'production';
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';
export type SerializedCard = Omit<Card, 'due' | 'last_review'> & { due: string; last_review?: string };
export interface ReviewEntry { wordId: string; mode: ReviewMode; card: SerializedCard }
export interface Activity { minutes: number; lessons: number; reviews: number; skills: Partial<Record<Skill, number>> }
export interface LearningState {
  version: 1;
  reviews: Record<string, ReviewEntry>;
  completedLessons: Record<string, { completedAt: string; skills: Skill[] }>;
  activity: Record<string, Activity>;
  phonicsCompleted: string[];
  session?: { lessonId: string; step: number; answers: Record<string, unknown> };
  dailyMinutes: 15 | 35 | 60;
  /** Ephemeral notice; omitted from backups and persistent data. */
  storageWarning?: string;
}
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }

const modes: ReviewMode[] = ['meaning', 'listening', 'production'];
const skills: Skill[] = ['listening', 'speaking', 'reading', 'writing'];
const ratings: Record<ReviewRating, Grade> = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false, maximum_interval: 36500 });

export function createInitialState(): LearningState {
  return { version: 1, reviews: {}, completedLessons: {}, activity: {}, phonicsCompleted: [], dailyMinutes: 35 };
}

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getReviewKey(wordId: string, mode: ReviewMode): string { return `${wordId}:${mode}`; }

function serializeCard(card: Card): SerializedCard {
  const { due, last_review, ...rest } = card;
  return { ...rest, due: due.toISOString(), ...(last_review ? { last_review: last_review.toISOString() } : {}) };
}

function deserializeCard(card: SerializedCard): Card {
  return { ...card, due: new Date(card.due), last_review: card.last_review ? new Date(card.last_review) : undefined };
}

function browserStorage(): StorageLike | undefined {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}

export function exportState(state: LearningState): string {
  const { storageWarning: _notice, ...data } = state;
  return JSON.stringify(data, null, 2);
}

export function loadState(storage?: StorageLike): LearningState {
  try {
    const target = storage ?? browserStorage();
    if (!target) return createInitialState();
    const raw = target.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    try { return validateState(JSON.parse(raw)); }
    catch {
      // Keep the original intact in a recovery slot before a fresh state is saved.
      try { target.setItem(`${STORAGE_KEY}.recovery`, raw); } catch { /* Storage may be full or blocked. */ }
      return { ...createInitialState(), storageWarning: '学习记录无法读取，已尝试保留原始记录。可以从之前导出的备份恢复。' };
    }
  } catch {
    return { ...createInitialState(), storageWarning: '浏览器暂时不允许保存记录，本次学习请及时导出备份。' };
  }
}

export function saveState(state: LearningState, storage?: StorageLike): boolean {
  try {
    const target = storage ?? browserStorage();
    if (!target) return false;
    target.setItem(STORAGE_KEY, exportState(state));
    return true;
  } catch { return false; }
}

export function addWords(state: LearningState, wordIds: string[], now = new Date()): LearningState {
  const reviews = { ...state.reviews };
  for (const wordId of new Set(wordIds)) {
    if (!validId(wordId)) throw new Error('词条编号无效。');
    for (const mode of modes) {
      const key = getReviewKey(wordId, mode);
      if (!Object.hasOwn(reviews, key)) reviews[key] = { wordId, mode, card: serializeCard(createEmptyCard(now)) };
    }
  }
  return { ...state, reviews };
}

export function getDueReviews(state: LearningState, now = new Date()): Array<ReviewEntry & { key: string }> {
  return Object.entries(state.reviews)
    .filter(([, entry]) => new Date(entry.card.due).getTime() <= now.getTime())
    .sort(([aKey, a], [bKey, b]) => Date.parse(a.card.due) - Date.parse(b.card.due) || aKey.localeCompare(bKey))
    .map(([key, entry]) => ({ key, ...entry }));
}

function activityFor(state: LearningState, now: Date): Activity {
  const current = state.activity[localDateKey(now)];
  return current ? { ...current, skills: { ...current.skills } } : { minutes: 0, lessons: 0, reviews: 0, skills: {} };
}

export function reviewWord(state: LearningState, key: string, rating: ReviewRating, now = new Date()): LearningState {
  const entry = state.reviews[key];
  if (!entry) throw new Error('这张复习卡尚未加入学习。');
  if (!Object.hasOwn(ratings, rating)) throw new Error('复习评级无效。');
  const lastReview = entry.card.last_review ? Date.parse(entry.card.last_review) : 0;
  if (!Number.isFinite(now.getTime()) || now.getTime() < lastReview) throw new Error('设备时间早于上次复习，请检查系统时间。');
  const nextCard = scheduler.next(deserializeCard(entry.card), now, ratings[rating]).card;
  const today = activityFor(state, now);
  today.reviews += 1;
  const skill: Skill = entry.mode === 'meaning' ? 'reading' : entry.mode === 'listening' ? 'listening' : 'speaking';
  today.skills[skill] = (today.skills[skill] ?? 0) + 1;
  return {
    ...state,
    reviews: { ...state.reviews, [key]: { ...entry, card: serializeCard(nextCard) } },
    activity: { ...state.activity, [localDateKey(now)]: today },
  };
}

/** minutes is actual active learning time supplied by the caller, not the lesson's planned duration. */
export function completeLesson(state: LearningState, lessonId: string, practicedSkills: Skill[], minutes: number, now = new Date()): LearningState {
  if (!validId(lessonId)) throw new Error('课程编号无效。');
  if (Object.hasOwn(state.completedLessons, lessonId)) return state;
  const completedSkills = [...new Set(practicedSkills)].filter(skill => skills.includes(skill));
  const today = activityFor(state, now);
  today.lessons += 1;
  today.minutes = Math.min(1440, today.minutes + (Number.isFinite(minutes) ? Math.max(0, Math.min(minutes, 180)) : 0));
  for (const skill of completedSkills) today.skills[skill] = (today.skills[skill] ?? 0) + 1;
  return {
    ...state,
    completedLessons: { ...state.completedLessons, [lessonId]: { completedAt: now.toISOString(), skills: completedSkills } },
    activity: { ...state.activity, [localDateKey(now)]: today },
    session: state.session?.lessonId === lessonId ? undefined : state.session,
  };
}

/** Keep negation and word order; normalize only presentation, never semantic differences. */
export function normalizeAnswer(answer: string): string {
  return answer.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:，。！？；：]/g, '').trim().replace(/\s+/g, ' ');
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(value) && !['__proto__', 'constructor', 'prototype'].includes(value);
}
function timestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return false;
  const time = new Date(value);
  return Number.isFinite(time.getTime()) && time.toISOString() === value;
}
function number(value: unknown, max = 1_000_000, integer = false): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max && (!integer || Number.isInteger(value));
}
function assert(condition: unknown, message = '备份内容格式不正确，未导入任何记录。'): asserts condition {
  if (!condition) throw new Error(message);
}
function validDay(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && timestamp(`${key}T00:00:00.000Z`);
}
function jsonValue(value: unknown, depth = 0): boolean {
  if (depth > 5) return false;
  if (value === null || typeof value === 'boolean') return true;
  if (typeof value === 'string') return value.length <= 10000;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.length <= 100 && value.every(v => jsonValue(v, depth + 1));
  return object(value) && Object.keys(value).length <= 100 && Object.entries(value).every(([k, v]) => /^[a-zA-Z0-9_][a-zA-Z0-9_-]{0,119}$/.test(k) && !['__proto__', 'constructor', 'prototype'].includes(k) && jsonValue(v, depth + 1));
}

function validateState(input: unknown): LearningState {
  assert(object(input));
  assert(input.version === 1, '备份版本不受支持，请使用此版本软件导出的学习备份。');
  assert([15, 35, 60].includes(input.dailyMinutes as number));
  assert(object(input.reviews) && Object.keys(input.reviews).length <= 30000);
  assert(object(input.completedLessons) && Object.keys(input.completedLessons).length <= 10000);
  assert(object(input.activity) && Object.keys(input.activity).length <= 20000);
  assert(Array.isArray(input.phonicsCompleted) && input.phonicsCompleted.length <= 1000 && input.phonicsCompleted.every(validId));
  const clean = createInitialState();
  clean.dailyMinutes = input.dailyMinutes as 15 | 35 | 60;
  clean.phonicsCompleted = [...new Set(input.phonicsCompleted as string[])];
  for (const [key, raw] of Object.entries(input.reviews)) {
    assert(object(raw) && validId(raw.wordId) && modes.includes(raw.mode as ReviewMode));
    assert(key === getReviewKey(raw.wordId, raw.mode as ReviewMode) && object(raw.card));
    const c = raw.card;
    assert(timestamp(c.due) && (c.last_review === undefined || timestamp(c.last_review)));
    assert(number(c.stability, 1_000_000) && number(c.difficulty, 10));
    for (const k of ['elapsed_days', 'scheduled_days', 'learning_steps', 'reps', 'lapses']) assert(number(c[k], 1_000_000, true));
    assert(number(c.state, 3, true));
    assert((c.lapses as number) <= (c.reps as number));
    assert(c.reps === 0 ? c.state === 0 && c.last_review === undefined : timestamp(c.last_review) && (c.stability as number) > 0 && (c.difficulty as number) >= 1);
    if (typeof c.last_review === 'string') assert(Date.parse(c.due) >= Date.parse(c.last_review));
    clean.reviews[key] = {
      wordId: raw.wordId, mode: raw.mode as ReviewMode,
      card: { due: c.due, stability: c.stability, difficulty: c.difficulty, elapsed_days: c.elapsed_days as number,
        scheduled_days: c.scheduled_days as number, learning_steps: c.learning_steps as number,
        reps: c.reps as number, lapses: c.lapses as number, state: c.state,
        ...(typeof c.last_review === 'string' ? { last_review: c.last_review } : {}) },
    };
  }
  for (const [key, raw] of Object.entries(input.completedLessons)) {
    assert(validId(key) && object(raw) && timestamp(raw.completedAt));
    assert(Array.isArray(raw.skills) && raw.skills.length <= 4 && raw.skills.every(s => skills.includes(s as Skill)));
    clean.completedLessons[key] = { completedAt: raw.completedAt, skills: [...new Set(raw.skills as Skill[])] };
  }
  for (const [key, raw] of Object.entries(input.activity)) {
    assert(validDay(key) && object(raw) && number(raw.minutes, 1440) && number(raw.lessons, 10000, true) && number(raw.reviews, 1_000_000, true) && object(raw.skills));
    const skillCounts: Partial<Record<Skill, number>> = {};
    for (const [skill, count] of Object.entries(raw.skills)) {
      assert(skills.includes(skill as Skill) && number(count, 1_000_000, true));
      skillCounts[skill as Skill] = count;
    }
    clean.activity[key] = { minutes: raw.minutes, lessons: raw.lessons, reviews: raw.reviews, skills: skillCounts };
  }
  if (input.session !== undefined) {
    const s = input.session;
    assert(object(s) && validId(s.lessonId) && number(s.step, 20, true) && object(s.answers) && jsonValue(s.answers));
    clean.session = { lessonId: s.lessonId, step: s.step, answers: JSON.parse(JSON.stringify(s.answers)) as Record<string, unknown> };
  }
  return clean;
}

/** Merge is idempotent: local cards/settings/session win; imported records fill missing keys. */
export function mergeImport(state: LearningState, parsed: unknown): LearningState {
  const imported = validateState(parsed);
  const activity = { ...imported.activity };
  for (const [day, local] of Object.entries(state.activity)) {
    const other = activity[day];
    if (!other) { activity[day] = local; continue; }
    const counts: Partial<Record<Skill, number>> = {};
    for (const skill of skills) {
      const value = Math.max(local.skills[skill] ?? 0, other.skills[skill] ?? 0);
      if (value) counts[skill] = value;
    }
    activity[day] = { minutes: Math.max(local.minutes, other.minutes), lessons: Math.max(local.lessons, other.lessons), reviews: Math.max(local.reviews, other.reviews), skills: counts };
  }
  const completedLessons = { ...imported.completedLessons, ...state.completedLessons };
  const lessonCounts: Record<string, number> = {};
  for (const entry of Object.values(completedLessons)) {
    const day = localDateKey(new Date(entry.completedAt));
    lessonCounts[day] = (lessonCounts[day] ?? 0) + 1;
  }
  for (const [day, count] of Object.entries(lessonCounts)) {
    const current = activity[day] ?? { minutes: 0, lessons: 0, reviews: 0, skills: {} };
    activity[day] = { ...current, lessons: Math.max(current.lessons, count) };
  }
  return { ...state, reviews: { ...imported.reviews, ...state.reviews }, completedLessons, activity,
    phonicsCompleted: [...new Set([...state.phonicsCompleted, ...imported.phonicsCompleted])] };
}
