# ⚡ Quick Deploy Checklist

## First Time Setup (5 minutes)

- [ ] Create GitHub account
- [ ] Create Vercel account (sign in with GitHub)
- [ ] Run these commands:
  ```bash
  cd /home/gk-krishnan/Desktop/Certinal
  git init
  git add .
  git commit -m "Initial commit"
  ```
- [ ] Create new repository on GitHub
- [ ] Connect local repo:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
  git push -u origin main
  ```
- [ ] Deploy on Vercel:
  - Import GitHub repo
  - Set Root Directory to: `web-app`
  - Add environment variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Deploy!

## Daily Workflow (30 seconds)

1. Make changes
2. Test locally: `cd web-app && npm run dev`
3. Deploy:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
4. Wait 1-2 minutes - Vercel auto-deploys!

That's it! 🎉

