# Prompts sent to each chat

English translation for readers. The prompts were sent in Spanish exactly as written in `PROMPTS.md`; that file is the source of truth.

All architectures start from the `base` commit (tag), which contains `BRIEF.md`, `data/programa.json`, and an empty Next.js project with `node_modules` already installed.
The messages are sent as-is. `.handoff/` is in `.gitignore` and only serves so the orchestrator can detect the end of each turn.

## Common closing text (SOLO)

> Work from start to finish without asking me for confirmation: you make the decisions. Don't make commits. As a last step, once there's nothing left for you to do, write `ENTREGA.md` (delivery notes: what you built, how to run it, important decisions, and what's left pending) and then create the empty file `.handoff/fin.done`.

---

## Architecture 1 — Opus solo (`festival-1`)

> Read `BRIEF.md` and build the site it asks for in this folder.
>
> + common closing text

## Architecture 3 — Opus with free-form subagents (`festival-3`) · Architecture 6 — Fable with free-form subagents (`festival-6`)

> Read `BRIEF.md` and build the site it asks for in this folder. Do it with subagents, however you like: you have complete freedom to decide how many, which ones, and how to split up the work.
>
> + common closing text

## Architecture 5 — Fable solo (`festival-5`)

Same as architecture 1.

---

## Architectures 2 (`festival-2`) and 4 (`festival-4`) — several roles, each in its own chat

Roles:
- **Arch. 2:** Opus = definer (backlog + semi-detail) and reviewer · Sonnet = code writer.
- **Arch. 4:** Fable = backlog · Opus = semi-detail and reviewer · Sonnet = code writer.

One round of review.

### Step B — Backlog (Arch. 2: Opus · Arch. 4: Fable)

> You're the one who defines the product on a team. Read `BRIEF.md` and `data/programa.json`. Write `docs/BACKLOG.md`: prioritized epics and user stories, each with verifiable acceptance criteria. No implementation decisions: that comes later. Don't write code. Other people, in other chats, will do the technical detail and the implementation based on your document, without being able to ask you anything, so everything important in the brief (including what isn't explicitly stated) has to be in there.
>
> Work without asking me for confirmation. When you're done, create the empty file `.handoff/backlog.done`.

### Step D — Semi-detail (Arch. 2: Opus, same chat · Arch. 4: Opus)

Arch. 2 (same chat, second message):
> Now write `docs/DETALLE.md` (technical detail) based on your backlog: for each story, what files and routes to create, what components, types and interfaces, what logic (with edge cases), the concrete visual and animation direction (typography, color, motion, how each movie is represented), and how to verify it. Don't write application code: someone else will implement it in another chat that will only have `BRIEF.md`, `docs/BACKLOG.md`, `docs/DETALLE.md`, and the data.
>
> Work without asking me for confirmation. When you're done, create the empty file `.handoff/detalle.done`.

Arch. 4 (new Opus chat):
> You're the one who does the technical design on a team. Read `BRIEF.md`, `data/programa.json`, and `docs/BACKLOG.md` (someone else wrote it). Write `docs/DETALLE.md`: for each story, what files and routes to create, what components, types and interfaces, what logic (with edge cases), the concrete visual and animation direction (typography, color, motion, how each movie is represented), and how to verify it. Don't write application code: someone else will implement it in another chat that will only have `BRIEF.md`, `docs/BACKLOG.md`, `docs/DETALLE.md`, and the data.
>
> Work without asking me for confirmation. When you're done, create the empty file `.handoff/detalle.done`.

### Step C — Code (Sonnet)

> You're the one who implements on a team. Read `BRIEF.md`, `docs/BACKLOG.md`, and `docs/DETALLE.md` and implement the full site in this folder following those documents. Verify that `npm run build` passes.
>
> Work from start to finish without asking me for confirmation. Don't make commits. When you're done, create the empty file `.handoff/codigo.done`.

### Step R — Review (Arch. 2: Opus, same chat · Arch. 4: Opus, same chat as the detail)

> The implementation is ready. Review it against `BRIEF.md`, `docs/BACKLOG.md`, and `docs/DETALLE.md`: run the build, test the site, and read the code. Write `docs/REVIEW.md` with prioritized findings (blocking, important, minor), each with where it is and what's expected. Don't fix the code yourself: whoever implemented it will fix it. There will be a single round of fixes, so prioritize.
>
> Work without asking me for confirmation. When you're done, create the empty file `.handoff/review.done`.

### Step F — Fixes (Sonnet, same chat)

> The review is in `docs/REVIEW.md`. Fix the findings, starting with the blocking ones. Verify that `npm run build` passes.
>
> Work without asking me for confirmation. Don't make commits. As a last step, write `ENTREGA.md` (what you built, how to run it, important decisions, and what's left pending) and then create the empty file `.handoff/fin.done`.

---

# Round 2 (sent as written)

Architectures 4, 6, 7, 8, and 9. The orchestrator only sends the first message to the chat in charge. From there on, the self-coordinated ones (4, 7, 8, and 9) hand off the work among themselves. The `<ID_...>` placeholders are replaced with the actual `session_id` values at launch.

## Common coordination block (goes inside the prompt for architectures 4, 7, 8, and 9)

> **How to coordinate.** The other chats work in this same folder, but they can't see this conversation. To hand work off to one, use the `mcp__ccd_session_mgmt__send_message` tool with its `session_id` (if you don't have it loaded, look it up with ToolSearch). Every message has to include everything that chat needs to know: what to do, what to read, what to deliver, and how to signal it's done (create an empty `.handoff/<step>.done` file). If you want them to hand work off to each other without going through you, tell them so, with the corresponding `session_id` values.
>
> **How to wait without burning tokens.** When you hand work off to another chat, launch in the background (`run_in_background`) the command `until [ -f .handoff/<step>.done ]; do sleep 20; done` and end your turn. When the file appears, the command ends and wakes you up. Don't check manually or in a loop.
>
> **Rules.** No one asks for confirmation, no one makes commits, and no one uses subagents. There's a single round for each review. The work is done when `ENTREGA.md` exists (what was built, how to run it, important decisions, and what's left pending) and you create the empty file `.handoff/fin.done` as the last step.

## Architecture 4 — Fable → Opus → Sonnet, self-coordinated (`festival-4`). In charge: Fable

> You lead a team of three Claude Code chats to build the site `BRIEF.md` asks for in this folder.
> - **You (Fable):** write `docs/BACKLOG.md`, with prioritized epics and user stories, verifiable acceptance criteria, and everything important in the brief, including what isn't explicitly stated. It doesn't include implementation decisions.
> - **Opus** (`session_id` `<ID_OPUS>`): writes `docs/DETALLE.md` (per story: files and routes, components, types and interfaces, logic with edge cases, concrete visual and animation direction, and how to verify; no code). Then reviews the implementation and writes `docs/REVIEW.md` with prioritized findings, without fixing.
> - **Sonnet** (`session_id` `<ID_SONNET>`): implements the site following `BRIEF.md` and `docs/`, verifies that `npm run build` passes, and then fixes what's in `docs/REVIEW.md`.
>
> Order: backlog → detail → code → review → fixes and `ENTREGA.md`.
>
> + common coordination block

## Architecture 6 — Fable with subagents, free-form (`festival-6`)

Same prompt as architecture 3 (the "Opus with free-form subagents" section), sent to the Fable chat.

## Architecture 7 — Fable → Sonnet → Haiku, self-coordinated (`festival-7`). In charge: Fable

> You lead a team of three Claude Code chats to build the site `BRIEF.md` asks for in this folder.
> - **You (Fable):** write `docs/BACKLOG.md` (epics, prioritized stories, verifiable acceptance criteria, everything important in the brief including what's implicit, no implementation decisions). Then review Sonnet's technical detail and write `docs/REVIEW-DETALLE.md` (detail review notes), with prioritized findings.
> - **Sonnet** (`session_id` `<ID_SONNET>`): writes `docs/DETALLE.md` (per story: files and routes, components, types and interfaces, logic with edge cases, concrete visual and animation direction, and how to verify; no code) and fixes it per your review. Then reviews the implementation and writes `docs/REVIEW.md`, without fixing.
> - **Haiku** (`session_id` `<ID_HAIKU>`): implements the site following `BRIEF.md` and `docs/`, verifies that `npm run build` passes, and then fixes what's in `docs/REVIEW.md`.
>
> Order: backlog → detail → detail review → fixed detail → code → code review → fixes and `ENTREGA.md`.
>
> + common coordination block

## Architecture 8 — Fable + one Haiku, self-coordinated (`festival-8`). In charge: Fable

> Build the site `BRIEF.md` asks for in this folder. You're in charge of a Claude Code chat running Haiku (`session_id` `<ID_HAIKU>`) that works in this same folder. Division of labor: Haiku does the bulk of the work (writing the pages, the components, the logic, and the styles). You plan, hand off the work, review what it delivers, and can touch up or fix what it did, but you don't build large parts of the site yourself. You decide the order and how many batches you hand the work off in. The only help you can use is that chat.
>
> + common coordination block

## Architecture 9 — Opus + Sonnet, self-coordinated (`festival-9`). In charge: Opus

> You lead a team of two Claude Code chats to build the site `BRIEF.md` asks for in this folder.
> - **You (Opus):** write `docs/BACKLOG.md` (epics, prioritized stories, verifiable acceptance criteria, everything important in the brief including what's implicit, no implementation decisions) and `docs/DETALLE.md` (per story: files and routes, components, types and interfaces, logic with edge cases, concrete visual and animation direction, and how to verify; no code). Then review the implementation and write `docs/REVIEW.md`, with prioritized findings and without fixing.
> - **Sonnet** (`session_id` `<ID_SONNET>`): implements the site following `BRIEF.md` and `docs/`, verifies that `npm run build` passes, and then fixes what's in `docs/REVIEW.md`.
>
> Order: backlog and detail → code → review → fixes and `ENTREGA.md`.
>
> + common coordination block
