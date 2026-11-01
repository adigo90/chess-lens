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

1. Import one standard-chess PGN by pasting it or selecting a file. Analysis starts automatically.
2. Choose your player if your saved username does not match the PGN.
3. Start Game Review. Every move from both players appears in its move list. Click a move or use the board arrows / keyboard arrows to navigate.
4. Read the assessment and Coach Lens explanation. The board shows the position after the selected move.
5. Choose **Show me what if** for an alternative, or **Explore this move** when the played move matches the preferred line. The demonstration starts from before that move. **Back to the game** restores the actual position; Next move advances the game.
6. Use **Moments** as shortcuts to up to five important missed chances. Finish at the last move for a takeaway.

Review settings offer Quick / Deeper analysis and a manual side override. The optional first-review guide and dark mode preferences are stored locally.

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

The 0.2s/0.8s searches are quick estimates, not exhaustive analysis. Centipawn-loss thresholds are app heuristics (50/150/300 for inaccuracy/mistake/blunder); these are not Chess.com or Lichess accuracy ratings. Explanations are simple verified templates, not complete tactical motif detection. The displayed continuation is one possible line, not a guarantee of the opponent’s reply. Alternative user-entered moves are not evaluated. Repetition history is not passed into standalone FEN analysis. No persistent game history, user accounts or automatic Chess.com sync yet.

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

## Hosting

Source: https://github.com/adigo90/chess-lens . Production: https://chess-lens-five.vercel.app . Vercel deploys the main branch using the included configuration.

## Credits and licensing

- chess.js 1.4.0, BSD-2-Clause: `dist/vendor/CHESSJS-LICENSE.txt`.
- Stockfish.js 17.1, GPLv3: `dist/vendor/STOCKFISH-LICENSE.txt`; corresponding source and build instructions: https://github.com/nmrugg/stockfish.js/tree/v17.1.0 . Preserve license and source availability when distributing the engine.
- Application code has not been assigned an open-source license by the owner. No MIT license is implied by this package. Third-party licenses remain in effect.
- Mascot generated for this project with OpenAI image generation; see `docs/ASSETS.md`.

Independent project, not affiliated with Chess.com or Lichess.

## Current experience (0.9)

Every move is reviewable, including opponent moves, small inaccuracies, strong moves and the final checkmate. Moments are optional shortcuts rather than the main review sequence. The Full game tab has been removed; its scoresheet lives in Game Review. The board and action bar remain visible while coaching content scrolls.

Coach Lens uses deterministic, position-grounded observations of checks, immediate mates, captures, forks, queen attacks, development, central pawn moves and castling. It does not expose an engine’s internal reasoning. Subtle benefits receive an explicit fallback. Continuations contain up to eight legal half-moves. Good moves receive reinforcement rather than a manufactured correction.

## Validation

Core parsing/classification, guided-review and security tests run with `npm test`. Review tests cover every sample half-move, opponent perspective, final checkmate, missing analysis, legal alternatives from the pre-move position and custom FEN starts. `npm run build` verifies the release assets. Live browser verification is reported separately from these automated checks.

## Release security and licenses
See [SECURITY.md](SECURITY.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [release checklist](docs/RELEASE_CHECKLIST.md). Vercel headers are configured but require live verification after deployment. Original application licensing remains a decision for the owner; third-party notices are preserved.
