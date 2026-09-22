# Supabase setup

Render continues to host the static files. Supabase provides admin login and the product database.

## 1. Rotate the exposed secret

The Supabase secret key was shared accidentally. In Supabase, open **Project Settings > API Keys** and rotate/revoke the exposed secret key. Never add a secret key to this repository or frontend code.

## 2. Create the database table

Open the Supabase **SQL Editor**, paste the contents of `supabase-schema.sql`, and run it.

## 3. Create the admin account

Open **Authentication > Users > Add user**, create the admin email and password, then use those credentials at `/admin.html`.

## 4. Deploy

Commit and push the updated files to the repository connected to Render. The website uses the publishable key from `supabase-config.js`; that key is safe for browser use when the database policies in `supabase-schema.sql` are enabled.

After the table exists, the admin dashboard can add, edit, hide, and delete products from any device. The storefront shows only products whose `visible` value is true.