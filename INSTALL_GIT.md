# Git Installation Instructions

## The Git download page should open in your browser automatically.

If it didn't open, go to: https://git-scm.com/download/win

## Installation Steps:

1. **Download the installer**
   - Click the download link (usually starts automatically)
   - File will be named something like: `Git-2.47.0-64-bit.exe`

2. **Run the installer**
   - Open the downloaded file
   - If Windows asks "Do you want to allow this app to make changes?" → Click **Yes**

3. **Installation Options** (Recommended Settings):
   - ✅ **Select Components:** Leave defaults checked
   - ✅ **Default Editor:** Use whatever default is shown (or choose VS Code/Notepad++ if you prefer)
   - ✅ **PATH Environment:** Select **"Git from the command line and also from 3rd-party software"** (should be default)
   - ✅ **HTTPS Transport:** Use the OpenSSL library (default)
   - ✅ **Line Ending Conversions:** Checkout Windows-style, commit Unix-style (default)
   - ✅ **Terminal Emulator:** Use MinTTY (default)
   - ✅ **Default behavior of git pull:** Default (fast-forward or merge)
   - ✅ **Credential Helper:** Git Credential Manager (default)
   - ✅ **Extra Options:** Enable file system caching (default)
   - ✅ Just click **Next** through all screens using defaults

4. **Complete Installation**
   - Click **Install**
   - Wait for installation to complete
   - Click **Finish**

5. **Verify Installation**
   - **IMPORTANT:** Close any open PowerShell/Terminal windows
   - Open a **NEW** PowerShell window
   - Run: `git --version`
   - You should see something like: `git version 2.47.0.windows.1`

## After Installation

Once Git is installed and verified, let me know and I'll help you:
1. Create your GitHub repository
2. Initialize Git in your project
3. Push your code to GitHub
4. Connect Vercel to auto-deploy

## Troubleshooting

**If `git --version` doesn't work:**
- Make sure you opened a NEW PowerShell window (old ones won't see the updated PATH)
- Restart your computer if needed
- Verify Git is in your PATH: `$env:Path -split ';' | Select-String -Pattern 'Git'`
