// Pure domain functions: no document, network, or framework dependency.
import { seedPosts, costs, cards } from './data.js';
export const STORAGE_KEY = 'still-prototype-v1';
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function initialState() {
  return { version: 1, plan: 'free', messages: [], chatUses: 0, stars: [], journals: [], results: [],
    card: 0, savedCards: [], timer: { end: null, remaining: 1500 }, reminders: [],
    completed: [], favourites: [], posts: structuredClone(seedPosts), liked: [], vote: null,
    bookings: [], duo: { code: '', speaker: 'You', messages: [] } };
}
export function scoreCheckin(answers) {
  if (!Array.isArray(answers) || answers.length !== 4 || answers.some(n => !Number.isInteger(n) || n < 1 || n > 5)) throw new Error('Answer all four questions.');
  const score = Math.round(((answers.reduce((a, b) => a + b, 0) - 4) / 16) * 100);
  return { score, label: score < 35 ? 'Make room to recharge' : score < 70 ? 'Find your steady rhythm' : 'Keep what supports you',
    note: 'A demonstration of scoring, not a validated measure or clinical assessment.' };
}
export function remainingSeconds(timer, now = Date.now()) {
  return timer.end === null ? timer.remaining : Math.max(0, Math.ceil((timer.end - now) / 1000));
}
const toggle = (items, value) => items.includes(value) ? items.filter(x => x !== value) : [...items, value];
export function reducer(s, a) {
  switch (a.type) {
    case 'MESSAGE': return s.chatUses >= costs[s.plan] ? s : { ...s, chatUses: s.chatUses + 1, messages: [...s.messages, a.message] };
    case 'REPLY': return { ...s, messages: [...s.messages, a.message] };
    case 'STAR': return { ...s, stars: toggle(s.stars, a.id) };
    case 'CLEAR_CHAT': return { ...s, messages: [], stars: [] }; // usage deliberately remains
    case 'SAVE_RESULT': return { ...s, results: [a.result, ...s.results] };
    case 'SAVE_JOURNAL': return { ...s, journals: [a.entry, ...s.journals] };
    case 'CARD': return { ...s, card: a.index };
    case 'SAVE_CARD': return { ...s, savedCards: toggle(s.savedCards, s.card) };
    case 'TIMER_START': return { ...s, timer: { ...s.timer, end: a.now + s.timer.remaining * 1000 } };
    case 'TIMER_PAUSE': return { ...s, timer: { end: null, remaining: remainingSeconds(s.timer, a.now) } };
    case 'TIMER_RESET': return { ...s, timer: { end: null, remaining: a.seconds } };
    case 'ADD_REMINDER': return { ...s, reminders: [...s.reminders, a.reminder] };
    case 'REMOVE_REMINDER': return { ...s, reminders: s.reminders.filter(x => x.id !== a.id) };
    case 'NOTIFY_REMINDER': return { ...s, reminders: s.reminders.map(x => x.id === a.id ? { ...x, notified: true } : x) };
    case 'COMPLETE': return { ...s, completed: toggle(s.completed, a.id) };
    case 'FAVOURITE': return { ...s, favourites: toggle(s.favourites, a.id) };
    case 'ADD_POST': return { ...s, posts: [a.post, ...s.posts] };
    case 'LIKE_POST': return { ...s, liked: toggle(s.liked, a.id) };
    case 'VOTE': return Number.isInteger(a.option) && a.option >= 0 && a.option < 3 ? { ...s, vote: a.option } : s;
    case 'BOOK': return s.bookings.some(x => x.provider === a.booking.provider && x.slot === a.booking.slot) ? s : { ...s, bookings: [a.booking, ...s.bookings] };
    case 'CANCEL_BOOKING': return { ...s, bookings: s.bookings.filter(x => x.id !== a.id) };
    case 'SET_PLAN': return Object.hasOwn(costs, a.plan) ? { ...s, plan: a.plan } : s;
    case 'CREATE_ROOM': return { ...s, duo: { code: a.code, speaker: 'You', messages: [] } };
    case 'SPEAKER': return ['You', 'Partner'].includes(a.speaker) ? { ...s, duo: { ...s.duo, speaker: a.speaker } } : s;
    case 'DUO_MESSAGE': return !s.duo.code ? s : { ...s, duo: { ...s.duo, messages: [...s.duo.messages, a.message] } };
    case 'RESET': return initialState();
    default: return s;
  }
}
// Narrow structural guard: reject malformed/old snapshots instead of crashing rendering.
export function restore(raw) {
  try {
    const x = JSON.parse(raw);
    if (x.version !== 1 || !Object.hasOwn(costs, x.plan) || !Number.isInteger(x.chatUses) || x.chatUses < 0) return initialState();
    const arrays = ['messages','stars','journals','results','savedCards','reminders','completed','favourites','posts','liked','bookings'];
    if (arrays.some(k => !Array.isArray(x[k])) || !x.duo || !Array.isArray(x.duo.messages) || !x.timer || !Number.isFinite(x.timer.remaining)) return initialState();
    if (x.timer.end !== null && !Number.isFinite(x.timer.end)) return initialState();
    if (x.timer.remaining < 0 || !Number.isInteger(x.card) || x.card < 0 || x.card >= cards.length ||
      x.savedCards.some(i => !Number.isInteger(i) || i < 0 || i >= cards.length) ||
      x.results.some(r => !r || !Number.isInteger(r.score) || r.score < 0 || r.score > 100) ||
      x.posts.some(p => !p || !Number.isFinite(p.likes) || p.likes < 0) ||
      [...x.stars, ...x.completed, ...x.favourites, ...x.liked].some(id => typeof id !== 'string')) return initialState();
    // Validate object collections before they reach templates. This is not an auth boundary.
    if (x.messages.some(m => !m || typeof m.text !== 'string' || !['user','assistant'].includes(m.role)) ||
      x.journals.some(j => !j || !Array.isArray(j.answers) || j.answers.some(t => typeof t !== 'string')) ||
      x.posts.some(p => !p || typeof p.text !== 'string') || x.reminders.some(r => !r || !Number.isFinite(r.at))) return initialState();
    return { ...initialState(), ...x };
  } catch { return initialState(); }
}
export function createStore(storage) {
  let state;
  let durable = true;
  try { state = restore(storage.getItem(STORAGE_KEY)); } catch { state = initialState(); durable = false; }
  return {
    get: () => state,
    isDurable: () => durable,
    dispatch(action) {
      state = reducer(state, action);
      try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { durable = false; }
      return state;
    }
  };
}
