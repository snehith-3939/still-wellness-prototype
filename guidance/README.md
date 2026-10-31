# Start here

This folder answers three different questions:

1. **What did we observe?** Screens and selected behavior on Healo.
2. **How could a small version work?** The working code in this package.
3. **What would a real service need?** A proposed production architecture.

Only the first question describes evidence about Healo. The other two describe our independent implementation choices.

## Suggested reading order

| Read | Purpose |
|---|---|
| [01-observation-boundaries.md](01-observation-boundaries.md) | What is based on observation and what is simulated |
| [02-architecture.md](02-architecture.md) | File responsibilities, shared state and one architecture diagram |
| [03-feature-walkthrough.md](03-feature-walkthrough.md) | Click-by-click tour with expected results and code entry points |
| [04-code-explained.md](04-code-explained.md) | Read the code by tracing interactions; includes a chat flowchart |
| [05-growing-a-backend.md](05-growing-a-backend.md) | Proposed next architecture and one production-boundary diagram |
| [06-verification.md](06-verification.md) | Tests, browser verification and known limits |

Three diagrams appear where a flow or boundary is easier to understand visually. The architecture chapters contain editable Mermaid versions. Standalone SVG equivalents open in any browser:

- [Shared state flow](../dist/diagrams/state-flow.svg)
- [Chat flow](../dist/diagrams/chat-flow.svg)
- [Proposed backend boundary](../dist/diagrams/backend-boundary.svg)

The app's Prototype walkthrough also shows the shared-state diagram. To regenerate the SVG files after changing their authoring source, run `node scripts/make-diagrams.mjs` from the project root. This optional step uses only Node's standard library.

## A practical 20-minute reading session

Run the app, open Overview and read the first architecture diagram. Send one chat message, then follow `sendChat()` → `replyTo()` → `reducer()` in the source. Complete a check-in and compare `scoreCheckin()` with your result. Finally, read the backend guide to understand which local shortcuts would become server responsibilities.

The goal is to understand the mechanics well enough to change them. For example, add one original lesson to `data.js`, or change the demo chat allowance in `costs`, then reload and observe the difference.
