# Favorite iPad Games for Ages 2–3: Research + Selection (2026-02-08)

## Method
- Pulled app popularity/review signals from Apple App Store API + Google Play snippets.
- Pulled sentiment buzz from Reddit using `last30days` (reddit source, 30-day window).
- Focused on apps that are age-appropriate, simple to navigate, and can keep toddlers engaged with positive feedback loops.

## Top 3 selected apps

### 1) PBS KIDS Games
**Why it ranks high**
- Broad catalog of simple mini-games with familiar kid-friendly themes.
- Excellent for short attention spans because kids can switch activities quickly.

**Data signals**
- Apple App Store (US): 4.35 avg rating, **366,490** ratings.
- Google Play snippet: **10M+ downloads**, ~54.9K reviews.

**Reddit sentiment (last30days)**
- Recent thread references concern around offline behavior changes, but overall parent usage remains strong.
- Sentiment: **mixed-positive** (strong adoption, some usability concerns).

---

### 2) Khan Academy Kids
**Why it ranks high**
- Strong early-learning structure (letters, numbers, matching, basic problem solving).
- Highly parent-endorsed for educational value.

**Data signals**
- Apple App Store (US): 4.81 avg rating, **120,648** ratings.
- Google Play snippet: **10M+ downloads**, ~53.9K reviews.

**Reddit sentiment (last30days)**
- Historical/evergreen parent praise remains very strong (frequent recommendations in toddler/parent subs).
- Sentiment: **positive** for educational outcomes.

---

### 3) Sago Mini World
**Why it ranks high**
- Open-ended, imaginative play that works well for very young kids.
- Good for “stay engaged longer” sessions due to sandbox-like interactions.

**Data signals**
- Apple App Store (US): 4.35 avg rating, **61,969** ratings.
- Google Play snippet (developer listing): **10M+ downloads**, ~45.8K reviews.

**Reddit sentiment (last30days)**
- Parent chatter is smaller in volume but generally favorable; repeatedly recommended for toddler tablet play.
- Sentiment: **positive but lower volume**.

---

## Thesis
For age 2–3, the best engagement comes from mixing:
1. **Guided learning loops** (Khan style)
2. **Fast mini-game switching** (PBS style)
3. **Open-ended creative play** (Sago style)

That mix outperforms single-mode games for sustained attention and repeat sessions.

## What was added to Gordon Game Hub
Three new games inspired by those top picks (original implementations, no copied branded assets):

1. `games/trace-trail/` (Khan-inspired)
   - Tap-to-complete letter rounds
   - Sticker rewards + chime celebration

2. `games/peekaboo-pairs/` (PBS-inspired)
   - Animal matching rounds
   - Stars for matches + bonus stars for round clear

3. `games/pet-parade/` (Sago-inspired)
   - Dress-up/sandbox interactions
   - Hearts progression + pet unlock rotation every 5 hearts

## Asset/licensing approach
- Graphics: original UI + emoji + inline SVG/CSS effects (no copyrighted character assets).
- Audio: existing hub background music (`assets/music.mp3`) and local synthesized reward sounds.
- Royalty-free posture: no proprietary external image/audio packs added.
