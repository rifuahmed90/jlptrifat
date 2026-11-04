# 🌸 KanjiFlow — Dark Japanese Kanji & JLPT Trainer (PWA)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-teal.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Deploy to GitHub Pages](https://github.com/actions/deploy-pages/actions/workflows/deploy.yml/badge.svg)](https://github.com/actions/deploy-pages)
[![JLPT Levels](https://img.shields.io/badge/JLPT-N5%20%7C%20N4%20%7C%20N3%20%7C%20N2%20%7C%20N1-emerald.svg)](#)

> **বাংলা ও ইংরেজির সমন্বয়ে জাপানি কাঞ্জি, শব্দভাণ্ডার, ব্যাকরণ এবং হাতের লেখা শেখার ১০০% অফলাইন ও ফ্রি আধুনিক PWA অ্যাপ্লিকেশন।**
> A modern, zero-dependency, AMOLED dark-mode Japanese Kanji and Vocabulary trainer featuring authentic Japanese School Worksheets (漢字練習帳), Spaced Repetition (SRS), interactive stroke animations, and multi-device cloud synchronization.

---

## ✨ প্রধান বৈশিষ্ঠ্যসমূহ (Key Features)

- 🎴 **JLPT N5 থেকে N1 কাঞ্জি ডাটাবেস:** বাংলা অর্থ, ওন'ইওমি (On'yomi), কুন'ইওমি (Kun'yomi), স্ট্রোক কাউন্ট, মনোটাইপ মেমোরি স্টোরি এবং বাস্তব উদাহরণ বাক্য।
- 📝 **জাপানি স্কুল ওয়ার্কশীট (漢字練習帳):** জাপানের প্রাথমিক বিদ্যালয়ের আসল খাতার স্টাইলে প্র্যাকটিস শিট জেনারেটর — প্রতিটি কাঞ্জির মাস্টার বক্স, ১০টি প্র্যাকটিস সেল, ফুরিগানা/ওকুরিগানা সারি এবং প্রতি A4 পেজে ৫টি কাঞ্জি নিয়ে হাই-কোয়ালিটি PNG ডাউনলোড ও ডিরেক্ট প্রিন্ট।
- ✂️ **অটো-কাঞ্জি এক্সট্রাক্টর (Auto Cleaner):** যেকোনো জাপানি অনুচ্ছেদ বা বাক্য পেস্ট করলে হিরাগানা/কাতাকানা বাদ দিয়ে স্বয়ংক্রিয়ভাবে কাঞ্জিগুলোকে ফিল্টার করে কাস্টম প্র্যাকটিস শিট তৈরি।
- ✍️ **ইন্টারেক্টিভ ক্যানভাস ও স্ট্রোক অর্ডার:** KanjiVG ভেক্টর অ্যানিমেশনের মাধ্যমে নিখুঁত স্ট্রোক অর্ডার দেখা এবং ক্যানভাসে হাত দিয়ে আঁকার সুবিধা (Watch & Draw Mode)।
- 🧠 **বৈজ্ঞানিক SRS (Spaced Repetition System):** স্মৃতির স্থায়ীত্বের জন্য সুনির্দিষ্ট টাইম-ইন্টারভালে (৪ ঘণ্টা, ১ দিন, ৩ দিন, ১ সপ্তাহ, ১ মাস) অটোমেটিক রিভিশন ট্র্যাকিং ও ফ্ল্যাশকার্ড কুইজ।
- 📖 **N5–N3 ব্যাকরণ সহায়িকা (Grammar Hub):** ক্রিয়াপদের ৩টি গ্রুপ, ৮টি ছদ্মবেশী ফাঁদ, পার্টিকেল কম্পাস (に বনাম で), あげる/くれる/もらう এবং সকর্মক-অকর্মক নিয়মাবলি।
- 🔍 **টেক্সট রিডার ও অ্যানালাইজার (Text Reader):** জাপানি বাক্যের উপর স্বয়ংক্রিয় ফুরিগানা ও কাঞ্জি মিনিং পপআপ।
- ⌨️ **সম্পূর্ণ কিবোর্ড ন্যাভিগেশন:** মাউস ছাড়াই কিবোর্ডের `1`–`4`, `?`, `/`, `Space`, `Esc`, অ্যারো কি (`←`/`→`), `F`, `S`, `D`, `P` ইত্যাদি দিয়ে পুরো অ্যাপ ব্যবহার।
- ☁️ **Google একাউন্ট দিয়ে ক্লাউড সিঙ্ক (Firebase):** যেকোনো ফোন, ট্যাবলেট বা কম্পিউটারে প্রগ্রেস ও SRS হিস্ট্রি অটোমেটিক সিঙ্ক।
- 📱 **১০০% অফলাইন PWA:** ইন্টারনেট ছাড়াই বিমান বা পাতালরেলেও সম্পূর্ণ কাজ করে, ইন্সটল করা যায় Android, Windows, Mac এবং iOS-এ।

