# Gordon Game Hub

## What This Is

A kid-friendly (toddler, ages 2-3) game hub PWA built for iPad. Gordon is the mascot character. The site is hosted on GitHub Pages at **www.gordongamehub.com** (via CNAME). The repo is at `https://github.com/99redder/gordon-game-hub`.

## Tech Stack

- **No build step.** Pure vanilla HTML, CSS, and JavaScript. No frameworks, no bundlers, no npm (except the Firebase Cloud Function).
- **PWA** with service worker (`sw.js`) for offline caching. Cache-first strategy with versioned cache name (currently `gordon-game-hub-v15`).
- **Firebase Realtime Database** (compat SDK loaded via CDN) for cross-device messaging.
- **Firebase App Check** with reCAPTCHA v3 for API protection.
- **Firebase Cloud Function** (`functions/index.js`) that prunes messages older than 48 hours every 6 hours.
- **Google Fonts** - Fredoka font family (weights 600, 700, 800) used throughout.
- **CSS custom properties** for theming (defined at top of `css/styles.css`).

## Project Structure

```
├── index.html                  # Main hub page (game grid + Gordon character + message display)
├── messages.html               # Separate PWA for family to send messages to Gordon
├── manifest.webmanifest        # PWA manifest for main hub
├── messages-manifest.webmanifest # PWA manifest for messages app
├── sw.js                       # Service worker (pre-caches all assets, cache-first)
├── CNAME                       # GitHub Pages custom domain (www.gordongamehub.com)
├── css/
│   └── styles.css              # Shared styles for hub + all games
├── js/
│   ├── app.js                  # Main hub logic (Gordon interaction, music, game transitions, Firebase message cycling)
│   ├── messages.js             # Messages PWA logic (Firebase push/clear)
│   ├── firebase-config.js      # Firebase initialization (shared by both pages)
│   └── app-check.js            # Firebase App Check with reCAPTCHA v3
├── assets/
│   ├── music.mp3               # Background music (royalty-free)
│   └── MUSIC_LICENSE.txt
├── icons/
│   └── icon.svg                # App icon (SVG)
├── functions/
│   ├── index.js                # Firebase Cloud Function (prune old messages)
│   └── package.json
└── games/
    ├── letter-pop/             # Letter recognition game
    │   ├── index.html
    │   └── letter-pop.js
    ├── shape-safari/           # Shape identification game
    │   ├── index.html
    │   └── shape-safari.js
    ├── number-count/           # Counting/tapping game
    │   ├── index.html
    │   └── number-count.js
    ├── coloring/               # Free-draw coloring canvas
    │   ├── index.html
    │   └── coloring.js
    └── dress-up/               # Dress up character game
        ├── index.html
        └── dress-up.js
```

## Key Architecture Decisions

### Two PWAs, One Codebase
- `index.html` = the main Game Hub that Gordon uses (shows games + animated messages)
- `messages.html` = a separate installable PWA for family members to send messages from their own devices
- Both share `css/styles.css`, `firebase-config.js`, `app-check.js`, and `sw.js`

### Firebase Messaging System
- Messages stored at `db.ref('messages')` with fields: `{ text, from, ts }`
- `messages.js` pushes messages via `db.ref('messages').push()`
- `app.js` listens in real-time via `ref.on('value')` and cycles through messages above Gordon with bounce-in/fade-out CSS animations (5-second intervals)
- "From" name persisted in localStorage key `ggh_fromName`
- Cloud Function prunes messages older than 48 hours

### Service Worker Caching
- All game HTML + JS files are listed in the `ASSETS` array and pre-cached on install
- Cache-first strategy: cached files served instantly, network used as fallback
- Firebase API URLs (`firebaseio.com`, `googleapis.com`) are excluded from caching
- Supports `SKIP_WAITING` message for immediate SW updates
- `index.html` also includes `<link rel="prefetch">` tags for all game files

### Games
- Each game is self-contained in `games/<name>/` with its own `index.html` and JS file
- Games share `../../css/styles.css` for common button styles, cloud backgrounds, etc.
- Each game has its own `<style>` block for game-specific layout
- All games have: back-to-hub button (`.hubBtn` class), music toggle, cloud background, confetti celebration animation
- **Animal Bucket** is hosted externally at `https://99redder.github.io/bucketgame/` (don't modify it)
- Game-specific patterns: large touch targets, Fredoka font, colored gradient buttons, `clamp()` responsive sizing

### Music
- Background music plays at volume 0.45, loops continuously
- Music preference stored in localStorage key `ggh_music` (on/off)
- iOS/iPad autoplay restrictions handled by waiting for first user gesture
- Music toggle button renders SVG speaker icon (on/off states)

## Common Patterns

- `const $ = (sel) => document.querySelector(sel)` used in all JS files
- CSS: glass-morphism cards with `backdrop-filter: blur()`, soft shadows, rounded corners (22-26px)
- CSS: `clamp()` for responsive font sizes throughout
- CSS: cloud animation layers in `::before`/`::after` pseudo-elements
- Games use `.good` / `.bad` outline classes for correct/incorrect feedback
- Confetti celebration via CSS-only `@keyframes` animation (no JS particles)

## Important Notes

- **iPad-first design.** Everything is optimized for touch, large targets, no hover-dependent features.
- **No build step.** Edit files directly. Changes go live when pushed to `main` branch (GitHub Pages).
- **Service worker cache versioning.** When changing cached files, bump the version number in `sw.js` (`CACHE_NAME`) so users get updates. The SW auto-activates and reloads.
- **Don't modify Animal Bucket.** It's an external game hosted at a different repo.
- **Firebase config is in `js/firebase-config.js`.** The API key and config are public (standard for Firebase web apps). Security is handled by Firebase Database Rules and App Check.
- **`prefers-reduced-motion` support** is included in `css/styles.css` for accessibility.
