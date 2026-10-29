# Portal copy changes

Hallmark editorial redesign. Auth/database operations, routes, form attributes and callbacks remain intact. Consent and privacy paragraphs remain verbatim. Changes below respond to copy gates; markup-only changes are identified.

## src/portal/App.jsx
- Before: `<p className="portal-eyebrow">A community built on trust</p><h1>Come into the circle.</h1>`
- After: `<h1>Join the CET community.</h1>`
- Reason: 54: replace decorative eyebrow and figurative title with a clear task heading.

## src/portal/App.jsx
- Before: `<p className="portal-eyebrow">The Orbis network · CET</p>`
- After: removed.
- Reason: 54: institution is retained in masthead and welcome text.

## src/portal/App.jsx
- Before: `'Your campus connections. Everywhere.'`
- After: `'The CET network.'`
- Reason: 19: direct title for the portal overview.

## src/portal/App.jsx
- Before: `<span>People · Skills · Impact</span>`
- After: `<span>People, skills, impact.</span>`
- Reason: 63: remove middle-dot chain.

## src/portal/App.jsx
- Before: `<h2>{title} ↗</h2>`
- After: `<h2>{title}</h2>`
- Reason: 63: remove decorative arrow.

## src/portal/App.jsx
- Before: `<p className="portal-eyebrow">Your next chapter starts here</p>`
- After: removed.
- Reason: 54: remove decorative eyebrow.

## src/portal/App.jsx
- Before: `<section className="auth-panel"><p className="portal-eyebrow">Welcome to your community</p><h1>`
- After: `<section className="auth-panel"><div className="auth-intro"><h1>`
- Reason: 54: remove decorative eyebrow; recompose auth introduction beside the form.

## src/portal/App.jsx
- Before: `tab==='login'?'Good to have you back.':tab==='forgot'?'Let’s get you back in.':tab==='recover'?'Choose a new password.':'Check your inbox.'`
- After: `tab==='login'?'Sign in.':tab==='forgot'?'Reset your password.':tab==='recover'?'Choose a new password.':'Verify your email.'`
- Reason: 19: use clear task titles.

## src/portal/App.jsx
- Before: `'Your connections are waiting.'}</p>`
- After: `'Use your registered email address to access the network.'}</p></div>`
- Reason: 19: replace generic filler with a task instruction.

## src/portal/App.jsx
- Before: `New password · at least 12 characters`
- After: `New password (at least 12 characters)`
- Reason: 63: replace middle-dot label separator.

## src/portal/App.jsx
- Before: `<p className="portal-eyebrow">Your place in the network</p>`
- After: removed.
- Reason: 54: remove decorative eyebrow.

## src/portal/App.jsx
- Before: `'Your profile. Your story.'`
- After: `'Your profile.'`
- Reason: 19: use a direct task heading.

## src/portal/App.jsx
- Before: `Portal preview · Account services`
- After: `Portal preview. Account services`
- Reason: 63: remove middle-dot chain.

## src/portal/App.jsx
- Before: `<span>Orbis · An Islamic Cultural Centre initiative</span>`
- After: `<span>Orbis<small>An Islamic Cultural Centre initiative</small></span>`
- Reason: 63: retain attribution on separate lines.

## src/portal/App.jsx
- Before: `Back to the main website ↗`
- After: `Back to the main website`
- Reason: 63: remove decorative arrow.

## src/portal/ProfileForm.jsx
- Before: `Start with you`
- After: `About you`
- Reason: 19: clear section title.

## src/portal/ProfileForm.jsx
- Before: `Date of birth · private`
- After: `Date of birth (private)`
- Reason: 63: replace middle-dot label separator.

## src/portal/ProfileForm.jsx
- Before: `Phone with country code · private`
- After: `Phone with country code (private)`
- Reason: 63: replace middle-dot label separator.

## src/portal/ProfileForm.jsx
- Before: `Password · at least 12 characters`
- After: `Password (at least 12 characters)`
- Reason: 63: replace middle-dot label separator.

## src/portal/ProfileForm.jsx
- Before: `Class of · graduation / expected year`
- After: `Graduation year (completed or expected)`
- Reason: 63: readable field label.

## src/portal/ProfileForm.jsx
- Before: `'Where life has taken you':'Where you are now'`
- After: `'Location and career':'Current location'`
- Reason: 19: direct section titles.

## src/portal/ProfileForm.jsx
- Before: `Company location · city, country`
- After: `Company location (city, country)`
- Reason: 63: replace middle-dot label separator.

## src/portal/ProfileForm.jsx
- Before: `Make yourself known`
- After: `Profile and visibility`
- Reason: 19: direct section title.

## src/portal/ProfileForm.jsx
- Before: `LinkedIn · optional`
- After: `LinkedIn (optional)`
- Reason: 63: replace middle-dot label separator.

