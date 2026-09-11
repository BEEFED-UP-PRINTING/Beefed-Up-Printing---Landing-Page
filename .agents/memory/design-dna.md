---
name: BUP Design DNA
description: Personalised style profiling + AI-generated merch concepts for Beefed Up Printing customers.
---

# BUP Design DNA

## What it is
A personalised style profile per logged-in user. Captures colours, music, vibes, design keywords, and notes. GPT-5.4 generates 6 hyper-personalised merch concepts (tees, hoodies, caps, sticker packs, posters) each time the user requests fresh suggestions.

## Architecture
- DB tables: `design_dna_profiles` (one per user), `design_dna_suggestions` (many per user, ordered by createdAt desc)
- API routes (all require auth): `GET/PUT /api/dna/profile`, `GET/POST /api/dna/suggestions`
- AI: `@workspace/integrations-openai-ai-server` → `openai` client → `gpt-5.4`, non-streaming, JSON output
- Frontend: `DesignDNAPanel` (slide-in), `DesignDNAOnboarding` (5-step quiz modal), `DesignDNACard`, `DesignDNASuggestions`
- Entry points: Navbar "My DNA" link (desktop + mobile) — only visible when authenticated

## Key decisions
- Suggestions are additive (new batch prepended to existing) — user can keep requesting new ones
- First-save auto-generates suggestions so user immediately sees value
- Panel is a right-side slide-in, not a page, so it doesn't interrupt the landing page experience

**Why:** Keeps the landing page immersive while giving returning customers a personal space.

## Gotchas
- OpenAI returns JSON wrapped in markdown sometimes — strip ```json fences before parsing
- `dnaVersion` is a Unix timestamp snapshot — not a real increment, just used for grouping a batch
