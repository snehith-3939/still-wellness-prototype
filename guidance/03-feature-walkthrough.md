# Feature walkthrough and code map

Start at Overview. Use synthetic details. The app has no remote application API; every action below changes this browser's demo state.

## 1. Overview and shared progress

Notice the three starter activities and the reflection/lesson/check-in totals. After saving a journal entry or completing a lesson, return here and watch the summaries change.

**Code:** `homeView()` reads `store.get()` and derives counts. There is no second dashboard database. This is a simple example of multiple screens sharing the same records.

## 2. Chat: interaction, response and saved messages

Open Chat companion and choose “Work feels stressful”. A pending message appears, followed by a scripted reply. Star the reply and switch to Starred messages. Return to the full conversation and reload: the messages and star persist.

**Code path:** `sendChat()` creates a user message → `MESSAGE` checks the allowance → `replyTo()` returns a fixed response for its keyword category → `REPLY` adds it → `chatView()` displays the store. `STAR` toggles an ID in `stars`.

**Try the boundary:** the Free demo allows eight messages. Exhausting it disables sending. Switch to Plus in Demo account to increase the allowance to thirty. Starting a new conversation clears messages but deliberately does not reset usage.

The keyword responder is not a genuine assistant or a sufficient safety system. Its risk-related branch is only an illustrative routing case.

## 3. Duo practice

Create a demo room. The room code appears; entering that same code confirms the local join. Write a message as You, switch to Partner, and add another. The reflection changes once both speaker names appear.

**Code:** `CREATE_ROOM`, `SPEAKER` and `DUO_MESSAGE` in `reducer()`; `duoReflection()` for the fixed practice prompt. Codes do not discover other browsers or people. Real room membership needs a server.

## 4. Self check-in

Answer all four questions and submit. Choosing 3 for all questions produces 50/100. The result and its date appear in history. Reload to verify persistence.

**Code:** `questions` defines original prompts. Native radio groups require a response; `scoreCheckin()` independently rejects invalid or incomplete arrays. It maps a 4–20 total to 0–100. `SAVE_RESULT` prepends a record.

This score demonstrates mechanics. It is not a validated wellness or clinical scale.

## 5. Journal

Choose a mood. Write a short response, continue through three prompts, and save. Expand the new history entry. Use Back before submitting to see that earlier draft answers remain.

**Code:** `draft` and `journalStep` hold unfinished form state. Next/Back save the current textarea into `draft.answers`. The final submit copies all three responses into a persisted `SAVE_JOURNAL` entry. Reloading before the final save loses the unfinished draft by design.

## 6. Wellness tools

Save a care card, choose another, and find your saved title below the worksheet. Set a one-minute timer, start it, visit another page and return. The remaining time reflects elapsed time. Pause freezes the remainder; Reset returns to 25 minutes.

**Code:** `SAVE_CARD` toggles the current index. `TIMER_START` stores an end timestamp. `remainingSeconds()` subtracts current time from that timestamp. The one-second interval updates the display; it does not subtract one second from stored state on every tick.

Add a future local reminder with a sample title. A toast appears when due if the page is open. It does not email or send an operating-system notification. Download the worksheet to see a client-created text file.

**Code:** `ADD_REMINDER` saves a timestamp. The interval marks due records as notified. `download()` constructs a Blob URL for the original worksheet.

## 7. Learning and sound

Select a lesson, read it, save it with the star, and mark it read. Overview's lesson count changes. Reload and the completion/favourite markers remain. The optional ambient control generates two quiet sine waves; Stop or navigation closes the audio context.

**Code:** `lessons` supplies content; `FAVOURITE` and `COMPLETE` toggle lesson IDs. `createAmbient()` owns the AudioContext; it begins only after the Play button is used. This prototype has no third-party course audio or transcripts.

## 8. Community sandbox

Add a sample thought. Filter by category or search part of the text. Like it, then click again to undo the like. Select a poll answer, then another: the existing local choice is replaced rather than adding extra votes.

**Code:** `ADD_POST` creates a record. `postsMarkup()` applies text/category filtering. `LIKE_POST` toggles membership in `liked`. `VOTE` stores one option index. Displayed totals combine fixed sample votes with the current local choice.

No real community sees these posts. Reporting, moderation, comments, identity and public publishing are outside this small sample.

## 9. Find support and local booking

Choose a time on a fictional profile, review the selection, and confirm. The local booking appears below. Trying the same provider/slot again leaves one record. Cancel removes that local booking.

**Code:** the form creates `bookingDraft`, not a reservation. Confirm dispatches `BOOK`. The reducer checks duplicates by provider/slot before saving. `CANCEL_BOOKING` removes the demo record.

All time labels are illustrative relative labels. No actual availability, payment or professional contact occurs.

## 10. Demo account and data

Switch the plan, export the data JSON, or reset after reading the confirmation. Export shows how the state object connects features. Reset clears this demo's stored records and returns to the Free demo.

**Code:** `SET_PLAN` changes one field. `export` passes the state to `download()`. `RESET` creates fresh state. Reset does not clear other websites' storage, and no real account is created or deleted.

## Suggested experiments

- Add an original `cards` entry in `data.js`; the shuffle cycle includes it automatically.
- Change `costs.free` and run the allowance test to see its expectation fail.
- Replace the `replyTo()` adapter with another deterministic response while preserving `{kind, text}`.
- Add a new field to journal entries and update both the save controller and history view.
- Add server behavior only after reading the production-boundary guide.
