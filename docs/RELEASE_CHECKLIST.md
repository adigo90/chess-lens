# Friend-testing release

- [x] Review input rendering, import limits, worker cancellation and local storage.
- [x] Add Vercel CSP/security headers, privacy notice, component license list and source download.
- [x] npm audit: no known advisories for locked dependencies at review time.
- [ ] Confirm exact engine source/build correspondence (including NNUE weights); source archive contents and binary checksums are recorded, but binary reproducibility has not been independently verified.
- [ ] Decide license for original Chess Lens application code. Third-party licenses do not automatically grant a license to the whole application. GPL-3.0-or-later is a conservative candidate for review; do not claim it is adopted without owner's decision.
- [ ] Create private GitHub repository and push source/assets/tests/docs.
- [ ] Connect Vercel; import repo; verify live headers, WASM analysis, mobile import and no PGN network uploads.
- [ ] Check production link without owner login before sending it to a friend.
- [ ] Clear sample/private player data from screenshots intended for public marketing.

No trademark clearance or comprehensive legal review has been performed. Chess.com/Lichess names identify import sources, not endorsement; current analysis uses local Stockfish, not Lichess API.
