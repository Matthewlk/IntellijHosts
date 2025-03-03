import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Moon, Sun, Globe } from 'lucide-react';

const SettingsView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, language, setTheme, setLanguage } = useAppStore();
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'tr', name: 'Türkçe' }
  ];
  
  const handleChangeLanguage = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme settings */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">{t('settings.theme.title')}</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTheme('light')}
              className={`btn flex items-center ${
                theme === 'light' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Sun size={16} className="mr-2" />
              {t('settings.theme.light')}
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`btn flex items-center ${
                theme === 'dark' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Moon size={16} className="mr-2" />
              {t('settings.theme.dark')}
            </button>
            
            <button
              onClick={() => setTheme('system')}
              className={`btn flex items-center ${
                theme === 'system' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Globe size={16} className="mr-2" />
              {t('settings.theme.system')}
            </button>
          </div>
        </div>
        
        {/* Language settings */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">{t('settings.language.title')}</h2>
          
          <div className="grid grid-cols-3 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleChangeLanguage(lang.code)}
                className={`btn ${
                  language === lang.code ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Backup settings */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">{t('settings.backup.title')}</h2>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={true}
                className="mr-2"
                readOnly
              />
              {t('settings.backup.autoBackup')}
            </label>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Automatically create backups before making changes to hosts file
            </p>
          </div>
        </div>
        
        {/* Updates settings */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">{t('settings.updates.title')}</h2>
          
          <div className="mb-4">
            <p className="text-sm">
              <strong>{t('settings.updates.current')}:</strong> v0.1.0
            </p>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={true}
                className="mr-2"
                readOnly
              />
              {t('settings.updates.auto')}
            </label>
          </div>
          
          <button className="btn btn-primary">
            {t('settings.updates.check')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;