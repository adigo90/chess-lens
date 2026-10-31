# Chess Lens

**Import a PGN → understand what happened → learn something actionable → play better next game.**

A learning-first chess review for beginners. Import games from Chess.com or another standard-PGN source, replay important moments, and practice a better continuation. The board stays visible while the review panels scroll. Lens, the knight study companion, provides short prompts without pretending to be a conversational AI coach.

## Run locally

Requires Node.js 20 or newer. From the project folder:

```sh
npm run dev
```

Open **http://localhost:3000**. Stop with Ctrl+C. The server binds to your own computer only. No API key, account, database, dependency install or build step is required to try the bundled release. Do not double-click index.html: modules and the engine worker need HTTP.

```sh
npm test
npm run build
```

The build command validates the ready-to-serve `dist/` directory. Dependencies are pinned in package-lock.json for future development; the browser uses the checked-in vendor files. Running `npm ci` is optional unless changing dependencies. If you upgrade an engine or library, update its vendored files, licenses and version notes together.

## Using the app

1. Import one standard-chess PGN by pasting it or choosing a file; alternatively use the labelled example.
2. Choose your color and Quick or Deeper review.
3. Analysis starts automatically after import. Switch between **Game, Lesson, Moments and Moves** using tabs or the panel arrows.
4. Compare your move with the engine suggestion and replay its continuation.
5. Try a practice move on the board, request a hint, or reveal the answer.

## Features

- Legal PGN replay, castling, en passant, promotions and SetUp/FEN games through chess.js.
- Stockfish 17.1 lite single-thread WebAssembly in a Web Worker.
- Bounded search, progress, stop and recoverable engine errors.
- Approximate move grades and separate forced-mate handling for both colors.
- Classic Staunton SVG chess pieces: no OS font or emoji dependency.
- Fixed board, independently scrolling review panels, modern cream/walnut design and knight mascot.
- Desktop and portrait/landscape phone layouts.

## Privacy and honest limits

PGNs and analysis remain in tab memory and are not uploaded by this app. Reloading clears them. The host will still receive ordinary HTTP requests for app assets and may maintain infrastructure logs. No analytics, cloud AI or API credentials are included.

The 0.2s/0.8s searches are quick estimates, not exhaustive analysis. Centipawn-loss thresholds are app heuristics (50/150/300 for inaccuracy/mistake/blunder); these are not Chess.com or Lichess accuracy ratings. Explanations are simple verified templates, not complete tactical motif detection. Practice currently compares against one engine suggestion and supports choosing a promotion piece. Equivalent good alternatives are not yet evaluated. Repetition history is not passed into standalone FEN analysis. No persistent game history, user accounts or automatic Chess.com sync yet.

## Project layout

| Path | Purpose |
| --- | --- |
| `dist/index.html`, `style.css`, `app.js` | Responsive interface and review state |
| `dist/analysis.js` | PGN parsing, legal line conversion and classification |
| `dist/engine.js` | Stockfish worker protocol |
| `dist/pieces.js` | Classic white/black SVG piece renderer |
| `dist/assets/coach-knight.png` | Generated mascot, transparent PNG |
| `dist/vendor/` | Pinned runtime assets and licenses |
| `scripts/dev.mjs`, `build.mjs` | Local server and release validation |
| `tests/core.mjs` | 12 parsing and classification regression tests |
| `docs/HOSTING.md` | Hosting/domain comparison and deployment setup |
| `docs/ASSETS.md` | Mascot provenance and generation prompt |
| `PLAN.md`, `CHANGELOG.md` | Product roadmap and delivery record |

## Deployment

Deploy `dist/` to a static host with JavaScript and WASM MIME support. No server functions or isolation headers are required for this single-thread engine. Paths are relative so a subdirectory deployment can work. Vercel configuration is included. For Cloudflare Pages, use `npm run build` with output directory `dist`. Read [the hosting guide](docs/HOSTING.md) before choosing access settings: a private GitHub repository does not automatically make a deployed website private.

## GitHub handoff

GitHub authentication was unavailable when this package was prepared. It has **not** been pushed to a user GitHub repository. A CI workflow is included to run tests and validate assets on push/PR; it does not deploy anything. The exported source package excludes `.git`, `.openai`, node_modules and hosting identity.

Once GitHub is connected, create a private repository named `chess-lens` in the intended account and push this folder. Do not make the repository public by default. If doing it manually with an authenticated GitHub CLI from a fresh unzipped folder:

```sh
git init -b main
git add .
git commit -m "Initial Chess Lens application"
gh repo create chess-lens --private --source=. --remote=origin --push
```

## Credits and licensing

