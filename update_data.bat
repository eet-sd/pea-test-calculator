@echo off
rem One-click: ดึงชีตจำนวนสุ่มล่าสุด -> สร้าง data.js -> push ขึ้น GitHub Pages
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\update_data.ps1" %*
pause
