# AI-for-CV-and-Interview_EXE101

## Gmail API email on Render Free

Email defaults to `gmail_api` in both dev and prod. Verification, password reset
and subscription-expiration messages are sent over HTTPS, using the Gmail account
that authorized the `https://www.googleapis.com/auth/gmail.send` scope. Recipients
do not need to authorize Google or be OAuth test users. No sending domain or new
database migration is needed. Existing verification outbox retries are retained.

Set these in the **backend Render service → Environment**, then deploy the code:

```env
SPRING_PROFILES_ACTIVE=dev
EMAIL_PROVIDER=gmail_api
GMAIL_CLIENT_ID=<mail OAuth client ID>
GMAIL_CLIENT_SECRET=<mail OAuth client secret>
GMAIL_REFRESH_TOKEN=<refresh token for the sending account>
GMAIL_SENDER_EMAIL=tlamvantuan@gmail.com
FRONTEND_URL=https://smartfolio-exe101.vercel.app
BACKEND_URL=https://ai-for-cv-and-interview-exe101.onrender.com
```

Keep the existing dev database settings. With dev, `DEV_FRONTEND_URL` and
`DEV_BACKEND_URL` override the shared URL variables: remove localhost overrides
on Render or set them to the public URLs above. Local `.env` can keep localhost
overrides. The ignored `backend/.env` is not automatically uploaded to Render.
Never put OAuth secrets/tokens into Git, frontend variables or logs.

Use the mail OAuth client that issued the refresh token; it is separate from the
Google login client. `GMAIL_SENDER_EMAIL` must be the authorized Gmail account.
Access tokens are cached in memory, refreshed before expiry, and refreshed once
after an explicit send authentication rejection. Missing/revoked credentials or
provider failures throw errors; there is no automatic fallback to blocked SMTP.
No real message is sent by the unit tests. Provider acceptance does not guarantee
inbox delivery. Gmail sending limits and anti-abuse rules still apply.

An External OAuth application left in **Testing** issues Gmail refresh tokens
that expire after seven days. For ongoing deployment configure the appropriate
publishing/verification status for the application; tokens can also be revoked,
including after changing the Gmail password. Reauthorize and replace the stored
refresh token when required. See [Google token expiration](https://developers.google.com/identity/protocols/oauth2#expiration)
and [Gmail sending API](https://developers.google.com/workspace/gmail/api/guides/sending).

After deploy, register a real email and verify the public backend link redirects
to the public login page, then check password reset. A resend API 200 means the
request was accepted, not that inbox delivery completed. Check outbox attempts
and `[EMAIL] Message accepted | provider=gmail_api` or safe HTTP-status logs.
HTTP 400 during token refresh can mean invalid_grant (reauthorization needed);
403 can mean Gmail API disabled or insufficient scope, and 429 indicates limits.

To explicitly retain SMTP in a supported environment, set `EMAIL_PROVIDER=smtp`
with the existing `GOOGLE_EMAIL`/`GOOGLE_APP_PASSWORD` variables. Gmail API does
not require those SMTP credentials. Google login configuration is unchanged.
