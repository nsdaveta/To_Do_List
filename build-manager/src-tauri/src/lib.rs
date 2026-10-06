use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use tauri::{Emitter, Window};
use serde::Serialize;
use std::path::Path;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Clone, Serialize)]
struct StepUpdate {
    step: String,
    status: String,
}

#[derive(Clone, Serialize)]
struct ProcessOutput {
    content: String,
    is_error: bool,
}

/// Walk up from a starting path to find the main project root at runtime.
/// Used only as a fallback if the compile-time path is somehow unavailable.
fn find_project_root(start: &std::path::Path) -> Option<String> {
    let mut current = start.to_path_buf();
    for _ in 0..10 {
        if current.file_name().map(|n| n == "build-manager").unwrap_or(false) {
            if let Some(parent) = current.parent() {
                if parent.join("package.json").exists() {
                    return Some(parent.to_string_lossy().to_string());
                }
            }
        }
        if current.join("package.json").exists() && current.join("build-manager").exists() {
            return Some(current.to_string_lossy().to_string());
        }
        if !current.pop() {
            break;
        }
    }
    None
}

#[tauri::command]
fn get_project_path() -> String {
    // Strategy 1 (Primary): Compile-time path baked in by build.rs.
    // This is 100% correct regardless of which drive/folder the exe is launched from.
    let compile_time_path = env!("PROJECT_ROOT");
    if !compile_time_path.is_empty() && compile_time_path != "." {
        return compile_time_path.to_string();
    }

    // Strategy 2 (Fallback): Walk up from the exe's physical location on disk.
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(result) = find_project_root(&exe_path) {
            return result;
        }
    }

    // Strategy 3 (Last resort): Walk up from current working directory.
    if let Ok(cwd) = std::env::current_dir() {
        if let Some(result) = find_project_root(&cwd) {
            return result;
        }
    }

    ".".to_string()
}

#[tauri::command]
fn check_admin() -> bool {
    let mut cmd = Command::new("powershell");
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd.args(["-Command", "([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')"])
        .output();
    
    if let Ok(out) = output {
        String::from_utf8_lossy(&out.stdout).trim() == "True"
    } else {
        false
    }
}

#[tauri::command]
fn reveal_in_explorer(path: String) -> Result<(), String> {
    let path_buf = std::path::PathBuf::from(&path);
    if !path_buf.exists() {
        return Err(format!("Path does not exist: {}", path));
    }
    
    #[cfg(target_os = "windows")]
    {
        let win_path = path.replace("/", "\\");
        if path_buf.is_dir() {
            Command::new("cmd")
                .args(["/c", "start", "", &win_path])
                .creation_flags(CREATE_NO_WINDOW)
                .spawn()
                .map_err(|e| e.to_string())?;
        } else {
            Command::new("explorer")
                .arg("/select,")
                .arg(&win_path)
                .creation_flags(CREATE_NO_WINDOW)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

fn run_step(window: &Window, step_id: &str, command: &str, args: Vec<&str>, cwd: &str) -> Result<(), String> {
    window.emit("step-update", StepUpdate { step: step_id.to_string(), status: "active".to_string() }).unwrap();
    
    let mut cmd = Command::new("powershell");
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let mut child = cmd.args(["-ExecutionPolicy", "Bypass", "-Command"])
        .arg(format!("{} {}", command, args.join(" ")))
        .current_dir(cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn {}: {}", command, e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let window_clone = window.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(l) = line {
                let _ = window_clone.emit("process-output", ProcessOutput { content: l, is_error: false });
            }
        }
    });

    let window_clone2 = window.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(l) = line {
                let _ = window_clone2.emit("process-output", ProcessOutput { content: l, is_error: true });
            }
        }
    });

    let status = child.wait().map_err(|e| e.to_string())?;
    
    if status.success() {
        window.emit("step-update", StepUpdate { step: step_id.to_string(), status: "completed".to_string() }).unwrap();
        Ok(())
    } else {
        window.emit("step-update", StepUpdate { step: step_id.to_string(), status: "failed".to_string() }).unwrap();
        Err(format!("{} failed", command))
    }
}

