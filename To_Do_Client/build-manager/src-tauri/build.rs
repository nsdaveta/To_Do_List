fn main() {
    // Walk up from src-tauri/ → build-manager/ → project root
    let manifest_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let project_root = manifest_dir
        .parent() // build-manager/
        .and_then(|p| p.parent()) // To_Do_Client/
        .map(|p| p.to_string_lossy().replace("\\", "/"))
        .unwrap_or_else(|| ".".to_string());

    // Bake the path into the binary as a compile-time constant
    println!("cargo:rustc-env=PROJECT_ROOT={}", project_root);

    tauri_build::build()
}
