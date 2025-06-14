 # Extra Feature & Implementation Notes

This companion README complements the original **README.md** provided with the exam assignment.  It documents the *Part 3 "extra‑touch"* feature, outlines key implementation decisions, and records a few lessons learned along the way.

---

## 📌 Feature Added — “Smart Severity Filtering + One‑click CSV Export”

**UI**

* Severity filter chips (Critical / High / Medium / Low) with inline **×** clear‑control
* “Export CSV” button with download icon
  *Location*: `inertia/components/SeverityChips.tsx`, `inertia/components/icons/Download.tsx`, `inertia/pages/index.tsx`

**Server**

* `/export` route that streams the currently filtered result set as `issues.csv`
  *Location*: `start/routes.ts`, `TicketsController.exportCsv()`

### Why this feature?

1. **Day‑to‑day analyst workflow** –  
 • Directly solves the highest-friction workflow: analysts waste time scrolling past low-priority items.

• Gives managers an instant “where’s the fire?” view; demo-friendly.


2. **Light‑weight reporting** –
• Security & compliance teams must hand findings to engineering, auditors, MSSP partners, etc.
• One-click report removes copy-paste pain and makes the tool feel “ready for enterprise”.
 
 

---

## 🔍 Usage Quick‑start

```text
# basic search
after:01/05/2025 xss

# combine filters (date + reporter + term)
after:01/05/2025 reporter:auth@mobileapp.com jwt

# add UI chip for High‑severity only
after:01/05/2025 reporter:auth@mobileapp.com jwt  [click "High"]
```

*The chip state is reflected in the query‑string (****\`\`**\*\*) so the exported CSV always matches what you see on screen.*

---

## ⚒️ Implementation Notes

### 1  Full‑DB severity filter

* *Problem*: Client‑side chip originally filtered only the rows already in memory.
*  

### 2  CSV download vs. Inertia

* *Gotcha*: `router.visit()` rendered the CSV bytes as HTML. Swapped to a plain `<a href="/export?…">` so the browser triggers a file download.

### 3  Infinite scrolling race‑condition

* Early implementation re‑fetched page 10 even when no rows left ⇒ loop. Added `hasReachedEnd` flag and early‑return in `loadNextPage()`.

---

## 🚧 Future Improvements (out of scope)

1. Make severity to be search on the server,  so we query the entire dataset.
2. **Virtualised list** (react‑window) once issues ≫ 10 k.

3. **Role‑based export** – large exports could be subject to background job & e‑mail link.
 
---

## 🙏 Acknowledgements

* `csv-stringify` for painless CSV generation
