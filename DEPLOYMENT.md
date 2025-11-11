# 🚀 Easy Deployment Guide

This guide will help you deploy your ROI Calculator and set up a workflow where you can make changes locally and easily update the live version.

## 📋 Prerequisites

1. **GitHub Account** (free) - [Sign up here](https://github.com)
2. **Vercel Account** (free) - [Sign up here](https://vercel.com)
3. **Git installed** on your computer

## 🎯 Step-by-Step Deployment

### Step 1: Initialize Git Repository

Open terminal in your project folder and run:

```bash
cd /home/gk-krishnan/Desktop/Certinal
git init
git add .
git commit -m "Initial commit - ROI Calculator"
```

### Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Name it: `healthcare-roi-calculator` (or any name you like)
4. **Don't** initialize with README (we already have one)
5. Click **"Create repository"**

### Step 3: Connect Local Repository to GitHub

Copy the commands GitHub shows you (they'll look like this), or use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name.

### Step 4: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (it should appear in the list)
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `web-app` (important!)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add:
     - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: Your Supabase project URL
   - Add another:
     - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value**: Your Supabase anon key
6. Click **"Deploy"**

### Step 5: Wait for Deployment

Vercel will:
- Install dependencies
- Build your app
- Deploy it
- Give you a URL like: `your-app-name.vercel.app`

**That's it! Your app is live! 🎉**

## 🔄 Workflow: Making Changes and Updating

Once deployed, here's your simple workflow:

### 1. Make Changes Locally

Edit files in your project (e.g., `web-app/app/page.tsx`)

### 2. Test Locally (Optional but Recommended)

```bash
cd web-app
npm run dev
```

Check `http://localhost:3000` to see your changes

### 3. Commit and Push to GitHub

```bash
cd /home/gk-krishnan/Desktop/Certinal
git add .
git commit -m "Description of your changes"
git push
```

### 4. Automatic Deployment

Vercel will **automatically detect** the push to GitHub and:
- Pull the latest code
- Rebuild the app
- Deploy the new version
- Update your live site (usually takes 1-2 minutes)

You'll get an email notification when deployment is complete!

## 📝 Quick Reference Commands

```bash
# Navigate to project
cd /home/gk-krishnan/Desktop/Certinal

# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your change description"

# Push to GitHub (triggers auto-deploy)
git push

# View deployment status
# Go to vercel.com → Your project → Deployments
```

## 🔍 Viewing Your Deployments

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project
3. See all deployments in the **"Deployments"** tab
4. Each deployment shows:
   - Status (Ready, Building, Error)
   - Preview URL
   - Commit message
   - Time deployed

## 🎨 Custom Domain (Optional)

Want a custom domain like `roi-calculator.yourcompany.com`?

1. Go to Vercel dashboard → Your project → **Settings** → **Domains**
2. Add your domain
3. Follow the DNS configuration instructions

## 🐛 Troubleshooting

### Build Fails

1. Check the build logs in Vercel dashboard
2. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

### Changes Not Appearing

1. Make sure you pushed to GitHub: `git push`
2. Check Vercel dashboard for deployment status
3. Wait 1-2 minutes for deployment to complete
4. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Environment Variables Not Working

1. Make sure variable names start with `NEXT_PUBLIC_` for client-side access
2. Go to Vercel → Project → Settings → Environment Variables
3. Add/update variables
4. Redeploy (or push a new commit)

## 💡 Pro Tips

1. **Always test locally first** before pushing
2. **Write descriptive commit messages** - helps track changes
3. **Check Vercel dashboard** if something goes wrong
4. **Use preview deployments** - Vercel creates preview URLs for each branch/PR
5. **Keep `.env.local` local only** - never commit it to GitHub

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Git Basics](https://git-scm.com/doc)

---

**Need help?** Check Vercel's deployment logs or GitHub issues!

