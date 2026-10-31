# Security review — 31 October 2026

## Design
Static client-only application. No API keys, database, accounts, server-side PGN upload, or remote analysis endpoint. Player-controlled strings are rendered with textContent. The two innerHTML assignments use fixed application SVG markup or a validated single-letter chess-piece identifier, not PGN text. Username defaults are empty for new users.

## Controls
- Import limit: 150,000 UTF-8 bytes; one standard game, no more than 600 half-moves.
- Legal moves validated by chess.js; engine runs in a dedicated worker with timeouts and cancellation.
- Vercel configuration restricts scripts/workers/network connections to the same origin, permits WebAssembly compilation without JavaScript unsafe-eval, blocks framing and plugins, disables camera/microphone/location/payment, and sets nosniff/no-referrer.
- Dependencies pinned by lockfile; install scripts disabled for Vercel. CI uses read-only repository permissions. Dependabot checks npm and Actions weekly once enabled on GitHub.
- Secrets/environment files excluded from Git. Do not put secrets in dist: all browser assets are public.

## Checks and limitations
npm audit reported zero known vulnerabilities for the two locked dependencies on this date; this does not prove they are vulnerability-free. Core and security regression tests cover parsing boundaries and piece markup. Header configuration needs verification on the actual Vercel deployment, including Stockfish WASM startup in Chrome and Safari. Host-provided scripts may require separate policy treatment; these headers target Vercel, not the current Sites host.

PGN parsing currently runs on the main thread; pathological permitted input may still stall a tab. File-size limits reduce but do not eliminate that risk. This is a focused source review, not a penetration test or security certification. Do not share a public release until license/source availability and deployment checks are complete.

## Reporting
Report concerns privately to the project owner through the channel where the preview was shared. Do not post credentials or private PGNs in public issues. Configure GitHub private vulnerability reporting if the repository later becomes public.
