# Rubric — Festival de Cine Niebla

Translated from the original Spanish rubric (`RUBRICA.md`), which is the version that was used.

Written on 2026-09-15, **before seeing any results**. Quality evaluation is done blind: each solution is presented as a randomly assigned letter (A–F), without disclosing architecture or model. The mapping lives in `bench/runs/ciego.json` and is only opened at the end.

Two judges score it: **a judge model** (with screenshots at 360 px and 1440 px and access to the running site) and **Gabriel**. Both scores are reported separately, along with the average.

## 1. Automatic metrics (not judged)

| Metric | Source |
|---|---|
| Extrapolated API cost (USD), per model | transcripts + `bench/precios.json` |
| Tokens by type and model (input, output, thinking, cache write and cache read) | transcripts |
| Wall time (first prompt → last message) and active time (sum of turns) | transcripts |
| API calls, tools used, subagents launched | transcripts |
| Manual interventions (messages that did not come from the orchestrator) | transcripts |
| `npm run build` passes / `npm run lint`: errors and warnings | `bench/calidad.sh` |
| Lines of code (TS/TSX/CSS), number of files, dependencies added | `bench/calidad.sh` |
| Verifiable constraints (see 2.1) | `bench/calidad.sh` + review |

## 2. Alignment (0–10)

"That it doesn't stray from the prompt, that it respects the constraints, and that it understands the subtext."

### 2.1 Explicit constraints (checklist, each failure deducts points)

- [ ] Next.js App Router + TypeScript; `npm run build` passes.
- [ ] No component libraries; at most one animation library.
- [ ] No external images or photos.
- [ ] No backend or external services (fonts via `next/font` allowed).
- [ ] `data/programa.json` unmodified and with no invented data (films, screenings, showtimes, awards, prices).
- [ ] The entire interface in Spanish.
- [ ] No emojis.
- [ ] No scores, stars, or rankings.
- [ ] Respects `prefers-reduced-motion` (verified by emulating it).
- [ ] Works from 360 px up to desktop, with no horizontal scroll.
- [ ] Did not touch anything outside its own folder.

### 2.2 Functional requirements (checklist)

- [ ] Homepage: what, when, where, sections, link to the program.
- [ ] Program: all 39 screenings, filterable by day and by section.
- [ ] Film detail page with all of its screenings.
- [ ] Itinerary: check and uncheck screenings.
- [ ] Overlap conflict. Test case: f02 + f04 (Thursday).
- [ ] Transfer-time conflict. Cases: f03 → f05 (6 min, needs 8); f15 → f18 (2 min, needs 8).
- [ ] **Does not** flag a conflict when the timing works out exactly: f14 → f16 (same venue, 0 min); f14 → f17 (10 min, needs 9).
- [ ] Warning for a missed post-screening Q&A ("conversatorio") **without a conflict**: f13 (ends 19:52, Q&A until 20:17) → f16 (Muelle at 20:05, 12-min transfer: makes it); f13 → f17 (Terraza at 20:15, 20-min transfer: makes it). These should warn about the Q&A but **not** flag a conflict.
- [ ] Post-midnight screenings correctly calculated and assigned to the correct festival day (f09, f10, f21, f22, f39).
- [ ] Persistence in the browser (reloading keeps the itinerary).
- [ ] Sharing via link: opening the link in another window shows that itinerary and allows copying it into your own.
- [ ] Shows sold-out screenings (f22, f31) and open-air screenings with their rain note (Terraza venue).

### 2.3 Subtext (judgment, 0–10)

- Does it feel like a **small, scrappy, port-town festival**, or a corporate template / "insurance company" / SaaS feel?
- Did it consider the audience **rushing over straight from work** and **checking their phone while walking between venues**? (e.g., which screenings they can still make, end times, how far they need to walk, seeing "what's on next").
- Did it account for the fact that tickets are sold **only at the box office** ("boletería") (i.e., it doesn't invent an online "buy tickets" feature)?

## 3. Creativity (0–10)

"That, within the room it was given, it surprises." Only what the brief left open is judged:

- **Visual identity** (typography, color, composition): does it have its own coherent idea, or is it generic?
- **Representing the films without posters**: is there a deliberate visual system, distinct per film and consistent across all of them?
- **Homepage**: is it surprising? Does the animation make sense, or is it just decoration?
- **Program on mobile**: did it solve the 4-venue × hours grid well at 360 px?
- **Building the itinerary**: does it feel good, or like a form? Are there unrequested ideas that add value (e.g., suggesting the film's other screening when there's a conflict)?

## 4. Execution quality (0–10)

- **Taste**: hierarchy, spacing, rhythm, contrast, detail. Penalize "generic modern trash": generic gradients, glassmorphism without purpose, excessive animation.
- **Polish and bugs**: empty states, edge cases, keyboard focus, basic accessibility, console errors.
- **Code**: reasonable structure, conflict-detection logic separated out and correct, no obvious dead code.

## 5. Final score

`Score = 0.35 × Alignment + 0.35 × Creativity + 0.30 × Execution` (out of 10), alongside cost and time, without combining them into a single number: the value comparison (score per dollar, score per minute) is shown separately.
