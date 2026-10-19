# Folio source audit and fixes

Date: September 30, 2026. Scope: the latest available standalone Cloudflare source, including the previous Google-name fix. The deployed Cloudflare URL and any edits made on your Mac were not supplied, so they are not claimed to match this source.

**Evidence labels:** PASS means the source-level simulation has a connected path under valid prerequisites, not that a browser click was executed. FAIL names a specific source defect or the previously reported navigation failure. Browser-specific risks are labeled as risks, not observed failures. Live browser/OAuth results are NOT RUN. No audit can prove that every possible bug is gone.

Automated verification: typecheck PASS; lint PASS; 52 tests PASS; production build PASS; 27 local HTTP/page/API/asset checks PASS. Those HTTP checks are not browser-click tests. Supabase/Google live login, real phone interaction, Safari/Firefox/Chrome rendering, and visual overlap checks require your deployed site.

## STEP 1 — Inventory

195 authored interactive definitions in components/folio are listed below. Rows include composite controls/containers, so this is not a count of visible DOM buttons. Repeated JSX controls represent every item in their source array or saved workspace; personal entities/facts/resumes cannot be enumerated without the live account data. Additional generated/primitive controls and all bounded options follow the table. Audit IDs I001… are report references, not invented DOM IDs. Where no ID/class exists, the component, accessible label, and file/line identify the control.

