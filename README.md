# Ad Clarity Next

AI ad creative review app for screenshot clarity, attention flow, CTA visibility, and conversion readiness.

## What it does

Upload an ad creative image and get:

- Overall creative score
- Attention-region overlay
- Six scoring dimensions
- Specific fixes
- Risk flags

## Tech stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Anthropic SDK
- Vercel-ready deployment

## Environment variables

Required in Vercel:

```txt
ANTHROPIC_API_KEY
```

Optional in Vercel:

```txt
ANTHROPIC_MODEL
```

Recommended model value:

```txt
claude-3-5-sonnet-latest
```

Never upload `.env.local` to GitHub.

## Local setup

Run:

```bash
npm install
```

Then:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Build check

Run:

```bash
npm run build
```

## Deploy

Import this GitHub repo into Vercel.

Then add the required environment variable in Vercel Project Settings.

## Product honesty

This app provides AI-powered creative analysis. It does not claim real biometric measurement, real eye-tracking, or neuroscience proof.
