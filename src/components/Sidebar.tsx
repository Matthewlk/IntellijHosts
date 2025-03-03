import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store';
import { Settings, List } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { activeTab, setActiveTab } = useAppStore();
  
  return (
    <div className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col">
      {/* App title */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold">{t('app.title')}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{t('app.description')}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              className={`w-full flex items-center space-x-2 p-2 rounded ${
                activeTab === 'current' ? 'bg-[var(--color-accent)]' : 'hover:bg-[var(--color-hover)]'
              }`}
              onClick={() => setActiveTab('current')}
            >
              <List size={20} />
              <span>{t('sidebar.current')}</span>
            </button>
          </li>
          <li>
            <button
              className={`w-full flex items-center space-x-2 p-2 rounded ${
                activeTab === 'profiles' ? 'bg-[var(--color-accent)]' : 'hover:bg-[var(--color-hover)]'
              }`}
              onClick={() => setActiveTab('profiles')}
            >
              <List size={20} />
              <span>{t('sidebar.profiles')}</span>
            </button>
          </li>
          <li>
            <button
              className={`w-full flex items-center space-x-2 p-2 rounded ${
                activeTab === 'settings' ? 'bg-[var(--color-accent)]' : 'hover:bg-[var(--color-hover)]'
              }`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={20} />
              <span>{t('sidebar.settings')}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;