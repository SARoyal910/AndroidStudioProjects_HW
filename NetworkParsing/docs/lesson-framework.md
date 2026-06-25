# Network Parsing Lesson Framework

This project keeps the HTML lessons self-contained so they can be opened directly in a browser, but the pages now share a repeatable lesson pattern. Use this checklist when creating the next Android teaching page.

## Required Lesson Pieces

1. **Concept overview**
   - Name the one thing the app teaches.
   - Give a three-step story before showing code.
   - Define vocabulary before students need it.

2. **Interactive model**
   - Include one simulator or mini-lab where students can choose success and failure paths.
   - Show both the input data and the UI state result.
   - Use `aria-live="polite"` for changing result panels.

3. **Code bridge**
   - Show trimmed code blocks.
   - Add line-click annotations for the most important lines.
   - Explain what the line does, why it exists, and what breaks if it changes.

4. **Practice**
   - Add guided exercises with prediction, action, and reveal.
   - Add common mistakes with symptom and fix.
   - Add an exit ticket or worksheet.

5. **Teacher mode**
   - Hide teacher notes by default with `.teacher-only`.
   - Toggle them with `data-teacher="on"` on the root element.
   - Keep notes short: teaching prompt, misconception, or answer key.

6. **Slide mode**
   - Use `data-slide="on"` on the root element.
   - Display one `.band` at a time with `.slide-current`.
   - Keep Prev/Next controls keyboard-accessible.

7. **Progress**
   - Persist quiz/practice completion in `localStorage`.
   - Always include a reset button.
   - Treat progress as a learning aid, not grading.

8. **Print mode**
   - Hide navigation, buttons, and interactive controls in `@media print`.
   - Show teacher notes in print so the page can become an instructor handout.
   - Avoid page-breaking inside tables, code blocks, cards, and worksheets.

9. **Verification**
   - Add the page to `tools/verify-html.mjs`.
   - Verify desktop interactions.
   - Verify mobile non-code overflow.
   - Verify script syntax and internal anchors.

## Shared CSS Class Meanings

- `.band`: one major lesson section.
- `.band-inner`: constrained content width.
- `.callout`: important explanation.
- `.teacher-only`: hidden unless teacher mode is on.
- `.lesson-grid`: responsive grid for exercises or mistakes.
- `.lesson-card`: individual exercise/mistake prompt.
- `.progress-box`: localStorage-backed progress summary.
- `.slide-controls`: fixed controls shown only in slide mode.
- `.sr-only`: screen-reader-only text.

## Interaction Rules

- Buttons that behave like toggles should update `aria-pressed`.
- Dynamic result regions should use `aria-live="polite"`.
- All interactive elements must be reachable by keyboard.
- `summary`/`details` is preferred for simple reveal answers because it works without custom JavaScript.

## Maintenance Rule

If a page needs to work as a standalone file, keep its CSS and JavaScript inline. If several lessons are later hosted together, these patterns can be extracted into shared `lesson.css` and `lesson.js` files using the class names above.
