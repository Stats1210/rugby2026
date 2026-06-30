# Rugby 2026 — Host on GitHub Pages & share with friends

This is a complete installable web app (PWA). Hosting it on **GitHub Pages** (free)
gives you a share link, home-screen install on any phone, and — via a **GitHub Action** —
results that update themselves. No server to manage.

---

## Part 1 — Put it online

The local git repo is already prepared and committed. You just need to create the
GitHub repo and push.

1. On **https://github.com/new**: create a repo named **`rugby2026`**, **Public**,
   with **no** README/.gitignore/license (keep it empty). Click *Create repository*.
2. Back here, push (Claude will run these for you, or run in Git Bash from this folder):
   ```
   git remote add origin https://github.com/<your-username>/rugby2026.git
   git branch -M main
   git push -u origin main
   ```
   A browser window pops up the first time to log in to GitHub — that's the auth, no
   passwords typed anywhere unsafe.
3. On GitHub: **repo → Settings → Pages**. Under *Build and deployment → Source* choose
   **Deploy from a branch**, branch **main**, folder **/ (root)**, **Save**.
4. Wait ~1 minute. Your app is live at:
   **`https://<your-username>.github.io/rugby2026/`**

**Share that link.** On each phone:
- **iPhone:** open in **Safari** → Share → **Add to Home Screen**
- **Android:** open in **Chrome** → menu (⋮) → **Install app / Add to Home screen**

---

## Part 2 — Switch on automatic live results (near 4 July 2026)

The app already works without this (tap a score, hit Save — local to your phone).
To make scores fill in automatically for everyone:

1. Get a free key at **https://dashboard.api-football.com/register** (covers api-rugby).
   Copy your **API key**.
2. On GitHub: **repo → Settings → Secrets and variables → Actions → New repository secret**
   - Name: `APISPORTS_KEY`
   - Secret: *(paste your key)* → **Add secret**
3. **repo → Actions tab** → enable workflows if prompted → open **Update live results** →
   **Run workflow** once to test. From then on it runs every ~10 minutes and commits
   fresh scores into `results.json`, which the app reads automatically.

> The exact league/season filter for the Nations Championship can only be confirmed once
> it appears in the API (around the first matches, 4 July 2026). If scores don't show,
> open `scripts/fetch-results.mjs` and adjust the `url` line — there's a comment marking it.
> Manual entry always works as a fallback.

---

## What's in this folder

| File | Purpose |
|---|---|
| `index.html` | The app |
| `manifest.webmanifest`, `sw.js`, `icons/` | Makes it installable + offline |
| `results.json` | Live-results feed (updated by the Action) |
| `scripts/fetch-results.mjs` | Fetches scores from the rugby API |
| `.github/workflows/update-results.yml` | Runs the fetch every ~10 min |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

Plain HTML/JS — no build step.
