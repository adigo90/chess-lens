# Hosting Chess Lens

Checked 31 October 2026. Prices are USD, subject to change; availability, taxes and premium-name pricing are separate. A **domain** is the address; **hosting** serves the website. Buying an address does not put localhost online.

## Recommendation

Develop locally, keep a private GitHub repository as the source of truth once connected, and use static hosting when cross-device access matters. Cloudflare Pages is a good fit for the current all-static app. Vercel Hobby also fits a personal, non-commercial version. A custom domain is optional; start with the host's supplied URL and add a domain once the name feels settled. Current private ChatGPT hosting remains the working test deployment.

| Option | Benefits | Downsides / limits | Cost shape |
| --- | --- | --- | --- |
| Localhost | Fast iteration, no hosting account, app works without a remote analysis server | Only this computer by default; server must be running; phone cannot use the computer's localhost; no sharing URL | No hosting/domain fee |
| Current private ChatGPT Site | Already configured, private access, immediate testing | Platform access and publishing workflow dependency; not yet your GitHub source of truth | Existing environment; no external price assumption |
| Cloudflare Pages | Well suited to static files, Git integration, supplied URL, custom domains | Configure DNS/access policy; hosting privacy is separate from repo privacy; build/project limits apply | Static asset requests are free and unlimited on free and paid plans; domain separate |
| Vercel Hobby | Convenient Git deployment workflow, supplied URL, custom domains, future app tooling | Free Hobby is personal/non-commercial only; usage caps; not all access controls are free | Free tier within its terms and limits; domain separate |
| GitHub Pages | Simple repository-based static hosting, custom domain support | GitHub Free Pages requires a public repo; private repo eligibility needs an appropriate paid plan; deployed-site privacy is a separate concern | Free for public-repo use on GitHub Free; domain separate |

## Domain budget

Cloudflare's current standard `.com` table lists **$10.46 registration and $10.46 renewal**. Treat **$10–20/year** as a planning range for a conventional available domain, not a quote for a particular name. Premium domains and other suffixes can cost much more. Look at renewal cost, not just first-year promotions. No name availability has been checked and no domain has been purchased.

A custom domain gives a memorable address and can move with the app between hosts. It introduces annual renewal, DNS setup and account ownership to maintain. It does not improve Stockfish strength or add user accounts.

## Deployment settings

- Framework: Other / static.
- Build command: `npm run build` (asset verification; no bundling).
- Output directory: `dist`.
- API keys/environment secrets: none.
- Runtime analysis: browser-local Web Worker with single-thread WASM.
- Keep JS and WASM together under `vendor/`; do not redirect worker/WASM requests to index.html.
- Files may be served over HTTPS. Stockfish does not require a backend in this version.
- Preserve a private audience unless you deliberately choose public release. Use provider access controls for private deployments; do not rely on an obscure URL.

## Practical sequence

1. Run locally and review your own games.
2. Connect GitHub; push to a private `chess-lens` repository with its README and CI checks.
3. Select a hosting provider and explicitly choose the intended audience.
4. Deploy `dist/`, test analysis, file import, practice and mobile layouts.
5. Choose an available domain; check first-year and renewal prices at checkout.
6. Add it in the hosting dashboard and follow that provider's verified DNS instructions.

## Official sources

- Cloudflare static asset pricing: https://developers.cloudflare.com/pages/functions/pricing/
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Vercel Hobby scope and caps: https://vercel.com/docs/plans/hobby
- Cloudflare domain price table: https://pricing.registrar.cloudflare.com/?q=com
- GitHub Pages availability and custom domains: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
