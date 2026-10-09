---
name: BUP production boundaries
description: GitHub Pages hosts the public site; the live Cloudflare Worker defines production account, DNA, and Maggie contracts.
---

# BUP production boundaries

The public site `beefedupp.co.za` uses GitHub Pages from `main` at `/`. `api.beefedupp.co.za` is the production Cloudflare Worker; do not assume the local Replit API artifact matches production. The live Worker exposes saved Design DNA through `GET /api/dna/profile` for the signed-in customer and accepts Maggie chat history as `{ role, content }` entries, limited to the latest ten.

**Why:** The frontend, local Replit API artifact, and live Worker are separate runtimes. Local route code does not prove the live API contract or account isolation.

**How to apply:** Before changing login, Design DNA, or Maggie's backend contract, inspect the live Worker rather than inferring behavior from the local API artifact. For frontend-only DNA sync, use the existing authenticated helper and leave the Worker unchanged.