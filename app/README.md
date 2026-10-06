# MemoryTrail application

Two experiences share one small application:

- **Find a memory:** editable certain/maybe/ignore clues, ranked candidates, rejection/undo, event traversal, optional real-image captioning and AI reranking.
- **Evidence Lab:** source-linked feedback import, deterministic deduplication, schema-constrained AI extraction, exact-quote validation, stage filtering, human-review flags and export.

The third tab is a session/test log. Synthetic practice outcomes are explicitly separated from unverified real-photo selections.

## What runs immediately

Open the separately supplied `MemoryTrail_Interactive_Demo.html` in a desktop browser. It has no runtime dependencies, no external image assets and no API calls in demo mode. It demonstrates interaction mechanics using 12 synthetic illustrations and a 12-record sourced research seed. It is **not** an AI photo-search benchmark or completed field research.

## Run the application locally

Use Node.js 22 or later. No npm packages are required for the runtime.

```sh
cd app
npm test
npm start
```

Then open `http://127.0.0.1:3000` in a browser. A standalone HTML attachment is not a public deployment.

## Enable actual AI

```sh
cp .env.example .env
```

Edit `.env` locally to set `GEMINI_API_KEY` and optionally `GEMINI_MODEL`. The sample uses `gemini-2.5-flash`; select an available vision/structured-output-compatible model in your provider account. Restart `npm start`, open AI & privacy settings, and enable live calls. Model access and usage charges are controlled by the provider account. Do not commit `.env`, send a model API key in a chat, or put it into frontend JavaScript.

A separate `REVIEWER_TOKEN` can gate live calls. It is not a provider key; reviewers can enter it in the settings dialog. Keep it in browser memory only. Synthetic demo and seed evidence remain available without the token.

The server supports four operations:

1. `parse`: turns the user’s stated memory into uncertainty-preserving clues.
2. `caption`: sends one resized, explicitly selected image to the vision model. Captions do not infer people’s identities, dates, locations or relationships.
3. `rank`: ranks only supplied photo IDs against the clues and captions, with guesses kept soft.
4. `discovery`: classifies up to 20 source-linked feedback records and provides exact evidence quotes.

Quote checking verifies fidelity to the imported text, not the truth of the original source. Human review remains required. Image reasons are model interpretations, not objective confidence percentages.

## Real-image workflow

Read the upload consent, enable live AI, and select up to 32 non-sensitive JPEG, PNG or WebP images. Each is resized in the browser and sent individually to the backend. A successful batch replaces the illustrated gallery. Images and captions remain in active browser memory only. Reload or “Clear private images” removes active app references; provider retention is separate.

Open a real image and expand “Add metadata you actually know” to set an optional place, date or event label. Photos with the exact same **user-supplied** event label appear as nearby moments. The app does not infer an event from upload order and does not parse EXIF, integrate Google Photos, or automatically cluster a large personal library.

## Evidence format

```json
[
  {
    "id": "R101",
    "text": "An exact excerpt you have permission to analyze",
    "source_url": "https://example.org/original-discussion",
    "source_type": "Public forum",
    "source_date": "2026-09-21"
  }
]
```

This is a schema example, not real evidence. Replace the URL and text with actual sources. Imports support 1–500 records, up to 5,000 characters each, and a 3 MB file. Duplicate IDs are rejected; normalized exact-text duplicates are removed. The live extraction runs in batches of 20 and replaces the prior corpus only when the whole run validates. Semantic duplicate detection, automated scraping, and model-driven cross-cluster prioritization are future work; the current UI compares stage groups and exposes evidence for human prioritization.

## Publish

The application includes `vercel.json` and Node-style API functions for a **Vercel deployment scaffold**. Live hosting was not tested in this environment. Use the `app` folder as the project root, select an appropriate no-framework configuration, and configure server-side environment variables. Check that `/`, `/api/health`, `/api/ai`, the JavaScript files, and `/assets/p01.svg` route correctly after deployment. Adjust host routing to the platform’s current settings if needed. Do not label deployment successful until those checks pass on the public URL.

For a small reviewer pilot, set `REVIEWER_TOKEN`. In a Vercel environment, model calls fail closed unless that token exists or `ALLOW_PUBLIC_AI=true` is explicitly set. The included in-memory limiter is per instance, not a distributed global quota. Before removing the token for anonymous traffic, set provider spending limits and hosting-level abuse controls. Choose a host plan compatible with 60-second functions or lower the timeout. Cost, quota and platform requirements must be checked in the account before publishing.

The discovery and MVP are two tabs at the same origin; publish both and link to them explicitly in the final deck. Add URL hashes only if you implement hash routing; the current tabs do not provide separate deep links.

## Validation status

- 22 automated unit tests passed for deterministic ranking, evidence validation, bounds and mocked provider output.
- Browser flow checks passed on an embedded standalone rendering, including 390px responsive layout. They were not tests of a live hosted origin.
- Local HTTP endpoints are separately smoke-tested without model credentials where recorded in `docs`.
- Actual model calls, real photographic accuracy, public hosting, account permissions, production security and participant usability were **not** validated.

Tests are diagnostic checks, not a guarantee of correctness or security. See `../docs` for the actual captured test reports.

## Primary technical references

- Google Photos capabilities: https://support.google.com/photos/answer/15318661?co=GENIE.Platform%3DAndroid&hl=en
- Google Photos APIs: https://developers.google.com/photos/overview/about
- Gemini structured output: https://ai.google.dev/gemini-api/docs/structured-output
- Gemini image input: https://ai.google.dev/gemini-api/docs/image-understanding
- Configurable models: https://ai.google.dev/gemini-api/docs/models

## Known limits

This is a research prototype, not a production service. There is no user account isolation across a shared browser session, durable database, distributed rate limiter, provider deletion API, automatic metadata extraction, embedding index or unrestricted library connector. The browser holds at most 32 selected images, and live ranking may omit weaker candidates from the top 12 while the gallery retains them. No camera roll is read without explicit file selection. Failures are displayed; the app does not silently substitute fake AI results.
