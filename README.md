# Self Checkout Web App

Mobile-first self-checkout demo with customer checkout, admin dashboard, phone OTP login, Google-style demo login, and static GitHub Pages deployment.

## Local Use

```bash
npm install
npm run dev -- -p 3000
```

Open:

- Customer: http://localhost:3000/customer
- Customer login: http://localhost:3000/login?next=/customer
- Admin login: http://localhost:3000/admin/login?next=/admin

Demo OTP: `1234`

## GitHub Pages Deploy

1. Push this repo to GitHub.
2. In GitHub, open `Settings > Pages`.
3. Set source to `GitHub Actions`.
4. Push to the `main` branch.
5. The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the static site.

The app is configured for GitHub Pages project URLs using `NEXT_PUBLIC_BASE_PATH`.

## Notes

This GitHub Pages version is fully client-side. Login, cart, admin access, inventory edits, and checkout demo state run in the browser using `localStorage` and component state. For production payments/auth/database, deploy to a server platform such as Vercel and connect real OAuth, OTP, and backend APIs.
