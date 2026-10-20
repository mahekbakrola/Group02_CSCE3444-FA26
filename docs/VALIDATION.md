# Validation record

Validation performed September 9, 2026 with fictional fixtures.

## Automated verification

| Gate                              | Result / scope                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| Dependency installation           | Prescribed Sites installer completed successfully against the lockfile                  |
| ESLint                            | Passed with no errors or warnings                                                       |
| TypeScript                        | `tsc --noEmit` passed                                                                   |
| Unit / contract / SQL / PDF tests | 33 tests passed using `npm test`                                                        |
| Production build                  | Vinext/Vite Worker and client build completed; large lazy-bundle warning retained       |
| Initial migration                 | Applied successfully to local D1; the generated migration also runs in repository tests |

The final source is rebuilt after UI corrections. Build output retains one warning for large PDF/Three.js-related chunks; those modules are dynamically imported. Static route classification is marked unknown for some routes by the platform's beta runtime, while the build and route loading succeed.

## What the tests prove

- Question IDs are unique and metadata is populated; first-year, security-target, and repair-specific questions branch in the correct scope.
- Skips can be reopened; required values and metric confirmation are enforced.
- Numbers are not fabricated; unsupported numerical tokens are rejected.
- Answer changes/deletions invalidate dependent claims; edits become user-supplied facts and require separate approval.
- Tailoring leaves master facts unchanged; frozen presentation snapshots and restored source revisions behave as intended.
- Students can reach a first draft without employment; negated and self-reported skills do not become demonstrated skills.
- Job comparison distinguishes evidence states and preferred terms; career suggestions return explanations and gaps.
- Record IDs use a secure Web Crypto fallback when randomUUID is unavailable in an HTTP development preview.
- AI fallback works without credentials; malformed output and foreign evidence references are rejected.
- The actual repository SQL round-trips records under the generated SQLite schema, isolates users and modes, handles stale saves without child-record overwrite, and cascades account deletion correctly.
- All three templates create real one-page PDFs for the seed. Long statements/unbroken URLs continue onto additional pages, unsupported glyphs fail clearly, and missing skill evidence blocks a stale skills snapshot.

The SQL test adapter mirrors D1's transactional batch contract with a real SQLite transaction; it is not a replacement for platform load or multi-region tests. AI responses are mocked. Tests do not prove the semantic truth of user claims.

## Browser walkthroughs

The app was inspected in the internal live development preview using the supported browser runtime. The exercised flows include:

- Dashboard, résumé studio and live document preview load with the fictional profile.
- Rename a résumé; reload and verify the saved name and revision.
- Edit a bullet; verify the separate approval state and the export-blocking review dialog.
- Approve the edited bullet; verify all contributions can return to approved state.
- Select the repair entry, save a qualitative outcome, and reach the optional number/range question with explicit confirmation.
- Fetch rule-based follow-up suggestions and verify relevant repair/data-recovery prompts.
- Analyze a description containing Python/SQL/Git, Docker and Kubernetes; verify demonstrated, self-reported and missing groups respectively.
- Create a tailored named résumé; verify grounded project ordering and zero automatically approved bullets.
- Create a fictional first-year personal profile; capture a project in the miner and verify the new entry opens at its personal-contribution question.
- Inspect the 390 × 844 mobile CSS layout in an iframe viewport, open its navigation drawer and navigate to the career explorer.

The browser's blob-download event bridge did not return a file handle even though the application displayed a successful PDF-download notification. The same export engine was run directly, its PDF was parsed with Poppler, and the final rasterized page was visually inspected. The sample contains selectable text, conventional sections and no clipped content. Do not equate a toast with full browser-download delivery verification.

## Visual QA and limits

Desktop dashboard and résumé editor were visually inspected. The final fictional sample PDF was rendered and inspected after export spacing changes. Mobile dashboard and navigation were inspected at a 390-pixel iframe width; this is a responsive-layout check, not a physical-phone or touch-device certification.

The cloud browser used the graph's fallback. Three.js interaction and cleanup are implemented, but GPU-backed dragging, WebGL restoration, battery use and a broader hardware matrix were not empirically verified here. The equivalent HTML/list navigation is available independently.

Remaining verification before opening public access: automated browser regressions across Chromium/Firefox/WebKit, assistive-technology review and contrast audit, production identity with multiple real accounts, paid-provider integration tests, abuse/rate-limit load tests and independent security review. See README for functional scope limits.
