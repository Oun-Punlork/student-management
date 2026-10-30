# Deploy with GitHub and Vercel

This repository uses two Vercel projects connected to the same GitHub repository:
one for the API (`Backend`) and one for the Vite frontend (`Frontend`).

## 1. Push the project to GitHub

Create an empty GitHub repository, then run these commands from the project root:

```powershell
git init
git add .
git commit -m "Prepare app for Vercel deployment"
git branch -M main
git remote add origin https://github.com/<your-account>/<your-repository>.git
git push -u origin main
```

The root `.gitignore` excludes environment files and build output. Never commit
real `.env` files, database URLs, JWT secrets, or mail credentials.

## 2. Deploy the API

In Vercel, import the GitHub repository and set **Root Directory** to `Backend`.
Deploy it and copy its production URL, for example
`https://student-management-api.vercel.app`.

Add these environment variables to the API Vercel project (Production, Preview,
and Development as appropriate):

- `DATABASE_URL` — the PostgreSQL connection string
- `JWT_SECRET` — a long, unique random secret
- `JWT_EXPIRES_IN` — optional; defaults to `1d`
- `FRONTEND_URL` — the frontend's Vercel production URL
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` — working
  SMTP settings; for Gmail use an App Password
- `MAIL_FROM` — optional sender label/address

Use the API URL without a trailing slash. Prisma client generation runs as the
Vercel build command. Apply any pending database migrations before deploying:

```powershell
Set-Location .\Backend
npx prisma migrate deploy
```

## 3. Deploy the frontend

Create another Vercel project from the same GitHub repository and set **Root
Directory** to `Frontend`. Set this environment variable before deploying:

- `VITE_API_URL` — the API Vercel production URL, for example
  `https://student-management-api.vercel.app`

The frontend build uses that value for all API requests. Local development keeps
using the Vite proxy when `VITE_API_URL` is empty.

## 4. Finish email verification links

After both deployments are live, set the API project's `FRONTEND_URL` to the
frontend production URL and redeploy the API. Verification emails will then
link to the hosted frontend's `/verify-email` page.

Both Vercel projects will deploy automatically when changes are pushed to the
connected GitHub branch.
