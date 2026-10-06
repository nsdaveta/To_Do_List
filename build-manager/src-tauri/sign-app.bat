@echo off
"C:\Program Files (x86)\Windows Kits\10\App Certification Kit\signtool.exe" sign /f "%~dp0..\..\cert.pfx" /p password123 /fd sha256 "%~1"
