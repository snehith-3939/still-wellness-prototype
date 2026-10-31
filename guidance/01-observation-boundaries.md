# Observation and implementation boundaries

The prior walkthrough covered Healo's public and signed-in navigation, selected subflows, a neutral test conversation, local screen variations, and content catalogs. It did not establish its internal backend architecture. REA was researched but not run, and full network contracts were not captured.

This prototype can therefore explain how we implemented the observed product patterns. It cannot establish exactly how Healo implemented them.

| Pattern observed on Healo | Our small implementation | What remains unknown about Healo |
|---|---|---|
| Home activities, rewards and progress | Store-derived activity summaries | Event ledger, daily reset and personalization rules |
| Chat, suggestions, response stages, saved messages | Local keyword routing, 600 ms pending state and starred replies | Model/provider, prompts, streaming protocol, tools, memory and safety system |
| Duo rooms and participant conversation | One local room and a speaker switch | Server room lifecycle, authorization, real-time transport and compatibility computation |
| Assessment catalogs and external questionnaire flow | Four original questions, transparent formula and local results | Assessment-specific scoring, reports, validation and cross-domain architecture |
| Mood journal and guided prompts | Three original prompts plus mood/history | AI reflection, prompt generation and reporting rules |
| Care cards, timers, reminders and worksheets | Three original cards, deadline timer, local reminders and text worksheet | Full catalogs, job scheduling, delivery and reward rules |
| Courses, transcripts, saved content and audio | Three original reading lessons, saved/completed state and generated tones | Media pipeline, progress synchronization, transcript engine and rights |
| Community thoughts, polls and moderation controls | Browser-local posts/likes/search and a sample poll | Server permissions, moderation, ranking and notifications |
| Provider selection and staged booking | Two fictional profiles, review and local booking record | Real availability, provider systems, payment, intake and cancellation rules |
| Plans, credits and payment review | Free/Plus demo allowance switch | Actual entitlement ledger, billing integration and offer segmentation |
| Account/settings and legal/resource screens | Export/reset and an informational support boundary | Real identity, consent, retention, deletion and administrative systems |

## Intentional simplifications

The prototype uses a single state object and a browser key rather than a database. Chat replies are deterministic. An assessment score is a teaching formula, not a clinical result. Duo speakers share one page; they are not two authenticated people. Community activity is never sent to other users. Booking and plan switches never charge or reserve anything.

This is a feature-family teaching sample. The earlier inventory contained 122 visible assessment titles, 29 worksheets and 43 course chapters; this package implements a few original examples rather than reproducing that catalog. It also omits real voice/image processing, institutional/admin roles, crisis directories, multi-day reports, email delivery and password/OTP flows.

## Evidence and ownership

The original reference is [Healo](https://healo.infiheal.com/). The earlier audit and execution plan are sibling deliverables in this chat's `outputs` folder. No authenticated URLs, tokens, personal account details, proprietary questionnaires, transcripts, branding, audio or images from Healo are included in this package. Source/content reuse requires appropriate rights; this package uses original examples.
