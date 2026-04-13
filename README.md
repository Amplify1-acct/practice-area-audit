# Practice Area Page Audit

A web app that audits law firm practice area pages against a 15-point gold standard. Paste any URL, get a full gap report with prioritized recommendations.

## Deploy to Vercel

### 1. Push to GitHub
```bash
cd practice-area-audit
git init
git add .
git commit -m "Initial commit"
gh repo create practice-area-audit --public --source=. --push
```
(Or create a repo on github.com manually and push.)

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Before deploying, add an environment variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key from https://console.anthropic.com/settings/keys
5. Click **Deploy**

That's it. Vercel gives you a public URL like `practice-area-audit.vercel.app` that your team can bookmark.

### 3. Local development (optional)
```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```
Open http://localhost:3000.

## How it works
- Frontend (`app/page.js`): URL input + report display
- Backend (`app/api/audit/route.js`): Calls Claude Sonnet 4.5 with the `web_fetch` tool. The 15-point system prompt is baked in. Your API key stays on the server.
- Each audit costs roughly $0.05–$0.15 in API usage depending on page size.

## Cost control (recommended)
Set a monthly spend limit on your Anthropic API key at https://console.anthropic.com/settings/limits so the public URL can't run up a bill if it gets shared widely. If you want to lock the app down, add basic auth via Vercel's password protection (Pro plan) or add a simple shared-password check to the API route.
