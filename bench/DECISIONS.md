# Benchmark decisions

Decision and incident log, translated from `DECISIONES.md`.

- **Task:** idea A, the Niebla Film Festival website (`BRIEF.md` + `data/programa.json`).
- **Roles:** backlog = epics, stories and acceptance criteria. Semi-detail = files, interfaces, logic, visual direction and how to verify, without code. Code writer = implements. Review = `docs/REVIEW.md`.
- **Review:** a single round of review and correction.
- **Chats:** visible in the Claude app (Code tab), one per role, each architecture in its own `ClaudeModelFusions-wt/festival-N` worktree.
- **Effort:** high for all models. A single run per architecture.
- **Batches:** batch 1 = architectures 1, 2, 3 and 5. Batch 2 = architectures 4 and 6. **Notify Gabriel before launching batch 2.**
- **Coordination in batch 1 (architecture 2):** the orchestrator (this chat) passes the work from one chat to another. It does not count in the metrics.
- **Self-coordination (updated 2026-09-15):** tested **afterward**, as a separate experiment with its own architectures. It does not replace any of the original six. In these architectures the chats pass the work to each other on their own: the role in charge writes to the next chat using the inter-session messaging tool and waits with a background watcher (a `.handoff/*.done` file, checked every ~20 s), so it doesn't spend tokens while waiting. That coordination does count in its metrics.
- **How coordination is reported:** when the orchestrator passes the work from one chat to another, it counts as a person coordinating. The report distinguishes "with human coordination (orchestrator)" from "self-coordinated".
- **Fable → Opus → Sonnet runs self-coordinated** (decided by Gabriel on 2026-09-15).
- **Once Opus alone, Opus + Sonnet and Opus with subagents finish, nothing else is launched.** Gabriel's go-ahead is awaited before continuing.

## Pending architectures (agreed on 2026-09-15)

None is launched without Gabriel's order.

- **4. Fable → Opus → Sonnet, self-coordinated.** Three chats. Fable does the backlog. Opus does the semi-detail and the code review. Sonnet writes the code. The chats pass the work to each other on their own.
- **6. Fable with subagents, free-form.**
- **7. Fable → Sonnet → Haiku, self-coordinated.** Three separate chats.
  - Fable: backlog and review of the semi-detail.
  - Sonnet: semi-detail and review of the code.
  - Haiku 4.5: code.
  - One round of detail review (Fable reviews Sonnet) and one round of code review (Sonnet reviews Haiku).
- **8. Fable + one Haiku, in separate chats.** Fable can only delegate to Haiku. There is a single Haiku chat, and Fable decides what to ask it and how to hand off the work.
- **9. Opus + Sonnet self-coordinated.** The same roles as architecture 2, but the chats pass the work to each other on their own, without the orchestrator.
- **Dropped:** Opus with subagents choosing each subagent's model. The list is closed at 4, 6, 7, 8 and 9.
- **Preparation (2026-09-15):**
  - Worktrees `festival-7`, `festival-8` and `festival-9` created from `base`. `festival-4` and `festival-6` already existed.
  - Draft prompts in `bench/PROMPTS.md` (section "Second round"), pending Gabriel's review.
  - Chats needed: 11. They would be opened with `claude://code/new` links.
  - In the multi-chat architectures nobody uses subagents.
  - In architecture 8, Fable can touch up what Haiku did, but the bulk of the work is handed to Haiku (confirmed by Gabriel).
  - Gabriel approves the prompts without reviewing them. The 5 architectures are launched together.
- **Incidents from launching the second round (to be reported as a limitation):**
  - Several `claude://code/new` links created "No folder" chats. They were relocated with `change_directory` (9b, 7b, 7c).
  - Chats opened via link are born in **Manual** mode. Gabriel switched the Sonnet ones (and the others) to **Auto**.
  - Haiku 4.5 does not support Auto mode. The Haiku chats (7c, 8b) stayed in **Accept edits** mode, so commands (build, `touch .handoff/...`) kept requiring approval. Their architectures (7 and 8) are going to accumulate more manual interventions and waiting.
  - Even in Auto, compound commands `cd ... && <write>` require manual approval.
  - Approval wait time is either deducted or reported separately in the metrics.
  - **Human and orchestrator interventions in the second round:**
    - Architecture 8: Gabriel wrote to the Haiku chat twice ("git commands should also be done by fable", "you talk to fable"). Haiku ran out of context and the app compacted its conversation.
    - Architectures 4 and 7 (2026-09-16): the chats in charge (4a and 7a, Fable) woke up when the last stage finished, but their turn was cut off before closing. The work was complete, with `ENTREGA.md` written. The orchestrator asked them to resume the final verification and create `fin.done`. It counts as 1 intervention in each.
- **Architecture 7 (Fable → Sonnet → Haiku) NOT COMPLETED (Gabriel's decision, 2026-09-16).** Gabriel stopped it before Fable did the final verification and created `fin.done`, due to the chain's poor performance. The state the `festival-7` branch was left in is saved, but it does not enter the comparison as a completed architecture.
- **Reports:** one HTML page per batch and another with the total.
- **Extra deliverables:** `.bat` files in `ver/` to open the solution for each worktree or branch.
