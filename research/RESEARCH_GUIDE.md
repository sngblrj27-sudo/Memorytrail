# MemoryTrail: research and validation kit

**Status:** AI-assisted desk research and a functional software scaffold. **0 real interviews and 0 real participant tests have been completed.** Do not submit this draft as completed field research. All demonstration imagery, dates, places and event groups are synthetic.

## 1. What the supplied brief requires

The visible screenshots describe a Google Photos product-management graduation project. The goal is to increase the percentage of users who retrieve a photo they remember but cannot precisely describe at the start. This is not a generic search-redesign assignment.

The work includes an AI-powered discovery engine; decomposition of the business metric; 5–6 interviews from a chosen target segment; a grounded problem definition; a functional AI-native MVP; testing with at least 3 target users; success metrics; and risks with mitigation. Deliverables are a publicly testable discovery workflow, a PDF deck of at most 10 slides including a one-slide workflow explanation, and a publicly testable MVP.

Visible submission deadline: **7 October 2026, 4:00 PM, Asia/Calcutta (IST)**. Verify it against the portal before submitting. Some text beneath “Part 4: Define the Problem” is cropped in the supplied photographs; this kit does not invent those missing instructions.

No fellow’s name may appear in the deck. The filename follows the example pattern `NL_GooglePhotos`. The deck must be below 40 MB, include accessible support links, use readable/color-accessible styling, and use at least 14-point text for PowerPoint/Google Slides. The visible alternative minima are 26 in a 1920×1080 Figma frame and 22 in a 1920×1080 Canva frame.

## 2. The current product baseline

Google’s current Ask Photos documentation describes natural-language photo search, follow-up questions and a Remember List [O1]. Google also describes combining immediate classic-search results with background Gemini processing [O2]. Therefore, “add a chatbot,” “remember context,” or “make simple searches fast” alone is not a defensible novelty claim.

MemoryTrail explores **explicit, editable uncertainty and recovery from a near match**. This combination is a design hypothesis, not a verified gap in the current product. Test the current app on participants’ actual accounts, record version, platform, region and enabled features, and update the comparison before presenting it.

Official APIs are not a shortcut to unrestricted access to someone’s complete library: Google describes user-selected media through Picker and app-created content through Library [O3]. This prototype deliberately uses selected direct uploads and synthetic fixtures instead of claiming a production Google Photos integration.

Sources O1–O6 and S1–S5 are in `sources.json`; evidence records link back to originals. These are checked sources, not a full competitive audit.

## 3. What the seed evidence says—and does not say

The corpus contains **12 excerpt records from 5 discussion URLs across 3 communities**: Reddit, Hacker News and Android Stack Exchange. It is a purposive convenience sample. Several excerpts share a thread; records are not independent respondents. It includes historical discussions and newer comments with incompletely normalized dates. It includes 2 explicit success/counterevidence records and 1 adjacent scoping question. Do not report theme percentages as population prevalence.

The seed points to distinct possible issues: candidate retrieval failures, difficulty recovering or reaching nearby context, ambiguity between similar targets, and uncertainty about query capabilities. Other users report satisfactory search. These accounts describe experiences; they do not establish Google’s technical root causes.

The clearest bridge to the proposed mechanism is R03: a user reports difficulty opening additional pictures from the same date after finding a search match. That is evidence to investigate a traversal problem—not proof that the proposed feature solves it. R02 uses an apparently specific season/place/year query, so it does not itself validate uncertain-memory handling. R05 and R09 concern recall and may indicate indexing or ranking issues that no clarification UI can fix. R12 is adjacent to, rather than central to, the assignment.

**Provisional problem hypothesis:** Travellers who remember a scene but are uncertain about its date or place may abandon a retrieval task when they cannot distinguish a reliable clue from a guess or move from a near-match back into the surrounding moment.

**Competing hypotheses:** The target is not in the searchable library; visual recognition missed its content; available results are sufficient but sorting or timeline traversal hides them; the feature/setting differs by account; the user’s remembered clues are inaccurate; or the search already succeeds and no additional interface is necessary.

## 4. Grow and operate the discovery engine

