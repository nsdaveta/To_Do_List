@echo off
setlocal
echo -------------------------------------------------- >> "%~dp0sign-log.txt"
echo [%date% %time%] Called with: %* >> "%~dp0sign-log.txt"
echo [%date% %time%] Working directory: %CD% >> "%~dp0sign-log.txt"

if "%~1"=="" (
    echo [ERROR] No file specified to sign >> "%~dp0sign-log.txt"
    exit /b 1
)

set SIGNTOOL="C:\Program Files (x86)\Windows Kits\10\App Certification Kit\signtool.exe"
set PFX="%~dp0cert.pfx"
set PASS=password123
set FILE="%~1"

:: Attempt 1: DigiCert
echo [%date% %time%] Attempting sign with DigiCert... >> "%~dp0sign-log.txt"
%SIGNTOOL% sign /f %PFX% /p %PASS% /tr http://timestamp.digicert.com /td sha256 /fd sha256 %FILE% >> "%~dp0sign-log.txt" 2>&1
if %ERRORLEVEL% equ 0 goto success

:: Attempt 2: Sectigo (after 2 second pause)
echo [%date% %time%] DigiCert failed. Waiting 2s and retrying with Sectigo... >> "%~dp0sign-log.txt"
timeout /t 2 /nobreak > nul
%SIGNTOOL% sign /f %PFX% /p %PASS% /tr http://timestamp.sectigo.com /td sha256 /fd sha256 %FILE% >> "%~dp0sign-log.txt" 2>&1
if %ERRORLEVEL% equ 0 goto success

:: Attempt 3: GlobalSign (after 3 second pause)
echo [%date% %time%] Sectigo failed. Waiting 3s and retrying with GlobalSign... >> "%~dp0sign-log.txt"
timeout /t 3 /nobreak > nul
%SIGNTOOL% sign /f %PFX% /p %PASS% /tr http://ts.globalsign.com/tsa/r6advanced1 /td sha256 /fd sha256 %FILE% >> "%~dp0sign-log.txt" 2>&1
if %ERRORLEVEL% equ 0 goto success

:: All attempts failed
set SIGN_EXIT_CODE=%ERRORLEVEL%
echo [%date% %time%] FAILED to sign: %~1 after 3 attempts (Exit Code: %SIGN_EXIT_CODE%) >> "%~dp0sign-log.txt"
exit /b %SIGN_EXIT_CODE%

:success
echo [%date% %time%] Successfully signed: %~1 >> "%~dp0sign-log.txt"
exit /b 0
