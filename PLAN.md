> Current milestone: v0.8 guided review shipped. Import → automatic analysis → up to five key moments → captioned what-if playback → one takeaway. Lesson/puzzle UI replaced; moon/sun dark mode and knight-with-lens branding added. Next: connect GitHub and deploy the static dist/ output to Vercel. Earlier milestones below are historical.

# Chess Lens — product and implementation plan

Version 1 · 30 October 2026 · Owner: Adi

## Product promise
Import a game you played on Chess.com and understand what went well, what went wrong, and one thing to practice next. Designed first for adult beginners who want to learn without being overwhelmed by engine notation or rating pressure.

## Decisions
- Input: pasted or uploaded PGN. No Chess.com credentials required.
- Core analysis: locally hosted Stockfish WebAssembly running in a browser Web Worker. Lichess cloud evaluation is not the primary analysis backend; it is an optional later cache integration, subject to verification of current API terms and limits.
- A private responsive website is the first delivery. Desktop review and mobile readability both matter.
- First milestone uses chess.js for legal moves, PGN parsing, FEN, SAN and board state. Vendor pinned dependencies with their licenses.
- No generative explanation service is required for milestone one. Deterministic explanations must remain within what the engine and board establish.
- Imported games stay in browser memory initially. No automatic uploads, telemetry or remote game storage. Reloading clears the review.

## Main experience
1. Paste a PGN, select a .pgn file, or explore a clearly labelled sample.
2. Choose the side you played. Display players and result from PGN headers without trusting those strings as HTML.
3. Start analysis and see honest progress; allow cancellation and retry.
4. Review a board alongside a concise explanation. Navigate every move or jump to a key moment.
5. Filter moments into all, improvements, good moves and missed mates. Opponent mistakes are not counted as the user's mistakes.
6. Compare the actual continuation with the engine's suggested continuation. Provide navigation through both.
7. Practice a missed opportunity by attempting a legal move on the board before revealing the answer.
8. Finish with one evidence-based focus for the next game.

## Visual direction
Calm cream canvas, dark ink, forest-green board and accents, warm amber for opportunities and restrained red for costly errors. Editorial headings, spacious panels and readable move text. Severity must use text as well as color. Keep evaluation detail secondary to a plain-language lesson. No fabricated accuracy, streaks or progress statistics.

## Analysis model and correctness
For every game position, retain FEN, side to move, engine version, search budget, completed depth, score type (centipawns or mate), score value and legal principal variation. Normalize centipawn scores to White's perspective before comparisons, then compute move loss from the moving player's perspective. Do not mix centipawns and mate distances as ordinary numbers.

Milestone one uses a bounded search budget per position and labels its results as quick estimates. Suggested initial centipawn-loss thresholds: 50 = inaccuracy, 150 = mistake, 300 = blunder. These are our transparent heuristics, not Chess.com's or Lichess's proprietary categories. Clamp negative estimated loss to zero and acknowledge search noise. Use a separate branch for forced-mate scores: distinguish giving the opponent mate from losing an available forced mate. Continuing a forced mate with a longer line is not automatically a missed mate. A game-ending checkmate is a good move regardless of missing terminal engine info.

Every suggested line must replay legally from its exact starting FEN. Handle promotions, castling, en passant, checks and mate notation through chess.js. A good engine match means “matched the engine's suggestion”; it does not by itself mean brilliant, difficult, or the only winning move. Explain a capture, check or mate only when directly established. Deeper themes such as forks, pins and removing a defender require tested pattern detectors before being named.

## Milestone 1 — working single-game review
- PGN text and file import; explicit errors for invalid, empty, unsupported-variant, oversized and multi-game input.
- Standard chess and legal SetUp/FEN games; mainline review with comments/variations ignored by the parser.
- Board, coordinates, flip, start/back/forward/end, move list and keyboard navigation.
- Real Stockfish worker, progress, stop, timeouts and clear unavailable state.
- Per-move severity, engine match, missed mate and allowed mate handling.
- Selected-side moment list; basic factual explanations and suggested line playback.
- Practice first move of a suggestion with legal-move checking, hint and reveal. Promotion defaults to queen in the first UI and must be stated.
- Transparent search-budget label; no fake data on imported games.
- Private deployment and source repository with this plan, dependency licenses and tests.

