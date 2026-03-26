# 🪑 The Chair — Work Made Easier

> A live MUN committee management dashboard built for Chairpersons to command the committee with confidence.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-gold?style=flat)

---

## 📌 About

**The Chair** is a real-time General Speakers' List (GSL) and procedural timer dashboard designed for MUN Chairpersons. Built with a UN-inspired luxury dark interface, it helps chairs manage delegate queues, control speaking time, and handle yield protocols — all in one place.

---

## ✨ Features

- 🎙 **General Speakers' List (GSL)** — Add, remove, or move delegates in the queue. Current speaker is always highlighted on the floor.
- ⏱ **Committee Timer** — Animated countdown timer with presets (30s, 1m, 90s, 2m). Turns red at 10 seconds. Start, Pause, Reset controls.
- ⚖️ **Yield Protocol** — Three standard MUN yields on pause:
  - **Yield to Chair** — Resets timer, advances to next speaker
  - **Yield to Delegate** — Keeps remaining time, swaps current speaker
  - **Yield to Questions** — Keeps remaining time for Q&A
- 📋 **Session Log** — Every action (additions, removals, yields) is timestamped and persisted in SQLite.
- 🌐 **Flag Detection** — Auto-detects country flags for 60+ nations.
- 🏛️ **UN-Inspired UI** — Dark navy, gold accents, animated globe watermark, Cinzel typography.

---

## 🛠️ Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Backend   | Python · Flask      |
| Database  | SQLite              |
| Frontend  | React.js 18 · CSS3  |
| Fonts     | Google Fonts (Cinzel, Cormorant Garamond, DM Mono) |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- pip

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/the-chair.git
cd the-chair

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py
```

### Open in Browser
```
http://localhost:5000
```

---

## 📁 Project Structure

```
the-chair/
├── app.py                  # Flask backend + SQLite API
├── requirements.txt        # Python dependencies
├── mun.db                  # SQLite database (auto-created)
├── templates/
│   └── index.html          # Main HTML template
└── static/
    ├── css/
    │   └── main.css        # Full UI styling
    └── js/
        └── app.jsx         # React.js frontend
```

---

## 🌐 Live Demo

> 🔗 [Live Link](https://your-deployment-url.com) — *(add after deployment)*
> 📦 [GitHub Repo](https://github.com/YOUR_USERNAME/the-chair)

---

## 📸 Preview

> *A dark navy UN-inspired dashboard with gold accents, animated ring timer, and delegate queue management.*

---

## 📖 MUN Concepts Used

| Term | Meaning |
|------|---------|
| **GSL** | General Speakers' List — the queue of delegates waiting to speak |
| **The Chair** | The presiding officer of the committee |
| **Yield** | Giving remaining speaking time to someone else |
| **Quorum** | Minimum delegates required for a session |
| **The Floor** | Being "on the floor" means currently speaking |

---

## 🏆 Built For

> **Task 1: Live Committee GSL & Timer Dashboard (COMPULSORY)**
> Topic: React State Management, Deployment, and MUN Rules of Procedure

---
tee.</em>
</p>