- chess.js 1.4.0, BSD-2-Clause: `dist/vendor/CHESSJS-LICENSE.txt`.
- Stockfish.js 17.1, GPLv3: `dist/vendor/STOCKFISH-LICENSE.txt`; corresponding source and build instructions: https://github.com/nmrugg/stockfish.js/tree/v17.1.0 . Preserve license and source availability when distributing the engine.
- Application code has not been assigned an open-source license by the owner. No MIT license is implied by this package. Third-party licenses remain in effect.
- Mascot generated for this project with OpenAI image generation; see `docs/ASSETS.md`.

Independent project, not affiliated with Chess.com or Lichess.

## Validation status

The 12 core regression tests pass. Syntax checks pass for the app and localhost server. Earlier v0.2 browser checks covered desktop and phone layouts, actual Stockfish analysis and a correct practice move. The v0.4 desktop and 390×844 phone-sized layouts were visually checked in the browser. Pasted PGN automatic analysis, completion guide, preference persistence after reload, guide suppression and cancellation were verified. The file-picker automation stalled, so the direct file-selection flow remains unverified in the browser. Actual iOS Safari device testing remains outstanding.

## Automatic review (v0.4)

Paste PGN and choose **Import & analyze**, or select a PGN file to import and start immediately. Analysis remains local. Change your side at any time; use Game → Review → Deeper and re-analyze for more search time.

A successful review opens an **Analysis complete** guide. **Don’t show again** saves only a display preference in this browser; imported games are still cleared on reload. **How to use** always reopens the guide and lets you restore automatic guides. If storage is unavailable, the preference applies for the current page session.

Board pieces use Colin M. L. Burnett’s classic SVG set (GPL-2.0-or-later); see the asset licenses and Credits page.

## Position puzzles (v0.5)

Click a piece whose turn it is in any non-terminal game position to try the next move. Dots show legal destinations; blue marks the saved engine suggestion when enabled. Uncheck Show engine suggestion to hide it. A legal trial move appears on the board. Try again resets the position; Back to game restores the replay. The original game is never changed. Suggestions use the saved analysis, not a fresh search of alternative moves. Suggested continuations use their remaining saved engine line.

Navigation controls have full rectangular hit areas and dedicated space above the footer. Beginner explanations no longer use pawn-equivalent scores.

Verified v0.5 in browser: real engine analysis; hint destination; hint hiding; trial e2–e4 displayed and matched; reset and return to game; forward and back using button-corner clicks; 390×844 responsive layout. Core regression tests and release checks pass.

## Board-first layout (v0.6)

The board uses more of the available screen height. Hint and practice controls live in the review panel; the study-companion banner has been removed. Navigation uses SVG icons with full button hit areas. The first tab is now Game Review.

My Chess.com username is saved locally and used to match PGN White/Black headers, ignoring letter case and surrounding spaces. This personal build defaults to azg901. A match sets both the review side and board orientation before automatic analysis. An unmatched username asks the learner to choose a side; manual selection remains available. A PGN alone cannot identify its importer.

Verified v0.6: desktop and 390×844 phone layout; imported azg901 as Black automatically selects Black and flips the board; completed local analysis; 14 core checks including identity matching.

## Coach Lens and Focus mode
Coach Lens explanations describe verified move effects and the saved continuation; they do not infer unproven future checkmates or claim to expose engine reasoning. Focus toggles a dark board-and-review workspace; Escape exits. The centered knight logo replaces CL. PGN help appears on hover, focus or tap.

## Current experience (0.8)
Import PGN → automatic local analysis → choose your side if unknown → start review → show a captioned alternative → next moment → one takeaway. Moments and Full game remain secondary navigation. The action bar stays visible while explanations scroll. The sample reviews Black's missed defense.

Coach Lens explanations are deterministic, position-grounded observations (checks, immediate mates, captures, forks, queen attacks, development and castling), not an LLM coach. Subtle benefits receive an explicit fallback rather than a made-up tactical claim. Saved PVs provide up to eight legal half-moves; a line is one possible continuation and can end before a deeper forced mate. Quick analysis is approximate. Reviews select at most five mistakes/blunders/missed mates; minor inaccuracies are omitted.

Dark mode uses the system preference initially and remembers an explicit toggle. Guide dismissal and username are saved locally; game content is not persisted. GitHub and Vercel migration is the next step; this release remains on the existing private Sites host.

## Release security and licenses
See [SECURITY.md](SECURITY.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [release checklist](docs/RELEASE_CHECKLIST.md). Vercel headers are configured but require live verification after deployment. Original application licensing remains a decision for the owner; third-party notices are preserved.
