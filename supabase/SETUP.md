# Connect the Orbis account portal

The local website is connected to the supplied Supabase project. Read-only checks confirmed the alumni-count RPC works, email sign-in is enabled, email confirmation is required, and anonymous reads of private profiles are denied. Live email delivery still needs an end-to-end test. Netlify needs the same two public build variables before deployment; the local `.env` is ignored by Git. Without both values, a checkout displays a preview with authentication disabled and no invented alumni numbers.

## 1. Create your database

1. Create your new Supabase project and wait until it is ready.
2. Open **SQL Editor → New query**.
3. Open [`001_orbis_portal.sql`](001_orbis_portal.sql), copy the **entire file**, paste it into the SQL Editor, and click **Run**.
4. Confirm success. Under Table Editor you should see `orbis_profiles`, `orbis_private_profiles`, `orbis_posts`, `orbis_feedback`, and `orbis_reports`.

The migration creates the tables, validation, signup trigger, access policies and RPC functions in one transaction. It can be run again with the same contents. Future schema changes should use a new migration; `create table if not exists` does not upgrade an older schema automatically. Run this as the SQL Editor's administrator, not an application user.

## 2. Enable verified email accounts

In Supabase **Authentication**, open the email provider settings:

- Enable email/password signup and **Confirm email**.
- Set the minimum password length to **12** to match the form.
- Keep anonymous sign-ins disabled for this portal.
- Keep the default confirmation and password recovery email links using `{{ .ConfirmationURL }}`. This is a browser-only app using Supabase's default implicit callback flow; it does not have an `/auth/confirm` server route.

