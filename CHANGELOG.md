# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-10-01

### Added
- **PWA Offline Service Worker**: `public/sw.js` precaching shell assets for complete offline installation.
- **Background Tab Timer Synchronization**: Ref-based timestamp recovery on `visibilitychange` preventing browser throttling on Pomodoro and active workout timers.
- **Diminishing Returns Progression Formula**: Non-linear stat progression curve preventing stat inflation (`stat += xp / (stat + 25)`).
- **Comprehensive Backup Validation & Migration**: Schema migration pipeline (`v1.0.0` -> `v2.0.0`) including full calisthenics state and benchmark history.
- **Full Keyboard Accessibility**: ARIA roles, `tabindex`, visible focus indicators, and keyboard controls (`Space` / `Enter`) on the reflex tester arena.
- **Mobile Safe Area & Reduced Motion**: Full support for iOS notch/home-bar safe areas (`env(safe-area-inset-*)`) and `@media (prefers-reduced-motion: reduce)`.
- **CI / DevOps Pipeline**: Added GitHub Actions workflow (`.github/workflows/ci.yml`), `LICENSE` (MIT), and `CONTRIBUTING.md`.

### Fixed
- **Custom Quest Click Collision**: Prevented quest deletion button clicks from triggering quest completion awards.
- **Confetti Resource Conservation**: Automatically clear and cancel RAF loops on document hide; capped maximum particle count to prevent low-end device lag.
- **Git Remote Target**: Verified synchronization with `https://github.com/ashinmathai33-hash/new.git`.

---

## [2.0.0] - 2026-09-30

### Added
- **12-Month Calisthenics Progression Engine**: Autoregulated system based on form quality, RPE, and consecutive clean sessions.
- **Dual Environment Architecture**: Strict `HOME` vs `HOSTEL` training mode adaptations.
- **Active Workout Session Player**: Interactive rep counters, hold timers, and post-exercise feedback.
- **Calisthenics Skill Tree**: Visual RPG branching graph across Push, Pull, Core, Shoulders, Legs, and Balance.
- **Central Exercise Registry**: 35+ calisthenics and fitness movements with form queues and safety precautions.
- **Fitness Benchmark Testing**: Baseline assessment engine with PR tracking across 7 core metrics.
- **Screen Wake Lock API**: Preserves screen activity during active workout sets and isometric planks.

---

## [1.0.0] - 2026-09-28

### Initial Release
- RPG 9-Stat Radar Chart.
- Pomodoro Focus Engine with ambient noise synthesizers.
- Daily quest tracking and anti-burnout Streak Shields.
- Cognitive reflex tester and eye care 20-20-20 trainer.
- Offline-first JSON export/import.
