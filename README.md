# Which Claude combination builds best?

Eight ways of combining **Claude Opus 5, Sonnet 5, Fable 5.1 and Haiku 4.5** got the same client brief: build the website for a small, fictional film festival in a Chilean port. I measured what each one cost, how long it took and how good the result was, with my own scores plus two blind AI judges.

**Short version:** combining models almost never helped. Opus with subagents built the best site, Opus alone came second, and Fable alone was the best value: 8/10 for $11 in 23 minutes. Multi-chat pipelines ("one plans, another codes, another reviews") were slower, more expensive and not better. Delegating the code to Haiku was the worst of the finished runs.

➡️ **Full interactive report:** [`docs/index.html`](docs/index.html) (GitHub Pages)

## Results

| Architecture | Round | My score | Opus judge | Fable judge | API cost | Net time | API calls | Lines of code |
|---|---|---|---|---|---|---|---|---|
| Opus 5 with subagents (free to use them) | 1 | **9.5** | 8.78 | **9.18** | $55.64 | 50 min | 391 | 12,954 |
| Opus 5 alone | 1 | 8 | **8.84** | 9.04 | $21.00 | 41 min | 119 | 5,889 |
| Fable 5.1 with subagents (free to use them) | 2 | 8 | 8.43 | 8.32 | $31.04 | 47 min | 179 | 5,749 |
| Fable 5.1 alone | 1 | 8 | 7.99 | 7.58 | **$11.33** | **23 min** | 37 | 4,430 |
| Opus 5 plans and reviews + Sonnet 5 codes, self-coordinated | 2 | 7.5 | 7.30 | 6.59 | $46.57 | 1 h 28 min | 389 | 5,608 |
| Fable 5.1 backlog → Opus 5 detail and review → Sonnet 5 codes, self-coordinated | 2 | 7 | 7.81 | 6.96 | $54.56 | 1 h 59 min | 424 | 6,148 |
| Fable 5.1 plans and reviews + Haiku 4.5 codes, self-coordinated | 2 | 5 | 5.82 | 5.75 | $25.83 | 1 h 16 min | 276 | 3,309 |
| Opus 5 plans and reviews + Sonnet 5 codes, handed off by an orchestrator | 1 | 4 | 7.95 | 8.13 | $71.80 | 2 h 5 min | 559 | 6,957 |

- **Judge score** = 35% alignment + 35% creativity + 30% execution, following the [rubric](bench/RUBRIC.md). Both judges scored all 8 sites together, blind, with randomly assigned letters.
- **API cost** = the real tokens of each run × official API prices (checked 2026-09-15), including cache writes and reads. The runs were actually paid with a Max plan.
- **Net time** = wall-clock time minus waits for manual permission approvals (see limitations).
- **Not completed:** Fable 5.1 → Sonnet 5 → Haiku 4.5 was stopped before finishing and is excluded ($28.72 spent at that point).

### What stands out

1. **A single strong model is hard to beat.** Opus alone and Fable alone scored as well as or better than every multi-chat pipeline, at a fraction of the cost and time.
2. **Subagents helped Opus, not the budget.** Opus with subagents produced the favorite site, but cost 2.6× Opus alone.
3. **Whoever writes the code pays the bill.** The coding chat makes hundreds of calls and re-reads its whole context from cache each time. Wherever Sonnet coded, Sonnet was the biggest expense, despite being the cheapest per token.
4. **Haiku as the coder was the weakest result.** It also ran out of context mid-task.
5. **Humans and AI judges mostly agreed**, with one exception. The orchestrator-coordinated Opus + Sonnet run was my least favorite (4/10), while both judges gave it about 8.

## The task

- [`BRIEF.md`](BRIEF.md): the client brief, in Spanish, exactly as the models received it ([English translation](BRIEF.en.md)). It deliberately uses a local Chilean voice.
- [`data/programa.json`](data/programa.json): the same data for every run. It has 24 films, 39 screenings and 4 venues with walking times between them, plus deliberate traps: screenings that end after midnight, post-screening Q&As, sold-out screenings, and transfers that are too short to make on foot.
- **Constraints:** Next.js + TypeScript, no component libraries, no external images, no emojis, no ratings, `prefers-reduced-motion` respected, working from 360 px up.

## Method

