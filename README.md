# Yousef Store — Store + Admin Dashboard

This merged project keeps the redesigned public storefront and adds the Supabase-powered `/admin` dashboard.

## Setup
1. Copy your existing Supabase publishable key into `.env`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Storefront: `/`
5. Admin: `/admin`

If the database table is not prepared for sorting/featured/visibility, run `supabase-dashboard-migration.sql` once in Supabase SQL Editor.

Do not put a Supabase secret/service-role key in the frontend.
