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
- Tailwind CSS 4
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