1. Gather permitted public feedback or consented interview excerpts. Add `id`, `text`, `source_url`, `source_type` and, when known, source/comment date. Retain the original wording and a specific link. Do not claim an excerpt is a full interview.
2. Import JSON into Evidence Lab. The importer accepts 1–500 records, validates provenance URLs and unique IDs, and removes exact normalized-text duplicates. It does not scrape sources or remove all semantic duplicates.
3. Enable the supplied server-side model integration. The UI processes up to 20 records per batch. The model extracts the observed retrieval stage, remembered clues, missing information, a short exact quote, and a tentative interpretation.
4. The app rejects an extraction if the quote is not a substring of the supplied source text or the ID is unknown. **That proves fidelity to the input, not authenticity of the original website.** Open the source and verify it yourself before checking “Reviewed.”
5. Compare stages using filters. Keep success, irrelevant feedback and contradictions. Export all annotations plus review status. Segment by source, feature version, date and memory completeness before prioritizing opportunities.
6. Recode a sample independently. Expand the sample across Play/App Store reviews and support discussions where collection is permitted. Record inclusion/exclusion criteria. This starter’s five threads are not “at-scale validation.”

The bundled annotations were AI-assisted desk synthesis, not a captured execution of the live workflow. To fulfill the project, run the public workflow on an expanded corpus after configuration, retain an exported output, and link it from slide 3.

### Suggested evidence coding fields

Observation: what was actually said or seen. Context: device, version, task, search availability, source date. Remembered: visual object, person, event, location, temporal relation, text. Missing: exact date/place/wording, where photo was stored, target identity. Journey stage: express, retrieve, recognize, refine, coverage, success, other. Workaround: timeline scrolling, manual notes, albums, mode switch, giving up. Severity: observed consequence, not model sentiment. Confidence: reliability of the evidence, not the user’s memory confidence.

Avoid converting “low results” into a confident “embedding failure” or “indexing bug.” Those are alternatives to test.

## 5. Recruit 5–6 people and observe actual retrieval

**Provisional target:** People with at least two years of Google Photos use who take travel photos, have made several trips, and can recall a recent episode of struggling to find a photo despite remembering something about it. The two-year and trip criteria are recruiting choices—not discovered segment statistics.

Recruit across Android/iOS and available/unavailable Ask Photos. Include at least one person who reports easy retrieval so the study does not select only dissatisfaction. Do not require people to expose medical, identity-document, intimate, or children’s photos. Participation and each upload are optional.

### Invitation

“I’m studying how people find older photos when they remember only part of the scene. Could you spare 25–30 minutes to show how you normally search for one or two non-sensitive photos? I’m testing the product, not you. You can stop or skip any question; no photo upload is required for the interview.”

### Consent and data handling

Explain what you record, who sees it, and deletion timing. Ask separately for note-taking, screen recording and sending selected images to an external AI provider. Do not imply that consent to an interview implies consent to AI processing. Use P01–P06, not names, in shared notes. Keep any identity/contact mapping outside the public project. Redact personal information before exporting. Agree on a deletion date; the app’s clear/reload behavior is not a provider deletion guarantee.

### 25–30 minute interview script

**0–3 minutes — Consent and context.** Ask how long they have used Google Photos, what they photograph, and how they normally retrieve old images. Record device and feature availability rather than assuming everyone has the same search.

**3–7 minutes — A real incident.** “Tell me about the last time you wanted an older photo and had trouble finding it.” Ask what triggered the need, what they remembered before searching, what they did first, what they tried next and what happened. Avoid naming uncertainty chips or the proposed solution.

**7–18 minutes — Observe one or two tasks.** “Please try to find a non-sensitive photo you remember exists but cannot immediately locate. Use the app as you normally would.” Capture the initial query verbatim with permission. Ask them to say which clues are certain, uncertain or absent **after the first unprompted attempt**, to avoid priming the baseline. Do not tell them the date, correct label or target. Record a maximum 120-second task window as a study convention, not an industry standard. Let the conversation continue afterwards if needed, but distinguish time-limited failure from later success.

**18–23 minutes — Reconstruct the breakdown.** “What did that result make you try next?” “Was there a photo that looked close?” “How would you normally get from it to the moment you want?” “Could the image be in another account or not backed up?” “What makes you confident you found the intended photo?”

