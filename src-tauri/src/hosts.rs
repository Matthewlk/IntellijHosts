use serde::{Serialize, Deserialize};
use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};
use chrono::Local;
use crate::error::AppError;
use crate::utils::{get_hosts_file_path, get_app_data_dir, elevate_privileges};
use once_cell::sync::Lazy;
use std::sync::Mutex;

static PROFILES_CACHE: Lazy<Mutex<Vec<HostsProfile>>> = Lazy::new(|| {
    Mutex::new(Vec::new())
});

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HostsEntry {
    pub ip: String,
    pub domain: String,
    pub comment: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HostsProfile {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub entries: Vec<HostsEntry>,
    pub created_at: String,
    pub updated_at: String,
}

pub fn read_hosts_file(path: &Path) -> Result<Vec<HostsEntry>, AppError> {
    let mut file = File::open(path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    
    let mut entries = Vec::new();
    
    for line in content.lines() {
        let line = line.trim();
        
        // Skip empty lines and comments
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        
        // Parse the line
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 {
            let ip = parts[0].to_string();
            let domain = parts[1].to_string();
            
            // Extract comment if present
            let comment = if parts.len() > 2 && parts[2].starts_with('#') {
                Some(parts[2..].join(" "))
            } else {
                None
            };
            
            entries.push(HostsEntry {
                ip,
                domain,
                comment,
                enabled: true,
            });
        }
    }
    
    Ok(entries)
}

pub fn write_hosts_file(path: &Path, entries: &[HostsEntry]) -> Result<(), AppError> {
    let mut content = String::new();
    
    // Add header
    content.push_str("# Hosts file managed by IntellijHosts\n");
    content.push_str("# Last updated: ");
    content.push_str(&Local::now().to_string());
    content.push_str("\n\n");
    
    // Add entries
    for entry in entries {
        if entry.enabled {
            content.push_str(&entry.ip);
            content.push_str("\t");
            content.push_str(&entry.domain);
            
            if let Some(comment) = &entry.comment {
                content.push_str("\t");
                content.push_str(comment);
            }
            
            content.push_str("\n");
        }
    }
    
    // Use elevated privileges to write the file
    elevate_privileges(path, &content)
}

pub fn backup_hosts_file(path: &Path) -> Result<PathBuf, AppError> {
    let backup_dir = get_app_data_dir()?.join("backups");
    fs::create_dir_all(&backup_dir)?;
    
    let timestamp = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let backup_path = backup_dir.join(format!("hosts_backup_{}.txt", timestamp));
    
    let content = fs::read_to_string(path)?;
    fs::write(&backup_path, content)?;
    
    Ok(backup_path)
}

pub fn get_profiles_path() -> Result<PathBuf, AppError> {
    let app_data_dir = get_app_data_dir()?;
    fs::create_dir_all(&app_data_dir)?;
    Ok(app_data_dir.join("profiles.json"))
}

pub fn save_profile(profile: HostsProfile) -> Result<(), AppError> {
    let mut profiles = get_profiles()?;
    
    // Check if profile already exists
    let index = profiles.iter().position(|p| p.id == profile.id);
    
    if let Some(idx) = index {
        // Update existing profile
        profiles[idx] = profile;
    } else {
        // Add new profile
        profiles.push(profile);
    }
    
    // Update cache
    *PROFILES_CACHE.lock().unwrap() = profiles.clone();
    
    // Save to file
    let profiles_path = get_profiles_path()?;
    let json = serde_json::to_string_pretty(&profiles)?;
    fs::write(profiles_path, json)?;
    
    Ok(())
}

pub fn get_profiles() -> Result<Vec<HostsProfile>, AppError> {
    // Check cache first
    {
        let cache = PROFILES_CACHE.lock().unwrap();
        if !cache.is_empty() {
            return Ok(cache.clone());
        }
    }
    
    let profiles_path = get_profiles_path()?;
    
    // If file doesn't exist, return empty list
    if !profiles_path.exists() {
        return Ok(Vec::new());
    }
    
    let content = fs::read_to_string(profiles_path)?;
    let profiles: Vec<HostsProfile> = serde_json::from_str(&content)?;
    
    // Update cache
    *PROFILES_CACHE.lock().unwrap() = profiles.clone();
    
    Ok(profiles)
}

pub fn apply_profile(profile_id: String) -> Result<(), AppError> {
    let profiles = get_profiles()?;
    let profile = profiles.iter()
        .find(|p| p.id == profile_id)
        .ok_or_else(|| AppError::NotFound("Profile not found".to_string()))?;
    
    let hosts_path = get_hosts_file_path()?;
    
    // Backup current hosts file
    backup_hosts_file(&hosts_path)?;
    
    // Write new hosts file
    write_hosts_file(&hosts_path, &profile.entries)?;
    
    Ok(())
}

pub fn delete_profile(profile_id: String) -> Result<(), AppError> {
    let mut profiles = get_profiles()?;
    
    let initial_len = profiles.len();
    profiles.retain(|p| p.id != profile_id);
    
    if profiles.len() == initial_len {
        return Err(AppError::NotFound("Profile not found".to_string()));
    }
    
    // Update cache
    *PROFILES_CACHE.lock().unwrap() = profiles.clone();
    
    // Save to file
    let profiles_path = get_profiles_path()?;
    let json = serde_json::to_string_pretty(&profiles)?;
    fs::write(profiles_path, json)?;
    
    Ok(())
}

pub fn export_profiles(path: &Path) -> Result<(), AppError> {
    let profiles = get_profiles()?;
    let json = serde_json::to_string_pretty(&profiles)?;
    fs::write(path, json)?;
    Ok(())
}

pub fn import_profiles(path: &Path) -> Result<Vec<HostsProfile>, AppError> {
    let content = fs::read_to_string(path)?;
    let imported_profiles: Vec<HostsProfile> = serde_json::from_str(&content)?;
    
    let mut current_profiles = get_profiles()?;
    
    // Merge profiles, overwriting existing ones with the same ID
    for imported in &imported_profiles {
        if let Some(idx) = current_profiles.iter().position(|p| p.id == imported.id) {
            current_profiles[idx] = imported.clone();
        } else {
            current_profiles.push(imported.clone());
        }
    }
    
    // Update cache
    *PROFILES_CACHE.lock().unwrap() = current_profiles.clone();
    
    // Save to file
    let profiles_path = get_profiles_path()?;
    let json = serde_json::to_string_pretty(&current_profiles)?;
    fs::write(profiles_path, json)?;
    
    Ok(imported_profiles)
}