# Orbis website and CET community portal

A website for Orbis, an Islamic Cultural Centre initiative, with scroll-driven SVG animation, React Bits flip cards, and a Supabase-backed student/alumni portal. The portal includes email verification, profiles, an alumni world map, a member directory, mentoring filters, global chat, threaded questions, reports, and private feedback.

## Supabase setup

Copy the entire [`supabase/001_orbis_portal.sql`](supabase/001_orbis_portal.sql) into the new project's SQL Editor and run it. Follow [`supabase/SETUP.md`](supabase/SETUP.md) for email confirmation, SMTP, redirect URLs and the two public environment variables. The local `.env` now connects the supplied Supabase project. Set the same two variables in Netlify before deploying; `.env` is deliberately ignored by Git. A checkout without either variable builds in preview mode without fake members or counts.

## Preview locally

Run `npm ci` followed by `npm run build` to compile the React components. Serve the output with `python -m http.server 4173 --bind 127.0.0.1 --directory dist`, then visit `http://127.0.0.1:4173/` or `/portal.html`. Rebuild after editing files in `src/` or changing `.env`.

The landing page stays plain HTML, CSS, and JavaScript with React islands for cards and the map; the portal is a separate React entry point. Generated bundles are local classic scripts, so visual `file://` previews work too. Real authentication must use HTTP/HTTPS for email callbacks.

Run `npm run test:portal` to validate the SQL and RLS policies in an isolated PostgreSQL engine. This does not connect to or modify your Supabase project. Hosted authentication and email delivery must also be tested after configuration.

## Deploy to Netlify

For Git deployments, Netlify uses the included configuration: build command `npm run build`, publish directory `dist`. Dependencies are locked in `package-lock.json`.

For manual deployment, run `npm run build` and upload only the resulting `dist` folder. Do not upload `node_modules` or the project source folder.

## Flip cards

`src/FlipCard.jsx` and `src/FlipCard.css` adapt the React Bits component supplied for this project. Card content and color themes live in `src/cards.jsx` and `src/cards.css`. Click, tap, Enter, Space, or drag horizontally to flip; vertical touch scrolling is preserved. Reduced motion uses static face switching. Motion documentation: https://motion.dev/docs/react-installation