**23–28 minutes — Importance and alternatives.** Ask about consequences, recurring frequency in their own words, workarounds and occasions when the current experience is good. Do not ask whether they “would use an AI assistant” as proof of demand.

**28–30 minutes — Close.** Request permission for a later prototype session and confirm deletion/privacy commitments.

Use `interview_notes.csv` for the actual observations. Keep verbatim evidence and interpretation in separate columns. Mark a cause “unknown” unless you have grounds to distinguish it.

### Predeclared decision

Continue with the proposed segment/mechanism only if multiple independent observed tasks reveal a recoverable uncertainty or near-match-traversal problem. If most failures are absent images, missing backup, or unretrievable objects, change the problem and solution. One historical forum comment is insufficient to validate the chosen segment.

## 6. Test with at least 3 target users

Return to at least three of the interviewed people. Do not substitute model-generated personas or the developer’s own automated checks for participant testing.

**Study A: Current-product observation.** Test participants’ real retrieval tasks in the current Google Photos experience. Record the actual task, library scope and correctness. This establishes context, not a controlled estimate of comparative improvement.

**Study B: Mechanism/usability test.** Use consented, non-sensitive, selected images and matched but different tasks. For controlled comparisons, keep image set and metadata equal across conditions. Counterbalance order (AB, BA, AB for three people), and avoid repeating exactly the same target after it has been found. Document any mismatch between a full Google library and an uploaded subset; do not call such a comparison a clean A/B experiment.

The supplied keyword baseline is only a toy comparator. An improvement over it is not evidence of improvement over Ask Photos. The illustrated practice tasks establish that controls work; they do not measure photographic retrieval quality, natural memory or user value.

**Task families:** reliable scene + uncertain place; reliable visual detail + uncertain date; near-match requiring a verified event group. For real uploads, participants may add known place/date/event metadata in the image dialog. Time and effort spent on this setup must be disclosed. Grouping is manual in this MVP; large-library automatic event grouping is not implemented.

**Procedure:** Obtain processing consent; verify that the selected corpus contains the intended target; have the participant attempt the task unaided; log time, confidence edits, clarifications, candidate dismissals and nearby traversal; ask for the intended photo; independently verify selection; note what failed. Stop or record timeout at 120 seconds. Use a fresh task for the other condition. Never coach toward the correct image.

**Provisional pilot gate:** At least 2 of 3 participants complete a representative task without moderator help; no falsely “verified” success; at least one observed example of an uncertainty-edit or traversal action helping. This is a usability decision rule, not statistical evidence of a population-level uplift. Document disconfirming results and revise.

Populate `usability_results.csv`. Replace slide 8 with actual outcomes, evidence references and one specific iteration. A participant saying “nice feature” is not task success.

## 7. Define metrics without confusing denominators

**Proposed business outcome:** Within a specified seven-day observation window, the share of eligible users who correctly retrieve the target within 120 seconds on their first standardized vague-memory task. Restrict eligibility to tasks for which the photo exists in the tested corpus; report exclusions separately. Each user counts once. This definition is an operational proposal, not an existing Google metric.

Let N be eligible users beginning a task; C users whose clues are captured; V users shown at least one relevant candidate; O users opening the target; and S users correctly confirming it within the task window. Define these as nested sets, so S/N = (C/N) × (V/C) × (O/V) × (S/O). Report missing/zero denominators as undefined, not zero. “Relevant candidate shown” needs a labeled target or independent review; it is not known from an arbitrary click.

**Task-level diagnostics:** verified success within 120 seconds; median and distribution of time-to-correct-target, with failures reported rather than dropped; candidate exposure, near-match traversal, query reformulation, useful clarification, abandoned tasks, and retrieval rank. Repeated tasks from one participant are not independent users.

**Technical diagnostics:** caption failures; valid-JSON rate; source-quote validation failures; request latency; missing metadata; cost per task; model/version. Unit test pass counts measure code behavior, not retrieval quality.

**Guardrails:** false success; irrelevant sensitive content exposed; unsupported explanations; opt-in rejection/withdrawal; image deletion handling; request/cost limits; accessible controls. Favor displaying “uncertain” over asserting a missing memory.

**Downstream business hypothesis:** Useful retrieval may strengthen trust and retention. No retention or revenue lift was measured. A later larger study should be sized using baseline success, desired effect, and user-level variance rather than picking a convenient sample.

