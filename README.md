# Smart Pick Consulting — smart-pick.co

Private repository for the Smart Pick Consulting website.

## Stack
- **Cloudflare Pages** — static frontend hosting
- **Cloudflare Workers** — serverless API (form handling)
- **Cloudflare D1** — SQLite database (contact submissions)
- **GitHub** — version control with PR-based deployments

## Local Development
```bash
npm install
npm run dev
```

## Deployment
Deploys automatically via Cloudflare Pages git integration on every merge to `main`.
Pull Requests generate isolated preview URLs automatically.

## Project Structure
```
public/          # Static site (served by Cloudflare Pages)
workers/api/     # Cloudflare Worker functions (API routes)
wrangler.toml    # Cloudflare configuration
```
