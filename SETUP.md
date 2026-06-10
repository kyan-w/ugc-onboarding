# UGC Onboarding Portal — Setup Guide

## Accounts you need (both free)

| Account | Purpose | Sign-up link |
|---------|---------|-------------|
| **GitHub** (free) | Hosts the landing page publicly via GitHub Pages | github.com |
| **Google** (free) | Google Sheets tracks who watched what via Apps Script | google.com |

---

## Step 1 — Customize the page

Open `index.html` and find the `CONFIG` block near the bottom. Edit:

```js
creators: [
  "Jane Smith",     // ← replace with your 6 creators' real names
  "Alex Johnson",
  // ...
],

videos: [
  {
    title: "Video 1 — Program Overview",
    description: "What UGC is and how our program works",
    type: "youtube",        // use "youtube" for YouTube videos
    src: "dQw4w9WgXcQ"      // ← paste just the YouTube video ID here
  },
  // repeat for videos 2–4
]
```

### Where to find the YouTube video ID
A YouTube URL looks like: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
The video ID is everything after `?v=` → **dQw4w9WgXcQ**

---

## Step 2 — Set up Google Sheets tracking

1. Go to **script.google.com** → click **New Project**
2. Delete the default code, paste the entire contents of `tracker.gs`
3. Click **Save** (name it "UGC Tracker")
4. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy** → copy the **Web app URL**
6. Paste that URL into `index.html` in the `trackingUrl` field:

```js
trackingUrl: "https://script.google.com/macros/s/YOUR_ID/exec"
```

A Google Sheet will be created automatically on first submission.
To view the dashboard, open the script editor → Run → `buildDashboard`.

---

## Step 3 — Publish to GitHub Pages

1. Create a free account at **github.com**
2. Click **New repository** → name it `ugc-onboarding` → set to **Public** → Create
3. Upload `index.html` (drag & drop in the browser, or use git)
4. Go to repo **Settings → Pages**
5. Under "Branch" select `main`, folder `/root` → **Save**
6. Your live URL will be: `https://YOUR-USERNAME.github.io/ugc-onboarding/`

---

## Step 4 — Send each creator their personal link

Add `?creator=Name` to the URL so the dropdown auto-selects them:

```
https://YOUR-USERNAME.github.io/ugc-onboarding/?creator=Jane%20Smith
https://YOUR-USERNAME.github.io/ugc-onboarding/?creator=Alex%20Johnson
```

Send each person their own unique link — no confusion, and tracking is tied to their name automatically.

---

## How tracking works

- **Local save** — progress saves in the browser so creators can pause and resume.
- **Google Sheets log** — every video completion fires a log entry with name, video, and timestamp.
- **Dashboard** — run `buildDashboard()` in the Apps Script editor to get a live summary sheet.

---

## Checklist before launch

- [ ] Replaced all 6 creator names in CONFIG
- [ ] Replaced all 4 video IDs in CONFIG  
- [ ] Deployed Google Apps Script and pasted the URL into trackingUrl
- [ ] Uploaded index.html to GitHub Pages
- [ ] Tested one creator link end-to-end
- [ ] Sent each creator their personal URL