## src/portal/ProfileForm.jsx
- Before: `GitHub · optional`
- After: `GitHub (optional)`
- Reason: 63: replace middle-dot label separator.

## src/portal/ProfileForm.jsx
- Before: `Portfolio website · optional`
- After: `Portfolio website (optional)`
- Reason: 63: replace middle-dot label separator.

## src/portal/ProfileForm.jsx
- Before: `A little about you · optional`
- After: `A little about you (optional)`
- Reason: 63: replace middle-dot label separator.

## src/portal/Directory.jsx
- Before: `Close ×`
- After: `Close`
- Reason: 63: remove decorative close glyph; accessible name unchanged.

## src/portal/Directory.jsx
- Before: `<p className="portal-eyebrow">{person.member_type} · Class of {person.graduation_year}</p><h2 id="member-name">{person.full_name}</h2>`
- After: `<h2 id="member-name">{person.full_name}</h2><p className="member-meta">{person.member_type}, class of {person.graduation_year}</p>`
- Reason: 54/63: present useful member data under the name without eyebrow styling.

## src/portal/Directory.jsx
- Before: `{person.program} {person.branch||person.specialization} · CET`
- After: `{person.program} {person.branch||person.specialization}, CET`
- Reason: 63: remove middle-dot chain.

## src/portal/Directory.jsx
- Before: `{person.company_name} · {person.company_location}`
- After: `{person.company_name}<br/>{person.company_location}`
- Reason: 63: company location on separate line.

## src/portal/Directory.jsx
- Before: `{k==='portfolio'?'Website':k==='github'?'GitHub':'LinkedIn'} ↗`
- After: `{k==='portfolio'?'Website':k==='github'?'GitHub':'LinkedIn'}`
- Reason: 63: remove decorative arrow.

## src/portal/Directory.jsx
- Before: `<p className="portal-eyebrow">Find your people</p>`
- After: removed.
- Reason: 54: existing directory heading describes the task.

## src/portal/Directory.jsx
- Before: `{p.member_type} · {p.graduation_year}`
- After: `{p.member_type}, class of {p.graduation_year}`
- Reason: 63: readable member metadata.

## src/portal/Directory.jsx
- Before: `<p>{p.job_title||p.program}{p.company_name?` · ${p.company_name}`:''}</p>`
- After: `<p>{p.job_title||p.program}{p.company_name&&<><br/>{p.company_name}</>}</p>`
- Reason: 63: company name on a separate line.

## src/portal/Directory.jsx
- Before: `View profile ↗ {p.mentorship?'· Mentor':''}`
- After: `View profile{p.mentorship?' (mentor)':''}`
- Reason: 63: remove arrow and middle-dot chain.

## src/portal/Community.jsx
- Before: `<section><div className="page-heading"><p className="portal-eyebrow">A conversation worth having</p>`
- After: `<section className="community-screen"><div className="page-heading">`
- Reason: 54: remove decorative eyebrow; recompose introduction beside conversation.

## src/portal/Community.jsx
- Before: `← All conversations`
- After: `All conversations`
- Reason: 63: remove decorative arrow.

## src/portal/Community.jsx
- Before: `Updates automatically · latest 50 messages`
- After: `Updates automatically. Latest 50 messages.`
- Reason: 63: remove middle-dot chain.

## src/portal/Feedback.jsx
- Before: `<p className="portal-eyebrow">Help shape Orbis</p><h1>We’re listening.</h1>`
- After: `<h1>Feedback for Orbis.</h1>`
- Reason: 54: clear title replaces eyebrow and figurative heading.

## src/portal/Feedback.jsx
- Before: `<h2>Your recent feedback</h2>`
- After: `<h2 className="feedback-history-title">Your recent feedback</h2>`
- Reason: Layout only: history heading uses shared section scale.

## portal.html
- Before: `<title>Orbis · The CET Network</title>`
- After: `<title>Orbis: The CET Network</title>`
- Reason: 63: remove middle-dot title separator.

## portal.html
- Before: `<p style="padding:40px">Opening the Orbis network…</p>`
- After: `<p class="portal-boot">Opening the Orbis network…</p>`
- Reason: Layout only: use shared spacing tokens.

## portal.html
- Before: `<noscript>Please enable JavaScript to use the account portal.</noscript>`
- After: `<noscript><div class="portal-boot"><h1>The Orbis network</h1><p>Please enable JavaScript to use the account portal.</p><a href="index.html">Return to the main website</a></div></noscript>`
- Reason: 27: provide useful content and a working destination when scripting is off.

## Additional sweep changes
- Feedback introduction: “Ideas, issues, questions—share them with the Orbis team.” → “Share ideas, issues and questions with the Orbis team.” Gate 19 dash removal. “Your feedback is private.” remains verbatim.
- Password recovery instruction: “Your connections are waiting.” → “Set a new password with at least 12 characters.” Clear instruction for a password-only form.
