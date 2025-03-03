import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';
import { open, save } from '@tauri-apps/api/dialog';

export interface HostsEntry {
  ip: string;
  domain: string;
  comment?: string;
  enabled: boolean;
}

export interface HostsProfile {
  id: string;
  name: string;
  description?: string;
  entries: HostsEntry[];
  created_at: string;
  updated_at: string;
}

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  hostsFilePath: string;
  currentEntries: HostsEntry[];
  profiles: HostsProfile[];
  activeTab: 'current' | 'profiles' | 'settings';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  setActiveTab: (tab: 'current' | 'profiles' | 'settings') => void;
  loadHostsFile: () => Promise<void>;
  saveHostsFile: (entries: HostsEntry[]) => Promise<void>;
  loadProfiles: () => Promise<void>;
  saveProfile: (profile: HostsProfile) => Promise<void>;
  applyProfile: (profileId: string) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  importProfiles: () => Promise<void>;
  exportProfiles: () => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'system',
  language: 'en',
  hostsFilePath: '',
  currentEntries: [],
  profiles: [],
  activeTab: 'current',
  isLoading: false,
  error: null,
  
  setTheme: (theme) => set({ theme }),
  
  setLanguage: (language) => set({ language }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  loadHostsFile: async () => {
    set({ isLoading: true, error: null });
    try {
      const path = await invoke<string>('get_hosts_file_path');
      const entries = await invoke<HostsEntry[]>('read_hosts');
      set({ hostsFilePath: path, currentEntries: entries });
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveHostsFile: async (entries) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('save_hosts', { entries });
      set({ currentEntries: entries });
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await invoke<HostsProfile[]>('get_profiles');
      set({ profiles });
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('save_profile', { profile });
      await get().loadProfiles();
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  
  applyProfile: async (profileId) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('apply_profile', { profileId });
      await get().loadHostsFile();
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteProfile: async (profileId) => {
    set({ isLoading: true, error: null });
    try {
      await invoke('delete_profile', { profileId });
      await get().loadProfiles();
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  
  importProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const selected = await open({
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });
      
      if (selected) {
        const path = Array.isArray(selected) ? selected[0] : selected;
        await invoke('import_profiles', { path });
        await get().loadProfiles();
      }
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  
  exportProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const selected = await save({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: 'intellij_hosts_profiles.json',
      });
      
      if (selected) {
        await invoke('export_profiles', { path: selected });
      }
    } catch (error) {
      set({ error: String(error) });
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearError: () => set({ error: null }),
}));