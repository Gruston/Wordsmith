# WordSmith — How to Deploy to Your iPhone

## What you have
A folder called `wordsmith-pwa` containing:
- `index.html` — the entire app
- `manifest.json` — tells your phone this is an installable app
- `sw.js` — makes the app work offline
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — app icons

---

## Step 1 — Deploy to Netlify (free, takes 5 minutes)

1. Go to **https://netlify.com** in your browser
2. Click **Sign up** — create a free account (use your email)
3. Once logged in, you'll see a dashboard
4. Look for a box that says **"Deploy manually"** or **"drag and drop your site folder here"**
   - It's usually near the bottom of the main page
5. **Drag the entire `wordsmith-pwa` folder** onto that box
6. Wait 30 seconds — Netlify will give you a URL like:
   `https://happy-einstein-abc123.netlify.app`
7. That URL is your app. It's live immediately.

> **Tip:** You can rename the URL in Netlify settings to something like
> `wordsmith-beta.netlify.app` for free.

---

## Step 2 — Install on your daughter's iPhone

1. On her iPhone, open **Safari** (must be Safari — Chrome won't work for this)
2. Type in the Netlify URL you got above
3. The app will load in Safari — it will look exactly as designed
4. Tap the **Share button** at the bottom of Safari
   (the box with an arrow pointing up ↑)
5. Scroll down and tap **"Add to Home Screen"**
6. Tap **"Add"** in the top right
7. The WordSmith icon now appears on her home screen
8. Tap it — the app opens full screen with no browser bar, exactly like a real app

---

## Step 3 — Verify it's working

When she first opens the app:
- She'll see the onboarding screen (name, year level, text selection)
- Her progress saves automatically to her phone
- The app works offline after the first load (word cards, quizzes, puzzles all work without internet)
- AI features (if added later) will require internet

---

## Updating the app later

When you have a new version of the code:
1. Replace the files in your folder with the new ones
2. Drag the updated folder onto Netlify again
3. The app updates automatically — her progress is saved on her phone and is not affected

---

## Troubleshooting

**"Add to Home Screen" option doesn't appear:**
- Must use Safari, not Chrome or Firefox
- Make sure the URL starts with `https://` (Netlify always does this automatically)

**App shows a blank white screen:**
- Wait 10 seconds — Babel (the code translator) takes a moment on first load
- Check you have internet for the first load

**Progress disappeared:**
- Progress is saved in Safari's local storage on her phone
- It persists between sessions as long as she doesn't clear Safari's browsing data
- Tip: in iPhone Settings → Safari → Advanced → Website Data — do not clear WordSmith data

---

## Important notes for beta testing

- This is a **PWA (Progressive Web App)** — it behaves like a real app but runs through Safari under the hood
- It is **not** in the App Store — it installs directly via "Add to Home Screen"
- Only people you share the Netlify URL with can access it
- The free Netlify tier supports up to 100GB bandwidth/month — more than enough for 1–20 users
- You can password-protect the site in Netlify settings if you want extra privacy

---

## Next steps (when ready)

When you're ready to move to a proper native iOS app (Phase 2 of the build plan),
the code in this folder is the foundation. A developer can convert it to
React Native / Expo and submit it to TestFlight for proper iOS beta testing.
