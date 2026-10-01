/**
 * Haptic feedback utility using Web Vibration API (navigator.vibrate).
 * Gracefully no-ops on desktop or unsupported devices.
 */
class HapticFeedbackService {
  private isSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  // Light tap (10ms) - button presses, tabs
  light(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
  }

  // Medium tap (25ms) - checkbox toggles, set logged
  medium(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
  }

  // Success pattern (35ms, pause 40ms, 45ms) - quest done, level up, rewards claimed
  success(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate([35, 40, 45]);
      } catch {}
    }
  }

  // Alert/Warning pattern (60ms, pause 60ms, 60ms) - timer done, countdown
  alert(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate([60, 60, 60]);
      } catch {}
    }
  }
}

export const haptics = new HapticFeedbackService();