The migration cannot turn on email confirmation. This dashboard setting is essential: if confirmation is disabled, Supabase can mark new accounts confirmed without sending verification mail. [Supabase password authentication documentation](https://supabase.com/docs/guides/auth/passwords).

Under **Authentication → URL Configuration**, set:

| Setting | Value |
|---|---|
| Site URL | `https://orbis.icccet.com/portal.html` |
| Redirect URL | `https://orbis.icccet.com/portal.html` |
| Local redirect URL | `http://127.0.0.1:4173/portal.html` |
| Optional localhost redirect | `http://localhost:4173/portal.html` |

Also add `https://YOUR-NETLIFY-PROJECT.netlify.app/portal.html` if you test on that address. Replace the placeholder with your actual project hostname. Add only preview deployments you intend to use. The client sends its current origin's `/portal.html` as the return where to setup address for verification and recovery. Exact allowed paths avoid accidental redirects to the landing page. [Supabase redirect documentation](https://supabase.com/docs/guides/auth/redirect-urls).

## 3. Set up verification email delivery

Creating a Gmail account for owning the project is fine, but it does not automatically configure Supabase's email delivery.

Before opening registration to everyone, configure **custom SMTP** in Supabase Authentication. Supply your email provider's SMTP host, port, username, password, sender address and sender name (for example, `Orbis · ICC`). Complete any sending-domain verification required by that provider. Keep SMTP credentials in Supabase, never in website code or Netlify's public build variables.

Supabase's default mail service is restricted to authorized team addresses and has low limits; it is intended for testing. Custom SMTP is needed to send signup and reset messages to ordinary students and alumni. [Supabase SMTP instructions](https://supabase.com/docs/guides/auth/auth-smtp).

## 4. Connect the website

Get these **two public values** from the project's Connect dialog or API settings:

```dotenv
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

A legacy `anon` key also works. Do not use a secret key, service-role key, database password or personal Supabase access token. The browser necessarily receives the public key; database access is protected by the migration's RLS policies and functions.

### On your computer

Copy `.env.example` to `.env` in the `orbis` project folder and replace both values. `.env` is ignored by Git. Then run:

```powershell
npm ci
npm run build
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:4173/portal.html`. Real email callbacks require an HTTP/HTTPS address; use this local server instead of `file://`. Rebuild after changing configuration or source code.

### On Netlify

1. Open the **Orbis** Netlify project connected to `icctvmcet/orbis-icc`.
2. Under project environment variables, add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Make them available to the build.
3. Use build command `npm run build` and publish directory `dist` (already defined in `netlify.toml`).
4. Deploy the updated source. Changing environment variables requires a new build.
5. Open `https://orbis.icccet.com/portal.html`. The preview banner should disappear.

The website's existing landing page, scroll animation and flip cards remain. A **Member portal** link, registration link and public alumni map have been added. This work has not been pushed or deployed automatically.

## 5. Check the complete live flow

Use two email addresses you control after SMTP is configured:

1. Register one student and one alumnus. Try the conditional B.Tech branches and a custom M.Tech specialization. Alumni who are employed or self-employed must enter role, company and company location.
2. Check the inbox/spam folder. Follow the confirmation link, sign out, and sign back in. Before confirmation, directory/community actions must be blocked.
3. For the alumnus, enable directory visibility and choose a current country. The public map should count the alumnus once; selecting that country should show their profile to a signed-in, verified member.
4. Turn directory visibility off. The profile and its count should disappear from other members' directory/map. DOB, phone and email must never appear on someone else's member profile.
5. Post a question, reply using the other account, and check a second open tab for updates. Remove your own post and try the report action on another person's post.
6. Send feedback. It should appear only in the sender's history and the administrator's database view.
7. Request a password reset, open the email, set a new password, then sign out and sign in with it. Check an expired link shows instructions for requesting another.
8. Refresh the portal and confirm the session persists. Test on a phone too.

The hosted public counts API and email-confirmation setting have been checked. Actual email delivery, signed-in flows and Realtime still need the two-account test above. Local tests exercise the actual SQL/RLS using an isolated PostgreSQL engine:

```powershell
npm run test:portal
```

## Privacy and community behavior

- Email is managed by Supabase Auth. DOB and international phone are in an owner-only table; authorized project administrators can access them.
- Country and city mean **where the member currently lives**. Company location is a separate career field. Country maps are approximate; the dropdown also includes small countries/territories not visible at this map scale.
- Directory sharing is off by default. Opted-in profiles can be read by verified accounts; only aggregate counts of opted-in, verified alumni are public. Email verification proves control of an email address, not CET enrollment or graduation. CET affiliation is self-declared.
- Users can edit their details, change student/alumni status, hide their directory profile, add optional links/bio, and opt into mentoring.
- Global chat and threaded Q&A require verified accounts with completed profiles. A poster's name accompanies their messages even when their directory profile is hidden. The community has live updates with a 15-second polling fallback, pagination, author removal, reports and a 10-posts/minute limit per account.
- Feedback is private between its author and project administrators, with a 3-submissions/minute limit. Feedback does not send an email notification to administrators.
- SQL enables publication of `orbis_posts` if `supabase_realtime` exists. If Realtime is disabled in your project, enable it for that table in the dashboard; polling still refreshes conversations.

## Administration

For this first version, administrators use the Supabase dashboard; there is no public admin page or user-editable admin flag.

- Review `orbis_feedback`, and set its status to `reviewing` or `resolved`. The sender sees that status in their history.
- Review `orbis_reports` and the corresponding `post_id` in `orbis_posts`. To remove content, set `deleted = true` and replace `body` with `[removed]` in Table Editor. Repeated abuse can be handled by banning the account in Supabase Authentication.
- Users can request account deletion through private feedback. Verify the request belongs to the account, then delete the user from **Authentication → Users**. Foreign keys cascade removal of the profile, private details, posts, feedback and reports; deleting a parent post also removes its replies. Follow the project's backup-retention policy for copies outside the live database.
- Do not turn off RLS or grant direct table writes to solve a UI error. Check the Auth logs or SQL error instead. `Database error saving new user` usually points to a missing migration or invalid registration payload in the signup trigger.

See [VALIDATION.md](VALIDATION.md) for the checks already performed locally.
