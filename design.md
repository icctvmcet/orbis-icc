# Design: Orbis

Shared design system for the landing page and CET community portal.

## Direction
- Editorial and confident, like a university alumni journal (user-selected).
- Brand: supplied Orbis mark and full logo; navy, cream and gold retained from the existing source.
- Landing shape: a publisher's opening, alumni atlas, orbit sequence, People/Skills/Impact, and a colophon.
- Portal: functional app screens inside the existing top-navigation shell. No invented data or inaccessible demo-only screens.
- Hero: Banner. A large, left-aligned serif title and compact existing logo with the two existing actions.

## Tokens
`tokens.css` is the source of truth, imported by the landing and portal styles.
- Paper #f8f4eb, secondary paper #f2ecdf, warm neutral #e9dfca.
- Navy ink #0a3158, dark field #082b4d, secondary navy #163e65.
- Gold #c5a24f is an action/selection signal; large navy fields are declared surface colour.
- Instrument Serif 400 for headings; DM Sans 400 and 600 for prose, navigation and controls. Local licensed font files.
- At most two families and three running weights. Never italicise or recolour one word of a heading.
- Container 1440px with 64px desktop gutters; 24px tablet and 16px phone.
- Spacing and type scales are in tokens.css. Small labels 14px, body 16px or above; untracked sentence case.
- Use whitespace, rules and tinted fields. Cards only for individually interactive members or flip cards, no nested containers.
- Card and input radius 4px. Pill radius reserved for the moving navigation indicator.

## Controls and movement
- One primary recipe: navy fill, cream text, 48px minimum height, 4px radius.
- Secondary controls: transparent background, navy text, rule or underline.
- Instant, high-contrast focus outlines on every interactive element. Preserve disabled/loading/error/success states already wired.
- Keep hover-sliding navigation, keyboard focus preview and return to active route. Animate transform and opacity only; no width/height transitions.
- Keep the existing reversible scroll SVG orbit and user-requested flip cards, with reduced-motion fallbacks.

## Content and wiring
- Preserve every route, field, validation rule, callback, link destination and script hook.
- Consent/privacy copy stays verbatim. All other copy changes are recorded in .hallmark/copy-changes.md.
- Remove decorative eyebrows; move real institutional attribution into the masthead/colophon.
- Use the existing map and real counts. No stock people, invented testimonials or ornamental metrics.
- UI punctuation uses separate lines rather than middle-dot chains or arrow suffixes.

## Exports
tokens.css and base.css. Source fonts and licenses in assets/fonts/.
