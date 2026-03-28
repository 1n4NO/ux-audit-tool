# 🚀 UX Audit Engine  
### Automated UX & Accessibility Analysis for Modern Websites

> Analyze any website in seconds. Detect UX issues, accessibility gaps, and usability flaws — with actionable insights.

---

## 🌐 Live Demo
👉 _Coming soon (will be deployed on Vercel)_

---

## 📦 Repository

🔗 https://github.com/1n4NO/ux-audit-tool

---

## 🧠 Overview

**UX Audit Engine** is a heuristic-based website analysis tool that programmatically evaluates user experience and accessibility without relying on paid AI APIs.

It scans a given URL, parses the DOM, and applies deterministic rules inspired by industry standards like WCAG to generate:

- 📊 UX Score
- 🚨 Issue Breakdown
- 💡 Actionable Recommendations
- 🔗 Shareable Reports

---

## ✨ Features

### 🔍 Automated UX Analysis
- Analyze any website via URL
- Detect usability issues directly from DOM structure

### ♿ Accessibility Checks
- Missing `alt` attributes on images
- Inputs without labels
- Buttons without descriptive text

### 📖 Readability Insights
- Long paragraph detection
- Content structure issues

### 📊 Smart Scoring System
- Category-based scoring:
  - Accessibility
  - Readability
  - Performance (basic)

### 💾 Persistent Reports
- Saves audit history locally using `localStorage`

### 🔗 Shareable Reports
- Unique report URLs (`/report/[id]`)
- Easily share insights with others

---

## 🖼️ Screenshots

> _Add screenshots here (Landing Page, Results, History, Report Page)_

---

## 🏗️ Architecture

```js
Client (Next.js App Router)
↓
API Route (/api/audit)
↓
HTML Fetch (axios)
↓
DOM Parsing (cheerio)
↓
Audit Engine (custom rules)
↓
Structured Report (JSON)
```

---

## 🧩 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS  
- **Backend:** Vercel Serverless Functions  
- **Parsing Engine:** Cheerio  
- **Data Fetching:** Axios  
- **Storage:** LocalStorage  
- **Deployment:** Vercel (planned)

---

## ⚙️ How It Works

1. Enter a website URL  
2. Server fetches HTML content  
3. DOM is parsed using Cheerio  
4. Audit rules are applied:
   - Accessibility checks
   - Typography checks
   - Structural heuristics  
5. Issues are aggregated and scored  
6. Results are displayed with actionable insights  

---

## 🧠 Audit Engine Philosophy

Instead of relying on AI, this project uses a **deterministic heuristic engine**.

```ts
if (!img.alt) {
  issues.push("Missing alt text");
}
```

## Why this approach?
✅ Predictable results
✅ Zero API cost
✅ High performance
✅ No hallucinations
📊 Scoring Logic
Accessibility → -5 per issue
Readability → -3 per issue
Performance → baseline (extensible)

Final Score = Average of all categories

## 📁 Project Structure

```js
/app
/api/audit        → Audit API
/report/[id]      → Shareable report page
/page.tsx         → Landing page

/components
ScoreCards.tsx
IssuesList.tsx
History.tsx

/lib/audit
accessibility.ts
typography.ts
index.ts

/types
audit.ts

```


# 🚀 Getting Started

## 1. Clone the repository
```js git clone https://github.com/1n4NO/ux-audit-tool.git
cd ux-audit-tool
```
## 2. Install dependencies
```js npm install
```
## 3. Run locally
```js npm run dev
```
# 🌍 Deployment

This project will be deployed on Vercel.

```js vercel deploy
```

### 👉 Live link will be added soon

# 🧨 Future Enhancements

### 🔥 WCAG contrast ratio analysis
### 🔥 Puppeteer support for JS-heavy websites
### 🔥 Authentication (user-based reports)
### 🔥 Chrome Extension (“Audit this page”)
### 🔥 Export reports (PDF)
### 🔥 Dark mode
### 🎯 Why This Project Matters

### Most UX tools:

### Require manual audits
### Are expensive
### Depend heavily on AI

#### UX Audit Engine proves that powerful developer tools can be built using deterministic logic and strong frontend engineering.

## 🧑‍💻 Author

### Pratik Singh
### Frontend Architect | React | Performance | Scalable Systems

## 📄 License

### MIT License

# ⭐ Support

## If you like this project:

### ⭐ Star the repo
### 🍴 Fork it
### 🧠 Share feedback