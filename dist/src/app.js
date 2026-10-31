import { cards, prompts, moods, questions, lessons, providers, demoPoll, costs, mechanics } from './data.js';
import { createStore, uid, scoreCheckin, remainingSeconds } from './core.js';
import { replyTo, duoReflection, createAmbient } from './services.js';

const store = createStore({ getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) });
const audio = createAmbient();
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const e = escapeHTML;
const routes = [
  ['home', 'Overview', 'home'], ['chat', 'Chat companion', 'chat'], ['duo', 'Duo practice', 'people'],
  ['tests', 'Self check-in', 'check'], ['journal', 'Your journal', 'book'], ['wellness', 'Wellness tools', 'sun'],
  ['library', 'Learning & sound', 'play'], ['community', 'Community', 'heart'], ['care', 'Find support', 'care']
];
const paths = {
  home: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
  chat: '<path d="M21 11a8 8 0 0 1-8 8H6l-4 3V11a9 9 0 1 1 19 0Z"/><path d="M7 10h10M7 14h6"/>',
  people: '<circle cx="8" cy="7" r="3"/><path d="M2 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 4 5v2"/>',
  check: '<rect x="4" y="3" width="16" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
  book: '<path d="M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3zM12 6v15"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2"/>',
  play: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/>',
  heart: '<path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-4 4 2 10 8 15 6-5 12-11 8-15Z"/>',
  care: '<path d="M4 20h16V8L12 3 4 8zM12 9v7M8.5 12.5h7"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>', star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  leaf: '<path d="M20 3C7 1 2 8 5 15c7 6 16 1 15-12ZM3 21 16 8"/>',
  code: '<path d="m8 5-6 7 6 7M16 5l6 7-6 7M14 3l-4 18"/>',
  settings: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
const action = (name, text, extra = '', cls = 'button') => `<button type="button" class="${cls}" data-action="${name}" ${extra}>${text}</button>`;
const link = (route, text, cls = 'button') => `<a class="${cls}" href="#${route}">${text}</a>`;
const date = value => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const clock = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
let route = 'home', pending = false, starredOnly = false, testAnswers = [], journalStep = 0;
let draft = { mood: 'Okay', answers: ['', '', ''] }, communityQuery = '', communityFilter = 'All';
let activeLesson = lessons[0].id, audioOn = false, bookingDraft = null, mobileOpen = false;
let toastTimeout;

function toast(message) {
  $('#toast').textContent = message; $('#toast').classList.add('visible');
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 4000);
}
function update(action, redraw = true) { store.dispatch(action); if (redraw) render(); }
function intro(kicker, title, subtitle, side = '') {
  return `<div class="page-intro"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="muted">${subtitle}</p></div>${side}</div>`;
}
function mechanism() {
  const m = mechanics[route]; if (!m) return '';
  return `<details class="mechanism"><summary>${icon('code')} How this works <span>Implementation note</span></summary><div><strong>${m[0]}</strong><p>${m[1]}</p><code>${m[2]}</code> ${link('guide', 'Explore the walkthrough →', 'text-link')}</div></details>`;
}
function shell(content) {
  const s = store.get();
  return `<aside class="sidebar ${mobileOpen ? 'open' : ''}" aria-label="Main navigation">
    <a class="brand" href="#home">${icon('leaf')}<span>still<span class="brand-dot">.</span></span></a>
    <span class="sidebar-label">YOUR LITTLE CORNER</span>
    <nav>${routes.map(([id, name, ic]) => `<a href="#${id}" ${id === route ? 'aria-current="page"' : ''}>${icon(ic)}<span>${name}</span>${id === 'chat' ? '<span class="nav-dot"></span>' : ''}</a>`).join('')}</nav>
    <div class="sidebar-bottom"><div class="sidebar-note"><span>Take it at your pace.</span><p>Small moments make room<br>for better days.</p><span class="tiny-flower">✳</span></div><a href="#guide">${icon('code')} Prototype walkthrough</a><a href="#account">${icon('settings')} Demo account</a></div>
  </aside>
  <div class="workspace"><header class="topbar"><div class="topbar-left">${action('menu', '☰', 'aria-label="Toggle navigation" aria-expanded="'+mobileOpen+'"', 'mobile-toggle')}<span class="breadcrumb">Your space <span>/</span> ${routes.find(x => x[0] === route)?.[1] || (route === 'guide' ? 'Walkthrough' : 'Demo account')}</span></div><div class="topbar-right"><span class="demo-pill"><span></span> Local demo</span><a href="#account" class="usage-pill">${icon('sun')} ${Math.max(0, costs[s.plan] - s.chatUses)} chats left</a><a href="#account" class="avatar" aria-label="Open demo account">D</a></div></header>
  <main id="main" tabindex="-1">${!store.isDurable() ? '<p class="notice">Storage is unavailable. Changes will last only while this page is open.</p>' : ''}${content}${mechanism()}<footer>Made for exploring, one small interaction at a time. <span>Independent educational prototype · sample data</span></footer></main></div>`;
}

