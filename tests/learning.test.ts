import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, createInitialState, addWords, getDueReviews, reviewWord, completeLesson, normalizeAnswer,
  exportState, loadState, saveState, mergeImport, localDateKey, type StorageLike } from '../src/lib/learning.ts';

const now = new Date('2026-11-03T20:00:00.000Z');
function storage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); } };
}

test('new vocabulary creates three independent, due, unlearned cards', () => {
  const initial = createInitialState();
  const next = addWords(initial, ['coffee', 'coffee'], now);
  assert.equal(Object.keys(initial.reviews).length, 0);
  assert.equal(getDueReviews(next, now).length, 3);
  assert.equal(getDueReviews(next, new Date(now.getTime() - 1)).length, 0);
  assert.equal(next.reviews['coffee:meaning'].card.reps, 0);
  const reviewed = reviewWord(next, 'coffee:listening', 'good', now);
  assert.equal(reviewed.reviews['coffee:listening'].card.reps, 1);
  assert.equal(reviewed.reviews['coffee:meaning'].card.reps, 0);
  assert.equal(getDueReviews(reviewed, now).length, 2);
  assert.deepEqual(addWords(reviewed, ['coffee'], now).reviews, reviewed.reviews);
});

test('FSRS schedules forgotten cards sooner than easy cards', () => {
  const state = addWords(createInitialState(), ['tea'], now);
  const again = reviewWord(state, 'tea:meaning', 'again', now);
  const easy = reviewWord(state, 'tea:meaning', 'easy', now);
  assert.ok(Date.parse(again.reviews['tea:meaning'].card.due) < Date.parse(easy.reviews['tea:meaning'].card.due));
  assert.ok(Date.parse(again.reviews['tea:meaning'].card.due) > now.getTime());
});

test('stored dates round-trip and can be fed back into FSRS after reloading', () => {
  const target = storage();
  let state = addWords(createInitialState(), ['water'], now);
  state = reviewWord(state, 'water:production', 'good', now);
  assert.equal(state.activity[localDateKey(now)].skills.speaking, 1);
  assert.equal(state.activity[localDateKey(now)].skills.writing, undefined);
  assert.equal(saveState(state, target), true);
  const loaded = loadState(target);
  assert.deepEqual(loaded, state);
  const due = new Date(loaded.reviews['water:production'].card.due);
  const next = reviewWord(loaded, 'water:production', 'good', due);
  assert.equal(next.reviews['water:production'].card.reps, 2);
  assert.equal(next.activity[localDateKey(now)].reviews, 2);
});

test('lesson completion counts once and preserves an unrelated in-progress lesson', () => {
  const state = { ...createInitialState(), session: { lessonId: 'lesson-2', step: 2, answers: {} } };
  const once = completeLesson(state, 'lesson-1', ['reading', 'reading', 'speaking'], 4.5, now);
  const twice = completeLesson(once, 'lesson-1', ['listening'], 35, now);
  assert.equal(twice, once);
  assert.equal(once.activity[localDateKey(now)].minutes, 4.5);
  assert.equal(once.activity[localDateKey(now)].lessons, 1);
  assert.deepEqual(once.completedLessons['lesson-1'].skills, ['reading', 'speaking']);
  assert.equal(once.session?.lessonId, 'lesson-2');
});

test('answer normalization accepts presentation differences but preserves negation and word order', () => {
  assert.equal(normalizeAnswer('  I’m  happy！ '), "i'm happy");
  assert.equal(normalizeAnswer('Ｉ want tea.'), 'i want tea');
  assert.notEqual(normalizeAnswer('I do not want tea.'), normalizeAnswer('I want tea.'));
  assert.notEqual(normalizeAnswer('Tea wants me.'), normalizeAnswer('I want tea.'));
});

test('import adds missing records, preserves existing progress, and cannot double count', () => {
  let local = addWords(createInitialState(), ['coffee'], now);
  local = reviewWord(local, 'coffee:meaning', 'easy', now);
  let remote = addWords(createInitialState(), ['coffee', 'tea'], now);
  remote = completeLesson(remote, 'lesson-2', ['writing'], 8, now);
  const merged = mergeImport(local, JSON.parse(exportState(remote)));
  assert.equal(Object.keys(merged.reviews).length, 6);
  assert.deepEqual(merged.reviews['coffee:meaning'], local.reviews['coffee:meaning']);
  assert.ok(merged.completedLessons['lesson-2']);
  assert.deepEqual(mergeImport(merged, JSON.parse(exportState(remote))), merged);
});

test('invalid, incompatible, and dangerous backups are rejected atomically', () => {
  const initial = createInitialState();
  assert.throws(() => mergeImport(initial, { ...initial, version: 2 }), /版本/);
  assert.throws(() => mergeImport(initial, { ...initial, dailyMinutes: 999 }));
  assert.throws(() => mergeImport(initial, { ...initial, activity: { '2026-02-30': { minutes: 3, lessons: 1, reviews: 0, skills: {} } } }));
  const bad = addWords(initial, ['coffee'], now);
  bad.reviews['coffee:meaning'].card.due = 'yesterday';
  assert.throws(() => mergeImport(initial, bad));
  const poison = JSON.parse(exportState(initial));
  poison.completedLessons = JSON.parse('{"__proto__":{"completedAt":"2026-11-03T20:00:00.000Z","skills":[]}}');
  assert.throws(() => mergeImport(initial, poison));
  assert.equal(Object.keys(initial.reviews).length, 0);
});

test('corrupt browser storage is backed up and storage failure is surfaced', () => {
  const target = storage();
  target.setItem(STORAGE_KEY, '{broken');
  const loaded = loadState(target);
  assert.ok(loaded.storageWarning);
  assert.equal(target.getItem(`${STORAGE_KEY}.recovery`), '{broken');
  assert.equal(target.getItem(STORAGE_KEY), '{broken');
  assert.equal(saveState(createInitialState(), { getItem: () => null, setItem: () => { throw new Error('quota'); } }), false);
});
