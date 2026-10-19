# AI workflow, grounding, and privacy

## What uses AI

Only optional interview follow-up suggestions call a language model. The question queue, completeness, résumé composition, PDF export, skill evidence, career ranking, job comparison and tailoring all work without a model.

If either `OPENAI_API_KEY` or `OPENAI_MODEL` is missing, `/api/ai` returns up to three rule-based questions and labels the provider accordingly. When both are configured, the user must opt in through Settings. The request sends confirmed answers for only the selected experience, excluding direct profile contact fields. Users should still avoid sensitive information inside their free-form experience descriptions.

## Provider contract

`AIProvider.generateFollowUps(workspace, entityId)` returns a Zod-validated object:

```json
{
  "missingInformation": [],
  "suggestedFollowUps": [
    {
      "question": "What changed after you solved that problem?",
      "reason": "The action is described but an outcome is missing.",
      "relatedAnswerIds": ["entity:project.action"]
    }
  ],
  "potentialSkills": [],
  "possibleMetrics": [],
  "confidence": 0
}
```

The example ID is illustrative. Actual returned IDs must be members of the supplied fact set. Up to three questions are accepted, with bounded strings/arrays. Responses API `text.format` requests a strict JSON schema; runtime Zod validation and ID checks are still required. Confidence means usefulness of the question, not competence or likelihood of employment. Unverified skills/possible metrics never become résumé facts.

The provider uses a 20-second timeout, a 1,600-output-token cap, `store:false`, no callable model tools, and an instruction separating untrusted answer data from system instructions. It never requests hidden chain-of-thought. A database limit allows fewer than ten prior paid calls within the preceding hour. Failed paid attempts count against the allowance. Errors leave stored answers intact and surface a retryable message.

## Claims and provenance

The deterministic composer chooses confirmed action, outcome, tools and metric fields. Every generated bullet stores its evidence IDs and source revisions. It never inserts a guessed number, qualification, employer or result. The user can compare raw, clear-action and richer grounded wording, then edit and approve.

Saving changed wording creates a clearly labeled user-authored source and removes approval. Approval is a separate action. Export requires confirmed current sources, supported numeric tokens, approved bullets, valid contact fields, and continued evidence for the frozen skills list. Restoration does not exempt old bullets from current checks.

Source linkage is not semantic fact verification. The application cannot determine whether users told the truth, whether an answer overstates individual contribution, or whether the wording changes the relationship between a number and its context. Do not describe these checks as hallucination-proof or ATS-certified.

## Privacy and deletion

The application does not ask for date of birth, gender, citizenship/immigration status, medical details, street address, government IDs, or payment data. Employer-facing contact links are optional. Do not place sensitive information in free text.

Production data is stored in D1 under the authenticated user's profile. Demo and personal records are distinct. External AI is off by default. API retention policies are separate from the application's `store:false` request; this setting is not a promise of zero provider retention. See the primary-source data-control reference in `RESEARCH.md` and your provider account's current terms.

The Settings page exports a JSON copy, clears the current profile, resets the fictional demo, or deletes account-wide Folio records after explicit confirmation. Account deletion includes AI operation metadata. Infrastructure backups and provider-side retention are outside the immediate application deletion transaction.

## Remaining safety work before public scale

- Add multilingual/semantic evaluation datasets for misleading skills, negation and numeric relationships.
- Add budget monitoring, centralized abuse controls, bounded audit retention and alerts for provider failures.
- Add granular source references for every skill, award and contact/education presentation field.
- Perform an independent security review, accessibility audit, load test and retention review before public access.

Live API credentials were not supplied for this delivery. The rule-based workflow is operational; provider response/error contracts are tested using mocks. No paid-provider accuracy, latency or retention claim is inferred from those tests.
