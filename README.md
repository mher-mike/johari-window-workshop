# Johari Window Workshop

A minimal Next.js app for a 7-person Johari Window workshop.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Create `.env.local` before testing submissions or admin results:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Supabase setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `supabase/schema.sql`.
4. Run `supabase/seed.sql`.
5. Copy the project URL, anon key, and service role key into `.env.local`.

Do not expose the service role key in browser code. It is used only by server API routes.

## Vercel deployment

1. Push this app to a Git repository.
2. Create a Vercel project from that repository.
3. In Vercel project settings, add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Use the default build command: `npm run build`.
5. Deploy.
6. Share the deployed Vercel URL with the 7 participants.

All participants submit to the same Supabase database from the public Vercel URL. Draft progress may use localStorage, but final responses are written to Supabase.

## Database files

- `supabase/schema.sql` creates `participants`, `adjectives`, `sessions`, and `responses`.
- `supabase/seed.sql` inserts the fixed participants, the cleaned Armenian adjective list, and the default active session.

The `responses` table enforces:

- one response per session/respondent/target/adjective
- self responses require `respondent_id = target_id`
- peer responses require `respondent_id != target_id`
- valid session, participant, and adjective references

## Pages

- `/` participant flow
- `/admin` completion status and aggregate results
