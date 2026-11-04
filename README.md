# Study Quiz Hub

A multi-subject quiz hub with Kannada integrated as the first subject. The original Kannada quiz engine and its 520-question bank across Lessons 1–18 are preserved.

## Run locally
Use a local static server such as VS Code Live Server. Browsers block `fetch()` of JSON files from `file://`, so do not open `index.html` by double-clicking it.

## Project structure
- `index.html` — app entry point
- `assets/style.css` — styling
- `assets/app.js` — quiz engine and subject hub
- `data/kannada.json` — Kannada question bank
- `subjects/subjects.json` — subject registry

Future subjects can be added by extending the subject registry and integrating their question banks with the shared quiz engine.
