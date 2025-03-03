import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './store';
import { 
  Settings, 
  List, 
  Home, 
  Moon, 
  Sun, 
  Globe, 
  Plus, 
  Save, 
  Trash, 
  Download, 
  Upload, 
  Check, 
  X, 
  AlertCircle
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import CurrentHosts from './components/CurrentHosts';
import ProfilesView from './components/ProfilesView';
import SettingsView from './components/SettingsView';
import { invoke } from '@tauri-apps/api/tauri';
import i18n from './i18n';

function App() {
  const { t } = useTranslation();
  const { 
    theme, 
    language, 
    activeTab, 
    error,
    isLoading,
    setTheme, 
    setLanguage, 
    setActiveTab, 
    loadHostsFile,
    loadProfiles,
    clearError
  } = useAppStore();
  
  const [systemTheme, setSystemTheme] = useState<string>('light');
  
  useEffect(() => {
    // Load initial data
    loadHostsFile();
    loadProfiles();
    
    // Get system theme
    const getSystemTheme = async () => {
      try {
        const theme = await invoke<string>('get_system_theme');
        setSystemTheme(theme);
      } catch (error) {
        console.error('Failed to get system theme:', error);
      }
    };
    
    getSystemTheme();
  }, []);
  
  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme, systemTheme]);
  
  // Apply language
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-500 text-white rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle size={18} className="mr-2" />
              <span>{error}</span>
            </div>
            <button onClick={clearError} className="text-white">
              <X size={18} />
            </button>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-center">Loading...</p>
            </div>
          </div>
        )}
        
        {/* Content based on active tab */}
        {activeTab === 'current' && <CurrentHosts />}
        {activeTab === 'profiles' && <ProfilesView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

export default App;