# To-Do App Pro

A premium, glassmorphism-themed To-Do application built with **React**, **Vite**, and **Tauri**. Featuring a stunning UI, haptic feedback, audio cues, and a dedicated multi-target Build Manager.

## ✨ Features
- **Premium Glassmorphism UI**: High-resolution abstract backgrounds and blur effects.
- **Cross-Platform**: Windows (x64/x86) and Android support.
- **Interactive Feedback**: Haptic impact and melodic audio cues for actions.
- **Secure Auth**: OTP-verified registration and secure login.
- **Automated Builds**: Dedicated Build Manager tool for one-click distribution.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Rust (for Tauri builds)
- Git

### Installation
```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

## 🛠️ Build Manager Pro

The project includes a dedicated **Build Manager** tool located in the `/build-manager` directory. This tool automates the entire build and signing pipeline for all targets.

### How to use:
1. Navigate to the `build-manager` folder.
2. Run `npm install` then `npm run dev` to launch the manager.
3. Select your target (Windows x64, x86, or Android).
4. The tool will:
   - Sync your latest changes with Git.
   - Verify build environment (Signtool, etc.).
   - Compile the application.
   - Automatically sign the Windows installers.
   - Provide a direct link to the output folder.

## 📄 License
This project is for demonstration purposes.
