# Orbis authentication emails

In Supabase, go to Authentication > Emails > Templates. Open the corresponding template, replace its HTML body with the entire file below, set the subject and save.

| Supabase template | HTML file | Subject |
| --- | --- | --- |
| Confirm sign up | `confirm-signup.html` | Welcome to Orbis — confirm your email |
| Reset password | `reset-password.html` | Reset your Orbis password |

Keep `{{ .ConfirmationURL }}` unchanged in both templates. Supabase generates the appropriate confirmation or recovery link for the email being sent. Do not replace it with the portal URL: the generated link completes the authentication step before redirecting to the portal.

These files use inline styles, presentation tables, system fonts and no external images. Templates are saved locally; they are not automatically installed in Supabase or published by a website deployment. Preview them in Supabase and send test emails to an address you control after saving.

Reference: https://supabase.com/docs/guides/auth/auth-email-templates
