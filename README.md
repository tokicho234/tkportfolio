# Teketay Addis Kebede: Portfolio

Next.js (App Router) + Tailwind + Framer Motion + React Three Fiber, with a Neon Postgres backend.

## Setup
1. Create a Neon project and copy the **pooled** connection string.
2. `cp .env.example .env.local` and fill in `DATABASE_URL`, `ADMIN_PASSCODE`, `SESSION_SECRET` (`openssl rand -base64 32`).
3. `npm install && npm run dev`

Tables are created and seeded with the default content automatically on the first request. `db/schema.sql` is only for manual setup.

## Deploy (Vercel)
Import the repo and add the same three environment variables. Redeploy after changing them.

## How it works
- `GET /api/portfolio` is public and returns skills, projects, certificates and hero settings.
- `PUT /api/portfolio` saves them. It requires the admin session cookie (HttpOnly, SameSite=Strict, signed, 12 hours). The Admin Portal autosaves 0.7s after each edit.
- `POST /api/admin/login` checks `ADMIN_PASSCODE` on the server, with 8 attempts per IP per 15 minutes.
- Certificate images are stored in their own table (`cert_images`) and served from `GET /api/cert-image/:id` with long-lived caching. Upload them in Admin Portal > Certificates (resized to 1600px in the browser).
- The CV is served from `GET /api/cv` once uploaded in Admin Portal > CV (PDF, 4 MB max). Until then the Download CV button uses `public/Teketay_Addis_CV.pdf`.
- `POST /api/contact` stores messages (honeypot field, 5 per email per hour, 60 total per hour). Read and delete them in Admin Portal > Messages.
- Language and theme stay in each visitor's browser (localStorage).

Messages are stored but not emailed. To get notified, add a Resend or SMTP call at the end of `src/app/api/contact/route.js`.
