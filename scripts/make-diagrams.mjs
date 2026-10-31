// Optional authoring helper. SVG output is already included; no build is required.
import { mkdir, writeFile } from 'node:fs/promises';
const out = new URL('../dist/diagrams/', import.meta.url);
await mkdir(out, { recursive: true });
const esc = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const box = (x,y,w,h,label,sub='',fill='#eee8f5') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="#d8cce3"/><text x="${x+w/2}" y="${y+29}" text-anchor="middle" font-size="15" font-weight="600">${esc(label)}</text>${sub?`<text x="${x+w/2}" y="${y+51}" text-anchor="middle" font-size="11" fill="#7d6d8c">${esc(sub)}</text>`:''}`;
const arrow = points => `<polyline points="${points}" fill="none" stroke="#a08ab3" stroke-width="2" marker-end="url(#arrow)"/>`;
const svg = (title,desc,body,height=380) => `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${height}" viewBox="0 0 960 ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 8 4 0 8" fill="none" stroke="#a08ab3" stroke-width="1.2"/></marker></defs><rect width="960" height="${height}" rx="16" fill="#faf8fc"/><g font-family="Arial,sans-serif" fill="#4a3b5b"><text x="35" y="40" font-size="21" font-weight="600">${esc(title)}</text>${body}</g></svg>`;
await writeFile(new URL('state-flow.svg',out),svg('One action, one shared state','A user action reaches the controller and pure domain rules, which update shared state. The state is persisted locally and rendered into the screen.',
  box(35,95,170,72,'User action','Click or form submit')+arrow('205,131 245,131')+
  box(245,95,190,72,'Controller','app.js')+arrow('435,131 475,131')+
  box(475,95,190,72,'Domain rule','core.js reducer')+arrow('665,131 705,131')+
  box(705,95,215,72,'Shared state','createStore()')+
  arrow('813,167 813,240 665,240')+box(475,205,190,72,'Browser storage','Saved records','#edf1e8')+
  arrow('475,240 435,240')+box(245,205,190,72,'Updated screen','View + render()','#faeee6')+
  '<text x="35" y="337" font-size="12" fill="#84728f">Independent prototype architecture. This does not describe Healo’s private systems.</text>'));
await writeFile(new URL('chat-flow.svg',out),svg('Chat: the adapter boundary','Validate a message and check allowance, save it, display pending state, call the local scripted adapter, save the reply, then optionally star it.',
  box(35,87,200,72,'Submit message','Validate + allowance')+arrow('235,123 270,123')+
  box(270,87,200,72,'Save user message','MESSAGE action')+arrow('470,123 505,123')+
  box(505,87,200,72,'Pending screen','600 ms demo delay')+arrow('705,123 740,123')+
  box(740,87,185,72,'Scripted adapter','services.js replyTo()')+
  arrow('832,159 832,230 705,230')+box(505,195,200,72,'Save reply','REPLY action','#edf1e8')+
  arrow('505,230 470,230')+box(270,195,200,72,'Render / optional star','STAR toggles an ID','#faeee6')+
  '<text x="35" y="322" font-size="12" fill="#84728f">A real model call belongs behind a server API. The local adapter is deterministic and has no API key.</text>',360));
await writeFile(new URL('backend-boundary.svg',out),svg('A proposed real-service boundary','The browser calls an authenticated API. The API controls owned data, model credentials, authorized rooms, verified payments and scheduled delivery.',
  box(35,160,170,72,'Browser','Untrusted client')+arrow('205,196 245,196')+
  box(245,160,200,72,'Authenticated API','Ownership + entitlements')+
  arrow('445,196 485,196 485,106 530,106')+box(530,70,180,72,'Owned records','Database','#edf1e8')+
  arrow('445,196 530,196')+box(530,160,180,72,'Assistant / rooms','Server adapters')+
  arrow('445,196 485,196 485,286 530,286')+box(530,250,180,72,'Verified payments','Webhook → ledger','#faeee6')+
  arrow('710,106 750,106')+box(750,70,175,72,'Scheduled jobs','Persistent delivery','#edf1e8')+
  arrow('710,196 750,196')+box(750,160,175,72,'Model / realtime','External services')+
  '<text x="35" y="365" font-size="12" fill="#84728f">Proposed architecture for a future app. No assertion is made about the original service’s infrastructure.</text>',395));
console.log('Wrote three standalone SVG diagrams.');