---

## 🚀 গিটহাবে আপলোড এবং স্বয়ংক্রিয় ওয়েবসাইট চালু করার নিয়ম (GitHub & Auto Deploy)

এই রিপোজিটরিতে **GitHub Actions Workflow (`.github/workflows/deploy.yml`)** এবং **`.nojekyll`** ফাইল আগে থেকেই সাজিয়ে দেওয়া আছে। আপনি কোড পুশ করলেই গিটহাব নিজে নিজেই সম্পূর্ণ ওয়েবসাইট লাইভ হোস্ট করে দেবে!

### ধাপ ১: গিটহাবে নতুন রিপোজিটরি তৈরি করুন
1. [GitHub](https://github.com)-এ লগইন করে **New repository** বাটনে ক্লিক করুন।
2. রিপোজিটরির নাম দিন (যেমন: `kanjiflow` বা `kanji-trainer`)।
3. **Public** সিলেক্ট করুন এবং **Create repository** বাটনে ক্লিক করুন।

### ধাপ ২: লোকাল কম্পিউটার থেকে কোড পুশ করুন
আপনার কম্পিউটারে টার্মিনাল বা Git Bash খুলে প্রজেক্ট ফোল্ডারে নিচের কমান্ডগুলো চালান:

```bash
# গিট ইনিশিয়ালাইজ করুন
git init

# সব ফাইল যুক্ত করুন
git add .

# প্রথম কমিট দিন
git commit -m "Initial commit: KanjiFlow PWA with auto GitHub Pages deploy"

# মেইন ব্রাঞ্চ সেট করুন
git branch -M main

# আপনার গিটহাব রিপোজিটরির ইউআরএল যোগ করুন (আপনার ইউজারনেম দিয়ে রিপ্লেস করুন)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# গিটহাবে পুশ করুন
git push -u origin main
```

### ধাপ ৩: গিটহাব পেজেস (GitHub Pages) এনাবল করুন (অটো ওয়েবসাইট)
1. গিটহাবে আপনার রিপোজিটরির **Settings** (সেটিংস) ট্যাবে যান।
2. বাম পাশের মেনু থেকে **Pages** অপশনে ক্লিক করুন।
3. **Build and deployment** সেকশনের নিচে **Source** দেখতে পাবেন:
   - সেখানে ড্রপডাউন থেকে **GitHub Actions** নির্বাচন করুন।
   *(অথবা আপনি চাইলে **Deploy from a branch** বেছে নিয়ে Branch: `main` ও Folder: `/(root)` দিয়ে Save করতে পারেন)*
4. ১ থেকে ২ মিনিটের মধ্যে গিটহাব স্বয়ংক্রিয়ভাবে আপনার লাইভ ওয়েবসাইট লিংক জেনারেট করে দেবে!
   - আপনার সাইটের ঠিকানা হবে: `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## 💻 লোকাল মেশিনে রান করার নিয়ম (Run Locally)

কোনো এক্সটার্নাল প্যাকেজ বা বিল্ড স্টেপ প্রয়োজন নেই। নোড.জেএস থাকলে সরাসরি নিচের কমান্ড দিন:

```bash
npm start
# এরপর ব্রাউজারে http://localhost:3000 ওপেন করুন
```

অথবা সরাসরি `index.html` ফাইলটি যেকোনো ব্রাউজারে ডাবল ক্লিক করে রান করতে পারেন।

---

## ⌨️ কিবোর্ড শর্টকাট সহায়িকা (Keyboard Shortcuts)

যেকোনো সময় কিবোর্ডের **`?`** চাপলে শর্টকাট পপআপ দেখতে পাবেন:

| শর্টকাট কি | কাজ |
|---|---|
| **`1`** বা **`H`** | হোম পেজে যাওয়া (Home) |
| **`2`** বা **`K`** | কাঞ্জি লাইব্রেরিতে যাওয়া (Library) |
| **`3`** বা **`Q`** | কুইজ ও ফ্ল্যাশকার্ড পেজে যাওয়া (Quiz) |
| **`4`** বা **`U`** | প্রোফাইল ও প্রগ্রেসে যাওয়া (You) |
| **`/`** | সার্চ বক্সে দ্রুত কার্সর নিয়ে যাওয়া |
| **`Esc`** | যেকোনো উইন্ডো/ডায়ালগ/কাঞ্জি শিট বন্ধ করা বা ব্যাকে ফেরা |
| **`?`** | কিবোর্ড শর্টকাট সহায়িকা ডায়ালগ খোলা/বন্ধ করা |
| **`←`** / **`→`** বা **`J`** / **`K`** | কাঞ্জি শিটে আগের বা পরের কাঞ্জি দেখা |
| **`F`** | প্রিয় কাঞ্জি হিসেবে সংরক্ষণ (Favorite / Star) টগল |
| **`M`** বা **`L`** | কাঞ্জি শেখা সম্পন্ন (Learned / SRS) টগল |
| **`S`** বা **`V`** | জাপানি সঠিক উচ্চারণ শোনা (TTS Speech) |
| **`Space`** বা **`P`** | স্ট্রোক অ্যানিমেশন প্লে / রিস্টার্ট |
| **`[`** / **`]`** | স্ট্রোক এক ধাপ আগে বা পরে নেওয়া |
| **`C`** | হাতের লেখা প্র্যাকটিস ক্যানভাস মোছা |
| **`W`** | Watch এবং Draw মোড পরিবর্তন |
| **`1`**–**`4`** বা **`A`**–**`D`** | কুইজের উত্তর নির্বাচন |
| **`Space`** / **`Enter`** | ফ্ল্যাশকার্ডের উল্টো পিঠ দেখা (Reveal) |
| **`1`** / **`2`** / **`3`** | ফ্ল্যাশকার্ড রেটিং (ভুলে গেছি / মনে আছে / খুব সহজ) |
| **`D`** | জাপানি স্কুল প্র্যাকটিস শিট PNG ডাউনলোড |
| **`P`** বা **`Ctrl + P`** | A4 সাইজে সরাসরি প্রিন্ট বা PDF সেভ করা |

---

## 📁 ফাইল ও ফোল্ডার স্ট্রাকচার (Repository Structure)

```
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions auto-deploy workflow for Pages
├── .gitignore              # Git ignore rules for node_modules, temp files
├── .nojekyll               # Disables Jekyll processing on GitHub Pages
├── css/
│   ├── styles.css          # Design system, AMOLED dark theme & components
│   └── responsive.css      # Desktop, tablet and mobile responsive rules
├── data/                   # Source JLPT N5, N4, legacy N3 & Radical datasets
├── js/
│   ├── app.js              # State engine, SRS calculations, shortcuts & audio
│   ├── data.js             # Compiled, ultra-fast linguistic dataset
│   ├── firebase-config.js  # Optional Firebase authentication config
│   ├── firebase-sync.js    # Offline-first Firebase Firestore cloud sync
│   └── views.js            # UI screens, worksheets, canvas & flashcards
├── scripts/
│   ├── build-data.js       # Dataset compiler script
│   └── verify-build.js     # Verification and build test script
├── icons/                  # PWA icons (Android, iOS, Favicons)
├── index.html              # Core application entry point
├── manifest.json           # Progressive Web App manifest
├── serve.js                # Zero-dependency local development server
├── sw.js                   # Service Worker for 100% offline caching
└── package.json            # Scripts & project metadata
```

---

## 🔒 মাল্টি-ডিভাইস ক্লাউড সিঙ্ক (Optional Firebase Cloud Sync)

আপনার গুগল একাউন্ট দিয়ে ফোন এবং কম্পিউটারের মাঝে প্রগ্রেস সিঙ্ক করতে:
1. [Firebase Console](https://console.firebase.google.com)-এ একটি ফ্রি প্রজেক্ট তৈরি করুন।
2. **Authentication** থেকে Google সাইন-ইন চালু করুন।
3. **Firestore Database** তৈরি করুন।
4. প্রজেক্টের Web Config কপি করে অ্যাপের **Profile** পেজে "Firebase কনফিগ সেট করুন" বক্সে পেস্ট করে দিন (অথবা `js/firebase-config.js` ফাইলে পেস্ট করুন)।
*(কোনো কনফিগ না দিলেও অ্যাপটি পুরোপুরি অফলাইনে লোকাল স্টোরেজে আজীবন চলবে!)*

---

## 📄 লাইসেন্স (License)

This project is licensed under the **MIT License**. Free for students, teachers, and language enthusiasts worldwide! 🎌