- **Isolation:** each architecture ran in its own git worktree from the same base commit (tag `base`), with identical dependencies, all at high effort. Every chat was a visible Claude Code session in the desktop app.
- **Round 1:** Opus alone · Fable alone · Opus free to use subagents · Opus + Sonnet in separate chats, where an orchestrator session passed the work between them.
- **Round 2:** Fable free to use subagents · three multi-chat pipelines that **coordinated themselves**. The lead chat messaged the next chat and waited in the background, spending no tokens, until a handoff file appeared.
- **Prompts:** in Spanish, exactly as sent, in [`bench/PROMPTS.md`](bench/PROMPTS.md) ([English](bench/PROMPTS.en.md)).
- **Metrics:** tokens, calls, tools and timings come from the local Claude Code transcripts ([`bench/metricas.mjs`](bench/metricas.mjs)). Build, lint, lines of code and automatic constraint checks come from [`bench/calidad.mjs`](bench/calidad.mjs). All 8 finished sites build with 0 lint errors or warnings and add no dependencies.
- **Blind judging:** each site got 6 itinerary test cases with known answers (overlaps, too-short walks, post-screening Q&As, midnight), a shared link, and screenshots at 360 and 1440 px. These were captured by [`bench/capturas/capturar.mjs`](bench/capturas/capturar.mjs). Opus 5 and Fable 5.1 scored everything without seeing code, names or costs.
- **Decision and incident log:** [`bench/DECISIONS.md`](bench/DECISIONS.md).

## Limitations

- **One run per architecture.** There is randomness; another run could reorder things.
- **Chilean-flavored brief.** Sites that picked up the local tone amplified the slang. That helps alignment, but reads oddly outside Chile.
- **Humans in the loop.**
  - In round 1, the orchestrator handed work between the Opus and Sonnet chats.
  - In round 2, I approved permission prompts by hand and wrote twice to the Haiku chat.
  - The orchestrator also nudged Fable once, when its turn was cut off before closing.
- **Permissions and timing.**
  - Round 2 chats opened in manual permission mode, and Haiku does not support auto mode, so some chats sat waiting for approval for hours.
  - Net time removes pauses longer than 10 minutes inside a turn, but not short waits.
- **Extrapolated cost.** It is what those tokens would cost on the API, with the 1-hour cache that Claude Code uses.
- **Imperfect judges.**
  - My score is not blind.
  - The AI judges are blind, but Opus and Fable also competed, and they judged screenshots and page text rather than browsing the sites.
  - One screenshot bug was found and corrected during judging: a wrong URL for one site's film page. It is documented in the judge notes.

## Repository map

| Path | What |
|---|---|
| `festival-1` … `festival-9` (branches) | One finished site per architecture, as the models left it (see table below) |
| `docs/index.html` | The interactive English report |
| `bench/RUBRIC.md` · `bench/RUBRICA.md` | Scoring rubric, English and original Spanish |
| `bench/PROMPTS.en.md` · `bench/PROMPTS.md` | Exact prompts, English translation and original |
| `bench/DECISIONS.md` · `bench/DECISIONES.md` | Decisions and incidents, English and original |
| `bench/runs/metricas.json` · `bench/runs/calidad.json` | Raw process and code metrics |
| `bench/runs/juez2/` | Blind judging material (screenshots, test cases) and both judges' notes (`*.en.json` in English) |
| `bench/runs/notas-gabriel.json` | My scores and comments (`.en.json` in English) |
| `bench/precios.json` | API prices used for the cost extrapolation |
| `bench/reporte/` | Report template and builder |
| `INICIO.md` | The original project kickoff notes (Spanish) |

| Branch | Architecture |
|---|---|
| `festival-1` | Opus 5 alone |
| `festival-2` | Opus 5 + Sonnet 5, orchestrator hands off |
| `festival-3` | Opus 5 with subagents |
| `festival-4` | Fable 5.1 → Opus 5 → Sonnet 5, self-coordinated |
| `festival-5` | Fable 5.1 alone |
| `festival-6` | Fable 5.1 with subagents |
| `festival-7` | Fable 5.1 → Sonnet 5 → Haiku 4.5 (**not completed**) |
| `festival-8` | Fable 5.1 + Haiku 4.5, self-coordinated |
| `festival-9` | Opus 5 + Sonnet 5, self-coordinated |

## License

[MIT](LICENSE) © 2026 Gabriel De la Puente (NeuronaBens). The generated sites, the brief and the data are fictional; the festival, its films and its venues do not exist.

## Run a site locally

```bash
git worktree add ../festival-5 festival-5
cd ../festival-5
npm ci
npm run build && npm start
```

The generated sites are in Spanish, like the brief.
