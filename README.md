# Still — wellness learning prototype

A small, independent implementation of product patterns observed while walking through Healo. It demonstrates how features connect and how their code can be organized. The original application's private code, APIs, AI system, and scoring rules were not recovered.

## Live demo

[Open the public prototype](https://still-wellness-lab-snehith.tenderolive.chatgpt.site). Each visitor has separate browser-local sample data.

## Run locally

```sh
git clone https://github.com/snehith-3939/still-wellness-prototype.git
cd still-wellness-prototype
npm start
```

Open **http://127.0.0.1:4173**. Stop the server with Ctrl+C. No dependency installation, API key, database, or account is required. The scripts were tested with Node.js 26.4.0.

```sh
npm test
```

## Start learning

Read [guidance/README.md](guidance/README.md). Open the app's **Prototype walkthrough** screen for a shorter interactive tour. Each feature also has an expandable **How this works** note.

## What's working

- Overview with shared activity/progress summaries.
- Scripted chat, message allowance, starred replies, and local history.
- A single-browser, two-speaker Duo conversation and room-code demonstration.
- An original four-question nonclinical check-in with scoring and result history.
- A three-prompt journal with moods and saved entries.
- Care-card saving, a deadline-based focus timer, local in-app reminders, and a downloadable original worksheet.
- Original lessons, completion/favourites, and a browser-generated ambient tone.
- Local community posts, search/filter, reversible likes, and a poll.
- Fictional provider selection, booking review, duplicate prevention, and local cancellation.
- Demo plan entitlements, JSON export, reset, responsive navigation, and an implementation tour.

## Boundaries

All user data stays in this browser's localStorage. A hosted copy and localhost have separate storage. There is no real AI, authentication, shared room, public community, payment, medical assessment, care provider, or server notification. Reminders require the page to remain open. Use sample details; localStorage is not encrypted. The app uses original sample text, CSS artwork and generated tones rather than Healo assets or media.

The package has no runtime package dependencies and makes no application API calls. A hosting platform may add its own access/hosting infrastructure.

## Source layout

```text
dist/
  index.html             Browser entry
  styles.css             Responsive interface and CSS artwork
  src/
    data.js              Original catalogs, prompts, feature notes
    core.js              State, persistence and pure rules
    services.js          Scripted chat and generated audio adapters
    app.js               Views, routing and interaction controllers
guidance/                Explanation and walkthrough
tests/core.test.mjs      Domain and persistence checks
server.mjs               Loopback-only static development server
```

`dist/` is the editable application source, despite its conventional build-output name. There is no compilation step.