## 8. Risks and mitigations

- **Wrong memory is promoted into certainty.** Keep guesses soft; show the clue provenance; require user confirmation; verify test correctness independently. Never fabricate or generate the missing photo.
- **The true cause is indexing, not the interface.** Record corpus coverage and candidate availability. Treat negative/contradictory evidence as a reason to pivot, not to exclude a participant.
- **Privacy or unexpected provider retention.** Use only selected, consented, non-sensitive images; resize them; keep keys server-side; avoid raw image/query logs; explain third-party retention; close sessions after testing. Review hosting and provider terms before real participants.
- **Latency or cost makes clarification worse.** Limit selected images to 32 and batch feedback in 20s; caption once per session; keep an explicit no-AI demo mode; configure spending limits and distributed rate limits before public traffic.
- **Synthetic data exaggerates quality.** Report the test dataset and manual metadata setup. Validate on held-out real images and different participants before claiming usefulness.
- **UI route replicates existing functionality.** Recheck current Ask Photos. Justify the proposed explicit uncertainty/traversal interaction through observed tasks, not a novelty assertion.
- **Untrusted feedback manipulates the model.** Use fixed instructions, bounded inputs, fixed provider endpoints, validated IDs, exact quote checks and escaped HTML. These controls reduce risk; they are not a complete security audit.

## 9. Submission checklist

Conduct and document 5–6 interviews. Choose or revise the segment based on evidence. Run the live discovery workflow on an expanded corpus, review its output and retain the run record. Configure and test real-image AI retrieval. Test with at least 3 target users and update the solution based on observed failures. Replace the research-pending content in slides 5 and 8; update metrics and limitations from actual observations. Publish the discovery and MVP routes with safe account/budget settings. Test public access from a signed-out browser or supply an agreed reviewer token. Add the real URLs to the deck; do not leave placeholder links. Re-export the 10-slide PDF, confirm size, hyperlinks, anonymity, readability and the portal deadline.

**The accompanying deck is deliberately a research draft. Its missing user findings and public links are explicit, not disguised.**


## Source links

[S1]: https://www.reddit.com/r/googlephotos/comments/1fvq7hr/why_did_they_ruin_google_photos_search/
- **[S1] Why did they ruin Google Photos search?** — Thread includes later comments; individual comment dates are not normalized.
[S2]: https://www.reddit.com/r/GooglePixel/comments/1qbdo8i/google_photos_removing_search_and_replacing_it/
- **[S2] Google Photos removing search and replacing it with ask** — Self-reported user experience; not a product-wide measurement.
[S3]: https://www.reddit.com/r/googlephotos/comments/1lklsk2/classic_search_is_gone/
- **[S3] Classic Search is gone** — Historical user reports; current official documentation takes precedence for feature availability.
[S4]: https://news.ycombinator.com/item?id=44031190
- **[S4] Ask HN: Why does Google Photos' search suck?** — Includes positive and negative reports in the same discussion.
[S5]: https://android.stackexchange.com/questions/213108/google-photos-search-to-show-only-local-photos
- **[S5] Google Photos search to show only local photos** — Historical scoping question; date not normalized.
[O1]: https://support.google.com/photos/answer/15318661?co=GENIE.Platform%3DAndroid&hl=en
- **[O1] Use Ask Photos to search, edit and get assistance** — Natural-language search, follow-up questions, and a Remember List already exist.
[O2]: https://blog.google/products-and-platforms/products/photos/updates-ask-photos-search/
- **[O2] Improvements to Ask Photos** — Google describes combining fast classic results with background Gemini processing.
[O3]: https://developers.google.com/photos/overview/about
- **[O3] About the Google Photos APIs** — Picker selects user-authorized media; Library API manages app-created content. Prototype uses direct uploads instead.
[O4]: https://ai.google.dev/gemini-api/docs/structured-output
- **[O4] Gemini structured outputs** — Schema-constrained output still requires application-side validation.
[O5]: https://ai.google.dev/gemini-api/docs/image-understanding
- **[O5] Gemini image understanding** — Inline image input for opt-in captioning.
[O6]: https://ai.google.dev/gemini-api/docs/models
- **[O6] Gemini model catalog** — Model is configurable; sample default is gemini-2.5-flash.
