#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod hosts;
mod error;
mod utils;

use hosts::{HostsEntry, HostsProfile, read_hosts_file, write_hosts_file, backup_hosts_file};
use std::path::PathBuf;

#[tauri::command]
async fn get_hosts_file_path() -> Result<String, String> {
    let path = utils::get_hosts_file_path()
        .map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
async fn read_hosts() -> Result<Vec<HostsEntry>, String> {
    let path = utils::get_hosts_file_path()
        .map_err(|e| e.to_string())?;
    
    read_hosts_file(&path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_hosts(entries: Vec<HostsEntry>) -> Result<(), String> {
    let path = utils::get_hosts_file_path()
        .map_err(|e| e.to_string())?;
    
    // Create backup before writing
    backup_hosts_file(&path)
        .map_err(|e| e.to_string())?;
    
    write_hosts_file(&path, &entries)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_profile(profile: HostsProfile) -> Result<(), String> {
    hosts::save_profile(profile)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_profiles() -> Result<Vec<HostsProfile>, String> {
    hosts::get_profiles()
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn apply_profile(profile_id: String) -> Result<(), String> {
    hosts::apply_profile(profile_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_profile(profile_id: String) -> Result<(), String> {
    hosts::delete_profile(profile_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn export_profiles(path: String) -> Result<(), String> {
    let export_path = PathBuf::from(path);
    hosts::export_profiles(&export_path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn import_profiles(path: String) -> Result<Vec<HostsProfile>, String> {
    let import_path = PathBuf::from(path);
    hosts::import_profiles(&import_path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_system_theme() -> Result<String, String> {
    utils::get_system_theme()
        .map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_hosts_file_path,
            read_hosts,
            save_hosts,
            save_profile,
            get_profiles,
            apply_profile,
            delete_profile,
            export_profiles,
            import_profiles,
            get_system_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}