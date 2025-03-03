import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, HostsProfile, HostsEntry } from '../store';
import { Plus, Save, Trash, Edit, Check, X, Download, Upload, Play } from 'lucide-react';
import { v4 as generateUUID } from 'uuid';

const ProfilesView: React.FC = () => {
  const { t } = useTranslation();
  const { 
    profiles, 
    currentEntries,
    loadProfiles, 
    saveProfile, 
    applyProfile, 
    deleteProfile,
    importProfiles,
    exportProfiles
  } = useAppStore();
  
  const [editMode, setEditMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState<HostsProfile | null>(null);
  const [editEntries, setEditEntries] = useState<HostsEntry[]>([]);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'apply';
    profileId: string;
    profileName: string;
  } | null>(null);
  
  const handleCreateProfile = async () => {
    const now = new Date().toISOString();
    const newProfile: HostsProfile = {
      id: generateUUID(),
      name: 'New Profile',
      description: '',
      entries: [...currentEntries],
      created_at: now,
      updated_at: now
    };
    
    setEditingProfile(newProfile);
    setEditEntries([...currentEntries]);
    setEditMode(true);
  };
  
  const handleEditProfile = (profile: HostsProfile) => {
    setEditingProfile({ ...profile });
    setEditEntries([...profile.entries]);
    setEditMode(true);
  };
  
  const handleSaveProfile = async () => {
    if (!editingProfile) return;
    
    const now = new Date().toISOString();
    const updatedProfile: HostsProfile = {
      ...editingProfile,
      entries: editEntries,
      updated_at: now
    };
    
    await saveProfile(updatedProfile);
    setEditMode(false);
    setEditingProfile(null);
  };
  
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingProfile(null);
  };
  
  const handleConfirmDelete = (profile: HostsProfile) => {
    setConfirmAction({
      type: 'delete',
      profileId: profile.id,
      profileName: profile.name
    });
  };
  
  const handleConfirmApply = (profile: HostsProfile) => {
    setConfirmAction({
      type: 'apply',
      profileId: profile.id,
      profileName: profile.name
    });
  };
  
  const handleExecuteConfirm = async () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'delete') {
      await deleteProfile(confirmAction.profileId);
    } else if (confirmAction.type === 'apply') {
      await applyProfile(confirmAction.profileId);
    }
    
    setConfirmAction(null);
  };
  
  const handleCancelConfirm = () => {
    setConfirmAction(null);
  };
  
  // Hosts entry editing functions
  const handleAddEntry = () => {
    const newEntry: HostsEntry = {
      ip: '',
      domain: '',
      comment: '',
      enabled: true
    };
    
    setEditEntries([...editEntries, newEntry]);
  };
  
  const handleUpdateEntry = (index: number, field: keyof HostsEntry, value: any) => {
    const newEntries = [...editEntries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEditEntries(newEntries);
  };
  
  const handleDeleteEntry = (index: number) => {
    const newEntries = [...editEntries];
    newEntries.splice(index, 1);
    setEditEntries(newEntries);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('profiles.title')}</h1>
        <div className="flex space-x-2">
          <button 
            onClick={handleCreateProfile}
            className="btn btn-secondary flex items-center"
            disabled={editMode}
          >
            <Plus size={16} className="mr-1" />
            {t('profiles.create')}
          </button>
          <button 
            onClick={importProfiles}
            className="btn btn-secondary flex items-center"
            disabled={editMode}
          >
            <Download size={16} className="mr-1" />
            {t('profiles.import')}
          </button>
          <button 
            onClick={exportProfiles}
            className="btn btn-secondary flex items-center"
            disabled={editMode || profiles.length === 0}
          >
            <Upload size={16} className="mr-1" />
            {t('profiles.export')}
          </button>
        </div>
      </div>
      
      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg-primary)] p-6 rounded-md shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {confirmAction.type === 'delete' 
                ? t('profiles.confirmDelete') 
                : t('profiles.confirmApply')}
            </h3>
            <p className="mb-6">
              {confirmAction.type === 'delete'
                ? `Are you sure you want to delete "${confirmAction.profileName}"?`
                : `Are you sure you want to apply "${confirmAction.profileName}" to your hosts file?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={handleCancelConfirm}
                className="btn btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={handleExecuteConfirm}
                className={`btn ${confirmAction.type === 'delete' ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-primary'}`}
              >
                {confirmAction.type === 'delete' ? t('common.delete') : t('common.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit profile form */}
      {editMode && editingProfile && (
        <div className="mb-6">
          <div className="card mb-4">
            <h3 className="text-lg font-medium mb-3">
              {t('profiles.edit')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('common.name')}</label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
                <input
                  type="text"
                  value={editingProfile.description || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                  className="input w-full"
                />
              </div>
            </div>
            
            <h4 className="text-md font-medium mb-2">{t('hosts.entries')}</h4>
            
            <div className="mb-3">
              <button 
                onClick={handleAddEntry}
                className="btn btn-secondary flex items-center text-sm"
              >
                <Plus size={14} className="mr-1" />
                {t('hosts.add')}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                    <th className="text-left p-2 text-sm">{t('common.enabled')}</th>
                    <th className="text-left p-2 text-sm">{t('common.ip')}</th>
                    <th className="text-left p-2 text-sm">{t('common.domain')}</th>
                    <th className="text-left p-2 text-sm">{t('common.comment')}</th>
                    <th className="text-right p-2 text-sm"></th>
                  </tr>
                </thead>
                <tbody>
                  {editEntries.map((entry, index) => (
                    <tr key={index} className="border-b border-[var(--color-border)]">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={entry.enabled}
                          onChange={(e) => handleUpdateEntry(index, 'enabled', e.target.checked)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={entry.ip}
                          onChange={(e) => handleUpdateEntry(index, 'ip', e.target.value)}
                          className="input w-full text-sm py-1"
                          placeholder="127.0.0.1"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={entry.domain}
                          onChange={(e) => handleUpdateEntry(index, 'domain', e.target.value)}
                          className="input w-full text-sm py-1"
                          placeholder="example.com"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={entry.comment || ''}
                          onChange={(e) => handleUpdateEntry(index, 'comment', e.target.value)}
                          className="input w-full text-sm py-1"
                          placeholder="# Comment"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleDeleteEntry(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={handleCancelEdit} className="btn btn-secondary flex items-center">
                <X size={16} className="mr-1" />
                {t('common.cancel')}
              </button>
              <button onClick={handleSaveProfile} className="btn btn-primary flex items-center">
                <Check size={16} className="mr-1" />
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Profiles list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.length === 0 ? (
          <div className="col-span-full text-center p-8 bg-[var(--color-bg-secondary)] rounded-md">
            <p className="text-[var(--color-text-secondary)]">
              {t('profiles.noProfiles')}
            </p>
          </div>
        ) : (
          profiles.map((profile) => (
            <div key={profile.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{profile.name}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditProfile(profile)}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    disabled={editMode}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(profile)}
                    className="text-red-500 hover:text-red-700"
                    disabled={editMode}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              
              {profile.description && (
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  {profile.description}
                </p>
              )}
              
              <div className="text-xs text-[var(--color-text-secondary)] mb-3">
                <p>{profile.entries.length} entries</p>
                <p>Updated: {new Date(profile.updated_at).toLocaleString()}</p>
              </div>
              
              <button
                onClick={() => handleConfirmApply(profile)}
                className="btn btn-primary w-full flex items-center justify-center"
                disabled={editMode}
              >
                <Play size={16} className="mr-1" />
                {t('profiles.apply')}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfilesView;