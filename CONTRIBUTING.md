# Contributing to Level Up / Better Me

Thank you for your interest in contributing to Level Up / Better Me! This document outlines guidelines and development practices.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React 19 + TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Audio Engine**: Web Audio API Synthesizers (no external MP3 CDN dependencies)
- **Persistence**: Offline-First Local Storage with schema migration & JSON backup/restore
- **Hardware Integration**: Screen Wake Lock API for active workouts

---

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ashinmathai33-hash/new.git
   cd new
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Verify TypeScript compilation**:
   ```bash
   npx tsc -b
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📐 Guidelines & Rules

- **Offline-First & Privacy**: Never add external telemetry or mandatory cloud logins without user opt-in.
- **Gym-Free Fitness Design**: Workouts must strictly support **HOME** and **HOSTEL** environments without requiring gym memberships or heavy machines.
- **Strict Workout Cap**: Daily generated routines must never exceed 60 minutes.
- **Autoregulation Over Blind Increases**: Calisthenics progressions must honor form quality, RPE (perceived exertion), and recovery state.
- **Accessible & Responsive**: Components must support keyboard navigation (`Tab`, `Space`, `Enter`), ARIA roles, visible focus rings, and safe-area insets.
- **Zero Asset Dependency**: Keep audio synthesized via the Web Audio API rather than bundling external media files.

---

## 🌿 Pull Request Process

1. Fork the repo and create your feature branch: `git checkout -b feat/my-new-feature`
2. Ensure `npx tsc -b` and `npm run build` pass with zero errors or warnings.
3. Commit your changes: `git commit -m 'feat: add description of change'`
4. Push to your branch and open a Pull Request against `main`.
