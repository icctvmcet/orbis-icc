# Orbis landing page

A landing page for Orbis, an Islamic Cultural Centre initiative, with scroll-driven SVG animation and React Bits flip cards powered by Motion.

## Preview locally

Run `npm ci` followed by `npm run build` to compile the React card section. Then open `index.html` in a browser or serve the project with a local static server. Rebuild after editing files in `src/`.

The rest of the page stays plain HTML, CSS, and JavaScript. The generated card bundle is a local classic script, so direct `file://` previews work too. If the bundle is unavailable, the original three descriptions remain visible as a static fallback.

## Deploy to Netlify

For Git deployments, Netlify uses the included configuration: build command `npm run build`, publish directory `dist`. Dependencies are locked in `package-lock.json`.

For manual deployment, run `npm run build` and upload only the resulting `dist` folder. Do not upload `node_modules` or the project source folder.

## Flip cards

`src/FlipCard.jsx` and `src/FlipCard.css` adapt the React Bits component supplied for this project. Card content and color themes live in `src/cards.jsx` and `src/cards.css`. Click, tap, Enter, Space, or drag horizontally to flip; vertical touch scrolling is preserved. Reduced motion uses static face switching. Motion documentation: https://motion.dev/docs/react-installation
