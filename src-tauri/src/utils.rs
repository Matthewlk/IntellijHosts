use std::path::{Path, PathBuf};
use std::process::Command;
use std::fs;
use directories::BaseDirs;
use crate::error::AppError;

pub fn get_hosts_file_path() -> Result<PathBuf, AppError> {
    #[cfg(target_os = "windows")]
    {
        Ok(PathBuf::from(r"C:\Windows\System32\drivers\etc\hosts"))
    }
    
    #[cfg(target_os = "macos")]
    {
        Ok(PathBuf::from("/etc/hosts"))
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        Err(AppError::System("Unsupported operating system".to_string()))
    }
}

pub fn get_app_data_dir() -> Result<PathBuf, AppError> {
    let base_dirs = BaseDirs::new()
        .ok_or_else(|| AppError::System("Failed to get base directories".to_string()))?;
    
    let app_data_dir = base_dirs.data_dir().join("IntellijHosts");
    fs::create_dir_all(&app_data_dir)?;
    
    Ok(app_data_dir)
}

pub fn elevate_privileges(path: &Path, content: &str) -> Result<(), AppError> {
    let temp_path = get_app_data_dir()?.join("temp_hosts");
    fs::write(&temp_path, content)?;
    
    #[cfg(target_os = "macos")]
    {
        // Use osascript to elevate privileges on macOS
        let script = format!(
            "do shell script \"cat '{}' > '{}' && chmod 644 '{}'\" with administrator privileges",
            temp_path.to_string_lossy(),
            path.to_string_lossy(),
            path.to_string_lossy()
        );
        
        let output = Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()?;
        
        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::PermissionDenied(format!("Failed to elevate privileges: {}", error)));
        }
    }
    
    #[cfg(target_os = "windows")]
    {
        // Use PowerShell to elevate privileges on Windows
        let ps_script = format!(
            "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c copy /Y \"{}\" \"{}\"' -Verb RunAs -Wait",
            temp_path.to_string_lossy().replace("\\", "\\\\"),
            path.to_string_lossy().replace("\\", "\\\\")
        );
        
        let output = Command::new("powershell")
            .arg("-Command")
            .arg(ps_script)
            .output()?;
        
        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::PermissionDenied(format!("Failed to elevate privileges: {}", error)));
        }
    }
    
    // Clean up temp file
    let _ = fs::remove_file(temp_path);
    
    Ok(())
}

pub fn get_system_theme() -> Result<String, AppError> {
    #[cfg(target_os = "macos")]
    {
        let output = Command::new("defaults")
            .args(["read", "-g", "AppleInterfaceStyle"])
            .output()?;
        
        if output.status.success() {
            let theme = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if theme == "Dark" {
                return Ok("dark".to_string());
            }
        }
        
        Ok("light".to_string())
    }
    
    #[cfg(target_os = "windows")]
    {
        let ps_script = r#"
            $registryPath = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize"
            $keyName = "AppsUseLightTheme"
            
            try {
                $value = Get-ItemProperty -Path $registryPath -Name $keyName -ErrorAction Stop
                if ($value.$keyName -eq 0) { "dark" } else { "light" }
            } catch {
                "light"
            }
        "#;
        
        let output = Command::new("powershell")
            .arg("-Command")
            .arg(ps_script)
            .output()?;
        
        if output.status.success() {
            let theme = String::from_utf8_lossy(&output.stdout).trim().to_string();
            return Ok(theme);
        }
        
        Ok("light".to_string())
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        Ok("light".to_string())
    }
}