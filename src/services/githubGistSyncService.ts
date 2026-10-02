// GitHub Private Gist Synchronization Engine
// 100% Free, Private, Version-Controlled Cloud Sync using GitHub's Native Gist API

import { storage } from './storageService';
import { FullBackupData } from '../types';

export interface GitHubGistConfig {
  token: string;
  gistId: string | null;
  autoSync: boolean;
}

export interface GistSyncState {
  isConfigured: boolean;
  status: 'idle' | 'syncing' | 'synced' | 'error';
  gistId: string | null;
  gistUrl: string | null;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  username: string | null;
}

const STORAGE_KEYS = {
  CONFIG: 'levelup_github_gist_config',
  LAST_SYNC: 'levelup_github_gist_last_sync'
};

const GIST_FILENAME = 'levelup-rpg-save.json';

class GitHubGistSyncService {
  private state: GistSyncState = {
    isConfigured: false,
    status: 'idle',
    gistId: null,
    gistUrl: null,
    lastSyncedAt: null,
    errorMessage: null,
    username: null
  };

  private listeners: Set<(state: GistSyncState) => void> = new Set();

  constructor() {
    this.loadInitialState();
  }

  private loadInitialState() {
    const config = this.getConfig();
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

    if (config.token) {
      this.state.isConfigured = true;
      this.state.gistId = config.gistId;
      this.state.lastSyncedAt = lastSync;
      if (config.gistId) {
        this.state.gistUrl = `https://gist.github.com/${config.gistId}`;
      }

      // Verify token in background
      this.verifyToken(config.token).then(userInfo => {
        if (userInfo) {
          this.state.username = userInfo.login;
          this.notify();
          if (config.autoSync) {
            this.syncWithGist().catch(() => {});
          }
        }
      });
    }
  }