## Milestone 2 — dependable teaching
- Deeper analysis pass for critical positions, MultiPV and comparison of played move with alternatives at equal search effort.
- Verified tactical detectors: hanging material, forks, pins, back-rank mate, removing a defender.
- Explain opponent replies and why natural alternatives fail, not just the best first move.
- Accept equivalent good puzzle moves by analyzing the attempt, instead of requiring one exact engine move.
- Underpromotion selector, multiple-game import picker, clock comments and time-use analysis where present.
- Better accessible board interaction and screen-reader testing; arrows tied to the explanation.
- Tests for both colors, mate-score transitions, all terminal outcomes, corrupt PGN and cancellation races.

## Milestone 3 — personal dashboard
- Opt-in local game history and export/delete controls; later account sync only with a clear data policy.
- Deduplicate by normalized game and move sequence.
- Recurring mistake themes with replayable evidence; filter by color/time control/opening.
- Personal exercise queue with spaced repetition and “solved without hint” tracking.
- Trends based on comparable analysis settings and adequate sample sizes. Do not present small fluctuations as improvement.
- Optional Chess.com public game import and optional Lichess enrichment only after API verification.

## Data entities
Game: id, rawPgn, headers, initialFen, moves, selectedSide.
Move: ply, san, uci, beforeFen, afterFen, color.
PositionAnalysis: fen, engineVersion, budget, depth, scoreType, scoreWhite, pv.
Moment: ply, classification, explanationRule, evidence, suggestedLine, confidence/search caveat.
Exercise (later persisted): initialFen, solution candidates, attempts, hint state, due date.

## Validation and release gates
- Parser fixtures: normal game, comments, variation, castling, FEN promotion, en passant, malformed input and multi-game rejection.
- Classification fixtures: centipawn normalization for both colors, negative loss, preserved mate, missed mate, allowed mate, already losing by mate and delivered checkmate.
- Engine integration: initialization, real evaluation, legal PV conversion, terminal position and cancellation.
- Browser QA: import sample and custom PGN; analyze; change side; navigate; play/reveal a practice move; flip; invalid input; mobile width; no overflow.
- Keep unsatisfied checks and limitations visible in the release handoff. Browser or hosting limitations must not be described as passing tests.

## Implementation layout
Buildless HTML/CSS/ES modules served from dist/. app.js owns UI state; analysis.js owns PGN and classification logic; engine.js owns worker protocol; vendor/ contains pinned chess.js and Stockfish lite single-thread WASM. No API keys, database or application server required for the first milestone.

## Definition of success
A beginner can import their own game, identify a concrete mistake and a concrete good decision, understand the demonstrated consequence, and practice one missed opportunity without needing to interpret a raw engine score.

## Deferred / explicit limits
No claim of exhaustive tactical detection or master-level explanations in v1. Quick engine classifications are approximate. No official Chess.com accuracy reconstruction, automatic public sharing, monetization, account integration or batch cloud analysis. Lichess API compatibility has not been verified in this session and is not required by the chosen architecture.

## Accepted design revision — v0.2
User requested classic wood styling, unambiguous white/black pieces, and a board that remains visible while reading. Implemented original SVG pieces with fixed ivory/dark colors; a viewport-height board and independently scrolling review widget; Game/Lesson/Moments/Moves tabs and previous/next arrows. Desktop places board and widget side by side; portrait phones retain the board above the widget. This supersedes the original green/cream visual direction.

## Latest direction — v0.3
Modern dashboard, retaining the fixed board and wood-inspired warmth; Lens knight companion; portable localhost tooling; GitHub-ready README/CI/source package; official-source comparison of localhost, Cloudflare Pages, Vercel and custom domains. GitHub push requires a connected account; no external host migration or domain purchase has been performed.
