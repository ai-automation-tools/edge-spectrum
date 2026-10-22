# Run your own Edge Spectrum

[Repository home](../README.md) · [Documentation](README.md)

The public demo lets anyone use the Spectrum visualizer, odds and parlay calculators,
synthetic backtester, and ESPN scoreboard. Its advisor shows written sample responses.
It never calls Gemini and never asks visitors for API keys.

The same source includes the full live advisor. Deploy a copy to your account, supply
your own Gemini key, and enable full mode. There is no separate paid edition or activation key.
Hosting and AI usage are billed by your chosen providers.

## Deploy on Vercel

1. Open **Create your own site** on the demo and choose **Deploy your own**. The deploy
   button copies the repository, selects `site` as the Root Directory, and requests the
   environment variables below. Alternatively, use **Use this template** on GitHub,
   import that repository into Vercel, select the Vite preset, and set Root Directory to `site`.
2. Set the four full-mode variables in your Vercel project. Enter secrets only in your
   own hosting account, never in the demo, source files, or a deploy URL.
3. Deploy. Open `/backtester` on your new domain and enter your advisor passcode.
4. If you change variables later, redeploy so the new values take effect. Configure
   preview environments separately; leaving the mode unset keeps previews in demo mode.

| Variable | Demo | Your full instance |
| --- | --- | --- |
| `EDGE_SPECTRUM_MODE` | `demo` or unset | Exactly `full` |
| `GEMINI_API_KEY` | Not needed | Your Gemini API key |
| `ADVISOR_PASSCODE` | Not needed | Strong, unique passcode for advisor access |
| `ADVISOR_SECRET` | Not needed | Long random value for signing sessions |

Generate a signing secret locally:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Get your Gemini key from [Google AI Studio](https://aistudio.google.com/apikey).
The key remains on the server. Never use a `VITE_` prefix for any secret, because
Vite exposes those variables to the browser.

Vercel build settings: framework **Vite**, Root Directory **site**, build command
**npm run build** or **vite build**, output directory **dist**. The committed
`site/vercel.json` supplies the Vite build and routing configuration. Node 22 or 24 is supported.

## Run locally

Install Node.js 22 or 24, then:

```sh
git clone https://github.com/ai-automation-tools/edge-spectrum.git
cd edge-spectrum/site
npm ci
```

Copy `.env.example` to `.env` (`cp .env.example .env` on macOS/Linux, or
`Copy-Item .env.example .env` in PowerShell). The default is a key-free demo.
For the live advisor, set `EDGE_SPECTRUM_MODE=full` and fill in your key, passcode,
and signing secret. The `.env` file is ignored by Git.

```sh
npm run dev
```

Open `http://localhost:3001`. The Express server runs the same advisor gate and
backtest engine as the Vercel functions.

For a production Node host, build with `npm run build`, set `NODE_ENV=production`
in the hosting environment, and run `npm start` from `site`. Use HTTPS for a hosted instance.

## What full mode enables

All tools are available in both modes. Full mode replaces sample advice with Gemini
responses and suggested strategies. The advisor is still passcode protected: an
unset passcode disables it. An unset Gemini key prevents live responses.

Demo mode is enforced by the server. Changing browser state, sending direct requests,
or reusing a session from full mode cannot enable Gemini calls. Only a server environment
change to `full` enables that path. Unknown mode values fall back to demo.

The shared passcode is intended for a personal instance or small trusted group. It is
not a multi-user account system. The login throttle is per process, not a durable
usage quota; set provider usage limits appropriate to your account. If the passcode is
shared accidentally, rotate it **and** `ADVISOR_SECRET` to invalidate existing sessions.

## Customize and verify

- Edit `site/src/pages/Home.tsx` for the landing page and `site/src/projectLinks.ts`
  for repository and deployment links.
- Add tools in `site/src/tools.ts`, then register React routes in `site/src/App.tsx`.
- Edit `site/src/data/edges.ts`, then run `npm run gen:edges` to update generated datasets.
- Run `npm run lint`, `npm run check:deployment`, and the data/math checks listed
  in [the docs index](README.md) before publishing changes.

The backtester uses 26 synthetic seasons, not a database of actual historical results.
The project is educational software; simulated profits do not establish a real betting edge.

## License

The project is available under [Apache-2.0](../LICENSE). You can run and customize your
own site under those terms. Dependencies retain their respective licenses. Dataset
citations identify sources; they do not transfer ownership of those sources.