#[tauri::command]
async fn run_build(window: Window, target: String) -> Result<(), String> {
    let project_dir = get_project_path();

    if target == "quick-test" {
        window.emit("process-output", ProcessOutput { 
            content: "--- STARTING QUICK TEST (DEV MODE) ---".to_string(), 
            is_error: false 
        }).unwrap();
        
        // Skip Git and Env steps for quick test
        window.emit("step-update", StepUpdate { step: "git".to_string(), status: "completed".to_string() }).unwrap();
        window.emit("step-update", StepUpdate { step: "env".to_string(), status: "completed".to_string() }).unwrap();
        
        run_step(&window, "build", "npm", vec!["run", "tauri:dev"], &project_dir)?;
        
        window.emit("process-output", ProcessOutput { 
            content: "--- QUICK TEST TERMINATED ---".to_string(), 
            is_error: false 
        }).unwrap();
        return Ok(());
    }

    // Step 1: Git Sync (Only once for full builds)
    window.emit("step-update", StepUpdate { step: "git".to_string(), status: "active".to_string() }).unwrap();
    
    let mut cmd = Command::new("git");
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let status_output = cmd.args(["status", "--porcelain"])
        .current_dir(&project_dir)
        .output()
        .map_err(|e| format!("Failed to check git status: {}", e))?;
    
    if !status_output.stdout.is_empty() {
        run_step(&window, "git", "git", vec!["add", "."], &project_dir)?;
        run_step(&window, "git", "git", vec!["commit", "-m", "'Sync before build (automated)'"], &project_dir)?;
        let _ = run_step(&window, "git", "git", vec!["push"], &project_dir);
    } else {
        window.emit("process-output", ProcessOutput { content: "Working tree clean, skipping commit.".to_string(), is_error: false }).unwrap();
        let _ = run_step(&window, "git", "git", vec!["push"], &project_dir);
    }
    window.emit("step-update", StepUpdate { step: "git".to_string(), status: "completed".to_string() }).unwrap();

    let targets = if target == "all" {
        vec!["windows-x64", "windows-x86", "android"]
    } else if target == "windows-both" {
        vec!["windows-x64", "windows-x86"]
    } else {
        vec![target.as_str()]
    };

    for current_target in targets {
        window.emit("process-output", ProcessOutput { 
            content: format!("--- STARTING BUILD FOR TARGET: {} ---", current_target), 
            is_error: false 
        }).unwrap();

        // Step 2: Environment
        window.emit("step-update", StepUpdate { step: "env".to_string(), status: "active".to_string() }).unwrap();
        
        if current_target.starts_with("windows") {
            let signtool_path = "C:\\Program Files (x86)\\Windows Kits\\10\\App Certification Kit\\signtool.exe";
            let exists = Path::new(signtool_path).exists();
            
            window.emit("process-output", ProcessOutput { 
                content: format!("Checking Signtool existence: {}", if exists { "FOUND" } else { "MISSING" }), 
                is_error: !exists 
            }).unwrap();

            if !exists {
                window.emit("step-update", StepUpdate { step: "env".to_string(), status: "failed".to_string() }).unwrap();
                return Err("Signtool not found. Please install Windows SDK.".to_string());
            }
        } else if current_target == "android" {
            window.emit("process-output", ProcessOutput { content: "Skipping Windows Signtool check for Android build.".to_string(), is_error: false }).unwrap();
        }

        window.emit("step-update", StepUpdate { step: "env".to_string(), status: "completed".to_string() }).unwrap();

        // Step 3: Build
        if current_target == "android" {
            run_step(&window, "build", "npx", vec!["tauri", "android", "build"], &project_dir)?;
        } else if current_target == "windows-x86" {
            run_step(&window, "build", "npm", vec!["run", "tauri:build:x86"], &project_dir)?;
        } else if current_target == "windows-x64" {
            run_step(&window, "build", "npm", vec!["run", "tauri:build"], &project_dir)?;
        } else {
            return Err(format!("Unknown target: {}", current_target));
        }

        window.emit("process-output", ProcessOutput { 
            content: format!("--- COMPLETED BUILD FOR TARGET: {} ---", current_target), 
            is_error: false 
        }).unwrap();
    }

    Ok(())
}

#[tauri::command]
fn get_project_name() -> String {
    let project_path = get_project_path();
    let pkg_path = std::path::Path::new(&project_path).join("package.json");
    
    if let Ok(content) = std::fs::read_to_string(pkg_path) {
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(name) = json.get("name").and_then(|v| v.as_str()) {
                // Capitalize first letter and replace hyphens with spaces for a cleaner look
                let formatted = name.split(['-', '_'])
                    .map(|s| {
                        let mut c = s.chars();
                        match c.next() {
                            None => String::new(),
                            Some(f) => f.to_uppercase().collect::<String>() + c.as_str(),
                        }
                    })
                    .collect::<Vec<String>>()
                    .join(" ");
                return format!("{} Build Manager", formatted);
            }
        }
    }
    "Project Build Manager".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![run_build, check_admin, reveal_in_explorer, get_project_path, get_project_name])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
