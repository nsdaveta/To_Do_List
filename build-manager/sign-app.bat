@echo off
setlocal
echo -------------------------------------------------- >> "%~dp0sign-log.txt"
echo [%date% %time%] Called with: %* >> "%~dp0sign-log.txt"
echo [%date% %time%] Working directory: %CD% >> "%~dp0sign-log.txt"

if "%~1"=="" (
    echo [ERROR] No file specified to sign >> "%~dp0sign-log.txt"
    exit /b 1
)

"C:\Program Files (x86)\Windows Kits\10\App Certification Kit\signtool.exe" sign /f "%~dp0cert.pfx" /p password123 /tr http://timestamp.digicert.com /td sha256 /fd sha256 "%~1" >> "%~dp0sign-log.txt" 2>&1

set SIGN_EXIT_CODE=%ERRORLEVEL%
if %SIGN_EXIT_CODE% equ 0 (
    echo [%date% %time%] Successfully signed: %~1 >> "%~dp0sign-log.txt"
) else (
    echo [%date% %time%] FAILED to sign: %~1 (Exit Code: %SIGN_EXIT_CODE%) >> "%~dp0sign-log.txt"
)

exit /b %SIGN_EXIT_CODE%
