# Kanji — dark JLPT trainer

A modern, Android/Material 3-inspired kanji learning app. Plain HTML, CSS and JavaScript — no build step, no dependencies.

The app ships with **257 kanji** (N5 80, N4 167 and 10 legacy N3), **1,818 vocabulary words** and a **214-radical reference**, with **Bengali-first meanings**, English secondary translations, memory stories, components, usage notes, example sentences, furigana and stroke order. The UI chrome stays in English.

## Run it

Double-click `index.html` for a quick look, or start the tiny local server (needed for offline mode and install):

```powershell
npm start
# then open http://localhost:8080
```

No dependencies to install. Node.js is the only requirement for the server.

On desktop Chrome/Edge, use **Install app** in the address bar. On Android, open the local URL in Chrome and choose **Add to Home screen**.

## Data

Source files live in `data/`:

| File | Contents |
| --- | --- |
| `data/kanji_n5.json` | JLPT N5 dataset v1.3 — 80 kanji, 868 words |
| `data/kanji_n4.json` | JLPT N4 dataset v1.3 — 167 kanji, 1,180 words |
| `data/legacy_n3.json` | 10 legacy N3 kanji kept from the original app |
| `data/radicals.json` | 214 Kangxi radicals with Bengali meanings and family kanji |

`js/data.js` is generated — do not edit it by hand. After changing anything in `data/`, regenerate it:

```powershell
node scripts/build-data.js
```

The generator merges both vocabulary registries (N5 and N4 share `w_n5_*` ids) into one `VOCAB` map, links each kanji through `vocabIds`, builds the 214-entry `RADICALS` reference, and emits `DATA_META`, `VOCAB`, `RADICALS` and `KANJI`. The runtime stays dependency-free: `js/data.js` is a plain script loaded before the views.

## Features

- **257 kanji** across JLPT N5 (80), N4 (167) and N3 (10)
- **Bengali meanings** as the primary label, English as a secondary line
- **Rich detail sheet** — Bengali/English meaning, radical explanation, memory story and components, usage note, linked vocabulary with furigana, example sentences with ruby, Japanese text-to-speech, and stroke-order paths
- **Radical reference** — all 214 Kangxi radicals with Bengali meanings, readings, stroke counts and their kanji families; reachable from the Kanji library or any kanji detail sheet, with radical-family chips linked back to the deck
- **Reading display settings** — global switches for furigana above kanji, the kana reading line and Bengali/English translation lines, with a live preview; choices persist per device
- Dark Material 3 design: tonal surfaces, pill navigation, ripple feedback, bottom sheets, snackbars
- **Home** — daily kanji, streak, progress ring, up-next carousel and level progress
- **Kanji library** — live search across character, Bengali/English meaning, reading, vocabulary and example sentences, plus level filters and a saved deck
- **Quiz** — 10 multiple-choice questions per level with Bengali answers, instant feedback, scoring and an English-backed answer review
- **Profile** — learned/saved counts, accuracy, day streak, milestones, reading display settings and reset
- **Google Login & Cloud Sync (Firebase)** — sign in with your Google account to automatically sync your kanji progress, SRS stages, streak and quiz scores across all your devices (Android phone, iPhone, PC, Mac). Offline-capable with automatic conflict-free merging!
- **Responsive everywhere** — phone and tablet keep the bottom navigation (tablets never show the rail), while mouse-driven desktops from 1200px up get a side navigation rail; multi-column home/profile/quiz views and a centered kanji dialog on larger screens
- Progress persists in `localStorage`; a service worker caches the app shell (including the generated dataset) for offline use when served over localhost or HTTPS

## Multi-Device Cloud Sync (Firebase Setup)

To enable Google Login and real-time multi-device synchronization:

1. Create a free project on [Firebase Console](https://console.firebase.google.com).
2. Under **Authentication** -> **Sign-in method**, enable **Google**.
3. Under **Firestore Database**, click **Create database** (start in test mode or production mode).
4. Go to **Project Settings** -> General -> Add Web App, and copy the `firebaseConfig` object.
5. You can paste the config in two convenient ways:
   - **From the app UI**: Open the app, go to **Profile (You)** -> click **Firebase কনফিগ সেট করুন**, paste the config JSON and click Save!
   - **Or in code**: Paste it directly into `js/firebase-config.js`.

Recommended Firestore Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Structure

```
index.html          app shell
css/styles.css      design system and components
css/responsive.css  tablet, touch and desktop layouts
js/data.js          generated kanji, vocabulary + radical dataset
js/views.js         screen markup, radical reference and rich detail sheet
js/app.js           state, quiz engine, TTS, interactions
scripts/build-data.js  data generator (Node, build time only)
data/               source JLPT + radical JSON files
sw.js               offline app-shell cache
serve.js            zero-dependency local server
manifest.json       PWA metadata
icons/              app icons
```