function homeView() {
  const s = store.get(); const done = [s.messages.length > 0, s.journals.length > 0, s.completed.length > 0].filter(Boolean).length;
  return `${intro('A FRESH LITTLE START', 'A little room for you.', 'You don’t need to have it all figured out. Start with a small moment.', '<span class="date-label">'+new Date().toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})+'</span>')}
  <section class="hero"><div class="hero-copy"><span class="tag">A MOMENT OF STILL</span><h2>Meet yourself<br>where you are.</h2><p>A thought, a feeling, or just a quiet hello.<br>There’s space for it here.</p>${link('chat', 'Let’s talk '+icon('arrow'), 'button primary')}</div><div class="landscape" aria-hidden="true"><div class="halo"></div><div class="sun-disc"></div><div class="hill hill-back"></div><div class="hill hill-front"></div><div class="stem stem-one"></div><div class="stem stem-two"></div><span class="art-spark">✳</span><div class="art-caption">breathe in. settle in.</div></div></section>
  <div class="section-heading"><h2>Start small today</h2><span class="subtle">${done} of 3 moments explored</span></div>
  <div class="three-grid"><a class="task-card" href="#chat"><span class="icon-tile lavender">${icon('chat')}</span><span class="task-meta">A LITTLE CONNECTION · 2 MIN</span><h3>Say what’s on your mind</h3><p>A gentle space to start a conversation.</p><div class="card-bottom">${s.messages.length ? 'Explored ✓' : 'Start a conversation'} ${icon('arrow')}</div></a>
  <a class="task-card" href="#journal"><span class="icon-tile peach">${icon('book')}</span><span class="task-meta">A LITTLE REFLECTION · 3 MIN</span><h3>Let a thought land</h3><p>Put your day into words, at your pace.</p><div class="card-bottom">${s.journals.length ? 'Explored ✓' : 'Open your journal'} ${icon('arrow')}</div></a>
  <a class="task-card" href="#library"><span class="icon-tile sage">${icon('leaf')}</span><span class="task-meta">A LITTLE DISCOVERY · 3 MIN</span><h3>Practise a small pause</h3><p>A short lesson with one useful idea.</p><div class="card-bottom">${s.completed.length ? 'Explored ✓' : 'Find a little perspective'} ${icon('arrow')}</div></a></div>
  <div class="two-grid home-lower"><section class="panel checkin-promo"><span class="eyebrow">CHECK IN WITH YOURSELF</span><h2>How’s your energy today?</h2><p class="muted">Four questions. A moment to notice.</p><div class="mood-decor" aria-hidden="true">☀ <span>◡</span> ☁</div>${link('tests','Take a quick check-in →','text-link')}</section><section class="panel journey"><div class="section-heading"><h2>Your little moments</h2><span class="icon-tile small lavender">${icon('sun')}</span></div><div class="stats"><div><strong>${s.journals.length}</strong><span>reflections</span></div><div><strong>${s.completed.length}</strong><span>lessons read</span></div><div><strong>${s.results.length}</strong><span>check-ins</span></div></div><p class="muted small">Your progress stays in this browser. There’s no perfect score to chase.</p></section></div>`;
}
function chatView() {
  const s = store.get(); const visible = s.messages.filter(m => !starredOnly || s.stars.includes(m.id));
  return `${intro('A LITTLE CONNECTION', 'Let’s make some space.', 'A scripted companion for exploring the conversation flow.', action('star-filter', starredOnly ? 'Show all messages' : 'Starred messages', '', 'button secondary'))}
  <section class="chat-panel panel"><div class="chat-header"><div class="companion-icon">✳</div><div><strong>Still companion</strong><span>Local scripted responses · no AI connection</span></div>${action('clear-chat', 'New conversation', '', 'text-button')}</div>
  <div class="messages" id="messages" aria-live="polite" aria-busy="${pending}">${!visible.length ? `<div class="chat-welcome"><span class="orb">✳</span><h2>${starredOnly ? 'A place for words to keep.' : 'A quiet hello is a good start.'}</h2><p>${starredOnly ? 'Star a response to find it here.' : 'Try a sample prompt below, or write something of your own.'}</p>${!starredOnly ? '<div class="chips">'+['Work feels stressful', 'How does this demo work?', 'Help me listen better'].map(t => action('prompt',e(t),`data-prompt="${e(t)}"`,'chip')).join('')+'</div>' : ''}</div>` : visible.map(m => `<article class="message ${m.role}"><div class="bubble">${e(m.text)}</div><div class="message-meta">${m.role === 'user' ? 'You' : 'Still · scripted'}${m.role === 'assistant' ? action('star', icon('star'), `data-id="${e(m.id)}" aria-label="${s.stars.includes(m.id)?'Unstar':'Star'} message" aria-pressed="${s.stars.includes(m.id)}"`, 'star-button') : ''}</div></article>`).join('')}${pending ? '<div class="typing" role="status">Still is finding a little perspective <span>•••</span></div>' : ''}</div>
  <form id="chat-form" class="composer"><label class="sr-only" for="chat-input">Your message</label><textarea id="chat-input" name="message" rows="1" maxlength="2000" placeholder="What’s on your mind?" required ${pending?'disabled':''}></textarea><button class="send-button" aria-label="Send message" ${pending || s.chatUses >= costs[s.plan] ? 'disabled' : ''}>${icon('arrow')}</button></form><p class="composer-note">${s.chatUses >= costs[s.plan] ? 'Demo allowance reached. Switch plan in Demo account to explore the entitlement flow.' : 'Use sample details. This demo is not medical care or crisis support.'}</p></section>`;
}
function duoView() {
  const d = store.get().duo;
  return `${intro('BETTER CONNECTIONS', 'Two perspectives. One space.', 'A single-browser simulation of a shared conversation.')}
  ${!d.code ? `<section class="panel empty-state"><div class="duo-orbs"><span>Y</span><span>P</span></div><h2>Practise a gentler conversation.</h2><p>Create a local room, then switch speakers to see how shared chat data could work.</p>${action('create-room','Create demo room','','button primary')}<p class="small muted">No invite is sent. Both speakers are controlled on this device.</p></section>` : `<div class="two-grid"><section class="panel"><div class="section-heading"><h2>Your practice room</h2>${action('copy-room','Copy code','','button secondary small')}</div><p class="room-code">${e(d.code)}</p><form id="join-form" class="inline-form"><label class="sr-only" for="room-code">Room code</label><input id="room-code" name="code" placeholder="Enter this room’s code" required><button class="button secondary">Join locally</button></form><hr><div class="segmented" aria-label="Choose speaker">${['You','Partner'].map(n=>action('speaker',n,`data-speaker="${n}" aria-pressed="${n===d.speaker}"`,n===d.speaker?'selected':'')).join('')}</div><div class="duo-messages">${d.messages.length ? d.messages.map(m=>`<p class="duo-message"><strong>${e(m.speaker)}</strong>${e(m.text)}</p>`).join('') : '<p class="muted">Start with “One thing I’d like you to understand is…”</p>'}</div><form id="duo-form"><label for="duo-text">${d.speaker === 'You' ? 'Your turn' : 'Partner’s turn'}</label><textarea id="duo-text" name="message" rows="2" maxlength="1000" required placeholder="Write a practice message…"></textarea><button class="button primary">Add to conversation</button></form></section><aside class="panel reflection"><span class="eyebrow">A GENTLE REFLECTION</span><h2>Make room to hear.</h2><p>${e(duoReflection(d.messages))}</p><div class="divider-art" aria-hidden="true">◡ &nbsp; ◡</div><p class="small muted">Real shared rooms would need authenticated participants, a server, access checks, and real-time updates.</p></aside></div>`}`;
}
function testsView() {
  const s=store.get();
  return `${intro('A LITTLE SELF DISCOVERY','Notice your energy.','An original, nonclinical check-in showing a simple assessment workflow.')}
  <div class="two-grid assessment-grid"><section class="panel"><span class="tag lavender">4 QUESTIONS · ABOUT 2 MIN</span><h2>Your everyday energy check-in</h2><p class="muted">Think about today. 1 means “not at all”; 5 means “very much”.</p><form id="test-form">${questions.map((q,i)=>`<fieldset class="question"><legend>${i+1}. ${q}</legend><div class="rating">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="q${i}" value="${n}" ${testAnswers[i]===n?'checked':''} required><span>${n}</span></label>`).join('')}</div></fieldset>`).join('')}<button class="button primary">See my reflection ${icon('arrow')}</button></form></section>
  <aside><section class="panel result-panel"><span class="eyebrow">YOUR LATEST CHECK-IN</span>${s.results.length ? `<div class="score-ring" style="--score:${s.results[0].score}%"><span>${s.results[0].score}<small>/ 100</small></span></div><h2>${e(s.results[0].label)}</h2><p class="muted">${e(s.results[0].note)}</p>` : '<div class="empty-icon">◌</div><h3>A little perspective awaits.</h3><p class="muted">Your result will appear here after all four questions.</p>'}</section><section class="panel history-panel"><h3>Previous check-ins</h3>${s.results.slice(0,5).map(r=>`<div class="history-row"><span>${date(r.at)}</span><strong>${r.score}/100</strong></div>`).join('') || '<p class="muted small">Your first check-in starts the story.</p>'}</section></aside></div>`;
}
function journalView() {
  const s=store.get();
  return `${intro('A LITTLE REFLECTION','Let a thought land.','Three gentle prompts. No perfect words needed.')}
  <div class="two-grid"><section class="panel journal-panel"><h2>How are you arriving today?</h2><div class="moods">${moods.map((m,i)=>action('mood',`<span>${['☀','◡','○','☁','☂'][i]}</span>${m}`,`data-mood="${m}" aria-pressed="${draft.mood===m}"`,draft.mood===m?'mood selected':'mood')).join('')}</div><div class="progress-track"><span style="width:${(journalStep+1)/3*100}%"></span></div><p class="eyebrow">PROMPT ${journalStep+1} OF 3</p><h2>${prompts[journalStep]}</h2><form id="journal-form"><label class="sr-only" for="journal-text">Your reflection</label><textarea id="journal-text" name="answer" rows="7" maxlength="2000" placeholder="Start wherever you are…" required>${e(draft.answers[journalStep])}</textarea><div class="form-actions">${journalStep>0?action('journal-back','← Back','','text-button'):'<span></span>'}<button class="button primary">${journalStep===2?'Save reflection':'Next prompt →'}</button></div></form></section><section class="panel"><span class="eyebrow">YOUR REFLECTIONS</span><h2>Little pages of your day.</h2>${s.journals.length?s.journals.map(j=>`<details class="journal-entry"><summary>${date(j.at)} <span>${e(j.mood)}</span></summary>${j.answers.map((a,i)=>`<h4>${prompts[i]}</h4><p class="preserve">${e(a)}</p>`).join('')}</details>`).join(''):'<div class="empty-state compact"><span class="empty-icon">✎</span><p class="muted">Your saved reflections will find a home here.</p></div>'}</section></div>`;
}
function wellnessView() {
  const s=store.get(), card=cards[s.card];
  return `${intro('SMALL THINGS, SOFTLY','Make a little space.','Practical tools for an ordinary moment in your day.')}
  <div class="two-grid"><section class="self-card ${card.color}"><div class="section-heading"><span class="eyebrow">${card.tag}</span>${action('save-card',icon('star'),`aria-label="${s.savedCards.includes(s.card)?'Unsave':'Save'} care card" aria-pressed="${s.savedCards.includes(s.card)}"`,'round-button')}</div><div class="card-flower" aria-hidden="true">✳</div><h2>${card.title}</h2><p>${card.body}</p>${action('shuffle','Find another little moment ↻','','button glass')}<p class="small">${s.savedCards.length} saved · choose any card to save it</p></section>
  <section class="panel timer-panel"><span class="eyebrow">A LITTLE FOCUS</span><h2>One thing at a time.</h2><div class="timer-display" id="timer-display" role="timer" aria-label="Focus countdown">${clock(remainingSeconds(s.timer))}</div><form id="timer-form" class="inline-form"><label for="minutes">Minutes</label><input id="minutes" type="number" name="minutes" min="1" max="120" value="${Math.max(1, Math.ceil(s.timer.remaining / 60))}" required><button class="button secondary">Set</button></form><div class="timer-actions">${action(s.timer.end?'pause-timer':'start-timer',s.timer.end?'Pause':'Start focus','','button primary')}${action('reset-timer','Reset','','button secondary')}</div><p class="small muted">The countdown uses a deadline, so moving to another screen won’t lose time.</p></section></div>
  <div class="two-grid section-gap"><section class="panel"><h2>A little reminder</h2><p class="muted small">In-app reminders work while this demo is open. Times use your browser’s time zone.</p><form id="reminder-form"><label for="reminder-title">What would you like to remember?</label><input id="reminder-title" name="title" maxlength="100" placeholder="A short stretch, perhaps" required><label for="reminder-at">When?</label><input id="reminder-at" type="datetime-local" name="at" required><button class="button secondary">Add local reminder</button></form><div class="reminders">${s.reminders.map(r=>`<div class="reminder-row"><div><strong>${e(r.title)}</strong><span>${e(new Date(r.at).toLocaleString())} · ${r.notified?'Shown':'Upcoming'}</span></div>${action('remove-reminder','×',`data-id="${e(r.id)}" aria-label="Remove reminder"`,'text-button')}</div>`).join('')}</div></section><section class="panel worksheet"><span class="icon-tile peach">${icon('book')}</span><span class="eyebrow">A LITTLE STRUCTURE</span><h2>One small next step</h2><p class="muted">An original worksheet: name a task, make it smaller, choose a next step.</p>${action('worksheet','Download worksheet ↓','','button secondary')}<h3>Saved care cards</h3>${s.savedCards.map(i=>`<p class="small">✳ ${cards[i].title}</p>`).join('')||'<p class="muted small">Save a card above to keep it here.</p>'}</section></div>`;
}
function libraryView() {
  const s=store.get(), lesson=lessons.find(l=>l.id===activeLesson);
  return `${intro('A LITTLE DISCOVERY','A softer kind of learning.','Short, original lessons to read, reflect on, and return to.')}
  <div class="library-layout"><section class="lesson-list">${lessons.map((l,i)=>`<button class="lesson-card ${l.id===activeLesson?'active':''}" data-action="lesson" data-id="${l.id}" aria-pressed="${l.id===activeLesson}"><span class="lesson-art ${['lavender','sage','peach'][i]}" aria-hidden="true">${['◒','◡','✳'][i]}</span><span><small>${l.length}</small><strong>${l.title}</strong><span class="lesson-status">${s.completed.includes(l.id)?'Completed ✓':'Read a little →'} ${s.favourites.includes(l.id)?' · ★':''}</span></span></button>`).join('')}
  <div class="sound-card"><span>♫</span><h3>A little background calm.</h3><p>Two gentle browser-generated tones. Start at a low device volume.</p>${action('audio',audioOn?'Stop sound':'Play ambient tone',`aria-pressed="${audioOn}"`,'button secondary')}</div></section>
  <article class="panel lesson-detail"><div class="section-heading"><span class="eyebrow">${lesson.category}</span>${action('favourite',icon('star'),`data-id="${lesson.id}" aria-label="${s.favourites.includes(lesson.id)?'Unsave':'Save'} lesson" aria-pressed="${s.favourites.includes(lesson.id)}"`,'round-button')}</div><h2>${lesson.title}</h2><p class="reading-time">${lesson.length} · Original demo content</p><p class="lesson-prose">${lesson.text}</p><div class="practice"><h3>Try it, gently.</h3><ol>${lesson.steps.map(x=>`<li>${x}</li>`).join('')}</ol></div>${action('complete',s.completed.includes(lesson.id)?'Mark as unread':'I’ve read this lesson ✓',`data-id="${lesson.id}"`,'button primary')}<p class="muted small">Progress and saved lessons persist in this browser.</p></article></div>`;
}
function postsMarkup() {
  const s=store.get(); const posts=s.posts.filter(p=>(communityFilter==='All'||p.category===communityFilter)&&p.text.toLowerCase().includes(communityQuery.toLowerCase()));
  return posts.map(p=>`<article class="panel post"><div class="post-header"><span class="avatar small-avatar">${p.name==='You'?'Y':'S'}</span><div><strong>${e(p.name)}</strong><span>${e(p.category)} · local demo</span></div></div><p class="preserve">${e(p.text)}</p>${action('like',`${icon('heart')} ${p.likes+(s.liked.includes(p.id)?1:0)}`,`data-id="${e(p.id)}" aria-label="Like post" aria-pressed="${s.liked.includes(p.id)}"`,'like-button')}</article>`).join('') || '<div class="panel"><p class="muted">No thoughts match this view.</p></div>';
}
function communityView() {
  const s=store.get(), votes=demoPoll.votes.map((v,i)=>v+(s.vote===i?1:0)), total=votes.reduce((a,b)=>a+b,0);
  return `${intro('A LITTLE TOGETHERNESS','Small wins belong here.','A local-only community sandbox. Nothing is published to other people.')}
  <div class="two-grid community-layout"><section><form id="post-form" class="panel"><h2>Share a little thought</h2><label class="sr-only" for="post-text">Your thought</label><textarea id="post-text" name="text" rows="3" maxlength="1000" placeholder="What’s one small win today?" required></textarea><div class="form-actions"><select name="category" aria-label="Post category"><option>Small wins</option><option>Reflection</option></select><button class="button primary">Add local thought</button></div></form><div class="feed-filters"><div class="chips">${['All','Small wins','Reflection'].map(c=>action('filter',c,`data-category="${c}" aria-pressed="${communityFilter===c}"`,'chip')).join('')}</div><label class="sr-only" for="post-search">Search thoughts</label><input id="post-search" placeholder="Search thoughts…" value="${e(communityQuery)}"></div><div id="posts">${postsMarkup()}</div></section>
  <aside class="panel poll"><span class="eyebrow">A LITTLE CURIOSITY</span><h2>${demoPoll.question}</h2><p class="muted small">Sample votes + your local choice.</p>${demoPoll.options.map((o,i)=>`<button class="poll-option" data-action="vote" data-option="${i}" aria-pressed="${s.vote===i}"><span class="poll-fill" style="width:${s.vote===null?0:Math.round(votes[i]/total*100)}%"></span><span>${s.vote===i?'✓ ':''}${o}</span>${s.vote!==null?'<strong>'+Math.round(votes[i]/total*100)+'%</strong>':''}</button>`).join('')}<p class="small muted">${total} illustrative votes${s.vote!==null?' · change your choice anytime':''}</p><hr><p class="small muted">Production communities need moderation, abuse reporting, identity controls, and server-side access checks.</p></aside></div>`;
}
function careView() {
  const s=store.get();
  return `${intro('A LITTLE HUMAN SUPPORT','Find a next step.','Fictional profiles and local appointments demonstrate a booking flow.')}
  <p class="notice">These are sample profiles, not real professionals. This page does not provide care or arrange appointments.</p>
  <div class="two-grid">${providers.map(p=>`<section class="panel provider"><span class="provider-avatar ${p.color}">${p.initials}</span><h2>${p.name}</h2><p class="muted">${p.role}</p><div class="chips">${p.tags.map(t=>'<span class="tag">'+t+'</span>').join('')}</div><form class="booking-form" data-provider="${p.id}"><fieldset><legend>Choose an illustrative time</legend>${p.slots.map(slot=>`<label class="slot"><input type="radio" name="slot" value="${slot}" required> ${slot}</label>`).join('')}</fieldset><button class="button secondary">Review local booking →</button></form></section>`).join('')}</div>
  ${bookingDraft?`<section class="panel review section-gap" tabindex="-1" id="booking-review"><span class="eyebrow">REVIEW</span><h2>Your demo appointment</h2><p>${providers.find(p=>p.id===bookingDraft.provider).name} · ${e(bookingDraft.slot)}</p><p class="muted">Stored only on this device. No payment, email or provider notification.</p>${action('confirm-booking','Confirm local booking','','button primary')} ${action('dismiss-booking','Cancel','','button secondary')}</section>`:''}
  <section class="panel section-gap"><h2>Your demo bookings</h2>${s.bookings.map(b=>`<div class="reminder-row"><div><strong>${providers.find(p=>p.id===b.provider)?.name||'Sample provider'}</strong><span>${e(b.slot)} · simulated</span></div>${action('cancel-booking','Cancel',`data-id="${e(b.id)}"`,'text-button')}</div>`).join('')||'<p class="muted">Your local appointments will appear here.</p>'}</section><section class="support-note"><strong>Need support beyond a demo?</strong><p>This prototype cannot assess emergencies. Contact local emergency services if you are in immediate danger. Use verified local resources and qualified professionals for real support.</p></section>`;
}
function accountView() {
  const s=store.get();
  return `${intro('YOUR DEMO SPACE','A simple account model.','No login, payment, real subscription or external account connection.')}
  <div class="two-grid">${['free','plus'].map((plan,i)=>`<section class="panel plan-card ${s.plan===plan?'chosen':''}"><span class="tag ${i?'lavender':'sage'}">${i?'MORE ROOM TO EXPLORE':'A SMALL START'}</span><h2>${i?'Plus demo':'Free demo'}</h2><div class="plan-price">${costs[plan]} <span>scripted messages</span></div><p class="muted">${i?'Explore the same flow with a larger allowance.':'A small allowance demonstrates a feature gate.'}</p><ul><li>All sample feature screens</li><li>Local history and saved items</li><li>No money or real entitlements</li></ul>${action('plan',s.plan===plan?'Current demo plan':'Switch to '+plan+' demo',`data-plan="${plan}" ${s.plan===plan?'disabled':''}`,s.plan===plan?'button secondary':'button primary')}</section>`).join('')}</div>
  <section class="panel section-gap"><h2>Your data, in this browser.</h2><p class="muted">Browser storage is unencrypted and belongs to this origin. Use synthetic details here. A hosted copy and localhost have separate data.</p><p>${s.chatUses} messages used · ${s.journals.length} reflections · ${s.bookings.length} local bookings</p><div class="chips">${action('export','Export demo data ↓','','button secondary')}${action('reset','Reset demo data','','button danger')}</div><p class="small muted">Reset removes only this prototype’s storage key. The confirmation explains the action.</p></section>`;
}
function guideView() {
  return `${intro('BUILDING UNDERSTANDING','Follow the little connections.','An implementation map for this independent learning prototype.')}
  <section class="panel guide-overview"><span class="tag lavender">OBSERVED PATTERNS → INDEPENDENT IMPLEMENTATION</span><h2>One store. Small features. Clear boundaries.</h2><p class="muted">We observed Healo’s screens and selected flows. Its private backend, AI prompts, databases and scoring logic were not recovered. This app demonstrates plausible ways to build those product patterns with original sample content.</p><img class="architecture-diagram" src="./diagrams/state-flow.svg" alt="User action goes to the controller and domain rule, updates shared state, then local storage and the screen."></section>
  <div class="section-heading"><h2>A 10-minute walkthrough</h2></div><ol class="walkthrough panel"><li>Send “Work feels stressful” in Chat, star the reply, and inspect the saved view.</li><li>Create a Duo room and add a message from each speaker.</li><li>Complete the four-question check-in, then save a three-prompt journal entry.</li><li>Save a care card, start a focus timer, and change screens to see it continue.</li><li>Read and complete a lesson. Return to Overview to see progress.</li><li>Add a local community thought, vote, and simulate a booking.</li><li>Switch the demo plan and export your sample data.</li></ol>
  <div class="two-grid">${Object.entries(mechanics).map(([id,m])=>`<section class="panel guide-card"><span class="icon-tile small lavender">${icon(routes.find(r=>r[0]===id)?.[2]||'settings')}</span><h3>${m[0]}</h3><p class="muted">${m[1]}</p><code>${m[2]}</code>${link(id,'Try the feature →','text-link')}</section>`).join('')}</div><section class="panel section-gap"><h2>The guidance folder</h2><p class="muted">The source bundle contains a setup guide, architecture walkthrough, feature-to-code map, annotated examples, verification notes, and a path to a real backend. Start with <code>guidance/README.md</code>.</p></section>`;
}
const views = { home: homeView, chat: chatView, duo: duoView, tests: testsView, journal: journalView, wellness: wellnessView, library: libraryView, community: communityView, care: careView, account: accountView, guide: guideView };
function render() {
  $('#app').innerHTML = shell(views[route]());
  if (route==='chat') $('#messages').scrollTop = $('#messages').scrollHeight;
}
function navigate() {
  const next=location.hash.slice(1)||'home'; route=Object.hasOwn(views,next)?next:'home';
  audio.stop(); audioOn=false; mobileOpen=false; render(); $('#main').focus({preventScroll:true}); window.scrollTo(0,0);
}
function download(name, text, type) {
  const url=URL.createObjectURL(new Blob([text],{type})); const a=document.createElement('a'); a.href=url; a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function sendChat(text) {
  const s=store.get(); if(pending||!text.trim())return;
  if(s.chatUses>=costs[s.plan]){toast('Demo allowance reached. Explore plans in Demo account.');return;}
  pending=true; update({type:'MESSAGE',message:{id:uid(),role:'user',text:text.trim().slice(0,2000)}});
  setTimeout(()=>{const reply=replyTo(text); pending=false; update({type:'REPLY',message:{id:uid(),role:'assistant',text:reply.text,kind:reply.kind}},route==='chat'); if(route==='chat')$('#chat-input')?.focus();},600);
}

// Event delegation keeps listeners stable when view markup is replaced.
document.addEventListener('click',async event=>{
  if (event.target.closest('.skip-link')) { event.preventDefault(); $('#main').focus(); return; }
  const target=event.target.closest('[data-action]'); if(!target)return;
  const a=target.dataset.action, s=store.get();
  switch(a){
    case 'menu': mobileOpen=!mobileOpen;render();break;
    case 'prompt':sendChat(target.dataset.prompt);break;
    case 'star':update({type:'STAR',id:target.dataset.id});break;
    case 'star-filter':starredOnly=!starredOnly;render();break;
    case 'clear-chat':if(pending){toast('Wait for the pending reply first.');break;}if(s.messages.length&&!confirm('Clear this local conversation and its stars? Your demo message allowance will stay used.'))break;update({type:'CLEAR_CHAT'});break;
    case 'create-room':update({type:'CREATE_ROOM',code:uid().replaceAll('-','').slice(0,6).toUpperCase()});break;
    case 'speaker':update({type:'SPEAKER',speaker:target.dataset.speaker});break;
    case 'copy-room':try{await navigator.clipboard.writeText(s.duo.code);toast('Room code copied. This room works only locally.');}catch{toast('Copy unavailable. Select the displayed room code instead.');}break;
    case 'mood':draft.answers[journalStep]=$('#journal-text').value;draft.mood=target.dataset.mood;render();break;
    case 'journal-back':draft.answers[journalStep]=$('#journal-text').value;journalStep=Math.max(0,journalStep-1);render();$('#journal-text').focus();break;
    case 'shuffle':update({type:'CARD',index:(s.card+1)%cards.length});break;
    case 'save-card':update({type:'SAVE_CARD'});break;
    case 'start-timer':if(remainingSeconds(s.timer)===0)store.dispatch({type:'TIMER_RESET',seconds:1500});update({type:'TIMER_START',now:Date.now()});break;
    case 'pause-timer':update({type:'TIMER_PAUSE',now:Date.now()});break;
    case 'reset-timer':update({type:'TIMER_RESET',seconds:1500});break;
    case 'remove-reminder':update({type:'REMOVE_REMINDER',id:target.dataset.id});break;
    case 'worksheet':download('still-small-next-step.txt','ONE SMALL NEXT STEP\n\n1. Name a task on your mind:\n\n2. What would a smaller version look like?\n\n3. What is one next action?\n\n4. When will you make space for it?\n\nOriginal Still demo worksheet. General reflection, not treatment.','text/plain');toast('Worksheet downloaded.');break;
    case 'lesson':activeLesson=target.dataset.id;render();break;
    case 'favourite':update({type:'FAVOURITE',id:target.dataset.id});break;
    case 'complete':update({type:'COMPLETE',id:target.dataset.id});break;
    case 'audio':try{if(audioOn){audio.stop();audioOn=false;}else{await audio.start();if(route==='library')audioOn=true;else audio.stop();}if(route==='library')render();}catch(error){toast(error.message);}break;
    case 'filter':communityFilter=target.dataset.category;render();break;
    case 'like':update({type:'LIKE_POST',id:target.dataset.id});break;
    case 'vote':update({type:'VOTE',option:Number(target.dataset.option)});break;
    case 'confirm-booking':if(bookingDraft){const duplicate=s.bookings.some(b=>b.provider===bookingDraft.provider&&b.slot===bookingDraft.slot);store.dispatch({type:'BOOK',booking:{id:uid(),...bookingDraft}});bookingDraft=null;render();toast(duplicate?'That demo appointment already exists.':'Local demo booking saved. No real appointment was made.');}break;
    case 'dismiss-booking':bookingDraft=null;render();break;
    case 'cancel-booking':update({type:'CANCEL_BOOKING',id:target.dataset.id});toast('Local demo booking removed.');break;
    case 'plan':update({type:'SET_PLAN',plan:target.dataset.plan});toast('Demo plan changed. No payment or subscription.');break;
    case 'export':download('still-demo-data.json',JSON.stringify(store.get(),null,2),'application/json');toast('Demo data exported.');break;
    case 'reset':if(pending){toast('Wait for the pending reply before resetting.');break;}if(confirm('Remove all Still prototype data in this browser? This clears local messages, reflections, progress and bookings. It cannot be undone.')){audio.stop();audioOn=false;draft={mood:'Okay',answers:['','','']};journalStep=0;testAnswers=[];bookingDraft=null;update({type:'RESET'});toast('This demo has a fresh start.');}break;
  }
});
document.addEventListener('input',event=>{if(event.target.id==='post-search'){communityQuery=event.target.value;$('#posts').innerHTML=postsMarkup();}});
document.addEventListener('change',event=>{if(event.target.closest('#test-form'))testAnswers[Number(event.target.name.slice(1))]=Number(event.target.value);});
document.addEventListener('submit',event=>{
  const form=event.target;event.preventDefault();const data=new FormData(form);
  if(form.id==='chat-form')sendChat(data.get('message'));
  if(form.id==='join-form')toast(String(data.get('code')).trim().toUpperCase()===store.get().duo.code?'Joined this local practice room.':'That code is not this browser’s demo room.');
  if(form.id==='duo-form'){const text=String(data.get('message')).trim();if(!text)return;update({type:'DUO_MESSAGE',message:{id:uid(),speaker:store.get().duo.speaker,text}});$('#duo-text').focus();}
  if(form.id==='test-form'){try{const result=scoreCheckin(questions.map((_,i)=>Number(data.get('q'+i))));update({type:'SAVE_RESULT',result:{...result,id:uid(),at:Date.now()}});toast('Your demo check-in is saved.');}catch(error){toast(error.message);}}
  if(form.id==='journal-form'){const answer=String(data.get('answer')).trim();if(!answer){toast('Add a few words before continuing.');return;}draft.answers[journalStep]=answer;if(journalStep<2){journalStep++;render();$('#journal-text').focus();}else{store.dispatch({type:'SAVE_JOURNAL',entry:{...draft,answers:[...draft.answers],id:uid(),at:Date.now()}});draft={mood:'Okay',answers:['','','']};journalStep=0;render();toast('Your reflection has a little home now.');}}
  if(form.id==='timer-form'){const minutes=Number(data.get('minutes'));if(Number.isInteger(minutes)&&minutes>=1&&minutes<=120)update({type:'TIMER_RESET',seconds:minutes*60});}
  if(form.id==='reminder-form'){const at=new Date(data.get('at')).getTime(),title=String(data.get('title')).trim();if(!title||!Number.isFinite(at)||at<=Date.now()){toast('Choose a title and a future local date/time.');return;}update({type:'ADD_REMINDER',reminder:{id:uid(),title,at,notified:false}});toast('Local reminder saved. Keep the demo open to see it.');}
  if(form.id==='post-form'){const text=String(data.get('text')).trim();if(!text)return;update({type:'ADD_POST',post:{id:uid(),name:'You',category:data.get('category'),text,likes:0}});toast('Thought added only to this browser.');}
  if(form.classList.contains('booking-form')){bookingDraft={provider:form.dataset.provider,slot:data.get('slot')};render();$('#booking-review').focus();$('#booking-review').scrollIntoView({block:'center',behavior:'smooth'});}
});
setInterval(()=>{
  const s=store.get(),left=remainingSeconds(s.timer);
  if($('#timer-display'))$('#timer-display').textContent=clock(left);
  if(s.timer.end!==null&&left===0){update({type:'TIMER_RESET',seconds:0},route==='wellness');toast('Your focus moment is complete. Take a little pause.');}
  for(const reminder of s.reminders)if(!reminder.notified&&reminder.at<=Date.now()){store.dispatch({type:'NOTIFY_REMINDER',id:reminder.id});toast('A little reminder: '+reminder.title);}
},1000);
window.addEventListener('hashchange',navigate);
window.addEventListener('pagehide',()=>audio.stop());
navigate();
