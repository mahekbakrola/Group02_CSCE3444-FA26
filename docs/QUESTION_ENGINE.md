# Adaptive interview engine

The interview is the organizing component of Folio. The UI shows one applicable question at a time from a reusable bank, rather than rendering a long questionnaire.

## Minimum useful interview

Capture name, email, education and career context, then identify one contribution the student can explain. A job is never required. A class lab, club responsibility, repair, hobby project, research task, or helping a classmate can be the first example.

For each example, the core progression is **your action → problem/context → tools → result**, with scale, collaboration, difficulty and domain-specific details as useful follow-ups. Outcome and metric are different questions. A qualitative outcome is valid; an unknown number is not a reason to invent one.

The dashboard permits a first draft once there are name/email, school/degree, and one confirmed scoped action. It recommends richer answers before export without making every possible question mandatory. The export layer separately checks usable contact details, actual contributions and approval.

## Schema and runtime

The runtime source is `lib/engine/questions.ts`. `docs/QUESTION_BANK.json` contains every expanded entry. The schema includes:

| Field                             | Meaning                                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| id / category / scope             | Stable question identity, reporting category, and profile or repeated-entity scope                                          |
| text / why / example              | Question, rationale, optional model answer                                                                                  |
| inputType / options               | Text, textarea, email, URL, single choice or multiple choice                                                                |
| required / validation             | Whether skipping is allowed; minimum/maximum length and type checks                                                         |
| priority                          | Ordering among applicable unanswered questions                                                                              |
| conditions                        | All must match; `equals`, `notEquals`, `exists` or case-insensitive `includes`                                              |
| followUps                         | Explicit related questions for authors and suggestion logic; runtime applicability is controlled by conditions and priority |
| destination                       | Profile field or evidence key                                                                                               |
| resumeSections / careerDimensions | Intended use and authoring metadata                                                                                         |
| aiFollowUp / metric               | Whether an optional provider suggestion is appropriate; whether explicit numerical confirmation is required                 |

`questionQueue(workspace, category, entityId)` resolves entity scope, evaluates conditions against local answers with profile fallback, removes answered/skipped items, and sorts by priority. A fact key combines entity ID with question ID, so the same prompt can be answered independently for several projects. An explicit interview query parameter can focus a newly discovered entry.

Conditional examples include first-year lab prompts, software design/testing questions, data workflow questions, security-threat questions, and repair/data-recovery/customer communication probes. The scope prevents a repair answer from changing another project's queue.

## Completeness and confidence

Completeness is an application estimate with explicit denominators:

- Education: school, degree, graduation.
- Each experience/project: action, tools, problem and outcome.
- Skills evidence: entries with both a confirmed action and tools.
- Career direction: target, interests and a class/project the student enjoyed.

An empty employment section is not a blocker for a student with project evidence. “Enough for a first draft” is different from “all optional questions answered.” Percentages measure captured information, not candidate quality.

Folio distinguishes confirmed, unverified, skipped and absent information. Skill confidence is expressed as demonstrated versus self-reported evidence, not a 1–10 proficiency rating. AI's optional confidence field refers only to usefulness of its suggested questions; it is not used to label a student or approve claims.

## Edits, conflicts and duplicates

An edited answer replaces its stable key, increments its source revision and invalidates dependent bullet approvals. Skipped questions remain skipped but can be reopened from saved answers. Clearing a profile field also removes its mirrored interview fact. Conditional applicability is recalculated from current answers.

Two tabs use optimistic workspace revisions; a stale tab receives a conflict and must refresh. The user's text stays in the form on ordinary save failure. Duplicate answers to the same question/entity cannot become separate facts. Similar prose across different entities is not automatically merged; context can legitimately differ. Full semantic contradiction detection is a future improvement.

## Metric handling

Ask about scope, frequency, time period and unit. Offer “skip,” no number, or a user-confirmed approximation. `metric` prompts require explicit confirmation. The generator carries the user's actual text and source IDs into the draft. Export rejects numerical tokens absent from linked sources. This does not establish that a claim is true or that a number is used in the correct semantic relationship; explicit user review remains essential.

## Existing résumé and no-work flows

Pasted/`.txt` imports are unverified and tied to a chosen entry. The user reviews the statement and answers the contribution prompts before generation. Import does not silently parse job titles, awards or dates. Students without employment use the experience miner and repeatable project/activity entries; experienced users can add up to 30 independent entries using the same schema.

## Extending the question bank

1. Add a stable unique ID using the authoring helper. Include a useful rationale, limit, scope and priority.
2. Add conditions tied to existing answer IDs. Keep the highest-priority question useful even when optional answers are missing.
3. If it maps to a profile field, use the exact destination; otherwise it is stored as a scoped fact.
4. Add a meaningful branch test using a student fixture. Confirm another entity is unaffected.
5. Run `npm run docs:generate` and review the resulting inventory.

Do not assume adding a question automatically adds a résumé claim or scoring dimension. Connect new fields intentionally to the deterministic generator or provider logic and preserve provenance.
