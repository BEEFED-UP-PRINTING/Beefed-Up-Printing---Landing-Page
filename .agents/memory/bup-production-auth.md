---
name: BUP production auth split
description: Production Cloudflare API auth contract differs from the landing app's Replit OIDC client.
---

# BUP production auth split

At the time this was confirmed, the public landing page was served from GitHub Pages behind Cloudflare, while `api.beefedupp.co.za` was a Cloudflare Worker custom domain. The Worker exposed email/password routes (`/api/login`, `/api/register`) and `/api/me`, with D1/JWT-related bindings. The landing source instead expected Replit OIDC routes (`/api/auth/user` and a browser redirect to `/api/login`), and the local Replit API artifact implements that Replit flow.

**Why:** The same API hostname can serve a different runtime than the API source in the Replit workspace; local route code alone does not prove the production auth contract.

**How to apply:** Before changing login or Design DNA, re-check the live Worker and decide which identity system owns production accounts. Align the frontend and backend deliberately; do not assume that switching the API hostname or auth package preserves existing accounts.