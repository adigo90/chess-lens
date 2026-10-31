# Third-party software and assets

| Component | Version | License | Local notice |
|---|---|---|---|
| Stockfish.js / Stockfish | npm 17.1.0, lite single-thread | GNU GPL v3 | STOCKFISH-LICENSE.txt |
| chess.js, Jeff Hlywa | 1.4.0 | BSD-2-Clause | CHESSJS-LICENSE.txt |
| cburnett pieces, Colin M. L. Burnett | unmodified SVG snapshot, 2026-10-31 | GPL-2.0-or-later | ../assets/pieces/LICENSE.txt |

Stockfish authors: https://github.com/nmrugg/stockfish.js/blob/v17.1.0/AUTHORS
Engine source download: https://github.com/nmrugg/stockfish.js/archive/refs/tags/v17.1.0.tar.gz
Build instructions: https://github.com/nmrugg/stockfish.js/blob/v17.1.0/README.md
Upstream describes Emscripten 3.1.7 and ./build.js (./build.js --all for all flavors). This release uses unmodified npm binaries, not a local rebuild. The downloaded tag archive includes C++ sources, build.js, Makefile and NNUE networks. Reproducibility of the binary from that source has not been independently verified.
chess.js source: https://github.com/jhlywa/chess.js/tree/v1.4.0
Piece source and license: https://github.com/lichess-org/lila/blob/master/COPYING.md

The hosted upstream source download must remain freely available to binary recipients. Check it at each release; keep a backup and mirror it if upstream becomes unavailable. The repository's private status must not be used to restrict access to GPL corresponding source. All included copyright notices remain applicable. No new license is assigned to original Chess Lens code by this notice.

## SHA-256 of served engine files
These match the installed stockfish@17.1.0 npm package byte-for-byte.

- stockfish-17.1-lite-single-03e3232.js: `1c8265e52fdaef797684b4979b42c5dcfe0350df3e11a87e48e4ec5f86e0ca5c`

- stockfish-17.1-lite-single-03e3232.wasm: `7ca31bedd166148931a1cc84dbd8dd9cf001744e9994caf23a3c6ff4988d7086`
