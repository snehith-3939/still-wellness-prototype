# Verification and known limits

## Automated checks

Run `npm test` in the project root. Eleven domain tests cover:

1. Check-in score endpoints/midpoint and invalid or incomplete answers.
2. Chat allowance enforcement, keeping usage after conversation clearing, and plan expansion.
3. Timer elapsed time, zero clamping and pause behavior.
4. Duplicate local booking rejection and cancellation.
5. Duo's two-speaker transition and pre-room behavior.
6. Replacement of a poll choice rather than repeated vote accumulation.
7. Journal/progress/favourite persistence across store recreation.
8. A working in-memory fallback when storage is blocked.
9. Malformed and wrong-version storage fallback.
10. Reversible stars, reset behavior and independent seed state.
11. Deterministic assistant routing and its labelled support limitation.

`node --check dist/src/app.js` and `node --check server.mjs` check syntax. Tests do not validate any clinical claim or Healo behavior.

## Browser checks

The running app was exercised through the browser at localhost. Use the feature walkthrough as a reproducible manual script. These were UI-level observations, not claims about the original application:

| Scenario | Observed result |
|---|---|
| Scripted chat, star, reload | Reply and starred message restored from local storage |
| Four answers set to 3 | Score 50/100 and history record displayed |
| Three journal prompts and reload | Saved entry available in the reflection list |
| Duo messages from both roles | Both messages shown; reflection changes to the two-speaker prompt |
| Save care card | Saved title and pressed state shown |
| One-minute focus session across navigation | Countdown completed and the completion toast appeared |
| Future reminder | Local reminder row with date/time and removal control displayed |
| Save/read lesson | Favourite and completed state updated |
| Ambient sound | Play/Stop controls worked and the audio context was stopped |
| Local post containing `<b>Sample win</b>` | Literal text displayed; no `b` element created in the feed |
| Like/search/poll | Local state and filtered post updated; poll included one local choice |
| Same provider/slot confirmed twice | Exactly one local booking row |
| Switch to Plus | Allowance header reflected thirty minus the used message |
| Walkthrough SVG | Image loaded and had a descriptive accessible name |
| 390px mobile layout | No page-level horizontal overflow on Overview or Wellness; menu opened and navigation worked |

After this pass, a timer input display inconsistency, the Duo turn label, the skip-link route behavior, and offscreen mobile navigation focusability were corrected. Domain tests and syntax checks were rerun. JSON export, worksheet downloads, all keyboard/screen-reader combinations, and blocked browser permissions were not exercised end to end in the browser; their implementation/limitations remain documented.

## Known limits

- Only one local demo identity. No authorization or server security is claimed.
- No cross-tab or cross-device synchronization. Multiple open instances can overwrite localStorage changes.
- Unfinished drafts and pending replies are not restored after reload.
- A system-clock change can affect the deadline timer. Reminder delivery needs an open page and may be delayed in a background tab.
- A browser storage failure is visible, but quota recovery, schema migration and full malformed-data recovery are simplified.
- The scripted assistant and basic safety keywords are teaching adapters, not evaluated health systems.
- Local community and booking records are not sent to anybody. Relative appointment labels are illustrative.
- Audio depends on the browser's Web Audio support and permission policy.
- This is a lightweight accessibility implementation; a complete screen-reader/browser audit has not been performed.
- The prototype has no external application dependencies or API keys. The host's access infrastructure is separate.