| Audit ID / source | ID, class or accessible selector | Intended behavior | Handler / destination |
|---|---|---|---|
| I001 · auth-form.tsx:29 | className="brand auth-brand" | Open the dashboard/home page | Browser navigation to "/" |
| I002 · auth-form.tsx:32 | className="auth-google" | Start Google OAuth sign-in | Browser navigation to "/api/auth/google" |
| I003 · auth-form.tsx:36 | form (no authored ID/class) | Submit email signup or sign-in | onSubmit={submit} |
| I004 · auth-form.tsx:37 | id="auth-name" | Enter signup name | Uncontrolled form field → FormData in submit |
| I005 · auth-form.tsx:38 | id="auth-email" | Enter email address | Uncontrolled form field → FormData in submit |
| I006 · auth-form.tsx:39 | id="auth-password" | Enter password | Uncontrolled form field → FormData in submit |
| I007 · auth-form.tsx:42 | className="auth-submit" | Submit the credentials form | Parent form onSubmit |
| I008 · auth-form.tsx:44 | a (no authored ID/class) | Switch between signup and sign-in | Browser navigation to {signup ? "/signin" : "/signup"} |
| I009 · career.tsx:63 | className="subtle-button" | Open the interview to refine interests | Browser navigation to "/interview" |
| I010 · career.tsx:70 | className="career-tabs" | Manage map/list tab selection | Radix tab state/keyboard handlers; value="map" |
| I011 · career.tsx:77 | value="map" | Show constellation tab | Radix tab state/keyboard handlers; value="map" |
| I012 · career.tsx:81 | value="list" | Show list tab | Radix tab state/keyboard handlers; value="list" |
| I013 · career.tsx:120 | Constellation (no authored ID/class) | Select or drag a career graph | onSelect={(id) => router.push(\`/career/${id}\`)} |
| I014 · career.tsx:145 | aria-label="Search career paths"; value={query} | Filter career paths by title or skill | onChange={(e) => setQuery(e.target.value)} |
| I015 · career.tsx:161 | className="career-card" | Open each matching career detail | Browser navigation to {\`/career/${c.id}\`} |
| I016 · career.tsx:210 | Empty (no authored ID/class) | Return from a missing career to explorer | onClick={() => router.push("/career")} |
| I017 · career.tsx:218 | className="back-link" | Return to all career paths | Browser navigation to "/career" |
| I018 · career.tsx:259 | className="text-link" | Open the official O*NET occupation | Browser navigation to {\`https://www.onetonline.org/link/summary/${career.code}\`} |
| I019 · career.tsx:308 | Primary (no authored ID/class) | Create a planned learning project in the current workspace | onClick={() =>                     void mutate({                       type: "entity",                       entity: {                         id: newId(),                         kind: "project",                         title: \`${career.title} learning project\`,                         subtitle: "Planned — add facts after completing work",                         dates: "",                       },                     })                       .then(() =>                         toast.success(                           "Project added. Describe only work you actually complete.",                         ),                       )                       .catch(() => {})                   } |
| I020 · career.tsx:353 | className="subtle-button" | Fetch occupation source information | onClick={() => void sourceDetails()} |
| I021 · constellation.tsx:333 | className={\`graph-label node-${i}\`} | Open one of six labeled careers | onClick={() => onSelect?.(c.id)} |
| I022 · constellation.tsx:355 | className="graph-reset"; aria-label="Reset graph rotation" | Reset WebGL graph rotation | onClick={() => setReset((x) => x + 1)} |
| I023 · dashboard.tsx:41 | className="subtle-button" | Open master profile | Browser navigation to "/profile" |
| I024 · dashboard.tsx:62 | Primary (no authored ID/class) | Open interview | onClick={() => router.push("/interview")} |
| I025 · dashboard.tsx:72 | Constellation (no authored ID/class) | Open a labeled career from graph | onSelect={(id) => router.push(\`/career/${id}\`)} |
| I026 · dashboard.tsx:101 | className="next-step-link" | Open interview from suggested next step | Browser navigation to "/interview" |
| I027 · dashboard.tsx:150 | Jump (no authored ID/class) | Open master profile | Browser navigation to "/profile" |
| I028 · dashboard.tsx:156 | a (no authored ID/class) | Open the relevant coverage section | Browser navigation to {g.category === "skills" ? "/profile" : "/interview"} |
| I029 · dashboard.tsx:186 | Link (no authored ID/class) | Open a resume-health finding destination | Browser navigation to {\`/${f.action}\`} |
| I030 · dashboard.tsx:212 | Jump (no authored ID/class) | Open career explorer | Browser navigation to "/career" |
| I031 · dashboard.tsx:217 | className="career-mini" | Open each recommended career | Browser navigation to {\`/career/${c.id}\`} |
| I032 · dashboard.tsx:242 | Jump (no authored ID/class) | Open job list | Browser navigation to "/jobs" |
| I033 · dashboard.tsx:247 | Link (no authored ID/class) | Open each suggested example job | Browser navigation to {\`/jobs/${j.id}\`} |
| I034 · dashboard.tsx:279 | Link (no authored ID/class) | Open experience miner | Browser navigation to "/discover" |
| I035 · discover.tsx:175 | className="discovery-card" | Open one of ten discovery prompts and clear old input | onClick={() => {               setSelected(i);               setStory("");               setTitle("");             }} |
| I036 · discover.tsx:203 | className="text-link" | Open career explorer for project ideas | Browser navigation to "/career" |
| I037 · discover.tsx:208 | Dialog (no authored ID/class) | Open/close capture dialog | onOpenChange={(v) => !v && setSelected(null)} |
| I038 · discover.tsx:221 | id="discovery-title"; value={title} | Enter experience title | onChange={(e) => setTitle(e.target.value)} |
| I039 · discover.tsx:229 | id="discovery-story"; value={story} | Enter actual experience story | onChange={(e) => setStory(e.target.value)} |
| I040 · discover.tsx:242 | Primary (no authored ID/class) | Save experience and initial story, then open its interview | onClick={() => void save()} |
| I041 · entity-editor.tsx:49 | Dialog (no authored ID/class) | Open/close experience editor | onOpenChange={(v) => !v && onClose()} |
| I042 · entity-editor.tsx:59 | className="form-stack" | Submit experience create/edit | onSubmit={save} |
| I043 · entity-editor.tsx:62 | label="Experience type"; value={type} | Select experience kind | onChange={(v) => setType(v as EntityKind)} |
| I044 · entity-editor.tsx:79 | id="entity-title"; value={title} | Enter experience title | onChange={(e) => setTitle(e.target.value)} |
| I045 · entity-editor.tsx:92 | id="entity-subtitle"; value={subtitle} | Enter organization/context | onChange={(e) => setSubtitle(e.target.value)} |
| I046 · entity-editor.tsx:102 | id="entity-dates"; value={dates} | Enter dates | onChange={(e) => setDates(e.target.value)} |
| I047 · entity-editor.tsx:110 | Primary (no authored ID/class) | Submit experience create/edit | Parent form onSubmit |
| I048 · interview.tsx:76 | className="answer-form" | Submit the current answer | onSubmit={(e) => {         e.preventDefault();         void save();       }} |
| I049 · interview.tsx:92 | className="choice-list"; value={answer} | Select a single answer option | onValueChange={setAnswer} |
| I050 · interview.tsx:104 | id={\`choice-${i}\`}; value={o} | Choose each radio answer option | Radix → parent RadioGroup onValueChange=setAnswer |
| I051 · interview.tsx:121 | id={\`multi-${i}\`} | Choose/unchoose each multi-answer option | onCheckedChange={(checked) => {                   const values = answer ? answer.split(" \| ") : [];                   setAnswer(                     (checked                       ? [...values, o]                       : values.filter((v) => v !== o)                     ).join(" \| "),                   );                 }} |
| I052 · interview.tsx:139 | className="interview-input"; value={answer} | Enter a longer answer | onChange={(e) => setAnswer(e.target.value)} |
| I053 · interview.tsx:153 | value={answer} | Enter text/email/URL answer | onChange={(e) => setAnswer(e.target.value)} |
| I054 · interview.tsx:179 | Checkbox (no authored ID/class) | Confirm a supported metric | onCheckedChange={(v) => setConfirmed(v === true)} |
| I055 · interview.tsx:193 | className="subtle-button" | Skip an optional question | onClick={() => void save(true)} |
| I056 · interview.tsx:201 | Primary (no authored ID/class) | Save/update answer and continue | Parent form onSubmit |
| I057 · interview.tsx:276 | className="subtle-button" | Open resume studio | Browser navigation to "/resume" |
| I058 · interview.tsx:286 | className={\`outline-item ${selected === "profile" ? "active" : ""}\`} | Select profile foundations | onClick={() => {               setEntityId("profile");               setEdit(null);             }} |
| I059 · interview.tsx:300 | className={\`outline-item ${selected === x.id ? "active" : ""}\`} | Select each existing experience | onClick={() => {                 setEntityId(x.id);                 setEdit(null);                 setSuggestions(null);               }} |
| I060 · interview.tsx:324 | className="add-outline" | Open add-experience dialog | onClick={() => setAdd(true)} |
| I061 · interview.tsx:333 | Link (no authored ID/class) | Open experience miner | Browser navigation to "/discover" |
| I062 · interview.tsx:352 | label="Question category"; value={category ?? "all"} | Filter profile questions by category | onChange={(v) => {                   setCategory(v === "all" ? undefined : (v as Category));                   setEdit(null);                 }} |
| I063 · interview.tsx:378 | AnswerForm (no authored ID/class) | Render/save current or edited answer | onSaved={() => setEdit(null)} |
| I064 · interview.tsx:386 | Empty (no authored ID/class) | Add experience when queue is complete | onClick={() => setAdd(true)} |
| I065 · interview.tsx:418 | className="answer-history-row" | Edit a saved answer and scroll up | onClick={() => {                       setEdit(f.id);                       window.scrollTo({ top: 0, behavior: "smooth" });                     }} |
| I066 · interview.tsx:468 | className="subtle-button ai-suggest" | Request rules/AI follow-up suggestions | onClick={() => void suggest()} |
| I067 · interview.tsx:495 | EntityEditor (no authored ID/class) | Create a new experience and select it | onClose={() => setAdd(false)}; onCreated={(id) => {           setEntityId(id);           setEdit(null);         }} |
| I068 · jobs.tsx:82 | Tabs (no authored ID/class) | Manage opportunity/analyzer tabs | Radix tab state/keyboard handlers; value="opportunities" |
| I069 · jobs.tsx:84 | value="opportunities" | Show opportunity examples | Radix tab state/keyboard handlers; value="opportunities" |
| I070 · jobs.tsx:88 | value="analyze" | Show job-description analyzer | Radix tab state/keyboard handlers; value="analyze" |
| I071 · jobs.tsx:109 | aria-label="Search opportunities"; value={query} | Search opportunities | onChange={(e) => setQuery(e.target.value)} |
| I072 · jobs.tsx:116 | label="Work arrangement"; value={mode} | Filter by work arrangement | onChange={setMode} |
| I073 · jobs.tsx:122 | className={\`subtle-button ${savedOnly ? "selected" : ""}\`} | Toggle saved-only filter | onClick={() => setSavedOnly(!savedOnly)} |
| I074 · jobs.tsx:154 | className="icon-button"; aria-label={                           w.savedJobs.includes(j.id)                             ? \`Unsave ${j.title}\`                             : \`Save ${j.title}\`                         } | Save/unsave each example job | onClick={() =>                           void mutate({ type: "saveJob", id: j.id }).catch(                             () => {},                           )                         } |
| I075 · jobs.tsx:175 | Link (no authored ID/class) | Open example-job detail | Browser navigation to {\`/jobs/${j.id}\`} |
| I076 · jobs.tsx:218 | summary (no authored ID/class) | Expand recommendation reasons | Forwarded shared component props / native field behavior; see owning form/root |
| I077 · jobs.tsx:225 | className="job-card-link" | Open example-job detail | Browser navigation to {\`/jobs/${j.id}\`} |
| I078 · jobs.tsx:233 | Empty (no authored ID/class) | Clear all filters | onClick={() => {                     setQuery("");                     setMode("Any");                     setSavedOnly(false);                   }} |
| I079 · jobs.tsx:256 | id="jd-name"; value={versionName} | Enter optional version/role name | onChange={(e) => setVersionName(e.target.value)} |
| I080 · jobs.tsx:264 | id="job-description"; className="job-description-input"; value={description} | Enter job description and clear stale analysis | onChange={(e) => {                       setDescription(e.target.value);                       setResult(null);                     }} |
| I081 · jobs.tsx:279 | Primary (no authored ID/class) | Analyze requirements locally against workspace evidence | onClick={() => setResult(analyzeJob(description, w))} |
| I082 · jobs.tsx:299 | Primary (no authored ID/class) | Generate a tailored resume from analyzed description | onClick={() => void tailor(description, versionName)} |
| I083 · jobs.tsx:327 | Empty (no authored ID/class) | Return from unknown job to opportunities | onClick={() => router.push("/jobs")} |
| I084 · jobs.tsx:335 | className="back-link" | Return to job list | Browser navigation to "/jobs" |
| I085 · jobs.tsx:344 | className="subtle-button" | Save/unsave current job | onClick={() =>                   void mutate({ type: "saveJob", id: job.id }).catch(() => {})                 } |
| I086 · jobs.tsx:387 | Primary (no authored ID/class) | Generate resume tailored to current example job | onClick={() =>                   void tailor(job.description, \`${job.title} · ${job.company}\`)                 } |
| I087 · jobs.tsx:436 | summary (no authored ID/class) | Expand each requirement source | Forwarded shared component props / native field behavior; see owning form/root |
| I088 · onboarding.tsx:23 | ProfileForm (no authored ID/class) | Save profile foundations, then open interview | onboarding=true; onSave={async (p) => {               await mutate({ type: "profile", profile: p });               router.push("/interview");             }} |
| I089 · profile.tsx:148 | className="form-stack" | Validate and submit profile fields | onSubmit={handleSubmit(onSave)} |
| I090 · profile.tsx:153 | id={\`p-${f.key}\`} | Enter each contact/education field | react-hook-form register(f.key) |
| I091 · profile.tsx:168 | label="Career direction"; value={target \|\| "Still exploring"} | Select career direction | onChange={(v) => setValue("target", v)} |
| I092 · profile.tsx:184 | label="Year of study"; value={year \|\| "First year"} | Select year of study | onChange={(v) => setValue("year", v)} |
| I093 · profile.tsx:206 | Primary (no authored ID/class) | Submit profile save | Parent form onSubmit |
| I094 · profile.tsx:255 | className="subtle-button" | Open import-text dialog | onClick={() => setImporting(true)} |
| I095 · profile.tsx:262 | Primary (no authored ID/class) | Open new-experience editor | onClick={() => {                 setEntity(undefined);                 setAdd(true);               }} |
| I096 · profile.tsx:292 | className="icon-button"; aria-label="Edit personal profile" | Open personal-profile editor | onClick={() => setEditing(true)} |
| I097 · profile.tsx:318 | a (no authored ID/class) | Open each saved external profile link | Browser navigation to {url} |
| I098 · profile.tsx:337 | Empty (no authored ID/class) | Add first experience | onClick={() => setAdd(true)} |
| I099 · profile.tsx:374 | className="icon-button"; aria-label={\`Edit ${e.title}\`} | Edit an existing experience | onClick={() => {                         setEntity(e);                         setAdd(true);                       }} |
| I100 · profile.tsx:384 | className="icon-button"; aria-label={\`Delete ${e.title}\`} | Open confirmation to delete experience | onClick={() =>                         setRemove({ kind: "deleteEntity", id: e.id })                       } |
| I101 · profile.tsx:413 | className="text-link" | Confirm an unverified imported contribution | onClick={() =>                                 void mutate({                                   type: "answer",                                   entityId: e.id,                                   questionId: \`${e.kind}.action\`,                                   value: f.value,                                   confirmed: true,                                 })                                   .then(() =>                                     toast.success(                                       "Saved as your confirmed contribution.",                                     ),                                   )                                   .catch(() => {})                               } |
| I102 · profile.tsx:439 | className="icon-button"; aria-label="Edit answer" | Edit an existing interview fact | onClick={() => setFact(f)} |
| I103 · profile.tsx:447 | className="icon-button"; aria-label="Delete fact" | Open confirmation to delete fact | onClick={() =>                             setRemove({ kind: "deleteFact", id: f.id })                           } |
| I104 · profile.tsx:465 | className="text-link experience-followup" | Develop the selected experience in interview | Browser navigation to "/interview" |
| I105 · profile.tsx:522 | Dialog (no authored ID/class) | Open/close profile editor | onOpenChange={setEditing} |
| I106 · profile.tsx:530 | ProfileForm (no authored ID/class) | Edit/save profile and close on success | onSave={async (p) => {               await mutate({ type: "profile", profile: p });               setEditing(false);               toast.success("Profile saved");             }} |
| I107 · profile.tsx:541 | EntityEditor (no authored ID/class) | Create/edit experience in dialog | onClose={() => setAdd(false)} |
| I108 · profile.tsx:547 | Dialog (no authored ID/class) | Open/close answer editor | onOpenChange={(v) => !v && setFact(null)} |
| I109 · profile.tsx:559 | AnswerForm (no authored ID/class) | Save edited fact and close on success | onSaved={() => setFact(null)} |
| I110 · profile.tsx:569 | AlertDialog (no authored ID/class) | Open/close delete-fact/experience confirmation | onOpenChange={(v) => !v && setRemove(null)} |
| I111 · profile.tsx:582 | AlertDialogCancel (no authored ID/class) | Cancel deletion | Forwarded shared component props / native field behavior; see owning form/root |
| I112 · profile.tsx:583 | AlertDialogAction (no authored ID/class) | Delete selected experience/fact | onClick={() =>                 remove &&                 void mutate({ type: remove.kind, id: remove.id })                   .then(() => setRemove(null))                   .catch(() => {})               } |
| I113 · profile.tsx:597 | Dialog (no authored ID/class) | Open/close text-import dialog | onOpenChange={setImporting} |
| I114 · profile.tsx:607 | label="Experience for imported text"; value={importEntity \|\| w.entities[0]?.id \|\| ""} | Choose import destination experience | onChange={setImportEntity} |
| I115 · profile.tsx:613 | aria-label="Upload text résumé" | Read TXT upload into import text | onChange={async (e) => {               const file = e.target.files?.[0];               if (file) {                 if (file.size > 50000) {                   toast.error("Choose a text file under 50 KB.");                   return;                 }                 setImportText((await file.text()).slice(0, 1800));               }             }} |
| I116 · profile.tsx:628 | aria-label="Résumé text to review"; value={importText} | Enter pasted contribution | onChange={(e) => setImportText(e.target.value)} |
| I117 · profile.tsx:635 | Primary (no authored ID/class) | Save unverified imported text | onClick={() => void importFact()} |
| I118 · resume.tsx:240 | Primary (no authored ID/class) | Open create-resume dialog | onClick={() => setCreate(true)} |
| I119 · resume.tsx:277 | className="resume-card" | Open each resume version | Browser navigation to {\`/resume/${r.id}\`} |
| I120 · resume.tsx:303 | className="new-resume-card" | Open create-resume dialog from new card | onClick={() => setCreate(true)} |
| I121 · resume.tsx:318 | Empty (no authored ID/class) | Create first resume from empty state | onClick={() => setCreate(true)} |
| I122 · resume.tsx:335 | Empty (no authored ID/class) | Return from missing resume to studio | onClick={() => router.push("/resume")} |
| I123 · resume.tsx:343 | className="back-link" | Return to all versions | Browser navigation to "/resume" |
| I124 · resume.tsx:353 | className="subtle-button" | Open revision history | onClick={() => setHistory(true)} |
| I125 · resume.tsx:360 | Primary (no authored ID/class) | Run export checks and download PDF | onClick={() => void download()} |
| I126 · resume.tsx:372 | label="Résumé template"; value={r.template} | Change template and default section order | onChange={(v) =>                   void save({                     ...r,                     template: v as Template,                     sectionOrder:                       v === "technical"                         ? ["education", "project", "experience", "activity"]                         : ["education", "experience", "project", "activity"],                   })                 } |
| I127 · resume.tsx:393 | className="subtle-button" | Open rename dialog | onClick={() => {                   setNewName(r.name);                   setRename(true);                 }} |
| I128 · resume.tsx:403 | className="subtle-button" | Open creation dialog for a fresh draft | onClick={() => {                   setName(\`${r.name} · refreshed\`);                   setTemplate(r.template);                   setCreate(true);                 }} |
| I129 · resume.tsx:414 | className="icon-button"; aria-label="Delete this résumé" | Open delete-version confirmation | onClick={() => setRemove(true)} |
| I130 · resume.tsx:450 | className="evidence-link" | Open linked evidence sheet | onClick={() => setEvidence(b)} |
| I131 · resume.tsx:469 | className="icon-button"; aria-label="Move bullet up" | Move bullet upward | onClick={() => moveBullet(i, -1)} |
| I132 · resume.tsx:477 | className="icon-button"; aria-label="Move bullet down" | Move bullet downward | onClick={() => moveBullet(i, 1)} |
| I133 · resume.tsx:485 | className="subtle-button compact" | Open bullet wording editor | onClick={() => {                             setEditing(b);                             setText(b.text);                           }} |
| I134 · resume.tsx:496 | className={                           !issues.length ? "approved-button" : "approve-button"                         } | Toggle bullet approval | onClick={() =>                           void save({                             ...r,                             bullets: r.bullets.map((x) =>                               x.id === b.id                                 ? { ...x, approved: !b.approved }                                 : x,                             ),                           })                         } |
| I135 · resume.tsx:576 | Dialog (no authored ID/class) | Open/close create dialog | onOpenChange={setCreate} |
| I136 · resume.tsx:586 | id="resume-name"; value={name} | Enter new version name | onChange={(e) => setName(e.target.value)} |
| I137 · resume.tsx:594 | label="New résumé template"; value={template} | Select new version template | onChange={(v) => setTemplate(v as Template)} |
| I138 · resume.tsx:600 | Primary (no authored ID/class) | Generate resume draft and open it | onClick={() => void generate()} |
| I139 · resume.tsx:606 | Sheet (no authored ID/class) | Open/close linked-evidence sheet | onOpenChange={(v) => !v && setEvidence(null)} |
| I140 · resume.tsx:647 | className="subtle-button" | Review a suggested wording in editor | onClick={() => {                         setEditing(evidence);                         setText(s.text);                         setEvidence(null);                       }} |
| I141 · resume.tsx:671 | Dialog (no authored ID/class) | Open/close bullet editor | onOpenChange={(v) => !v && setEditing(null)} |
| I142 · resume.tsx:680 | aria-label="Edit résumé bullet"; value={text} | Enter edited bullet text | onChange={(e) => setText(e.target.value)} |
| I143 · resume.tsx:687 | Button (no authored ID/class) | Restore original bullet wording in editor | onClick={() => editing && setText(editing.original)} |
| I144 · resume.tsx:694 | Primary (no authored ID/class) | Save revised wording, requiring reapproval | onClick={() =>                 r &&                 editing &&                 void save({                   ...r,                   bullets: r.bullets.map((b) =>                     b.id === editing.id ? { ...b, text } : b,                   ),                 }).then((ok) => ok && setEditing(null))               } |
| I145 · resume.tsx:711 | className="danger-text" | Remove selected bullet | onClick={() =>                 void save({                   ...r,                   bullets: r.bullets.filter((b) => b.id !== editing.id),                 }).then((ok) => ok && setEditing(null))               } |
| I146 · resume.tsx:727 | Dialog (no authored ID/class) | Open/close revision-history dialog | onOpenChange={setHistory} |
| I147 · resume.tsx:746 | className="subtle-button" | Restore selected revision | onClick={() =>                     void mutate({ type: "restore", id: h.id })                       .then(() => {                         setHistory(false);                         toast.success("Draft restored");                       })                       .catch(() => {})                   } |
| I148 · resume.tsx:770 | Dialog (no authored ID/class) | Open/close failed-export review dialog | onOpenChange={(v) => !v && setPreflight(null)} |
| I149 · resume.tsx:789 | Primary (no authored ID/class) | Close export review | onClick={() => setPreflight(null)} |
| I150 · resume.tsx:792 | Dialog (no authored ID/class) | Open/close rename dialog | onOpenChange={setRename} |
| I151 · resume.tsx:800 | aria-label="Version name"; value={newName} | Enter replacement version name | onChange={(e) => setNewName(e.target.value)} |
| I152 · resume.tsx:806 | Primary (no authored ID/class) | Save replacement name | onClick={() =>               r &&               void save({ ...r, name: newName }).then(                 (ok) => ok && setRename(false),               )             } |
| I153 · resume.tsx:819 | AlertDialog (no authored ID/class) | Open/close version-deletion confirmation | onOpenChange={setRemove} |
| I154 · resume.tsx:829 | AlertDialogCancel (no authored ID/class) | Cancel version deletion | Forwarded shared component props / native field behavior; see owning form/root |
| I155 · resume.tsx:830 | AlertDialogAction (no authored ID/class) | Delete current resume and open studio | onClick={() =>                 r &&                 void mutate({ type: "deleteResume", id: r.id })                   .then(() => router.push("/resume"))                   .catch(() => {})               } |
| I156 · settings.tsx:95 | id="light-theme" | Persist light/dark appearance | onCheckedChange={(v) =>                   void mutate({                     type: "profile",                     profile: { ...w.profile, theme: v ? "light" : "dark" },                   }).catch(() => {})                 } |
| I157 · settings.tsx:113 | id="motion" | Persist motion setting | onCheckedChange={(v) =>                   void mutate({                     type: "profile",                     profile: { ...w.profile, motion: v },                   }).catch(() => {})                 } |
| I158 · settings.tsx:139 | id="ai-consent" | Persist optional external AI consent | onCheckedChange={(v) =>                   void mutate({                     type: "profile",                     profile: { ...w.profile, aiConsent: v },                   }).catch(() => {})                 } |
| I159 · settings.tsx:167 | className="text-link" | Open provider data-controls documentation | Browser navigation to "https://platform.openai.com/docs/guides/your-data" |
| I160 · settings.tsx:189 | className="subtle-button" | Download workspace JSON | onClick={exportData} |
| I161 · settings.tsx:207 | className="subtle-button danger-text" | Open clear-profile/reset-demo confirmation | onClick={() => {                   setRemove("profile");                   setConfirm("");                 }} |
| I162 · settings.tsx:226 | className="subtle-button danger-text" | Open delete-all-Folio-data confirmation | onClick={() => {                   setRemove("account");                   setConfirm("");                 }} |
| I163 · settings.tsx:258 | SignoutButton (no authored ID/class) | Sign out current browser session | SignoutButton.signout → POST /api/auth/signout |
| I164 · settings.tsx:262 | AlertDialog (no authored ID/class) | Open/close destructive confirmation | onOpenChange={(v) => !v && setRemove(null)} |
| I165 · settings.tsx:284 | aria-label="Type DELETE to confirm"; value={confirm} | Enter DELETE confirmation | onChange={(e) => setConfirm(e.target.value)} |
| I166 · settings.tsx:291 | AlertDialogCancel (no authored ID/class) | Cancel destructive action | Forwarded shared component props / native field behavior; see owning form/root |
| I167 · settings.tsx:292 | AlertDialogAction (no authored ID/class) | Clear/reset profile or delete both account workspaces | onClick={(e) => {                 e.preventDefault();                 void deleteData();               }} |
| I168 · shared.tsx:78 | value={value} | Provide shared select root and selection callback | onValueChange={onChange} |
| I169 · shared.tsx:79 | className="pick"; aria-label={label} | Open shared dropdown trigger | Forwarded shared component props / native field behavior; see owning form/root |
| I170 · shared.tsx:84 | value={typeof o === "string" ? o : o.value} | Select each dropdown item | Forwarded shared component props / native field behavior; see owning form/root |
| I171 · shared.tsx:107 | className="primary" | Provide shared primary button/submit behavior | onClick={onClick} |
| I172 · shared.tsx:136 | Primary (no authored ID/class) | Render empty-state action button | onClick={onClick} |
| I173 · shared.tsx:154 | className="text-link" | Open shared navigation/external link | Browser navigation to {href} |
| I174 · shell.tsx:64 | className="nav-button" | Render each sidebar navigation control | Forwarded shared component props / native field behavior; see owning form/root |
| I175 · shell.tsx:75 | a (no authored ID/class) | Navigate sidebar destination and dismiss mobile drawer | onClick={() => setOpenMobile(false)} |
| I176 · shell.tsx:117 | className="skip-link" | Skip keyboard focus/navigation to main content | Browser navigation to "#main-content" |
| I177 · shell.tsx:122 | className="brand" | Open dashboard from brand | Browser navigation to "/dashboard" |
| I178 · shell.tsx:139 | a (no authored ID/class) | Open interview from sidebar coach | Browser navigation to "/interview" |
| I179 · shell.tsx:145 | className="settings-link" | Open settings | Browser navigation to "/settings" |
| I180 · shell.tsx:149 | className="settings-link" | Open about/welcome page | Browser navigation to "/welcome" |
| I181 · shell.tsx:171 | className="icon-button"; aria-label="Switch profile" | Switch demo/personal workspace | onClick={() => setMode(mode === "demo" ? "personal" : "demo")} |
| I182 · shell.tsx:184 | className="mobile-trigger" | Toggle mobile sidebar | SidebarTrigger → useSidebar.toggleSidebar |
| I183 · shell.tsx:190 | className="search-button" | Open page search palette | onClick={() => setSearch(true)} |
| I184 · shell.tsx:195 | className="icon-button theme-button"; aria-label="Toggle color theme" | Persist color-theme toggle | onClick={() =>                 w &&                 void mutate({                   type: "profile",                   profile: {                     ...w.profile,                     theme: w.profile.theme === "dark" ? "light" : "dark",                   },                 }).catch(() => {})               } |
| I185 · shell.tsx:216 | className="header-resume" | Open resume studio | Browser navigation to "/resume" |
| I186 · shell.tsx:232 | button (no authored ID/class) | Switch workspace and open personal onboarding if needed | onClick={() => {               setMode(mode === "demo" ? "personal" : "demo");               if (mode === "demo") window.location.assign("/onboarding");             }} |
| I187 · shell.tsx:258 | Button (no authored ID/class) | Retry workspace fetch | onClick={refresh} |
| I188 · shell.tsx:259 | className="primary link-button" | Open sign-in/signup page | Browser navigation to "/signin" |
| I189 · shell.tsx:279 | CommandDialog (no authored ID/class) | Open/close command palette | onOpenChange={setSearch} |
| I190 · shell.tsx:280 | CommandInput (no authored ID/class) | Search command destinations | cmdk built-in search and keyboard selection |
| I191 · shell.tsx:292 | CommandItem (no authored ID/class) | Select palette destination and navigate | onSelect={() => {                   setSearch(false);                   window.location.assign(n.href);                 }} |
| I192 · signout-button.tsx:15 | className="subtle-button signout" | Sign out and discard cached account data by document navigation | onClick={signout} |
| I193 · welcome.tsx:33 | Primary (no authored ID/class) | Choose personal workspace and open onboarding | onClick={() => {                 setMode("personal");                 router.push("/onboarding");               }} |
| I194 · welcome.tsx:42 | className="subtle-button" | Choose demo workspace and open dashboard | onClick={() => setMode("demo")} |
| I195 · welcome.tsx:52 | Constellation (no authored ID/class) | Open a selected career from graph | onSelect={(id) => router.push(\`/career/${id}\`)} |

### Generated and primitive interactions

| Control / selector | Purpose | Connected behavior |
|---|---|---|
| Dialog close X, [data-slot=dialog-close] | Close each mounted normal dialog | Radix Close → owning onOpenChange; not a missing onClick |
| Dialog overlay, [data-slot=dialog-overlay] | Dismiss ordinary dialog outside its content | Radix outside-pointer behavior; parent onOpenChange |
| Sheet close X and overlay, [data-slot=sheet-content] | Close evidence sheet / mobile drawer | Radix Close/outside click → setEvidence(null) / setOpenMobile(false); sidebar intentionally hides its X and retains outside/escape close |
| Alert-dialog overlay | Block underlying page during destructive confirmation | Intentionally does not confirm deletion or dismiss via outside click |
| Select scroll-up/down buttons | Scroll long dropdown option list | Radix Select ScrollUpButton/ScrollDownButton |
| Select trigger/items | Open list and choose value | Radix root onValueChange forwarded by Pick; labels/options listed below |
| Radio/checkbox hidden form inputs | Native form integration | Radix handles native input syncing; user action is on the visible item |
| Tabs left/right/Home/End keyboard actions | Select tab accessibly | Radix tab keyboard handling |
| Command palette arrow keys, Enter, Escape | Select destination / dismiss | cmdk navigation and onSelect; Radix dialog close |
| Cmd/Ctrl+K window listener | Open/close jump palette | Frame useEffect fn; listener removed on unmount |
| Cmd/Ctrl+B window listener | Toggle sidebar | SidebarProvider.handleKeyDown → toggleSidebar; cleanup removes listener |
| WebGL canvas pointer down/move/up/cancel | Drag rotation or select a node | Constellation enter/move/up/cancel; listener cleanup and pointer capture |
| PDF/JSON generated download anchor | Save exported file | download/exportData create Blob, attach anchor, click, remove, delayed URL revocation |
| File chooser native dialog | Choose local TXT file | Native input type=file → async onChange + file.text catch |
| Page/form scrolling and scrollbars | Reach overflowed modal/textarea content | Browser native scrolling; dialog height now bounded |
| Browser Back/Forward restoration | Revisit page | Workspace pageshow reload on persisted restoration; auth pageshow clears busy state |

No slider is mounted in Folio. Unused scaffold components in components/ui (slider, dropdown-menu, pagination, etc.) do not create interactive elements on these pages. Mounted primitives were checked at their consumption sites; their dependency-internal event implementations were not rewritten.

### Every bounded menu/choice and data-driven destination

- Sidebar: Overview /dashboard; Your interview /interview; Experience miner /discover; Master profile /profile; Résumé studio /resume; Career explorer /career; Job matches /jobs. Palette adds Settings & privacy /settings.
- Experience kinds: Work experience; Project or lab; Activity, award, or volunteering; Additional education.
- Career directions: Software engineering; Data & AI; Cybersecurity; Cloud & systems; Hardware & engineering; Still exploring.
- Study years: First year; Second year; Third year; Final year; Graduate student; Recently graduated.
- Question categories: all; identity; education; career; skills; discovery.
- Work arrangement: Any; Remote; Hybrid; On-site.
- Templates: classic / Classic ATS; modern / Modern ATS; technical / Technical Student.
- ProfileForm field instances: p-name, p-email, p-school, p-degree, p-graduation, p-location; the full profile editor also includes p-gpa, p-phone, p-linkedin, p-github, p-website. Each registers that field key and shares the save form handler.
- Discovery cards: Fixed something; Built a project; Helped someone learn; Brought people together; Supported a business; Gave your time; Tried a challenge; Created for an audience; Contributed in the open; Asked a research question.
- Per saved entity: outline selector, edit/delete actions, follow-up link, each fact edit/delete/confirm control. Per resume: version link, each bullet evidence/edit/reorder/approve control, each history restore action. Per imported destination: every current entity. These counts depend on your saved data.

Question option controls (every option creates a radio or checkbox item):
- career.target (choice): Software engineering; Data & AI; Cybersecurity; Cloud & systems; Hardware & engineering; Still exploring
- education.year (choice): First year; Second year; Third year; Final year; Graduate student; Recently graduated
- discovery.work (choice): Yes, related to my field; Yes, in a different field; Not yet
- discovery.sources (multi): Course or personal projects; Repairing devices; Tutoring or helping classmates; A club or student organization; A family business; Volunteering; Hackathons or competitions; Content or community management; Research; Open source; None yet
- career.interests (multi): Building software; Finding patterns in data; Protecting systems; Connecting systems; Designing hardware; Helping people; Creating visual experiences; Exploring AI
- career.workMode (choice): Any; Remote; Hybrid; On-site
- career.type (choice): Internship; Full-time; Part-time; Exploring
- career.people (choice): Building independently; Collaborating with a technical team; Working directly with customers; A mix of these

Career detail links (all available paths; graph labels use the first six):
- Software engineering: /career/software
- Data science: /career/data
- Cybersecurity: /career/security
- Cloud & systems: /career/cloud
- Data engineering: /career/data-engineering
- Computer hardware: /career/hardware
- Web development: /career/web
- UX engineering: /career/ux
- Technical support: /career/support
- AI & machine learning: /career/ai
- Mobile development: /career/mobile
- Database engineering: /career/database

Example job detail links (all source listings):
- Software Engineering Intern: /jobs/j1
- Data Analyst Intern: /jobs/j2
- Security Operations Intern: /jobs/j3
- Cloud Engineering Intern: /jobs/j4
- Product Engineering Intern: /jobs/j5
- Data Platform Intern: /jobs/j6

## STEP 2 — Why things break

### F01 — Remaining client navigation could reproduce the reported same-tab stall

Links and router.push calls outside the already-fixed sidebar still used Next client navigation. All Folio page transitions now use native anchors or window.location.assign. Ctrl/Cmd-click remains a native browser action. This is a fix for the reported deployment behavior; source alone cannot establish that every old link stalled.

### F02 — Experience follow-up opened the wrong interview context

Develop this experience linked to /interview without an entity. It now includes the encoded entity ID.

### F03 — Simultaneous saves conflicted and could write the wrong query cache

Mutations read one revision with no synchronous gate; callbacks used the currently selected mode. A synchronous save guard now rejects an overlapping save with feedback, and mutation variables retain the workspace that initiated it.

### F04 — Workspace switching retained forms and selected IDs from the other workspace

Page component state was reused after switching mode. Page content now remounts per workspace; mode switches are blocked during a save.

### F05 — Blocked browser storage could crash workspace initialization

localStorage reads/writes were unguarded. Storage failures now fall back to an in-memory mode without crashing.

### F06 — Delete confirmations closed before the request succeeded

Radix AlertDialogAction auto-closes unless its event is prevented. Fact/experience and resume deletion now prevent premature close and only close/navigate on success; duplicate version deletion is disabled while saving. Cancel/Keep controls cannot imply that an already-running deletion can be undone; dismissal is blocked until the request finishes.

### F07 — Profile save rejection could produce an unhandled promise

react-hook-form handleSubmit was passed an async callback that could reject. It now catches failures, displays an inline error, and retains entered values.

### F08 — Whitespace-only input passed several client/server checks

Experience titles/imports are trimmed and meaningful text is required. Profile required fields are checked after trimming. Version names are trimmed.

### F09 — Discovery could leave an experience without its story

Capture previously made two separate saves. A new capture action applies entity and summary atomically before one repository save and one revision increment.

### F10 — Import confirmation overwrote an existing contribution

Confirming imported text replaced the experience action fact. A confirmImport action now preserves the existing action, adds the imported contribution, and marks that import confirmed. Duplicate confirmation is rejected; oversized combined input fails without partial writes.

### F11 — Network/proxy errors could leave controls waiting or show parser errors

Client requests lacked bounded waits and readable handling of non-JSON responses. The shared request helper now handles timeouts, offline errors, provider/API errors, and HTML proxy responses. PDF font loading also has a timeout. A timed-out save might already have reached the server; refresh before retrying.

### F12 — Google link ignored its disabled state

aria-disabled alone does not prevent anchor navigation. Google click handling now blocks credential/OAuth overlap and immediate repeat clicks. Email submission has its own synchronous guard.

### F13 — Successful login could open a persisted demo workspace

Both email and Google success now choose personal workspace explicitly. Workspace defaults to personal when no preference exists; the demo remains selectable.

### F14 — Browser Back could preserve stale loading/account UI

Auth pages reset busy state on pageshow. Workspace pages reload when restored from the browser back/forward cache, revalidating session and discarding stale account data. Actual browser cache behavior still needs testing.

### F15 — Late AI suggestions could belong to a previous experience

Switching outline entries did not invalidate an in-flight suggestions response. A request generation guard ignores late results/errors from the previous experience; saved answers also clear stale suggestions.

### F16 — Delete-all refreshed the old active workspace cache

Switching to personal mode followed immediately by refresh used the previous render closure and retained inactive caches. Successful delete-all now navigates to a fresh personal profile document, discarding both caches. Login account remains intact, so name/email defaults can be populated again.

### F17 — File-read rejection was unhandled

TXT upload now catches file.text failures and offers readable feedback. Empty imports cannot be submitted.

### F18 — Maximum-length names could fail fresh-draft creation

Adding a refreshed suffix or using a long career target exceeded the server version-name bound. Generated default names and refreshed names are capped at 120 characters.

### F19 — Email signup/profile limits differed

Auth accepted 254-character emails but the profile schema capped them at 250. Profile schema and profile input now accept the same 254-character bound.

### F20 — Template/remove controls could submit overlapping resume changes

The template dropdown and remove-bullet action now disable during saves. Central synchronous save guarding covers all mutating controls.

### F21 — Graph drag could stay active after leaving/canceling the pointer

The canvas now captures the pointer, handles cancellation/lost capture, and applies a movement threshold so slight movement does not turn a click into a drag. Capture release preserves the movement decision.

### F22 — Graph renderer had zero-size and disposal edge cases

Zero-width/height resize callbacks are ignored. WebGL context-lost and pointer listeners are removed on cleanup; async failures after disposal do not update component state.

### F23 — Reusable SVG gradient had a fixed ID

Current pages each mount one graph, so a duplicate live ID was not established. useId makes multiple graph instances safe. This is defensive hardening, not a claim that a duplicate currently existed.

### F24 — Graph reset looked clickable even in a static fallback

Reset is disabled with an explanatory title when rotation is unavailable; all career labels remain functional.

### F25 — Download implementation had browser compatibility risks

PDF/JSON download anchors now attach to the document before clicking and are removed afterward; Blob URLs remain alive for 30 seconds. This is compatibility hardening; actual download behavior in each browser remains untested.

### F26 — Wide dialogs could overflow small screens; some modals had no scroll bound

Wide dialogs now cap width to viewport minus margins; dialog/alert content has a scrollable viewport height bound. This fixes an identifiable CSS width issue; keyboard/viewport behavior needs real-device checks.

### F27 — Small mobile inputs and targets were harder to use

Mobile page inputs/selects/textareas now use 16px text, and icon/graph targets have 44px minima. This reduces iOS focus zoom and tap-target risk; exact layout/overlap needs visual testing.

### F28 — Shared Button default could accidentally submit a surrounding form

Shared Button now defaults to type=button while explicitly requested submit controls remain submit buttons. No additional accidental native-form submission was proven in the existing mounted pages; this protects reuse.

### F29 — Google/email name never reached the saved personal profile

The preceding name patch is included in the final source and fixes-only archive: verified account metadata seeds missing personal name/email, preserves customized values, and never changes the demo. Repository tests cover persistence and account isolation.

### F30 — Lint required the navigation path associated with the reported stall

A narrowly scoped lint setting documents Folio native navigation and disables only the Next recommendation to use Link in Folio components. No type/safety rules are disabled. The auth error effect and unused imports were also cleaned up so lint passes.

### Requested common-cause checks

| Cause | Finding |
|---|---|
| No listener / onclick | All authored controls traced. Native anchors, native summaries/inputs, Radix buttons, and forwarded Primary/Pick props do not require a separate authored DOM listener. Inert static graph reset was identified. |
| Function typo or case mismatch | React JSX references are checked by TypeScript; final typecheck passes. No inline HTML function-name string calls are used. |
| Missing queried IDs/classes | Application interactions use React state/refs, not selectors to wire buttons. #main-content exists. CSS selectors were traced to components. |
| JavaScript before DOM loaded | Canvas/window event wiring is in useEffect; React form handlers mount with elements. No application DOMContentLoaded dependency was found. |
| Duplicate IDs | Current mounted page composition does not establish duplicate IDs. Fixed reusable graph SVG gradient ID; profile/entity/question IDs are scoped to the mounted forms. A live DOM scan is still required. |
| Click-blocking overlap | Graph label parent pointer-events:none intentionally allows child pointer-events:auto. Center label cannot block clicks. Radix portals use z-50; skip link uses z-200. Actual stacking/coordinates are not proven by reading CSS: use elementFromPoint in browser. |
| Accidental form submission | Answer skip is type=button and Primary defaults to button; explicit form submits remain submit. Shared Button default hardened. |
| Earlier JS error | Typecheck/lint/build pass. Storage failures, async form/file errors, proxy JSON parsing, and late AI responses now have handling. Browser runtime exceptions remain a live check. |
| Replaced/re-rendered DOM listeners | React handlers rebind normally; canvas/keyboard listener effects clean up. Workspace switching now remounts page state. |
| Broken asset/link paths | All local page routes and three PDF fonts return 200 in local HTTP tests. Entity-specific follow-up route fixed. External destinations require internet/live checks. |
| API URL/CORS/error handling | Folio calls same-origin /api routes. Backend calls Supabase/O*NET/OpenAI, so client cross-origin API CORS is not needed for these routes. Google is full-page OAuth navigation. Error statuses and proxy failures are handled; live configuration remains unverified. |
| Desktop/mobile/touch | Pointer capture/cancel and modal width/scroll fixes added. Static mobile graph labels remain buttons. Actual iOS keyboard, tap overlap and cross-browser downloads require devices. |

## STEP 3 — Simulate every inventoried feature

For each row: start in the owning page with a valid loaded workspace when needed; click/type/select once and follow the handler/destination in Step 1. Code PASS is conditional on a valid backend/session and valid saved data. NOT RUN means no browser execution was performed. Edge failures are named rather than hidden under a blanket PASS.

| ID | Baseline simulation | Fixed code simulation | Exact remaining browser check |
|---|---|---|
| I001 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I002 | FAIL / risk: F12, F13 | PASS code path; browser NOT RUN | Live Supabase/Google setup, allowed account and both redirect URLs; Network for OAuth errors. |
| I003 | FAIL / risk: F11, F12, F13 | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I004 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I005 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I006 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I007 | FAIL / risk: F11, F12, F13 | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I008 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I009 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I010 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I011 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I012 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I013 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I014 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I015 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I016 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I017 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I018 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I019 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I020 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I021 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I022 | FAIL / risk: F24 | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I023 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I024 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I025 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I026 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I027 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I028 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I029 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I030 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I031 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I032 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I033 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I034 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I035 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I036 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I037 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I038 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I039 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I040 | FAIL / risk: F09, F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I041 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I042 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I043 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I044 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I045 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I046 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I047 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I048 | PASS code path | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I049 | FAIL / risk: F15 | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I050 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I051 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I052 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I053 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I054 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I055 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I056 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I057 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I058 | FAIL / risk: F15 | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I059 | FAIL / risk: F15 | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I060 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I061 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I062 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I063 | PASS code path | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I064 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I065 | PASS code path | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I066 | FAIL / risk: F15 | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I067 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I068 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I069 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I070 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I071 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I072 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I073 | PASS code path | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I074 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I075 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I076 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I077 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I078 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I079 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I080 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I081 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I082 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I083 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I084 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I085 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I086 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I087 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I088 | FAIL / risk: F01 (reported environment), F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I089 | FAIL / risk: F07, F08 | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I090 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I091 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I092 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I093 | FAIL / risk: F07, F08 | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I094 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I095 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I096 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I097 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I098 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I099 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I100 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I101 | FAIL / risk: F10, F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I102 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I103 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I104 | FAIL / risk: F01 (reported environment), F02 | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I105 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I106 | FAIL / risk: F07, F08, F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I107 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I108 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I109 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I110 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I111 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I112 | FAIL / risk: F06, F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I113 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I114 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I115 | FAIL / risk: F17 | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I116 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I117 | FAIL / risk: F08, F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I118 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I119 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I120 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I121 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I122 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I123 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I124 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I125 | FAIL / risk: F11, F25 (browser risk) | PASS code path; browser NOT RUN | Check browser Downloads and Network font requests; approve download permission if prompted. |
| I126 | FAIL / risk: F20 | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I127 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I128 | FAIL / risk: F18 | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I129 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I130 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I131 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I132 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I133 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I134 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I135 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I136 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I137 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I138 | FAIL / risk: F18, F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I139 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I140 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I141 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I142 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I143 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I144 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I145 | FAIL / risk: F20 | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I146 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I147 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I148 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I149 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I150 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I151 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I152 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I153 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I154 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I155 | FAIL / risk: F01 (reported environment), F06, F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I156 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I157 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I158 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I159 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I160 | FAIL / risk: F25 (browser risk) | PASS code path; browser NOT RUN | Check browser Downloads and Network font requests; approve download permission if prompted. |
| I161 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I162 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I163 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I164 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I165 | PASS code path | PASS code path; browser NOT RUN | Try valid, empty and invalid text; verify visible validation, no unhandled rejection, and submission only once. |
| I166 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I167 | FAIL / risk: F16, F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I168 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I169 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I170 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I171 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I172 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I173 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I174 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I175 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I176 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I177 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I178 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I179 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I180 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I181 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I182 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I183 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I184 | FAIL / risk: F03 (rapid clicks) | PASS code path; browser NOT RUN | Network: expected auth/workspace request; verify response and reload persistence; repeat with two accounts. |
| I185 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I186 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I187 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I188 | PASS code path | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I189 | PASS code path | PASS code path; browser NOT RUN | Keyboard/touch: Tab, Space/Enter, arrows, Escape, focus return; inspect Console if click is inert. |
| I190 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I191 | PASS code path | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I192 | FAIL / risk: F11 | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I193 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Confirm visible state change and keyboard behavior; Console must have no new error. |
| I194 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |
| I195 | FAIL / risk: F01 (reported environment) | PASS code path; browser NOT RUN | Check URL changes on same-tab click and Back; Network document request must return 200. |

### Edge-case simulations and evidence

| Scenario | Expected result after fix | Evidence / limitation |
|---|---|---|
| Empty required signup/login fields | Browser validation blocks submit; server rejects invalid JSON/details | Native required/type/minLength + server schema; live browser validation NOT RUN |
| Spaces-only name, school, degree, title or import | Meaningful input required; user gets error and input is retained | Profile checks; trimmed schemas; automated whitespace regression PASS |
| Invalid profile link protocol | Server rejects unsupported URLs; profile form catches and shows failure | Existing applyAction URL guard + fixed form rejection handling |
| Rapid save double-click / two controls clicked in one render | One mutation starts; overlapping mutation gets explicit wait feedback | Synchronous save guard; real rapid browser clicks NOT RUN |
| Double confirm of imported fact | Cannot append twice or overwrite earlier action | Automated regression PASS |
| Capture story fails validation | No partial entity-only write | Atomic action regression PASS |
| Save in two tabs with different revisions | Stale save fails without overwriting newer data | Existing actual repository SQL regression PASS; browser messaging NOT RUN |
| Switch workspace after editing fields | Page form state is reset; old mode results target its own cache | Keyed page subtree and captured mutation mode; browser NOT RUN |
| Storage denied | Mode selection works in memory for this page | Guarded reads/writes; persistence is impossible where browser refuses storage |
| Browser Back after Google / cached private page | Auth busy state clears; persisted workspace page revalidates via reload | pageshow handling; browser cache behavior NOT RUN |
| Offline, timeout, HTML 502, API 401/403/409/429 | Readable feedback; wait ends; do not blind-retry ambiguous timed-out writes | Request helper regression PASS; actual endpoint status checks PASS where specified |
| Delete request fails | Dialog stays available; user sees toast/error | preventDefault + close-on-success; live mocked failure click NOT RUN |
| Unsupported/stale/unapproved resume evidence | Export review explains refusal | PDF/evidence tests PASS |
| Empty or unmatched search | Empty result/list or clear-filters action; no exception from filtering | Source simulation PASS; visual no-results display is basic on career search |
| User navigates away without saving | Unsaved local input is not saved automatically | Existing Save & continue model remains. Save before changing pages; no new autosave feature is claimed |
| Google account without display-name metadata | Generic personal-name fallback remains editable | Name extractor handles missing data; cannot invent a name not returned by provider |
| Reload after delete-all | Private facts/resumes are gone; account name/email can be seeded again | Account deletion SQL tests + identity seeding tests PASS; login account intentionally remains |

## STEP 4 — Exact before/after code and complete files

The accompanying Folio-QA-changes.diff contains every exact removed/added line, with standard unified-diff source line numbers. It compares the originally delivered email/Google/Cloudflare ZIP to the final files, so it also includes the earlier name fix. Folio-QA-fixes.zip contains COMPLETE changed files, not patches/snippets, plus carried-forward name-fix files. Folio-QA-complete-source.zip is a complete fresh source checkout. Your locally configured wrangler.jsonc is not included in fixes.zip and must be kept. No schema migration is needed for these interaction fixes. Do not overwrite your current database UUID with the placeholder in the fresh full-source archive.

Files changed and reason:
- components/folio/auth-form.tsx: Duplicate/auth overlap guard, readable failures, Back handling, personal workspace navigation.
- components/folio/career.tsx: Use document navigation consistently; keep all existing page features.
- components/folio/constellation.tsx: Pointer lifecycle, unique gradient, renderer cleanup and static reset state.
- components/folio/dashboard.tsx: Use document navigation consistently; keep all existing page features.
- components/folio/discover.tsx: Use document navigation consistently; keep all existing page features.
- components/folio/entity-editor.tsx: Use document navigation consistently; keep all existing page features.
- components/folio/interview.tsx: Native navigation, readable request failures, stale suggestion cancellation.
- components/folio/jobs.tsx: Use document navigation consistently; keep all existing page features.
- components/folio/onboarding.tsx: Use document navigation consistently; keep all existing page features.
- components/folio/profile.tsx: Profile error handling, correct experience link, import preservation/errors, delete dialog behavior.
- components/folio/resume.tsx: Native navigation, bounded names, save guards, download compatibility, deletion handling.
- components/folio/settings.tsx: Export compatibility, safe delete cache reload, bounded requests and duplicate-delete guard.
- components/folio/shared.tsx: Support disabled dropdowns during saves.
- components/folio/shell.tsx: Reset page state per workspace and disable mode switches during saves.
- components/folio/signout-button.tsx: Sign-out double-click guard and readable bounded requests.
- components/folio/welcome.tsx: Use document navigation consistently; keep all existing page features.
- components/folio/workspace.tsx: Save guard, captured mode/cache, storage fallback, explicit personal login, Back restoration.
- components/ui/button.tsx: Default shared button to non-submit behavior.
- lib/auth/profile.ts: Extract verified-account contact defaults safely.
- lib/client-request.ts: Bound same-origin requests and translate HTTP/network/proxy failures.
- lib/engine/actions.ts: Atomic capture; preserve existing contribution when confirming imports.
- lib/engine/pdf.ts: Bound font fetch duration.
- lib/repository.ts: Persist missing personal contact fields; preserve customized values and isolation.
- lib/store.ts: Seed personal contact defaults before workspace read.
- lib/validation.ts: Trim input, align email bounds, accept atomic capture and confirmImport actions.
- app/api/workspace/route.ts: Use verified account metadata on personal workspace GET.
- app/auth/callback/route.ts: Open personal workspace after Google success.
- app/globals.css: Responsive modal width/scrolling, mobile field text and target sizing.
- tests/account-profile.test.ts: Automated regression coverage for changed behavior.
- tests/interactions.test.ts: Automated regression coverage for changed behavior.
- tests/repository.test.ts: Automated regression coverage for changed behavior.
- eslint.config.mjs: Document deliberate native navigation while retaining all other checks.

Every exact change follows (minus lines are BEFORE; plus lines are AFTER; @@ identifies the exact source positions):

```diff
--- before/components/folio/auth-form.tsx
+++ after/components/folio/auth-form.tsx
@@ -1,35 +1,45 @@
 "use client";
-import { useEffect, useState, type FormEvent } from "react";
+import { useEffect, useState, useRef, type FormEvent } from "react";
+import { fetchJson } from "@/lib/client-request";
 import { Orbit } from "lucide-react";
 
 export function AuthForm({ signup = false }: { signup?: boolean }) {
   const [error, setError] = useState("");
   const [busy, setBusy] = useState(false);
+  const submitting = useRef(false);
   useEffect(() => {
+    let active = true;
     if (new URLSearchParams(window.location.search).get("error") === "google")
-      setError("Google sign-in did not finish. Please try again or sign in with email.");
+      queueMicrotask(() => { if (active) setError("Google sign-in did not finish. Please try again or sign in with email."); });
+    const restored = () => { submitting.current = false; setBusy(false); };
+    window.addEventListener("pageshow", restored);
+    return () => { active = false; window.removeEventListener("pageshow", restored); };
   }, []);
   async function submit(event: FormEvent<HTMLFormElement>) {
     event.preventDefault();
+    if (submitting.current) return;
+    submitting.current = true;
     const data = new FormData(event.currentTarget);
     setBusy(true); setError("");
     try {
-      const response = await fetch(`/api/auth/${signup ? "signup" : "signin"}`, {
+      await fetchJson(`/api/auth/${signup ? "signup" : "signin"}`, {
         method: "POST", headers: { "Content-Type": "application/json" },
-        body: JSON.stringify({ email: data.get("email"), password: data.get("password"), ...(signup ? { name: data.get("name") } : {}) }),
+        body: JSON.stringify({ email: String(data.get("email") ?? "").trim(), password: data.get("password"), ...(signup ? { name: String(data.get("name") ?? "").trim() } : {}) }),
       });
-      const result = await response.json() as { error?: string };
-      if (!response.ok) throw Error(result.error ?? "Unable to sign in.");
       // A document navigation discards all cached data from any previous account.
-      window.location.assign("/dashboard");
-    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setBusy(false); }
+      window.location.assign("/dashboard?workspace=personal");
+    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); setBusy(false); submitting.current = false; }
   }
   return <main className="auth-page">
     <div className="auth-card">
       <a className="brand auth-brand" href="/"><Orbit size={28} /> folio<span className="brand-period">.</span></a>
       <h1>{signup ? "Create your account" : "Welcome back"}</h1>
       <p>{signup ? "Save your experience and build your next résumé." : "Sign in to continue your career workspace."}</p>
-      <a className="auth-google" href="/api/auth/google" aria-disabled={busy}>
+      <a className="auth-google" href="/api/auth/google" aria-disabled={busy} onClick={(e) => {
+        if (submitting.current) { e.preventDefault(); return; }
+        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
+        submitting.current = true; setBusy(true);
+      }}>
         <span aria-hidden="true">G</span> Continue with Google
       </a>
       <div className="auth-divider"><span>or use email</span></div>
--- before/components/folio/career.tsx
+++ after/components/folio/career.tsx
@@ -1,8 +1,6 @@
 "use client";
 import { newId } from "@/lib/engine/id";
-import Link from "next/link";
 import { useState } from "react";
-import { useRouter } from "next/navigation";
 import {
   ArrowLeft,
   ArrowRight,
@@ -24,6 +22,7 @@
 import { Input } from "@/components/ui/input";
 import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
 import { toast } from "sonner";
+import { fetchJson } from "@/lib/client-request";
 export function CareerExplorer({ id }: { id?: string }) {
   const { w, mutate, busy } = useWorkspace();
   const [query, setQuery] = useState("");
@@ -32,7 +31,6 @@
     occupation: unknown;
   } | null>(null);
   const [fetching, setFetching] = useState(false);
-  const router = useRouter();
   if (!w) return null;
   const careers = matchCareers(w);
   const career = id ? careers.find((c) => c.id === id) : null;
@@ -40,9 +38,7 @@
     if (!career) return;
     setFetching(true);
     try {
-      const r = await fetch(`/api/occupation?code=${career.code}`);
-      if (!r.ok) throw Error("Occupation unavailable");
-      setSource(await r.json());
+      setSource(await fetchJson(`/api/occupation?code=${encodeURIComponent(career.code)}`));
     } catch {
       toast.error(
         "Occupation information is unavailable. Try the source link.",
@@ -60,11 +56,11 @@
             title="A world of possible directions."
             description="Explore how your interests and evidence connect to the work people actually do."
             action={
-              <Link className="subtle-button" href="/interview">
+              <a className="subtle-button" href="/interview">
                 <Compass size={16} />
                 Refine my direction
                 <ArrowRight size={16} />
-              </Link>
+              </a>
             }
           />
           <Tabs defaultValue="map" className="career-tabs">
@@ -120,7 +116,7 @@
                   <Constellation
                     interactive
                     motion={w.profile.motion}
-                    onSelect={(id) => router.push(`/career/${id}`)}
+                    onSelect={(id) => window.location.assign(`/career/${id}`)}
                   />
                   <span className="graph-instruction">
                     Drag to explore · select a labeled path
@@ -158,7 +154,7 @@
                   .includes(query.toLowerCase()),
               )
               .map((c) => (
-                <Link
+                <a
                   href={`/career/${c.id}`}
                   className="career-card"
                   key={c.id}
@@ -193,7 +189,7 @@
                     connected
                     <ArrowRight size={15} />
                   </div>
-                </Link>
+                </a>
               ))}
           </div>
           <div className="method-note">
@@ -211,14 +207,14 @@
           title="Path not found"
           description="Choose a field from the career explorer."
           action="Explore careers"
-          onClick={() => router.push("/career")}
+          onClick={() => window.location.assign("/career")}
         />
       ) : (
         <>
-          <Link className="back-link" href="/career">
+          <a className="back-link" href="/career">
             <ArrowLeft size={15} />
             All career paths
-          </Link>
+          </a>
           <PageHeading
             eyebrow={`${career.cluster.toUpperCase()} · O*NET ${career.code}`}
             title={career.title}
--- before/components/folio/constellation.tsx
+++ after/components/folio/constellation.tsx
@@ -1,5 +1,5 @@
 "use client";
-import { useEffect, useRef, useState } from "react";
+import { useEffect, useRef, useState, useId } from "react";
 import { RotateCcw } from "lucide-react";
 import { CAREERS } from "@/lib/providers/careers";
 import type * as Three from "three";
@@ -13,6 +13,7 @@
   motion?: boolean;
 }) {
   const host = useRef<HTMLDivElement>(null);
+  const glowId = useId();
   const [failed, setFailed] = useState(false);
   const [reset, setReset] = useState(0);
   const callback = useRef(onSelect);
@@ -175,6 +176,7 @@
         const pointer = new T.Vector2();
         const resize = () => {
           const { width, height } = container.getBoundingClientRect();
+          if (!width || !height) return;
           renderer.setSize(width, height);
           camera.aspect = width / height;
           camera.updateProjectionMatrix();
@@ -184,16 +186,20 @@
         observer.observe(container);
         resize();
         const enter = (e: PointerEvent) => {
+          if (!interactive || e.button !== 0) return;
           drag = true;
           start = e.clientX;
           moved = false;
+          container.setPointerCapture(e.pointerId);
         };
         const move = (e: PointerEvent) => {
           const rect = container.getBoundingClientRect();
           if (drag && interactive) {
-            targetY += (e.clientX - start) * 0.008;
-            start = e.clientX;
-            moved = true;
+            if (moved || Math.abs(e.clientX - start) > 4) {
+              targetY += (e.clientX - start) * 0.008;
+              start = e.clientX;
+              moved = true;
+            }
           } else if (motion && !reduce) {
             targetY =
               ((e.clientX - rect.left - rect.width / 2) / rect.width) * 0.25;
@@ -202,8 +208,11 @@
           }
         };
         const up = (e: PointerEvent) => {
+          const wasDragging = drag;
+          const wasMoved = moved;
           drag = false;
-          if (!interactive || moved) return;
+          if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
+          if (!interactive || !wasDragging || wasMoved) return;
           const rect = container.getBoundingClientRect();
           pointer.set(
             ((e.clientX - rect.left) / rect.width) * 2 - 1,
@@ -231,6 +240,9 @@
         container.addEventListener("pointerdown", enter);
         container.addEventListener("pointermove", move);
         container.addEventListener("pointerup", up);
+        const cancel = () => { drag = false; moved = false; };
+        container.addEventListener("pointercancel", cancel);
+        container.addEventListener("lostpointercapture", cancel);
         const lost = (e: Event) => {
           e.preventDefault();
           setFailed(true);
@@ -243,6 +255,9 @@
           container.removeEventListener("pointerdown", enter);
           container.removeEventListener("pointermove", move);
           container.removeEventListener("pointerup", up);
+          container.removeEventListener("pointercancel", cancel);
+          container.removeEventListener("lostpointercapture", cancel);
+          renderer.domElement.removeEventListener("webglcontextlost", lost);
           scene.traverse((obj) => {
             const m = obj as Three.Mesh;
             if (m.geometry) m.geometry.dispose();
@@ -257,7 +272,7 @@
           renderer.domElement.remove();
         };
       })
-      .catch(() => setFailed(true));
+      .catch(() => { if (!disposed) setFailed(true); });
     return () => {
       disposed = true;
       clean();
@@ -273,12 +288,12 @@
           aria-hidden="true"
         >
           <defs>
-            <radialGradient id="node-glow">
+            <radialGradient id={glowId}>
               <stop stopColor="#a8edc8" stopOpacity=".18" />
               <stop offset="1" stopColor="#a8edc8" stopOpacity="0" />
             </radialGradient>
           </defs>
-          <circle cx="200" cy="170" r="155" fill="url(#node-glow)" />
+          <circle cx="200" cy="170" r="155" fill={`url(#${glowId})`} />
           <g stroke="#80bfa9" fill="none" strokeWidth=".8">
             <ellipse
               cx="200"
@@ -356,6 +371,8 @@
           className="graph-reset"
           onClick={() => setReset((x) => x + 1)}
           aria-label="Reset graph rotation"
+          disabled={failed}
+          title={failed ? "Rotation is unavailable in the static graph. Career labels still work." : "Reset graph rotation"}
         >
           <RotateCcw size={15} />
         </button>
--- before/components/folio/dashboard.tsx
+++ after/components/folio/dashboard.tsx
@@ -1,6 +1,4 @@
 "use client";
-import Link from "next/link";
-import { useRouter } from "next/navigation";
 import {
   ArrowRight,
   ArrowUpRight,
@@ -24,7 +22,6 @@
 import { Progress } from "@/components/ui/progress";
 export function Dashboard() {
   const { w } = useWorkspace();
-  const router = useRouter();
   if (!w) return null;
   const c = completeness(w),
     skills = skillEvidence(w).filter((s) => s.facts.length),
@@ -38,11 +35,11 @@
         title={`${w.mode === "demo" ? "Maya" : w.profile.name.split(" ")[0] || "Your story"}, meet your next chapter.`}
         description="Connect what you’ve done with what you could do next."
         action={
-          <Link className="subtle-button" href="/profile">
+          <a className="subtle-button" href="/profile">
             <Target size={16} />
             View your profile
             <ArrowUpRight size={15} />
-          </Link>
+          </a>
         }
       />
       <div className="overview-top">
@@ -59,7 +56,7 @@
               Your projects, part-time jobs, and small wins are pieces of a
               bigger story.
             </p>
-            <Primary onClick={() => router.push("/interview")}>
+            <Primary onClick={() => window.location.assign("/interview")}>
               Continue your interview
               <ArrowRight size={17} />
             </Primary>
@@ -71,7 +68,7 @@
           <div className="feature-graph">
             <Constellation
               motion={w.profile.motion}
-              onSelect={(id) => router.push(`/career/${id}`)}
+              onSelect={(id) => window.location.assign(`/career/${id}`)}
             />
           </div>
           <div className="feature-bottom">
@@ -98,10 +95,10 @@
               ? "You’ve described what you did. Adding an outcome will help someone understand why it mattered."
               : "A class project, part-time job, or helping a friend can be a useful place to begin."}
           </p>
-          <Link className="next-step-link" href="/interview">
+          <a className="next-step-link" href="/interview">
             {c.enough ? "Add the missing piece" : "Begin your interview"}
             <ArrowUpRight size={18} />
-          </Link>
+          </a>
           <div className="time-note">One focused question at a time</div>
         </Panel>
       </div>
@@ -183,7 +180,7 @@
           </PanelTitle>
           <div className="insight-list">
             {health.findings.slice(0, 3).map((f, i) => (
-              <Link href={`/${f.action}`} key={f.title}>
+              <a href={`/${f.action}`} key={f.title}>
                 <span
                   className={`insight-icon ${f.kind === "good" ? "good" : ""}`}
                 >
@@ -198,7 +195,7 @@
                   <p>{f.detail}</p>
                 </div>
                 <ChevronRight size={16} />
-              </Link>
+              </a>
             ))}
           </div>
           <div className="panel-footnote">
@@ -214,7 +211,7 @@
           </PanelTitle>
           <div className="career-mini-grid">
             {careers.slice(0, 3).map((c, i) => (
-              <Link href={`/career/${c.id}`} className="career-mini" key={c.id}>
+              <a href={`/career/${c.id}`} className="career-mini" key={c.id}>
                 <div className="career-mini-icon" style={{ color: c.color }}>
                   {i === 0 ? (
                     <GitBranch size={25} />
@@ -234,7 +231,7 @@
                 <span className="mini-arrow">
                   <ArrowUpRight size={17} />
                 </span>
-              </Link>
+              </a>
             ))}
           </div>
         </Panel>
@@ -244,7 +241,7 @@
           </PanelTitle>
           <div className="job-mini-list">
             {jobs.map((j) => (
-              <Link href={`/jobs/${j.id}`} key={j.id}>
+              <a href={`/jobs/${j.id}`} key={j.id}>
                 <div
                   className="company-symbol"
                   style={{ color: j.color, background: `${j.color}12` }}
@@ -262,7 +259,7 @@
                   </small>
                 </div>
                 <ArrowUpRight size={15} />
-              </Link>
+              </a>
             ))}
           </div>
         </Panel>
@@ -276,10 +273,10 @@
             all starts somewhere.
           </p>
         </div>
-        <Link href="/discover">
+        <a href="/discover">
           Find a hidden strength
           <ArrowRight size={17} />
-        </Link>
+        </a>
       </div>
     </>
   );
--- before/components/folio/discover.tsx
+++ after/components/folio/discover.tsx
@@ -1,8 +1,6 @@
 "use client";
 import { newId } from "@/lib/engine/id";
-import Link from "next/link";
 import { useState } from "react";
-import { useRouter } from "next/navigation";
 import {
   Wrench,
   GraduationCap,
@@ -117,7 +115,6 @@
 ];
 export function Discover() {
   const { w, mutate, busy } = useWorkspace();
-  const router = useRouter();
   const [selected, setSelected] = useState<number | null>(null);
   const [title, setTitle] = useState("");
   const [story, setStory] = useState("");
@@ -128,25 +125,19 @@
     const id = newId();
     try {
       await mutate({
-        type: "entity",
+        type: "capture",
         entity: {
           id,
           kind: item.kind as EntityKind,
-          title: title || item.title,
+          title: title.trim() || item.title,
           subtitle: "Discovered experience",
           dates: "",
         },
-      });
-      await mutate({
-        type: "answer",
-        entityId: id,
-        questionId: `${item.kind}.summary`,
-        value: story,
-        confirmed: true,
+        text: story,
       });
       toast.success("A new piece of your story, captured.");
       setSelected(null);
-      router.push(`/interview?entity=${encodeURIComponent(id)}`);
+      window.location.assign(`/interview?entity=${encodeURIComponent(id)}`);
     } catch {}
   }
   return (
@@ -200,10 +191,10 @@
             your first evidence.
           </p>
         </div>
-        <Link className="text-link" href="/career">
+        <a className="text-link" href="/career">
           Find a project
           <ArrowRight size={16} />
-        </Link>
+        </a>
       </div>
       <Dialog
         open={item !== null}
--- before/components/folio/entity-editor.tsx
+++ after/components/folio/entity-editor.tsx
@@ -34,11 +34,12 @@
   const [type, setType] = useState<EntityKind>(entity?.kind ?? kind);
   async function save(e: React.FormEvent) {
     e.preventDefault();
+    if (busy) return;
     const id = entity?.id ?? newId();
     try {
       await mutate({
         type: "entity",
-        entity: { id, title, subtitle, dates, kind: type },
+        entity: { id, title: title.trim(), subtitle, dates, kind: type },
       });
       toast.success(entity ? "Experience updated" : "Experience added");
       onClose();
--- before/components/folio/interview.tsx
+++ after/components/folio/interview.tsx
@@ -1,7 +1,6 @@
 "use client";
-import Link from "next/link";
 import { useSearchParams } from "next/navigation";
-import { useState } from "react";
+import { useState, useRef } from "react";
 import {
   ArrowRight,
   Plus,
@@ -32,6 +31,7 @@
 import { Progress } from "@/components/ui/progress";
 import { toast } from "sonner";
 import type { Suggestions } from "@/lib/providers/ai";
+import { fetchJson } from "@/lib/client-request";
 export function AnswerForm({
   q,
   entityId,
@@ -218,6 +218,7 @@
     suggestions: Suggestions;
   } | null>(null);
   const [aiBusy, setAiBusy] = useState(false);
+  const suggestionRequest = useRef(0);
   if (!w) return null;
   const requested = search.get("entity");
   const selected =
@@ -244,26 +245,21 @@
   const c = completeness(w);
   const remaining = queue.filter((q) => q.priority >= 80).length;
   async function suggest() {
+    const request = ++suggestionRequest.current;
     setAiBusy(true);
     try {
-      const response = await fetch("/api/ai", {
+      const data = await fetchJson<{ provider: string; suggestions: Suggestions }>("/api/ai", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ mode, entityId: selected }),
-      });
-      const data = (await response.json()) as {
-        provider: string;
-        suggestions: Suggestions;
-        error?: string;
-      };
-      if (!response.ok) throw Error(data.error);
-      setSuggestions(data);
+      }, 35000);
+      if (request === suggestionRequest.current) setSuggestions(data);
     } catch (e) {
-      toast.error(
+      if (request === suggestionRequest.current) toast.error(
         e instanceof Error ? e.message : "Unable to suggest questions.",
       );
     } finally {
-      setAiBusy(false);
+      if (request === suggestionRequest.current) setAiBusy(false);
     }
   }
   return (
@@ -273,11 +269,11 @@
         title="Let’s connect the dots."
         description="A thoughtful conversation. A stronger story. One question at a time."
         action={
-          <Link className="subtle-button" href="/resume">
+          <a className="subtle-button" href="/resume">
             <FileText size={16} />
             Build a draft
             <ArrowUpRightIcon />
-          </Link>
+          </a>
         }
       />
       <div className="interview-layout">
@@ -288,6 +284,9 @@
             onClick={() => {
               setEntityId("profile");
               setEdit(null);
+              setSuggestions(null);
+              suggestionRequest.current += 1;
+              setAiBusy(false);
             }}
           >
             <span className="outline-number">01</span>
@@ -304,6 +303,8 @@
                 setEntityId(x.id);
                 setEdit(null);
                 setSuggestions(null);
+                suggestionRequest.current += 1;
+                setAiBusy(false);
               }}
             >
               <span className="outline-number">
@@ -330,10 +331,10 @@
             <p>
               No formal experience? A class project or helping someone counts.
             </p>
-            <Link href="/discover">
+            <a href="/discover">
               Find a starting point
               <ArrowRight size={14} />
-            </Link>
+            </a>
           </div>
         </aside>
         <div className="interview-main">
@@ -380,7 +381,7 @@
                 q={q}
                 entityId={selected}
                 fact={editing}
-                onSaved={() => setEdit(null)}
+                onSaved={() => { setEdit(null); setSuggestions(null); }}
               />
             ) : (
               <Empty
--- before/components/folio/jobs.tsx
+++ after/components/folio/jobs.tsx
@@ -1,7 +1,5 @@
 "use client";
-import Link from "next/link";
 import { useState } from "react";
-import { useRouter } from "next/navigation";
 import {
   Search,
   Bookmark,
@@ -35,7 +33,6 @@
 import { toast } from "sonner";
 export function Jobs({ id }: { id?: string }) {
   const { w, mutate, busy } = useWorkspace();
-  const router = useRouter();
   const [query, setQuery] = useState("");
   const [mode, setMode] = useState("Any");
   const [savedOnly, setSavedOnly] = useState(false);
@@ -66,7 +63,7 @@
       toast.success(
         "Created a tailored draft. Review and approve its evidence.",
       );
-      router.push(`/resume/${next.resumes[0].id}`);
+      window.location.assign(`/resume/${next.resumes[0].id}`);
     } catch {}
   }
   const match = job ? analyzeJob(job.description, w) : result;
@@ -172,9 +169,9 @@
                         )}
                       </button>
                     </div>
-                    <Link href={`/jobs/${j.id}`}>
+                    <a href={`/jobs/${j.id}`}>
                       <h2>{j.title}</h2>
-                    </Link>
+                    </a>
                     <div className="job-location">
                       <MapPin size={14} />
                       {j.location}
@@ -222,10 +219,10 @@
                         ))}
                       </ul>
                     </details>
-                    <Link className="job-card-link" href={`/jobs/${j.id}`}>
+                    <a className="job-card-link" href={`/jobs/${j.id}`}>
                       See the fit
                       <ArrowUpRight size={16} />
-                    </Link>
+                    </a>
                   </Panel>
                 ))}
               </div>
@@ -328,14 +325,14 @@
           title="Opportunity not found"
           description="Explore the example opportunities or analyze your own job description."
           action="Back to opportunities"
-          onClick={() => router.push("/jobs")}
+          onClick={() => window.location.assign("/jobs")}
         />
       ) : (
         <>
-          <Link className="back-link" href="/jobs">
+          <a className="back-link" href="/jobs">
             <ArrowLeft size={15} />
             All opportunities
-          </Link>
+          </a>
           <PageHeading
             eyebrow={`${job.company.toUpperCase()} · FICTIONAL EXAMPLE`}
             title={job.title}
--- before/components/folio/onboarding.tsx
+++ after/components/folio/onboarding.tsx
@@ -1,12 +1,10 @@
 "use client";
-import { useRouter } from "next/navigation";
 import { useWorkspace } from "./workspace";
 import { PageHeading, Panel, Tag } from "./shared";
 import { ProfileForm } from "./profile";
 import { ShieldCheck } from "lucide-react";
 export function Onboarding() {
   const { w, mutate, mode } = useWorkspace();
-  const router = useRouter();
   if (!w) return null;
   return (
     <>
@@ -30,7 +28,7 @@
             onboarding
             onSave={async (p) => {
               await mutate({ type: "profile", profile: p });
-              router.push("/interview");
+              window.location.assign("/interview");
             }}
           />
         </Panel>
--- before/components/folio/profile.tsx
+++ after/components/folio/profile.tsx
@@ -1,5 +1,4 @@
 "use client";
-import Link from "next/link";
 import { useState } from "react";
 import { useForm, useWatch } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
@@ -76,6 +75,7 @@
     defaultValues: initial,
   });
   const target = useWatch({ control, name: "target" });
+  const [saveError, setSaveError] = useState("");
   const year = useWatch({ control, name: "year" });
   const fields: {
     key: keyof Profile;
@@ -145,7 +145,16 @@
       },
     );
   return (
-    <form onSubmit={handleSubmit(onSave)} className="form-stack">
+    <form onSubmit={handleSubmit(async (p) => {
+      setSaveError("");
+      const profile = { ...p, name: p.name.trim(), email: p.email.trim(), school: p.school.trim(), degree: p.degree.trim() };
+      if (!profile.name || !profile.email || !profile.school || !profile.degree) {
+        setSaveError("Enter your name, email, school, and degree. Spaces alone are not enough.");
+        return;
+      }
+      try { await onSave(profile); }
+      catch (error) { setSaveError(error instanceof Error ? error.message : "Unable to save your profile."); }
+    })} className="form-stack">
       <div className="form-grid">
         {fields.map((f) => (
           <div key={f.key}>
@@ -156,7 +165,7 @@
               placeholder={f.placeholder}
               type={f.type ?? "text"}
               required={f.required}
-              maxLength={250}
+              maxLength={f.key === "email" ? 254 : 250}
             />
             {errors[f.key] && (
               <p className="form-error">{errors[f.key]?.message}</p>
@@ -203,6 +212,7 @@
           background information is needed.
         </p>
       </div>
+      {saveError && <p className="form-error" role="alert">{saveError}</p>}
       <Primary type="submit" disabled={isSubmitting}>
         {isSubmitting
           ? "Saving..."
@@ -412,8 +422,9 @@
                           {!f.confirmed && (
                             <button
                               className="text-link"
+                              disabled={busy}
                               onClick={() =>
-                                void mutate({
+                                void mutate(f.questionId === "import.resume" ? { type: "confirmImport", id: f.id } : {
                                   type: "answer",
                                   entityId: e.id,
                                   questionId: `${e.kind}.action`,
@@ -462,13 +473,13 @@
                     details.
                   </p>
                 )}
-                <Link
+                <a
                   className="text-link experience-followup"
-                  href="/interview"
+                  href={`/interview?entity=${encodeURIComponent(e.id)}`}
                 >
                   Develop this experience
                   <ArrowRight size={15} />
-                </Link>
+                </a>
               </Panel>
             ))
           )}
@@ -566,7 +577,7 @@
           )}
         </DialogContent>
       </Dialog>
-      <AlertDialog open={!!remove} onOpenChange={(v) => !v && setRemove(null)}>
+      <AlertDialog open={!!remove} onOpenChange={(v) => !v && !busy && setRemove(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>
@@ -579,15 +590,14 @@
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
-            <AlertDialogCancel>Keep it</AlertDialogCancel>
+            <AlertDialogCancel disabled={busy}>Keep it</AlertDialogCancel>
             <AlertDialogAction
               disabled={busy}
-              onClick={() =>
-                remove &&
-                void mutate({ type: remove.kind, id: remove.id })
-                  .then(() => setRemove(null))
-                  .catch(() => {})
-              }
+              onClick={(event) => {
+                event.preventDefault();
+                if (remove) void mutate({ type: remove.kind, id: remove.id })
+                  .then(() => setRemove(null)).catch(() => {});
+              }}
             >
               Remove
             </AlertDialogAction>
@@ -621,7 +631,8 @@
                   toast.error("Choose a text file under 50 KB.");
                   return;
                 }
-                setImportText((await file.text()).slice(0, 1800));
+                try { setImportText((await file.text()).slice(0, 1800)); }
+                catch { toast.error("That file could not be read. Try another TXT file or paste the text."); }
               }
             }}
           />
@@ -633,7 +644,7 @@
             placeholder="Paste one relevant contribution (up to 1,800 characters)."
           />
           <Primary
-            disabled={!w.entities.length || !importText || busy}
+            disabled={!w.entities.length || importText.trim().length < 2 || busy}
             onClick={() => void importFact()}
           >
             Import for review
--- before/components/folio/resume.tsx
+++ after/components/folio/resume.tsx
@@ -1,7 +1,5 @@
 "use client";
-import Link from "next/link";
 import { useState } from "react";
-import { useRouter } from "next/navigation";
 import {
   Plus,
   Download,
@@ -151,7 +149,6 @@
 }
 export function ResumeStudio({ id }: { id?: string }) {
   const { w, mutate, busy } = useWorkspace();
-  const router = useRouter();
   const [create, setCreate] = useState(false);
   const [name, setName] = useState("");
   const [template, setTemplate] = useState<Template>("technical");
@@ -171,12 +168,12 @@
     try {
       const next = await mutate({
         type: "generate",
-        name: name || `${w!.profile.target || "My"} résumé`,
+        name: (name.trim() || `${w!.profile.target || "My"} résumé`).slice(0, 120),
         target: w!.profile.target,
         template,
       });
       setCreate(false);
-      router.push(`/resume/${next.resumes[0].id}`);
+      window.location.assign(`/resume/${next.resumes[0].id}`);
       toast.success("Draft created from your confirmed facts.");
     } catch {}
   }
@@ -207,7 +204,9 @@
       const a = document.createElement("a");
       a.href = url;
       a.download = `${r.profileSnapshot.name.replace(/[^a-z0-9]/gi, "-") || "resume"}-${r.template}.pdf`;
+      document.body.appendChild(a);
       a.click();
+      a.remove();
       setTimeout(() => URL.revokeObjectURL(url), 30000);
       toast.success(
         `PDF downloaded · ${result.pages} page${result.pages === 1 ? "" : "s"}`,
@@ -274,7 +273,7 @@
           {w.resumes.length ? (
             <div className="resume-grid">
               {w.resumes.map((r) => (
-                <Link
+                <a
                   className="resume-card"
                   key={r.id}
                   href={`/resume/${r.id}`}
@@ -298,7 +297,7 @@
                     </p>
                     <ArrowRight size={19} />
                   </div>
-                </Link>
+                </a>
               ))}
               <button
                 className="new-resume-card"
@@ -336,14 +335,14 @@
           title="This résumé isn’t here."
           description="It may have been deleted, or you may be viewing a different workspace."
           action="Back to studio"
-          onClick={() => router.push("/resume")}
+          onClick={() => window.location.assign("/resume")}
         />
       ) : (
         <>
-          <Link className="back-link" href="/resume">
+          <a className="back-link" href="/resume">
             <ArrowLeft size={15} />
             All résumé versions
-          </Link>
+          </a>
           <PageHeading
             eyebrow={`RÉSUMÉ STUDIO · REVISION ${r.revision}`}
             title={r.name}
@@ -371,6 +370,7 @@
             <div className="button-row">
               <Pick
                 label="Résumé template"
+                disabled={busy}
                 value={r.template}
                 onChange={(v) =>
                   void save({
@@ -403,7 +403,7 @@
               <button
                 className="subtle-button"
                 onClick={() => {
-                  setName(`${r.name} · refreshed`);
+                  setName(`${r.name} · refreshed`.slice(0, 120));
                   setTemplate(r.template);
                   setCreate(true);
                 }}
@@ -711,6 +711,7 @@
             <Button
               variant="ghost"
               className="danger-text"
+              disabled={busy}
               onClick={() =>
                 void save({
                   ...r,
@@ -807,7 +808,7 @@
             disabled={!newName.trim() || busy}
             onClick={() =>
               r &&
-              void save({ ...r, name: newName }).then(
+              void save({ ...r, name: newName.trim() }).then(
                 (ok) => ok && setRename(false),
               )
             }
@@ -816,7 +817,7 @@
           </Primary>
         </DialogContent>
       </Dialog>
-      <AlertDialog open={remove} onOpenChange={setRemove}>
+      <AlertDialog open={remove} onOpenChange={(v) => { if (!busy) setRemove(v); }}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Delete this résumé version?</AlertDialogTitle>
@@ -826,14 +827,14 @@
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
-            <AlertDialogCancel>Keep version</AlertDialogCancel>
+            <AlertDialogCancel disabled={busy}>Keep version</AlertDialogCancel>
             <AlertDialogAction
-              onClick={() =>
-                r &&
-                void mutate({ type: "deleteResume", id: r.id })
-                  .then(() => router.push("/resume"))
-                  .catch(() => {})
-              }
+              disabled={busy}
+              onClick={(event) => {
+                event.preventDefault();
+                if (r) void mutate({ type: "deleteResume", id: r.id })
+                  .then(() => window.location.assign("/resume")).catch(() => {});
+              }}
             >
               Delete version
             </AlertDialogAction>
--- before/components/folio/settings.tsx
+++ after/components/folio/settings.tsx
@@ -1,6 +1,6 @@
 "use client";
 import { SignoutButton } from "./signout-button";
-import { useState } from "react";
+import { useState, useRef } from "react";
 import {
   Download,
   ShieldCheck,
@@ -9,7 +9,6 @@
   Orbit,
   Trash2,
   RotateCcw,
-  LogOut,
   ExternalLink,
 } from "lucide-react";
 import { useWorkspace } from "./workspace";
@@ -28,11 +27,13 @@
   AlertDialogAction,
 } from "@/components/ui/alert-dialog";
 import { toast } from "sonner";
+import { fetchJson } from "@/lib/client-request";
 export function Settings() {
-  const { w, mutate, busy, refresh, setMode } = useWorkspace();
+  const { w, mutate, busy, setMode } = useWorkspace();
   const [remove, setRemove] = useState<"profile" | "account" | null>(null);
   const [confirm, setConfirm] = useState("");
   const [deleting, setDeleting] = useState(false);
+  const deletion = useRef(false);
   if (!w) return null;
   function exportData() {
     const blob = new Blob([JSON.stringify(w, null, 2)], {
@@ -42,28 +43,30 @@
     const a = document.createElement("a");
     a.href = url;
     a.download = "folio-profile-export.json";
+    document.body.appendChild(a);
     a.click();
-    setTimeout(() => URL.revokeObjectURL(url), 2000);
+    a.remove();
+    setTimeout(() => URL.revokeObjectURL(url), 30000);
     toast.success("Your profile data has been downloaded.");
   }
   async function deleteData() {
+    if (deletion.current || busy || confirm !== "DELETE") return;
+    deletion.current = true;
     try {
       setDeleting(true);
       if (remove === "account") {
-        const r = await fetch("/api/workspace", {
+        await fetchJson("/api/workspace", {
           method: "DELETE",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ confirm }),
         });
-        if (!r.ok)
-          throw Error("Your data could not be deleted. Please try again.");
         setMode("personal");
-        refresh();
+        // Discard both account workspace caches after deleting both workspaces.
+        window.location.assign("/profile?workspace=personal");
+        return;
       } else await mutate({ type: "reset" });
       toast.success(
-        remove === "account"
-          ? "All Folio account data deleted"
-          : w!.mode === "demo"
+        w!.mode === "demo"
             ? "Demo restored"
             : "Profile cleared",
       );
@@ -73,6 +76,7 @@
       toast.error(e instanceof Error ? e.message : "Deletion failed.");
     } finally {
       setDeleting(false);
+      deletion.current = false;
     }
   }
   return (
@@ -261,7 +265,7 @@
       </div>
       <AlertDialog
         open={remove !== null}
-        onOpenChange={(v) => !v && setRemove(null)}
+        onOpenChange={(v) => !v && !deleting && !busy && setRemove(null)}
       >
         <AlertDialogContent>
           <AlertDialogHeader>
@@ -288,9 +292,9 @@
             autoComplete="off"
           />
           <AlertDialogFooter>
-            <AlertDialogCancel>Keep my data</AlertDialogCancel>
+            <AlertDialogCancel disabled={deleting || busy}>Keep my data</AlertDialogCancel>
             <AlertDialogAction
-              disabled={confirm !== "DELETE" || deleting}
+              disabled={confirm !== "DELETE" || deleting || busy}
               onClick={(e) => {
                 e.preventDefault();
                 void deleteData();
--- before/components/folio/shared.tsx
+++ after/components/folio/shared.tsx
@@ -68,14 +68,16 @@
   onChange,
   options,
   label,
+  disabled = false,
 }: {
   value: string;
   onChange: (v: string) => void;
   options: (string | { value: string; label: string })[];
   label: string;
+  disabled?: boolean;
 }) {
   return (
-    <Select value={value} onValueChange={onChange}>
+    <Select value={value} onValueChange={onChange} disabled={disabled}>
       <SelectTrigger className="pick" aria-label={label}>
         <SelectValue placeholder={label} />
       </SelectTrigger>
--- before/components/folio/shell.tsx
+++ after/components/folio/shell.tsx
@@ -1,5 +1,5 @@
 "use client";
-import { useEffect, useState, type ReactNode } from "react";
+import { Fragment, useEffect, useState, type ReactNode } from "react";
 import { usePathname } from "next/navigation";
 import {
   Orbit,
@@ -171,6 +171,7 @@
             <button
               aria-label="Switch profile"
               className="icon-button"
+              disabled={busy}
               onClick={() => setMode(mode === "demo" ? "personal" : "demo")}
             >
               <ArrowRight size={17} />
@@ -230,6 +231,7 @@
             </span>
           </div>
           <button
+            disabled={busy}
             onClick={() => {
               setMode(mode === "demo" ? "personal" : "demo");
               if (mode === "demo") window.location.assign("/onboarding");
@@ -265,7 +267,7 @@
               </div>
             </div>
           ) : (
-            children
+            <Fragment key={mode}>{children}</Fragment>
           )}
         </main>
         <footer className="app-footer">
--- before/components/folio/signout-button.tsx
+++ after/components/folio/signout-button.tsx
@@ -1,16 +1,19 @@
 "use client";
-import { useState } from "react";
+import { useState, useRef } from "react";
+import { fetchJson } from "@/lib/client-request";
 import { LogOut } from "lucide-react";
 export function SignoutButton() {
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState("");
+  const submitting = useRef(false);
   async function signout() {
+    if (submitting.current) return;
+    submitting.current = true;
     setBusy(true); setError("");
     try {
-      const response = await fetch("/api/auth/signout", { method: "POST" });
-      if (!response.ok) throw Error("Unable to sign out. Please try again.");
+      await fetchJson("/api/auth/signout", { method: "POST" }, 35000);
       window.location.assign("/signin");
-    } catch (e) { setError(e instanceof Error ? e.message : "Unable to sign out."); setBusy(false); }
+    } catch (e) { setError(e instanceof Error ? e.message : "Unable to sign out."); setBusy(false); submitting.current = false; }
   }
   return <><button className="subtle-button signout" onClick={signout} disabled={busy}><LogOut size={16} />{busy ? "Signing out…" : "Sign out"}</button>{error && <p role="alert">{error}</p>}</>;
 }
--- before/components/folio/welcome.tsx
+++ after/components/folio/welcome.tsx
@@ -1,5 +1,4 @@
 "use client";
-import Link from "next/link";
 import {
   ArrowRight,
   MessagesSquare,
@@ -11,10 +10,8 @@
 import { Constellation } from "./constellation";
 import { useWorkspace } from "./workspace";
 import { Tag, Primary, Panel } from "./shared";
-import { useRouter } from "next/navigation";
 export function Welcome() {
   const { w, setMode } = useWorkspace();
-  const router = useRouter();
   return (
     <>
       <section className="welcome-hero">
@@ -33,25 +30,25 @@
             <Primary
               onClick={() => {
                 setMode("personal");
-                router.push("/onboarding");
+                window.location.assign("/onboarding");
               }}
             >
               Find my starting point
               <ArrowRight size={17} />
             </Primary>
-            <Link
+            <a
               className="subtle-button"
               href="/dashboard"
               onClick={() => setMode("demo")}
             >
               Explore Maya’s demo
-            </Link>
+            </a>
           </div>
         </div>
         <div>
           <Constellation
             motion={w?.profile.motion ?? true}
-            onSelect={(id) => router.push(`/career/${id}`)}
+            onSelect={(id) => window.location.assign(`/career/${id}`)}
           />
         </div>
       </section>
--- before/components/folio/workspace.tsx
+++ after/components/folio/workspace.tsx
@@ -3,6 +3,8 @@
   createContext,
   useContext,
   useState,
+  useRef,
+  useEffect,
   useSyncExternalStore,
   type ReactNode,
 } from "react";
@@ -16,6 +18,7 @@
 import { toast } from "sonner";
 import type { Workspace } from "@/lib/engine/model";
 import type { Action } from "@/lib/validation";
+import { fetchJson } from "@/lib/client-request";
 type Mode = "demo" | "personal";
 interface Context {
   w: Workspace | undefined;
@@ -36,13 +39,15 @@
     window.removeEventListener("storage", cb);
   };
 }
+let memoryMode: Mode = "personal";
 function storedMode(): Mode {
-  return localStorage.getItem("folio-mode") === "personal"
-    ? "personal"
-    : "demo";
+  if (new URLSearchParams(window.location.search).get("workspace") === "personal") return "personal";
+  try { return localStorage.getItem("folio-mode") === "demo" ? "demo" : "personal"; }
+  catch { return memoryMode; }
 }
 function setStoredMode(m: Mode) {
-  localStorage.setItem("folio-mode", m);
+  memoryMode = m;
+  try { localStorage.setItem("folio-mode", m); } catch { /* In-memory mode still works when storage is blocked. */ }
   window.dispatchEvent(new Event("folio-mode"));
 }
 export function useWorkspace() {
@@ -50,20 +55,30 @@
   if (!c) throw Error("Workspace provider required");
   return c;
 }
-async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
-  const response = await fetch(url, options);
-  const data = (await response.json()) as T & { error?: string };
-  if (!response.ok)
-    throw Error(data.error ?? "Something went wrong. Please try again.");
-  return data;
-}
 function DataProvider({ children }: { children: ReactNode }) {
+  const saving = useRef(false);
+  useEffect(() => {
+    const restored = (event: PageTransitionEvent) => {
+      if (event.persisted) window.location.reload();
+    };
+    window.addEventListener("pageshow", restored);
+    if (new URLSearchParams(window.location.search).get("workspace") === "personal") {
+      setStoredMode("personal");
+      const url = new URL(window.location.href);
+      url.searchParams.delete("workspace");
+      window.history.replaceState(window.history.state, "", url);
+    }
+    return () => window.removeEventListener("pageshow", restored);
+  }, []);
   const mode = useSyncExternalStore(
     subscribeMode,
     storedMode,
-    (): Mode => "demo",
+    (): Mode => "personal",
   );
-  const setMode = setStoredMode;
+  const setMode = (next: Mode) => {
+    if (saving.current) { toast.info("Wait for your save to finish before switching workspaces."); return; }
+    setStoredMode(next);
+  };
   const cache = useQueryClient();
   const query = useQuery<Workspace>({
     queryKey: ["workspace", mode],
@@ -72,17 +87,17 @@
     refetchOnWindowFocus: false,
   });
   const mutation = useMutation({
-    mutationFn: async (action: Action) => {
-      const latest = cache.getQueryData<Workspace>(["workspace", mode]);
+    mutationFn: async ({ action, mode: saveMode }: { action: Action; mode: Mode }) => {
+      const latest = cache.getQueryData<Workspace>(["workspace", saveMode]);
       if (!latest) throw Error("Wait for your profile to load.");
       return fetchJson<Workspace>("/api/workspace", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
-        body: JSON.stringify({ mode, revision: latest.revision, action }),
+        body: JSON.stringify({ mode: saveMode, revision: latest.revision, action }),
       }) as Promise<Workspace>;
     },
-    onSuccess: (data: Workspace) =>
-      cache.setQueryData(["workspace", mode], data),
+    onSuccess: (data: Workspace, variables) =>
+      cache.setQueryData(["workspace", variables.mode], data),
     onError: (e: Error) => toast.error(e.message),
   });
   return (
@@ -94,7 +109,16 @@
         busy: mutation.isPending,
         mode,
         setMode,
-        mutate: mutation.mutateAsync,
+        mutate: async (action) => {
+          if (saving.current) {
+            const error = Error("A save is already in progress. Wait for it to finish.");
+            toast.error(error.message);
+            throw error;
+          }
+          saving.current = true;
+          try { return await mutation.mutateAsync({ action, mode }); }
+          finally { saving.current = false; }
+        },
         refresh: () => void query.refetch(),
       }}
     >
--- before/components/ui/button.tsx
+++ after/components/ui/button.tsx
@@ -43,6 +43,7 @@
   variant = "default",
   size = "default",
   asChild = false,
+  type = "button",
   ...props
 }: React.ComponentProps<"button"> &
   VariantProps<typeof buttonVariants> & {
@@ -56,6 +57,7 @@
       data-variant={variant}
       data-size={size}
       className={cn(buttonVariants({ variant, size, className }))}
+      {...(!asChild ? { type } : {})}
       {...props}
     />
   )
--- before/lib/auth/profile.ts
+++ after/lib/auth/profile.ts
@@ -0,0 +1,11 @@
+import type { AuthUser } from "./core.ts";
+
+export function accountProfile(user: AuthUser) {
+  const metadata = user.user_metadata;
+  const name = [metadata?.full_name, metadata?.name]
+    .find(value => typeof value === "string" && value.trim());
+  return {
+    name: typeof name === "string" ? name.trim().slice(0, 100) : "",
+    email: typeof user.email === "string" ? user.email.trim().slice(0, 254) : "",
+  };
+}
--- before/lib/client-request.ts
+++ after/lib/client-request.ts
@@ -0,0 +1,16 @@
+// Same-origin JSON requests have bounded waits and readable proxy/network errors.
+export async function fetchJson<T>(url: string, options: RequestInit = {}, timeout = 20000): Promise<T> {
+  let response: Response;
+  try {
+    response = await fetch(url, { ...options, signal: options.signal ?? AbortSignal.timeout(timeout) });
+  } catch (error) {
+    if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name))
+      throw Error("The request timed out. Refresh to check whether it saved before trying again.");
+    throw Error("Unable to connect. Check your connection and try again.");
+  }
+  let data: T & { error?: string };
+  try { data = await response.json(); }
+  catch { throw Error(`The server returned an unexpected response (${response.status}). Please try again.`); }
+  if (!response.ok) throw Error(data.error || `The request failed (${response.status}). Please try again.`);
+  return data;
+}
--- before/lib/engine/actions.ts
+++ after/lib/engine/actions.ts
@@ -33,6 +33,12 @@
     }
   };
   switch (a.type) {
+    case "capture": {
+      w = applyAction(w, { type: "entity", entity: a.entity });
+      w = applyAction(w, { type: "answer", entityId: a.entity.id,
+        questionId: `${a.entity.kind}.summary`, value: a.text, confirmed: true });
+      break;
+    }
     case "profile": {
       for (const key of ["website", "linkedin", "github"] as const) {
         if (a.profile[key]) {
@@ -134,6 +140,21 @@
     case "deleteFact": {
       invalidate([a.id]);
       w.facts = w.facts.filter((f) => f.id !== a.id);
+      break;
+    }
+    case "confirmImport": {
+      const imported = w.facts.find((f) => f.id === a.id && f.questionId === "import.resume");
+      if (!imported || imported.confirmed) throw Error("Choose an unconfirmed imported contribution.");
+      const entity = w.entities.find((e) => e.id === imported.entityId);
+      if (!entity) throw Error("Experience not found.");
+      const questionId = `${entity.kind}.action`;
+      const existing = w.facts.find((f) => f.entityId === entity.id && f.questionId === questionId);
+      const value = [existing?.value !== "__skipped__" ? existing?.value : "", imported.value].filter(Boolean).join("\n");
+      w = applyAction(w, { type: "answer", entityId: entity.id, questionId, value, confirmed: true });
+      const source = w.facts.find((f) => f.id === imported.id)!;
+      source.confirmed = true;
+      source.revision += 1;
+      source.updatedAt = now;
       break;
     }
     case "generate": {
--- before/lib/engine/pdf.ts
+++ after/lib/engine/pdf.ts
@@ -35,7 +35,7 @@
   w: Workspace,
   r: Resume,
   loadFont: (name: string) => Promise<Uint8Array> = async (name) => {
-    const response = await fetch(`/fonts/${name}.ttf`);
+    const response = await fetch(`/fonts/${name}.ttf`, { signal: AbortSignal.timeout(20000) });
     if (!response.ok) throw Error("The export font could not be loaded.");
     return new Uint8Array(await response.arrayBuffer());
   },
--- before/lib/repository.ts
+++ after/lib/repository.ts
@@ -8,6 +8,27 @@
   type Fact,
 } from "./engine/model.ts";
 export const profileId = (user: string, mode: string) => `${user}:${mode}`;
+// Seed only missing personal contact fields. SQL guards against concurrent edits
+// and keeps every other profile field, resume, and fact intact.
+export async function seedAccountProfile(
+  db: D1Database, user: string, contact: { name: string; email: string },
+) {
+  if (!contact.name && !contact.email) return;
+  const pid = profileId(user, "personal");
+  const profile = emptyWorkspace().profile;
+  const now = new Date().toISOString();
+  await db.batch([
+    db.prepare("INSERT INTO profiles(id,user_id,mode,data,revision,write_token,updated_at) VALUES(?,?,?,?,0,?,?) ON CONFLICT(id) DO NOTHING")
+      .bind(pid, user, "personal", JSON.stringify(profile), "", now),
+    db.prepare(`UPDATE profiles SET data=json_set(data,
+      '$.name', CASE WHEN trim(coalesce(json_extract(data,'$.name'),''))='' THEN ? ELSE json_extract(data,'$.name') END,
+      '$.email', CASE WHEN trim(coalesce(json_extract(data,'$.email'),''))='' THEN ? ELSE json_extract(data,'$.email') END),
+      revision=revision+1,updated_at=? WHERE id=? AND
+      ((trim(coalesce(json_extract(data,'$.name'),''))='' AND ?!='') OR
+       (trim(coalesce(json_extract(data,'$.email'),''))='' AND ?!=''))`)
+      .bind(contact.name, contact.email, now, pid, contact.name, contact.email),
+  ]);
+}
 export async function loadWorkspace(
   db: D1Database,
   user: string,
--- before/lib/store.ts
+++ after/lib/store.ts
@@ -1,8 +1,13 @@
 import { database } from "./server";
 import * as repository from "./repository";
 import type { Workspace } from "./engine/model";
-export const loadWorkspace = (user: string, mode: "demo" | "personal") =>
-  repository.loadWorkspace(database(), user, mode);
+import type { AuthUser } from "./auth/core";
+import { accountProfile } from "./auth/profile";
+export const loadWorkspace = async (user: string, mode: "demo" | "personal", account?: AuthUser) => {
+  const db = database();
+  if (mode === "personal" && account) await repository.seedAccountProfile(db, user, accountProfile(account));
+  return repository.loadWorkspace(db, user, mode);
+};
 export const saveWorkspace = (user: string, w: Workspace, expected: number) =>
   repository.saveWorkspace(database(), user, w, expected);
 export const deleteAccount = (user: string) =>
--- before/lib/validation.ts
+++ after/lib/validation.ts
@@ -8,7 +8,7 @@
 export const ProfileSchema = z
   .object({
     name: short,
-    email: z.union([z.literal(""), z.string().email().max(250)]),
+    email: z.union([z.literal(""), z.string().email().max(254)]),
     phone: short,
     location: short,
     linkedin: short,
@@ -31,7 +31,7 @@
   .object({
     id,
     kind: z.enum(["experience", "project", "activity", "education"]),
-    title: z.string().min(1).max(150),
+    title: z.string().trim().min(1).max(150),
     subtitle: short,
     dates: short,
   })
@@ -77,8 +77,10 @@
     confirmed: z.boolean(),
   }),
   z.object({ type: z.literal("entity"), entity: EntitySchema }),
+  z.object({ type: z.literal("capture"), entity: EntitySchema, text: z.string().trim().min(2).max(1800) }),
   z.object({ type: z.literal("deleteEntity"), id }),
   z.object({ type: z.literal("deleteFact"), id }),
+  z.object({ type: z.literal("confirmImport"), id }),
   z.object({
     type: z.literal("generate"),
     name: z.string().min(1).max(120),
@@ -93,7 +95,7 @@
   z.object({
     type: z.literal("import"),
     entityId: id,
-    text: z.string().min(2).max(1800),
+    text: z.string().trim().min(2).max(1800),
   }),
   z.object({ type: z.literal("reset") }),
 ]);
--- before/app/api/workspace/route.ts
+++ after/app/api/workspace/route.ts
@@ -2,17 +2,19 @@
 import { loadWorkspace, saveWorkspace, deleteAccount } from "@/lib/store";
 import { RequestSchema } from "@/lib/validation";
 import { applyAction } from "@/lib/engine/actions";
+import { currentUser } from "@/lib/auth/server";
 export const dynamic = "force-dynamic";
 export async function GET(request: Request) {
   try {
-    const user = await identity();
+    const account = await currentUser();
+    const user = account ? `supabase:${account.id}` : null;
     if (!user)
       return json({ error: "Sign in to save and access your workspace." }, 401);
     const mode =
       new URL(request.url).searchParams.get("mode") === "personal"
         ? "personal"
         : "demo";
-    return json(await loadWorkspace(user, mode));
+    return json(await loadWorkspace(user, mode, account ?? undefined));
   } catch (e) {
     return json(
       {
--- before/app/auth/callback/route.ts
+++ after/app/auth/callback/route.ts
@@ -10,7 +10,7 @@
     if (!code || code.length > 2048 || !verifier || !/^[a-f0-9]{96}$/.test(verifier)) throw Error("Invalid callback");
     const session = await authRequest<Session>("token?grant_type=pkce", { auth_code: code, code_verifier: verifier });
     if (!sessionValid(session)) throw Error("Invalid session");
-    return verifierCookie(sessionCookies(NextResponse.redirect(new URL("/dashboard", url)), request, session), request);
+    return verifierCookie(sessionCookies(NextResponse.redirect(new URL("/dashboard?workspace=personal", url)), request, session), request);
   } catch {
     return verifierCookie(NextResponse.redirect(new URL("/signin?error=google", url)), request);
   }
--- before/app/globals.css
+++ after/app/globals.css
@@ -473,6 +473,24 @@
   padding: 30px !important;
 }
 .wide-dialog {
+  width: min(730px, calc(100vw - 2rem)) !important;
+}
+[data-slot="dialog-content"],
+[data-slot="alert-dialog-content"] {
+  max-height: 90vh;
+  max-height: 90dvh;
+  overflow-y: auto;
+}
+@media (max-width: 767px) {
+  input, textarea, .pick {
+    font-size: 16px !important;
+  }
+  .icon-button, .graph-label, .graph-reset {
+    min-width: 44px;
+    min-height: 44px;
+  }
+}
+.wide-dialog {
   max-width: 730px !important;
 }
 .folio-dialog [data-slot="dialog-header"] {
@@ -4322,3 +4340,8 @@
 .auth-card .auth-switch { text-align: center; margin: 1.5rem 0 1rem; }
 .auth-switch a { color: #afe8c8; text-decoration: underline; }
 @media(max-width: 400px) { .auth-card { padding: 1.25rem; } }
+@media (max-width: 767px) {
+  .page-content input, .page-content textarea, .page-content .pick {
+    font-size: 16px !important;
+  }
+}
--- before/tests/account-profile.test.ts
+++ after/tests/account-profile.test.ts
@@ -0,0 +1,8 @@
+import { test } from "node:test";
+import assert from "node:assert/strict";
+import { accountProfile } from "../lib/auth/profile.ts";
+test("Google and email signup names populate contact defaults", () => {
+  assert.deepEqual(accountProfile({ id: "a", email: "a@example.com", user_metadata: { full_name: " Maya Chen " } }), { name: "Maya Chen", email: "a@example.com" });
+  assert.equal(accountProfile({ id: "a", user_metadata: { full_name: " ", name: "Maya" } }).name, "Maya");
+  assert.deepEqual(accountProfile({ id: "a" }), { name: "", email: "" });
+});
--- before/tests/interactions.test.ts
+++ after/tests/interactions.test.ts
@@ -0,0 +1,49 @@
+import { test } from "node:test";
+import assert from "node:assert/strict";
+import { applyAction } from "../lib/engine/actions.ts";
+import { emptyWorkspace } from "../lib/engine/model.ts";
+import { ActionSchema } from "../lib/validation.ts";
+import { fetchJson } from "../lib/client-request.ts";
+
+const entity = { id: "project-a", kind: "project" as const, title: "Project", subtitle: "", dates: "" };
+test("experience capture commits the entity and answer as one revision or neither", () => {
+  const original = emptyWorkspace();
+  const w = applyAction(original, { type: "capture", entity, text: "I built an application." });
+  assert.equal(w.revision, original.revision + 1);
+  assert.equal(w.entities.length, 1);
+  assert.equal(w.facts[0].questionId, "project.summary");
+  assert.throws(() => applyAction(original, { type: "capture", entity, text: "" }));
+  assert.equal(original.entities.length, 0);
+  assert.equal(original.facts.length, 0);
+});
+test("confirming imports preserves existing contributions and cannot append twice", () => {
+  let w = applyAction(emptyWorkspace(), { type: "entity", entity });
+  w = applyAction(w, { type: "answer", entityId: entity.id, questionId: "project.action", value: "I built the interface.", confirmed: true });
+  w = applyAction(w, { type: "import", entityId: entity.id, text: "I wrote integration tests." });
+  const id = w.facts.find(f => f.questionId === "import.resume")!.id;
+  w = applyAction(w, { type: "confirmImport", id });
+  const action = w.facts.find(f => f.questionId === "project.action")!;
+  assert.ok(action.value.includes("built the interface"));
+  assert.ok(action.value.includes("integration tests"));
+  assert.equal(w.facts.find(f => f.id === id)!.confirmed, true);
+  assert.throws(() => applyAction(w, { type: "confirmImport", id }));
+});
+test("blank experience titles and whitespace imports are rejected", () => {
+  assert.equal(ActionSchema.safeParse({ type: "entity", entity: { ...entity, title: "   " } }).success, false);
+  assert.equal(ActionSchema.safeParse({ type: "import", entityId: entity.id, text: "  " }).success, false);
+});
+test("network, HTML proxy failures, timeouts, and API errors give readable feedback", async () => {
+  const realFetch = globalThis.fetch;
+  try {
+    globalThis.fetch = async () => new Response("Bad gateway", { status: 502 });
+    await assert.rejects(fetchJson("/api/workspace"), /unexpected response \(502\)/);
+    globalThis.fetch = async () => Response.json({ error: "Sign in first." }, { status: 401 });
+    await assert.rejects(fetchJson("/api/workspace"), /Sign in first/);
+    globalThis.fetch = async () => { throw new DOMException("timeout", "TimeoutError"); };
+    await assert.rejects(fetchJson("/api/workspace"), /timed out/);
+    globalThis.fetch = async () => { throw Error("offline"); };
+    await assert.rejects(fetchJson("/api/workspace"), /Unable to connect/);
+    globalThis.fetch = async () => Response.json({ ok: true });
+    assert.deepEqual(await fetchJson("/api/workspace"), { ok: true });
+  } finally { globalThis.fetch = realFetch; }
+});
--- before/tests/repository.test.ts
+++ after/tests/repository.test.ts
@@ -6,6 +6,7 @@
   loadWorkspace,
   saveWorkspace,
   deleteAccount,
+  seedAccountProfile,
 } from "../lib/repository.ts";
 import { applyAction } from "../lib/engine/actions.ts";
 
@@ -57,6 +58,24 @@
   } as unknown as D1Database;
   return { db, sqlite };
 }
+test("account contact defaults persist once, preserve custom values, and stay private", async () => {
+  const { db, sqlite } = fixture();
+  await seedAccountProfile(db, "alice", { name: "Google Name", email: "a@example.com" });
+  let w = await loadWorkspace(db, "alice", "personal");
+  assert.equal(w.profile.name, "Google Name");
+  assert.equal(w.revision, 1);
+  await seedAccountProfile(db, "alice", { name: "Changed Provider Name", email: "changed@example.com" });
+  w = await loadWorkspace(db, "alice", "personal");
+  assert.equal(w.profile.name, "Google Name");
+  assert.equal(w.revision, 1);
+  const next = applyAction(w, { type: "profile", profile: { ...w.profile, name: "Custom Name" } });
+  await saveWorkspace(db, "alice", next, w.revision);
+  await seedAccountProfile(db, "alice", { name: "Provider", email: "a@example.com" });
+  assert.equal((await loadWorkspace(db, "alice", "personal")).profile.name, "Custom Name");
+  assert.equal((await loadWorkspace(db, "bob", "personal")).profile.name, "");
+  assert.equal((await loadWorkspace(db, "alice", "demo")).profile.name, "Maya Chen");
+  sqlite.close();
+});
 test("repository round-trips profile, evidence, snapshots, revisions and saved jobs", async () => {
   const { db, sqlite } = fixture();
   const w = await loadWorkspace(db, "alice", "demo");
--- before/eslint.config.mjs
+++ after/eslint.config.mjs
@@ -14,6 +14,14 @@
     "next-env.d.ts",
   ]),
   {
+    files: ["components/folio/**/*.tsx"],
+    rules: {
+      // Folio deliberately uses document navigation throughout. Its hosted
+      // client router previously stalled on clicks that worked in a new tab.
+      "@next/next/no-html-link-for-pages": "off",
+    },
+  },
+  {
     files: ["components/ui/**/*.{ts,tsx}", "hooks/use-mobile.ts"],
     rules: {
       // These files are vendored verbatim from shadcn@4.17.0. Keep the
```

## STEP 5 — Mobile and browser review

Safari, Firefox and Chrome were NOT executed in this environment. There is no installed local browser binary here, and the deployed address was not supplied. Do not treat these source checks as cross-browser certification.

- iPhone Safari: test keyboard focus/zoom, viewport resizing with keyboard open, scrolling every dialog, and downloaded PDF/JSON behavior. Mobile fields and modals were hardened, but these require device checks.
- Android Chrome: verify drawer open/close, all dropdown options, tap targets, static career labels, and downloads.
- Firefox/desktop Safari/Chrome: test a normal same-tab click, Ctrl/Cmd-click, Back/Forward, dialog focus return, dropdown keyboard selection, and Blob downloads. Detached download anchors were hardened without claiming observed failure in any browser.
- Low-power/mobile/WebGL-disabled devices: graph uses its existing static fallback; labels still open careers and reset is disabled when rotation is unavailable.
- Slow/offline networks: expect a readable timeout or connection message. Refresh before retrying a save that timed out, because the server might have committed it.
- Supported recent browsers provide fetch, AbortSignal.timeout, Pointer Events, ResizeObserver, IntersectionObserver, Blob URLs and structuredClone. Older browsers lacking these APIs remain outside verified compatibility; check Console for an unavailable-function error.
- Hover styling is supplementary; actions have click/keyboard handlers. Actual tap overlap and hit-testing are not established by source review.

## STEP 6 — How you can verify

### Apply these fixes without losing your database configuration

1. Download and extract Folio-QA-fixes.zip.
2. Open READ-ME-FIRST.txt and copy each listed COMPLETE file into the SAME path in your existing Folio-cloudflare project. Replace individual files, not entire app/lib/components folders.
3. Keep your current wrangler.jsonc and Supabase configuration. No npm dependency change or new database migration is required.
4. In VS Code Terminal run:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run deploy
```

5. Refresh the deployed site. Test on workers.dev before changing domain routing.

### Manual test checklist

- [ ] Sign up with valid details; try empty fields, whitespace-only name, invalid email, and fewer than eight password characters. Valid signup opens personal workspace.
- [ ] Click Continue with Google once; after success your name/email appear in personal profile. Try Back after starting Google: the form should be usable again. Check both callback allowlists if Google rejects login.
- [ ] Refresh, close/reopen browser, sign out, and sign back in. Try Back after sign-out: no private saved profile data should be displayed as a usable signed-in workspace.
- [ ] Click every sidebar link and every dashboard/welcome card in the same tab. URL and visible page should change. Try a new tab and Back/Forward.
- [ ] On a phone, open the sidebar, select each page, dismiss the drawer outside it, and verify the page is usable afterward.
- [ ] Open Cmd/Ctrl+K, search each destination, use arrows and Enter, then test Escape and close X.
- [ ] Switch demo/personal. Open a form, type a distinctive temporary value, switch workspace, and verify that value is not carried into the other workspace. Saving is blocked from overlapping a switch.
- [ ] Add/edit/delete an experience. Click Develop this experience on the SECOND experience and confirm its interview outline is selected.
- [ ] Answer one of each question type: radio, multi-select, text, email, URL, long text, metric confirmation. Skip optional question, edit saved question, save invalid/empty input, and verify errors are visible.
- [ ] Rapidly double-click a save, then click two different save controls quickly. Only one should run at once; wait feedback is expected, not silent failure.
- [ ] Use two tabs to edit the same workspace; the stale save must refuse to overwrite current data. Refresh the stale tab.
- [ ] Capture a story in Experience miner and verify its entity and summary both persist after reload.
- [ ] Save a contribution, then import a SECOND contribution via paste/TXT. Confirm it and verify the first contribution is preserved. Reconfirm should not duplicate text.
- [ ] Upload a file over 50 KB, a normal TXT file, and blank/whitespace text. Verify readable handling. If the read fails, use paste.
- [ ] Change theme/motion/AI consent, reload and verify persistence. Request follow-ups, switch experience while request is pending, and confirm late suggestions do not appear under the wrong experience.
- [ ] Career map/list tabs, every graph label, reset/drag on desktop, list search, career detail source button, O*NET link and Add to my projects should work. Mobile static graph reset should be disabled, not silently inert.
- [ ] Job tabs, searches, arrangement dropdown, saved-only filter, save/unsave, details/requirement expanders, analyzer, and tailored draft should work. Fictional jobs have no live application button by design.
- [ ] Create a resume; change every template; rename; create fresh draft; reorder; edit; restore original text; remove bullet; inspect evidence; review alternate wording; approve; restore history; delete version.
- [ ] Add a confirmed certification, generate a fresh resume, and download the PDF in every template. Unapproved/stale evidence must explain why export is blocked. Existing snapshot resumes do not auto-update contact/certification changes.
- [ ] Export JSON and verify it downloads. Test reset demo and clear personal profile on throwaway data only.
- [ ] On a throwaway account test delete-all. Check demo/personal records are gone and another account is unaffected. Account name/email may return from the still-existing login account.
- [ ] In DevTools Network use Offline or Slow 3G to test readable save failures/timeouts. On failed deletion, the dialog should remain open; input should not disappear on profile-save failure.
- [ ] Test phone portrait/landscape and desktop Safari/Firefox/Chrome. Open the longest dialog, scroll to all actions, focus each input, and verify no overlay blocks clicks.

### Open the console and inspect failures

- Chrome on Mac: Option + Command + J; Firefox Web Console: Option + Command + K. You can also use F12 (or fn+F12) → Console. Safari: Settings → Advanced → enable features for web developers, then Develop → Show JavaScript Console (Option+Command+C). Exact menu names can vary by browser version.
- Keep Console and Network open while reproducing one failed click. Record the URL, control label, exact error text, screenshot, and request status/response. Do not send passwords or cookies.
- Look for Uncaught TypeError, ReferenceError, Unhandled promise rejection, Failed to fetch, NetworkError, TimeoutError, hydration errors, Loading chunk failed, 404 script/font requests, or an HTML response where JSON was expected.
- API 401: session missing/expired. 403: origin/consent policy or forbidden request. 409: another tab saved a newer revision; refresh. 429: rate limit; wait. 500/502/503: server/provider/configuration failure; inspect response and Cloudflare worker logs.
- Google error redirect_uri_mismatch: Google client redirect must be the Supabase /auth/v1/callback URL. Invalid/missing return URL: Supabase must allow the exact site /auth/callback. A denied testing account needs to be allowed by Google.
- If a button has no network request, inspect Elements → the element → event listeners and disabled/aria-disabled state. Do not infer missing listeners solely from no inline onclick: React/Radix use delegated handlers.
- To check overlapping elements: select the button in Elements so it is $0, then run this in Console:

```js
const rect = $0.getBoundingClientRect();
document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
```

The result should be the button or one of its children. If it is another element, inspect that element’s position, z-index, and pointer-events.

To check duplicate live IDs:

```js
[...document.querySelectorAll("[id]")]
  .map(element => element.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
```

Expected: [] on a normal page (inspect duplicates if returned). This live check complements the source review; it was not run here.

### Actual HTTP evidence

| Method | Path | Actual status |
|---|---|---|
| GET | / | 200 |
| GET | /dashboard | 200 |
| GET | /signin | 200 |
| GET | /signup | 200 |
| GET | /welcome | 200 |
| GET | /onboarding | 200 |
| GET | /interview | 200 |
| GET | /discover | 200 |
| GET | /profile | 200 |
| GET | /resume | 200 |
| GET | /resume/missing | 200 |
| GET | /career | 200 |
| GET | /career/missing | 200 |
| GET | /jobs | 200 |
| GET | /jobs/missing | 200 |
| GET | /settings | 200 |
| GET | /favicon.svg | 200 |
| GET | /fonts/FolioSans.ttf | 200 |
| GET | /fonts/FolioSans-Bold.ttf | 200 |
| GET | /fonts/FolioSerif.ttf | 200 |
| GET | /api/workspace | 401 |
| POST | /api/workspace | 401 |
| DELETE | /api/workspace | 401 |
| POST | /api/auth/signout | 403 |
| POST | /api/auth/signout | 200 |
| GET | /api/occupation?code=invalid | 404 |
| GET | /api/occupation?code=15-1252.00 | 200 |
