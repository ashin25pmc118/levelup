import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { storage } from './storageService';
import { FullBackupData } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  autoSync: boolean;
}

export interface CloudSyncState {
  isConfigured: boolean;
  isAuthenticated: boolean;
  userEmail: string | null;
  userId: string | null;
  status: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

const STORAGE_KEYS = {
  CONFIG: 'levelup_supabase_config',
  LAST_SYNC: 'levelup_cloud_last_sync'
};

class SupabaseSyncService {
  private client: SupabaseClient | null = null;
  private state: CloudSyncState = {
    isConfigured: false,
    isAuthenticated: false,
    userEmail: null,
    userId: null,
    status: 'idle',
    lastSyncedAt: null,
    errorMessage: null
  };
  private listeners: Set<(state: CloudSyncState) => void> = new Set();

  constructor() {
    this.loadInitialState();
  }

  private loadInitialState() {
    const config = this.getConfig();
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);

    if (config.url && config.anonKey) {
      try {
        this.client = createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        this.state.isConfigured = true;
        this.state.lastSyncedAt = lastSync;

        // Check active session
        this.client.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            this.state.isAuthenticated = true;
            this.state.userEmail = session.user.email || null;
            this.state.userId = session.user.id;
            this.notify();

            // Auto sync if enabled
            if (config.autoSync) {
              this.syncWithCloud().catch(() => {});
            }
          }
        });

