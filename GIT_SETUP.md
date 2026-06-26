# Git Setup Guide for CallGrabbr

## Step 1: Install Git

### Option A: Download Git for Windows (Recommended)
1. Download from: https://git-scm.com/download/win
2. Run the installer
3. Use default settings (recommended)
4. **Important:** Check "Add Git to PATH" during installation

### Option B: Use GitHub Desktop (Easier for beginners)
1. Download from: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Skip to "Setup with GitHub Desktop" below

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `callgrabbr`
3. Make it **Private** (recommended for production code)
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"
6. Copy the repository URL (e.g., `https://github.com/yourusername/callgrabbr.git`)

## Step 3A: Setup with Git CLI (After Installing Git)

Open a new PowerShell/Terminal window (important - so PATH updates take effect):

```powershell
cd c:\Unity\projects\callgrabbr\nml-main

# Initialize repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CallGrabbr with mobile app and push notifications"

# Add your GitHub repository as remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOURUSERNAME/callgrabbr.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3B: Setup with GitHub Desktop (Alternative)

1. Open GitHub Desktop
2. File → Add Local Repository
3. Choose: `c:\Unity\projects\callgrabbr\nml-main`
4. Click "create a repository" in the warning dialog
5. Commit all files with message: "Initial commit: CallGrabbr with mobile app"
6. Publish repository to GitHub (button in top toolbar)
7. Choose private repository
8. Click "Publish Repository"

## Step 4: Connect to Vercel

### Option A: Automatic Git Integration (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your "callgrabbr" project
3. Go to Settings → Git
4. Click "Connect Git Repository"
5. Select your GitHub account and repository
6. Select branch: `main`
7. Click "Connect"

Now every push to `main` will automatically deploy!

### Option B: Manual Deploy via CLI
```powershell
cd c:\Unity\projects\callgrabbr\nml-main
npm install -g vercel
vercel --prod
```

## Step 5: Verify Deployment

1. Check https://callgrabbr.com
2. Monitor deployment at https://vercel.com/dashboard
3. Check for any build errors in the deployment logs

## Environment Variables Checklist

Make sure these are set in Vercel dashboard (Settings → Environment Variables):

- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `RETELL_API_KEY`
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`

## Troubleshooting

### "Git is not recognized"
- Restart your terminal/PowerShell after installing Git
- Or restart your computer
- Verify installation: `git --version`

### "Permission denied" when pushing
- Use GitHub Personal Access Token instead of password
- Generate at: https://github.com/settings/tokens
- Use token as password when prompted

### Vercel build fails
- Check all environment variables are set
- Check deployment logs for specific errors
- Ensure Node.js 22.x is being used

## Quick Deploy (No Git)

If you just want to deploy quickly without Git:

```powershell
cd c:\Unity\projects\callgrabbr\nml-main
npx vercel --prod
```

Follow the prompts to deploy directly.
