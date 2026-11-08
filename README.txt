# Abhishek Saharan Portfolio — Admin Dashboard + Cloud Certificates

This version keeps the dark responsive portfolio and adds a private admin dashboard backed by Supabase (database, login and file storage).

## Files
- `index.html` — public portfolio website
- `admin.html` — private admin login and dashboard
- `styles.css` / `admin.css` — dark responsive design
- `app.js` / `admin.js` — public rendering and dashboard behavior
- `config.js` — your Supabase project URL and public anon key
- `supabase-setup.sql` — database tables, bucket and security policies

## Part A — Create the cloud backend (Supabase)
1. Create a project at https://supabase.com/ and save the database password somewhere safe.
2. In Authentication → Sign-in / Providers, keep Email enabled.
3. In Authentication → Settings / User Signups, turn OFF public sign-ups.
4. In Authentication → Users, create your own user with your email and a strong password. Confirm the user if the dashboard offers that option.
5. Open `supabase-setup.sql` in a text editor. Replace BOTH occurrences of `YOUR_LOGIN_EMAIL` with the exact email address you created. Run the full script in Supabase → SQL Editor → New query.
6. Open Project Settings → API. Copy the Project URL and the `anon` / `publishable` public key.
7. Open `config.js` and paste those values:
   - `supabaseUrl`: your Project URL
   - `supabaseAnonKey`: your anon/public key
   Never use the `service_role` or secret key in website files.

## Part B — Run the website
1. Open this folder in VS Code.
2. Use the VS Code Live Server extension and open `index.html`.
3. Visit `admin.html` (or click Admin login in the public website).
4. Sign in using the email/password created in Supabase Authentication.

For local testing, use Live Server rather than opening the HTML file directly. Supabase needs an internet connection.

## Part C — Manage your content
- Profile: edit your name, headline, bio, education, location, email and social links.
- Projects: add title, description, category and GitHub/demo URL.
- Certificates: upload a PDF/PNG/JPG/WEBP (max 10 MB) or add a verification URL. Files are stored in the `portfolio-files` cloud bucket.
- Skills: add only skills you have genuinely started learning or can explain.
- Achievements: add genuine awards, milestones and accomplishments.
- Experience: add education, training, teams, volunteering or work experience.
- Edit/Delete: use the buttons beside each saved item.
- The public site reads the saved content automatically.

## Part D — Publish free
You can host the static website on GitHub Pages:
1. Create a GitHub repository and upload all files in this folder (including `config.js`, but ensure it contains only the anon/public key).
2. In GitHub repository Settings → Pages, choose Deploy from a branch, `main`, and `/ (root)`.
3. Save and wait for the published URL.
4. In Supabase Authentication → URL Configuration, add your live website URL to Site URL and Redirect URLs. Also add your local Live Server URL while testing if required.

## Security notes
- Supabase Row Level Security (RLS) is enabled. Public visitors can read portfolio data and public certificate files; only the exact admin email configured in the SQL can write or delete.
- Public sign-ups must remain OFF. If you later need another editor, update the policies deliberately rather than enabling open registration.
- The anon/public key is designed to be used in browser code. Never expose the service_role/secret key.
- Certificate files in this setup are public because visitors need to view them. Do not upload documents containing private information, home address, phone number, student ID, signatures or other sensitive details.
- The contact form uses `mailto:` and opens the visitor's email app; it does not send/store messages on a server.
- This is a static front end with Supabase cloud services. It is not an encrypted private document vault.

## Troubleshooting
- "Invalid login credentials": check the user exists in Supabase Auth and the password is correct.
- "new row violates row-level security": ensure the SQL email placeholder exactly matches your login email, including capitalization, and that you signed in with that account.
- Content not loading: check `config.js`, internet connection, and that the SQL setup completed without errors.
- Certificate upload blocked: check file type/size and that the storage policies were created.