        // Listen for auth state changes
        this.client.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            this.state.isAuthenticated = true;
            this.state.userEmail = session.user.email || null;
            this.state.userId = session.user.id;
          } else {
            this.state.isAuthenticated = false;
            this.state.userEmail = null;
            this.state.userId = null;
          }
          this.notify();
        });
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.state.isConfigured = false;
      }
    }
  }

  public getConfig(): SupabaseConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
      anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
      autoSync: true
    };
  }

  public saveConfig(config: SupabaseConfig): boolean {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    if (config.url && config.anonKey) {
      try {
        this.client = createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        this.state.isConfigured = true;
        this.state.errorMessage = null;
        this.notify();
        return true;
      } catch (err: any) {
        this.state.errorMessage = err.message || 'Invalid Supabase credentials';
        this.notify();
        return false;
      }
    } else {
      this.client = null;
      this.state.isConfigured = false;
      this.state.isAuthenticated = false;
      this.notify();
      return true;
    }
  }

  public isConfigured(): boolean {
    return this.state.isConfigured;
  }

  public getState(): CloudSyncState {
    return { ...this.state };
  }

  public subscribe(fn: (state: CloudSyncState) => void): () => void {
    this.listeners.add(fn);
    fn(this.getState());
    return () => this.listeners.delete(fn);
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach(fn => fn(currentState));
  }

  // Test connection to Supabase instance
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.client) {
      return { success: false, message: 'Supabase client is not configured. Enter URL and Anon Key first.' };
    }
    try {
      // Test basic ping by checking auth settings
      const { error } = await this.client.auth.getSession();
      if (error) {
        return { success: false, message: `Connection error: ${error.message}` };
      }
      return { success: true, message: 'Successfully connected to Supabase cloud instance!' };
    } catch (err: any) {
      return { success: false, message: `Network error: ${err.message || String(err)}` };
    }
  }

  // Authentication: Sign Up
  public async signUp(email: string, password: string): Promise<{ success: boolean; message: string }> {
    if (!this.client) return { success: false, message: 'Supabase client not configured.' };
    try {
      const { data, error } = await this.client.auth.signUp({ email, password });
      if (error) return { success: false, message: error.message };
      if (data.user) {
        this.state.isAuthenticated = true;
        this.state.userEmail = data.user.email || null;
        this.state.userId = data.user.id;
        this.notify();
        // Initial push to cloud
        await this.pushToCloud();
        return { success: true, message: 'Account created! Initial data synced to cloud.' };
      }
      return { success: true, message: 'Confirmation email sent! Please check your inbox.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Sign up failed.' };
    }
  }

  // Authentication: Sign In
  public async signIn(email: string, password: string): Promise<{ success: boolean; message: string }> {
    if (!this.client) return { success: false, message: 'Supabase client not configured.' };
    try {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) return { success: false, message: error.message };
      if (data.user) {
        this.state.isAuthenticated = true;
        this.state.userEmail = data.user.email || null;
        this.state.userId = data.user.id;
        this.notify();
        // Sync with cloud on login
        await this.syncWithCloud();
        return { success: true, message: 'Logged in successfully! Data synchronized.' };
      }
      return { success: false, message: 'Failed to authenticate user.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed.' };
    }
  }

  // Authentication: Magic Link
  public async signInWithOtp(email: string): Promise<{ success: boolean; message: string }> {
    if (!this.client) return { success: false, message: 'Supabase client not configured.' };
    try {
      const { error } = await this.client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: 'Magic link sent to your email! Click it to sign in.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Magic link request failed.' };
    }
  }

  // Authentication: Sign Out
  public async signOut(): Promise<void> {
    if (this.client) {
      try {
        await this.client.auth.signOut();
      } catch {}
    }
    this.state.isAuthenticated = false;
    this.state.userEmail = null;
    this.state.userId = null;
    this.state.status = 'idle';
    this.notify();
  }

  // Push local storage payload to cloud
  public async pushToCloud(customData?: FullBackupData): Promise<{ success: boolean; message: string }> {
    if (!this.client) return { success: false, message: 'Supabase not configured.' };
    if (!this.state.userId) return { success: false, message: 'User not signed in.' };

    this.state.status = 'syncing';
    this.notify();

    try {
      const payloadString = customData ? JSON.stringify(customData) : storage.exportFullBackup();
      const payloadJson = JSON.parse(payloadString);
      const nowIso = new Date().toISOString();

      const { error } = await this.client
        .from('user_cloud_sync')
        .upsert({
          user_id: this.state.userId,
          updated_at: nowIso,
          data: payloadJson
        }, { onConflict: 'user_id' });

      if (error) {
        this.state.status = 'error';
        this.state.errorMessage = error.message;
        this.notify();
        return { success: false, message: `Upload failed: ${error.message}` };
      }

      this.state.status = 'synced';
      this.state.lastSyncedAt = nowIso;
      this.state.errorMessage = null;
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowIso);
      this.notify();

      return { success: true, message: 'Data pushed to Supabase cloud successfully!' };
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err.message || String(err);
      this.notify();
      return { success: false, message: `Push failed: ${err.message || String(err)}` };
    }
  }

  // Pull cloud payload from Supabase
  public async pullFromCloud(): Promise<{ success: boolean; message: string; data?: FullBackupData }> {
    if (!this.client) return { success: false, message: 'Supabase not configured.' };
    if (!this.state.userId) return { success: false, message: 'User not signed in.' };

    this.state.status = 'syncing';
    this.notify();

    try {
      const { data, error } = await this.client
        .from('user_cloud_sync')
        .select('*')
        .eq('user_id', this.state.userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No row found yet -> first time user
          this.state.status = 'idle';
          this.notify();
          return { success: true, message: 'No cloud data found yet. You can push local data first!' };
        }
        this.state.status = 'error';
        this.state.errorMessage = error.message;
        this.notify();
        return { success: false, message: `Fetch failed: ${error.message}` };
      }

      if (data?.data) {
        const importResult = storage.importFullBackup(JSON.stringify(data.data));
        if (importResult.success) {
          const nowIso = new Date().toISOString();
          this.state.status = 'synced';
          this.state.lastSyncedAt = nowIso;
          this.state.errorMessage = null;
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowIso);
          this.notify();
          return { success: true, message: 'Cloud data pulled and restored successfully!', data: data.data };
        } else {
          this.state.status = 'error';
          this.state.errorMessage = importResult.message;
          this.notify();
          return { success: false, message: `Restore error: ${importResult.message}` };
        }
      }

      this.state.status = 'idle';
      this.notify();
      return { success: true, message: 'Cloud data was empty.' };
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err.message || String(err);
      this.notify();
      return { success: false, message: `Pull failed: ${err.message || String(err)}` };
    }
  }

  // Intelligent Bi-Directional Cloud Sync
  public async syncWithCloud(): Promise<{ success: boolean; message: string; updatedLocal?: boolean }> {
    if (!this.client) return { success: false, message: 'Supabase not configured.' };
    if (!this.state.userId) return { success: false, message: 'User not signed in.' };

    this.state.status = 'syncing';
    this.notify();

    try {
      // 1. Fetch remote record metadata
      const { data: remoteRow, error } = await this.client
        .from('user_cloud_sync')
        .select('updated_at, data')
        .eq('user_id', this.state.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.state.status = 'error';
        this.state.errorMessage = error.message;
        this.notify();
        return { success: false, message: `Sync failed: ${error.message}` };
      }

      // If no remote record exists, push local data
      if (!remoteRow) {
        const pushRes = await this.pushToCloud();
        return { success: pushRes.success, message: 'First sync: uploaded local data to cloud.', updatedLocal: false };
      }

      // Compare timestamps
      const remoteTime = new Date(remoteRow.updated_at).getTime();
      const localLastSyncTime = this.state.lastSyncedAt ? new Date(this.state.lastSyncedAt).getTime() : 0;

      if (remoteTime > localLastSyncTime && remoteRow.data) {
        // Cloud has newer data (e.g. from your phone) -> Pull it
        const importRes = storage.importFullBackup(JSON.stringify(remoteRow.data));
        if (importRes.success) {
          const nowIso = new Date().toISOString();
          this.state.status = 'synced';
          this.state.lastSyncedAt = nowIso;
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, nowIso);
          this.notify();
          return { success: true, message: 'Newer data found on cloud! Local storage updated.', updatedLocal: true };
        }
      }

      // Otherwise local data is equal or newer -> Push to cloud
      const pushRes = await this.pushToCloud();
      return { success: pushRes.success, message: 'Cloud database synchronized with local changes.', updatedLocal: false };
    } catch (err: any) {
      this.state.status = 'error';
      this.state.errorMessage = err.message || String(err);
      this.notify();
      return { success: false, message: `Sync failed: ${err.message || String(err)}` };
    }
  }
}

export const cloudSync = new SupabaseSyncService();