  public getConfig(): GitHubGistConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      token: '',
      gistId: null,
      autoSync: true
    };
  }

  public saveConfig(config: GitHubGistConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    this.state.isConfigured = Boolean(config.token);
    this.state.gistId = config.gistId;
    if (config.gistId) {
      this.state.gistUrl = `https://gist.github.com/${config.gistId}`;
    }
    this.notify();
  }

  public getState(): GistSyncState {
    return { ...this.state };
  }

  public subscribe(fn: (state: GistSyncState) => void): () => void {
    this.listeners.add(fn);
    fn(this.getState());
    return () => this.listeners.delete(fn);
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach(fn => fn(s));
  }

  // Verify GitHub Token & get user profile
  public async verifyToken(token: string): Promise<{ login: string; name: string } | null> {
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/vnd.github+json'
        }
      });

      if (!res.ok) return null;
      const data = await res.json();
      return { login: data.login, name: data.name || data.login };
    } catch {
      return null;
    }
  }

  // Find existing LevelUp Gist or create a new secret Gist
  public async findOrCreateGist(token: string, existingGistId?: string): Promise<{ success: boolean; gistId?: string; message: string }> {
    const cleanToken = token.trim();
    if (!cleanToken) return { success: false, message: 'GitHub Personal Access Token is required.' };

    this.state.status = 'syncing';
    this.notify();

    try {
      // 1. If explicit Gist ID provided, check it
      if (existingGistId && existingGistId.trim()) {
        const checkRes = await fetch(`https://api.github.com/gists/${existingGistId.trim()}`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            Accept: 'application/vnd.github+json'
          }
        });

        if (checkRes.ok) {
          const gistData = await checkRes.json();
          const targetId = gistData.id;
          const config = this.getConfig();
          config.token = cleanToken;
          config.gistId = targetId;
          this.saveConfig(config);

          this.state.isConfigured = true;
          this.state.gistId = targetId;
          this.state.gistUrl = gistData.html_url || `https://gist.github.com/${targetId}`;
          this.state.status = 'synced';
          this.notify();
          return { success: true, gistId: targetId, message: 'Existing Private Gist connected!' };
        }
      }

      // 2. Search user's recent gists for levelup-rpg-save.json
      const listRes = await fetch('https://api.github.com/gists?per_page=30', {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github+json'
        }
      });

      if (listRes.ok) {
        const gists = await listRes.json();
        const found = gists.find((g: any) => g.files && g.files[GIST_FILENAME]);
        if (found) {
          const config = this.getConfig();
          config.token = cleanToken;
          config.gistId = found.id;
          this.saveConfig(config);

          this.state.isConfigured = true;
          this.state.gistId = found.id;
          this.state.gistUrl = found.html_url;
          this.state.status = 'synced';
          this.notify();
          return { success: true, gistId: found.id, message: 'Found and connected existing LevelUp Gist!' };
        }
      }

      // 3. Create a brand new Secret Gist
      const initialPayload = storage.exportFullBackup();
      const createRes = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'LevelUp RPG Cloud Save (Private & Auto-Synced)',
          public: false, // Secret Gist
          files: {
            [GIST_FILENAME]: {
              content: initialPayload
            }
          }
        })
      });

      if (!createRes.ok) {
        const errJson = await createRes.json().catch(() => ({}));
        this.state.status = 'error';
        this.state.errorMessage = errJson.message || 'Failed to create private Gist. Check token permissions.';
        this.notify();
        return { success: false, message: this.state.errorMessage || 'Failed to create Gist.' };
      }

      const newGist = await createRes.json();
      const config = this.getConfig();
      config.token = cleanToken;
      config.gistId = newGist.id;
      this.saveConfig(config);

      const nowIso = new Date().toISOString();
      this.state.isConfigured = true;
      this.state.gistId = newGist.id;
      this.state.gistUrl = newGist.html_url;
      this.state.lastSyncedAt = nowIso;
      this.state.status = 'synced';
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowIso);
      this.notify();

      return { success: true, gistId: newGist.id, message: 'Created brand new Secret Gist on GitHub!' };
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err.message || String(err);
      this.notify();
      return { success: false, message: `Gist connection failed: ${err.message}` };
    }
  }

  // Push local storage payload to GitHub Gist
  public async pushToGist(customData?: FullBackupData): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    if (!config.token || !config.gistId) {
      return { success: false, message: 'GitHub Gist is not configured.' };
    }

    this.state.status = 'syncing';
    this.notify();

    try {
      const payloadString = customData ? JSON.stringify(customData, null, 2) : storage.exportFullBackup();

      const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'LevelUp RPG Cloud Save (Private & Auto-Synced)',
          files: {
            [GIST_FILENAME]: {
              content: payloadString
            }
          }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        this.state.status = 'error';
        this.state.errorMessage = errJson.message || 'Push failed.';
        this.notify();
        return { success: false, message: `Upload failed: ${this.state.errorMessage}` };
      }

      const nowIso = new Date().toISOString();
      this.state.status = 'synced';
      this.state.lastSyncedAt = nowIso;
      this.state.errorMessage = null;
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowIso);
      this.notify();

      return { success: true, message: 'Saved to GitHub Private Gist successfully!' };
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err.message || String(err);
      this.notify();
      return { success: false, message: `Push error: ${err.message}` };
    }
  }

  // Pull payload from GitHub Gist
  public async pullFromGist(): Promise<{ success: boolean; message: string; data?: FullBackupData }> {
    const config = this.getConfig();
    if (!config.token || !config.gistId) {
      return { success: false, message: 'GitHub Gist is not configured.' };
    }

    this.state.status = 'syncing';
    this.notify();

    try {
      const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github+json'
        }
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        this.state.status = 'error';
        this.state.errorMessage = errJson.message || 'Pull failed.';
        this.notify();
        return { success: false, message: `Fetch failed: ${this.state.errorMessage}` };
      }

      const gist = await res.json();
      const file = gist.files?.[GIST_FILENAME];

      if (!file || !file.content) {
        this.state.status = 'error';
        this.state.errorMessage = `Gist does not contain ${GIST_FILENAME}`;
        this.notify();
        return { success: false, message: this.state.errorMessage };
      }

      const importResult = storage.importFullBackup(file.content);
      if (!importResult.success) {
        this.state.status = 'error';
        this.state.errorMessage = importResult.message;
        this.notify();
        return { success: false, message: `Restore error: ${importResult.message}` };
      }

      const nowIso = new Date().toISOString();
      this.state.status = 'synced';
      this.state.lastSyncedAt = nowIso;
      this.state.errorMessage = null;
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowIso);
      this.notify();

      return { success: true, message: 'Data pulled and restored from GitHub Gist!', data: JSON.parse(file.content) };
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err.message || String(err);
      this.notify();
      return { success: false, message: `Pull failed: ${err.message}` };
    }
  }

  // Intelligent Bi-Directional Sync with GitHub Gist
  public async syncWithGist(): Promise<{ success: boolean; message: string; updatedLocal?: boolean }> {
    const config = this.getConfig();
    if (!config.token || !config.gistId) {
      return { success: false, message: 'GitHub Gist not configured.' };
    }

    this.state.status = 'syncing';
    this.notify();

    try {
      // 1. Fetch remote Gist metadata
      const res = await fetch(`https://api.github.com/gists/${config.gistId}`, {
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/vnd.github+json'
        }
      });

      if (!res.ok) {
        return this.pushToGist();
      }

      const remoteGist = await res.json();
      const remoteUpdatedAt = remoteGist.updated_at ? new Date(remoteGist.updated_at).getTime() : 0;
      const localLastSyncTime = this.state.lastSyncedAt ? new Date(this.state.lastSyncedAt).getTime() : 0;

      // If remote gist is newer than our local last sync time, pull it!
      if (remoteUpdatedAt > localLastSyncTime + 3000 && remoteGist.files?.[GIST_FILENAME]?.content) {
        const importRes = storage.importFullBackup(remoteGist.files[GIST_FILENAME].content);
        if (importRes.success) {
          const nowIso = new Date().toISOString();
          this.state.status = 'synced';
          this.state.lastSyncedAt = nowIso;
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowIso);
          this.notify();
          return { success: true, message: 'Newer data found in GitHub Gist! Local storage updated.', updatedLocal: true };
        }
      }

      // Otherwise local is current or newer -> push to Gist
      const pushRes = await this.pushToGist();
      return { success: pushRes.success, message: 'GitHub Gist updated with latest local progress.', updatedLocal: false };
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err.message || String(err);
      this.notify();
      return { success: false, message: `Sync failed: ${err.message}` };
    }
  }

  // Disconnect GitHub Gist sync
  public disconnect(): void {
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    this.state = {
      isConfigured: false,
      status: 'idle',
      gistId: null,
      gistUrl: null,
      lastSyncedAt: null,
      errorMessage: null,
      username: null
    };
    this.notify();
  }
}

export const gistSync = new GitHubGistSyncService();
