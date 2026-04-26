# Supabase Setup for Red Collar

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New project.

## 2. Run the schema

In your project dashboard → **SQL Editor** → **New query**, paste the contents of `schema.sql` and click **Run**.

## 3. Enable Auth providers

In your project dashboard → **Authentication** → **Providers**:

- **Email** — enabled by default. Optionally disable "Confirm email" for testing.
- **Google** — enable it, then create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com):
  - Authorised redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
  - Paste the Client ID and Secret into Supabase.
- **Apple** — enable it. Requires an Apple Developer account and a Services ID.
  - Follow [Supabase Apple OAuth docs](https://supabase.com/docs/guides/auth/social-login/auth-apple).

## 4. Add environment variables

Create `/workspace/artifacts/tradie-match/.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are in your project → **Settings** → **API**.

## 5. (Optional) Disable email confirmation for dev

Authentication → Settings → uncheck "Enable email confirmations".
