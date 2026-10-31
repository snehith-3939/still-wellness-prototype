// Original sample content. None of these are Healo's proprietary questions or media.
export const prompts = ['What gave you a little energy today?', 'What would you like to set down?', 'What is one kind thing you can do for yourself?'];
export const moods = ['Great', 'Good', 'Okay', 'Low', 'Tough'];
export const questions = [
  'I made room for a short break today.',
  'I had enough energy for what mattered to me.',
  'I felt connected to someone or something.',
  'I found a moment of calm.'
];
export const cards = [
  { title: 'A change of scenery', body: 'Look out of a window. Find three things you haven’t noticed before.', tag: 'NOTICE · 2 MIN', color: 'lavender' },
  { title: 'Make something simple', body: 'Prepare a drink or a small snack. Give this one small task your full attention.', tag: 'NOURISH · 5 MIN', color: 'peach' },
  { title: 'A softer landing', body: 'Put down your screen, relax your shoulders, and let yourself pause for a moment.', tag: 'PAUSE · 1 MIN', color: 'sage' }
];
export const lessons = [
  { id: 'pause', title: 'The art of a small pause', length: '3 min read', category: 'EVERYDAY PRACTICE', text: 'A pause can be small enough to fit into an ordinary day. Choose one transition: before opening a new tab, after finishing a task, or before your next conversation. Stop for a moment and notice your surroundings. You do not need to fix how you feel. The practice is simply making a little space before choosing your next action.', steps: ['Choose one transition in your day.', 'Notice your breath and the space around you.', 'Decide on one small next action.'] },
  { id: 'listen', title: 'Listening with a little space', length: '4 min read', category: 'BETTER CONNECTIONS', text: 'Listening starts with allowing someone else to finish a thought. Try reflecting back what you heard before adding your own perspective. You can ask: “Have I understood you?” This is a communication exercise, not a substitute for resolving unsafe or harmful situations.', steps: ['Let the other person finish.', 'Reflect back one thing you heard.', 'Ask if you understood correctly.'] },
  { id: 'kind', title: 'A kinder inner voice', length: '3 min read', category: 'SELF REFLECTION', text: 'Write down one sentence you often tell yourself about an unfinished task. Imagine a friend telling you the same thing about themselves. What would you say to them? Rewrite the sentence in that voice, keeping it honest and specific. You can acknowledge a difficulty and still leave room for another attempt.', steps: ['Notice a familiar self-critical sentence.', 'Imagine what you would say to a friend.', 'Write an honest, kinder alternative.'] }
];
export const providers = [
  { id: 'maya', name: 'Maya Rao', role: 'Counsellor · fictional profile', initials: 'MR', color: 'peach', tags: ['Relationships', 'Everyday stress'], slots: ['Tomorrow, 10:00', 'Tomorrow, 15:00'] },
  { id: 'arun', name: 'Arun Sen', role: 'Wellness coach · fictional profile', initials: 'AS', color: 'sage', tags: ['Habits', 'Work & life'], slots: ['Tomorrow, 11:00', 'Tomorrow, 17:00'] }
];
export const demoPoll = { question: 'What helps you slow down?', options: ['A walk outside', 'Music', 'Writing it down'], votes: [12, 8, 5] };
export const seedPosts = [{ id: 'seed-one', name: 'The Still team', category: 'Small wins', text: 'A small win counts. Today, ours is taking a proper screen break.', likes: 3 }];
export const costs = { free: 8, plus: 30 };
export const mechanics = {
  home: ['An activity hub', 'The dashboard reads one shared store. Completing a lesson or saving a journal entry changes its summary immediately.', 'app.js → homeView(), core.js → reducer()'],
  chat: ['A replaceable assistant adapter', 'A deterministic local responder routes a message by simple keywords. It is a teaching stand-in for a server-side AI service, not recovered Healo logic.', 'services.js → replyTo(), app.js → chatView()'],
  duo: ['Two roles, one local conversation', 'Switch between two demo speakers. The room code and messages live in this browser; there is no remote participant or network synchronization.', 'core.js → CREATE_ROOM / DUO_MESSAGE'],
  tests: ['Questions → score → saved result', 'Four original, nonclinical questions demonstrate validation, a transparent score, a report, and history.', 'core.js → scoreCheckin(), SAVE_RESULT'],
  journal: ['Guided reflection → history', 'Mood and three text responses form a single entry. Saving updates history and the dashboard.', 'data.js → prompts, core.js → SAVE_JOURNAL'],
  wellness: ['Small tools with shared persistence', 'Cards, a deadline-based timer, local reminders, and a downloadable worksheet show several independent tools in one hub.', 'core.js → remainingSeconds(), app.js → wellnessView()'],
  library: ['Catalog → detail → progress', 'Original lessons support reading, favourites, and completion. A browser-generated ambient tone demonstrates an audio control.', 'data.js → lessons, services.js → createAmbient()'],
  community: ['A local social data model', 'Posts, likes, filtering and a poll work only in this browser. They demonstrate state changes without sending messages to real people.', 'core.js → ADD_POST / LIKE_POST / VOTE'],
  care: ['Selection → review → local booking', 'Fictional provider and time selections create a local appointment record. No availability service, payment or real booking is involved.', 'data.js → providers, core.js → BOOK'],
  account: ['A demo entitlement boundary', 'A plan switch changes the chat allowance. Export downloads this browser’s data; reset clears this demo only.', 'core.js → SET_PLAN / RESET, app.js → accountView()']
};
