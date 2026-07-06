# UX Audit Engine

Heuristic website auditing for accessibility, readability, and performance.

This project analyzes a public page URL, fetches its HTML, parses the DOM with Cheerio, and applies deterministic checks to produce a grouped report with category scores and actionable suggestions.

## What It Does

- Runs grouped audits across `accessibility`, `readability`, and `performance`
- Lets you choose exactly which checks to run before each audit
- Scores only the enabled categories and normalizes results against the selected checks
- Groups findings by concern area such as `Document`, `Forms`, `Headings`, `Images`, and `Media`
- Stores recent audits and report pages locally in the browser with `localStorage`

## Current Audit Coverage

### Accessibility
- Images missing `alt` text
- Buttons without labels
- Inputs missing accessible labels
- Links without accessible names
- Missing document language
- Non-navigational links like `href="#"` or `javascript:`
- Missing `main` landmark
- Iframes without titles
- Audio/video without controls
- Forms without submit controls

### Readability
- Missing page title
- Missing meta description
- Missing, multiple, or skipped headings
- Empty headings
- Overly long paragraphs
- Empty lists
- Very thin page content

### Performance
- Render-blocking scripts in `<head>`
- Large DOM size
- Non-critical images without lazy loading
- Images missing explicit dimensions
- Iframes without lazy loading
- Excessive stylesheet count

## Important Constraints

- This is deterministic heuristic analysis, not a browser-runtime audit engine
- It fetches server-rendered HTML only, so JavaScript-heavy pages may produce incomplete results
- Reports are stored locally in the browser; report URLs are not shareable across devices or browsers
- Performance checks are HTML-level heuristics, not full Lighthouse-style runtime measurements

## Architecture

```text
Next.js App Router UI
-> /api/audit
-> axios fetch
-> cheerio DOM parse
-> heuristic audit checks
-> normalized category scores + grouped issues
```

## Scoring Model

- Checks are grouped into `accessibility`, `readability`, and `performance`
- Each check has a deduction budget
- Issue severity contributes weighted deductions
- Each category score is normalized against the checks that were actually enabled
- Overall score is the average of the enabled category scores

## Tech Stack

- Next.js 16
- React 19
- Material UI
- Axios
- Cheerio
- TypeScript

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Current Product Positioning

This tool sits closer to a lightweight combined UX heuristic auditor than to full Axe DevTools or Lighthouse parity. It already supports grouped accessibility, readability, and performance checks, but it does not yet run browser-based runtime audits.

## Future Enhancements

### Phase 1: Expand Accessibility Coverage

Goal: strengthen the current heuristic engine before adding new runtime surfaces.

- Add more accessibility checks for screen-reader usability, landmark quality, ARIA misuse, focus handling, accessible-name edge cases, and color/contrast-related issues
- Introduce fixture-based validation for new accessibility rules so noisy heuristics are caught early
- Recalibrate scoring weights as accessibility coverage expands

Dependencies:
- Existing rule engine and test suite
- More representative HTML fixtures for validation

Why first:
- It improves the current product immediately
- It keeps the core audit engine credible before expanding into extensions and runtime workers

### Phase 2: Cross-Browser Extension

Goal: move from fetched HTML analysis to live page-context auditing inside the browser.

- Build a browser extension that can audit the rendered page directly
- Start with Chromium-based browsers, then adapt packaging and compatibility for Firefox and other supported browsers
- Use the extension to collect live DOM, computed styles, and page-context signals that server-side HTML fetches cannot see
- Send extension audit payloads back into this app for report rendering and history

Dependencies:
- Stable in-app report format and scoring model
- Defined message protocol between extension and report UI/backend

Why second:
- This is the fastest path toward Axe-like live page auditing
- It solves the current limitation around JavaScript-rendered pages

### Phase 3: Runtime Workers with Puppeteer

Goal: add deeper runtime and performance analysis beyond static heuristics.

- Create worker processes that use Puppeteer to load pages in a real browser context
- Capture runtime state for JavaScript-heavy pages
- Add deeper performance audits that move closer to Lighthouse-style analysis
- Use workers as a second audit engine alongside the current heuristic engine and future extension engine

Dependencies:
- Phase 2 is helpful but not strictly required
- Background job orchestration, queueing, and result persistence will likely be needed

Why third:
- This is the main path toward credible runtime performance analysis
- It is a larger architectural step than extension-based live DOM inspection

### Phase 4: DevTools Extension

Goal: make the product useful inside developer workflows, not only as a report viewer.

- Build a DevTools extension or panel for interactive inspection during development
- Surface grouped issues inline with richer context, debugging details, and actionable overlays
- Let developers inspect findings while viewing the page and DOM directly
- Connect DevTools findings back to the same scoring/report model where useful

Dependencies:
- Shared audit-core logic that can run in extension/devtools contexts
- Clear UX boundaries between page-action extension and developer-facing tools

Why fourth:
- It builds on the browser-extension and runtime-audit foundations
- It is most valuable once the underlying audit engines are richer and more stable

## Recommended Implementation Order

1. Expand accessibility checks and validate them with tests
2. Build a cross-browser page-audit extension
3. Add Puppeteer-based runtime workers for deeper performance analysis
4. Build a DevTools-focused extension experience on top of the shared audit core
