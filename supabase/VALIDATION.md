# Portal validation

## Passed locally

- `npm run build`: passed both without configuration (preview mode) and with the supplied Supabase project. The rebuilt browser portal now loads the live count RPC successfully, showing zero listed alumni, with no console warnings or errors.
- `npm run test:portal`: ran the real migration twice in isolated PostgreSQL (PGlite), using Supabase-style `anon`/`authenticated` roles and an `auth.uid()` session fixture.
- Database checks: anonymous aggregate access only; unverified access denied; owner-only DOB/phone; profile ownership; atomic rollback on invalid private details; optional link validation; all listed programmes/branches and country choices; inclusive 1943/2030 year bounds; arbitrary M.Tech specialization; directory opt-out; feedback isolation; question/reply posting; author-only removal; report ownership; post rate limit; deleted-thread protection; banned-account access denial and exclusion from counts.
- Browser checks: desktop overview and map render; India map click opens the verification gate; the country dropdown supports Singapore; registration selects student/alumni, all requested academic options, arbitrary M.Tech specialization, career fields and optional links; preview submission is disabled; invalid email links show recovery instructions.
- Responsive browser checks at 390px and 320px: registration/overview/login adapt without horizontal page overflow. The existing landing page still renders the SVG animation region, People/Skills/Impact cards, and the new portal links/map.
- Browser console: no errors or warnings in the inspected preview.

## Connected-project checks

The supplied project is now configured in the ignored local `.env`. Read-only checks against the hosted project passed: `/auth/v1/settings` reports email authentication enabled and automatic confirmation disabled; `orbis_country_counts()` returns an empty list successfully; an anonymous request for private profile IDs is denied. No test accounts, messages or cloud settings were created or changed by these checks.

The local database fixture checks SQL/RLS, not email delivery. Complete the two-account live checklist in [SETUP.md](SETUP.md), including actual verification emails, sign-in, password reset, cross-account directory privacy, live chat updates and private feedback. Supply the same public variables to Netlify when deploying.

These changes have not been pushed or deployed.
