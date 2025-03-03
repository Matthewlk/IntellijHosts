import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, HostsEntry } from '../store';
import { Plus, Save, Trash, Edit, Check, X } from 'lucide-react';

const CurrentHosts: React.FC = () => {
  const { t } = useTranslation();
  const { hostsFilePath, currentEntries, loadHostsFile, saveHostsFile } = useAppStore();
  
  const [entries, setEntries] = useState<HostsEntry[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HostsEntry | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  
  // Initialize entries from store
  useEffect(() => {
    setEntries([...currentEntries]);
  }, [currentEntries]);
  
  const handleAddEntry = () => {
    const newEntry: HostsEntry = {
      ip: '',
      domain: '',
      comment: '',
      enabled: true
    };
    
    setEditingEntry(newEntry);
    setEditIndex(null);
    setEditMode(true);
  };
  
  const handleEditEntry = (entry: HostsEntry, index: number) => {
    setEditingEntry({ ...entry });
    setEditIndex(index);
    setEditMode(true);
  };
  
  const handleDeleteEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };
  
  const handleToggleEnabled = (index: number) => {
    const newEntries = [...entries];
    newEntries[index].enabled = !newEntries[index].enabled;
    setEntries(newEntries);
  };
  
  const handleSaveEntry = () => {
    if (!editingEntry) return;
    
    const newEntries = [...entries];
    
    if (editIndex !== null) {
      // Update existing entry
      newEntries[editIndex] = editingEntry;
    } else {
      // Add new entry
      newEntries.push(editingEntry);
    }
    
    setEntries(newEntries);
    setEditMode(false);
    setEditingEntry(null);
    setEditIndex(null);
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingEntry(null);
    setEditIndex(null);
  };
  
  const handleSaveChanges = async () => {
    await saveHostsFile(entries);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('hosts.title')}</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleAddEntry}
            className="btn btn-secondary flex items-center"
            disabled={editMode}
          >
            <Plus size={16} className="mr-1" />
            {t('hosts.add')}
          </button>
          <button 
            onClick={handleSaveChanges}
            className="btn btn-primary flex items-center"
            disabled={editMode}
          >
            <Save size={16} className="mr-1" />
            {t('common.save')}
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          <strong>{t('hosts.path')}:</strong> {hostsFilePath}
        </p>
      </div>
      
      {/* Edit form */}
      {editMode && editingEntry && (
        <div className="card mb-4">
          <h3 className="text-lg font-medium mb-3">
            {editIndex !== null ? t('hosts.edit') : t('hosts.add')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.ip')}</label>
              <input
                type="text"
                value={editingEntry.ip}
                onChange={(e) => setEditingEntry({ ...editingEntry, ip: e.target.value })}
                className="input w-full"
                placeholder="127.0.0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.domain')}</label>
              <input
                type="text"
                value={editingEntry.domain}
                onChange={(e) => setEditingEntry({ ...editingEntry, domain: e.target.value })}
                className="input w-full"
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('common.comment')}</label>
              <input
                type="text"
                value={editingEntry.comment || ''}
                onChange={(e) => setEditingEntry({ ...editingEntry, comment: e.target.value })}
                className="input w-full"
                placeholder="# Optional comment"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editingEntry.enabled}
                onChange={(e) => setEditingEntry({ ...editingEntry, enabled: e.target.checked })}
                className="mr-2"
              />
              {t('common.enabled')}
            </label>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={handleCancelEdit} className="btn btn-secondary flex items-center">
              <X size={16} className="mr-1" />
              {t('common.cancel')}
            </button>
            <button onClick={handleSaveEntry} className="btn btn-primary flex items-center">
              <Check size={16} className="mr-1" />
              {t('common.save')}
            </button>
          </div>
        </div>
      )}
      
      {/* Entries table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <th className="text-left p-3">{t('common.enabled')}</th>
              <th className="text-left p-3">{t('common.ip')}</th>
              <th className="text-left p-3">{t('common.domain')}</th>
              <th className="text-left p-3">{t('common.comment')}</th>
              <th className="text-right p-3">{t('common.edit')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3 text-center text-[var(--color-text-secondary)]">
                  No entries found
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-[var(--color-border)] ${
                    !entry.enabled ? 'opacity-50' : ''
                  }`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={entry.enabled}
                      onChange={() => handleToggleEnabled(index)}
                      disabled={editMode}
                    />
                  </td>
                  <td className="p-3">{entry.ip}</td>
                  <td className="p-3">{entry.domain}</td>
                  <td className="p-3">{entry.comment || '-'}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditEntry(entry, index)}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        disabled={editMode}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={editMode}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentHosts;