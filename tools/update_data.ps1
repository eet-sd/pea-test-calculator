# One-click data refresh: sheet -> data.js -> commit -> push (GitHub Pages updates itself)
# Run via update_data.bat, or:  powershell -ExecutionPolicy Bypass -File tools\update_data.ps1
# NOTE: keep this file ASCII-only (Windows PowerShell 5.1 misreads UTF-8 .ps1 without BOM)
param(
    [string]$InputFile = ""   # optional: use a manually downloaded CSV/export instead of fetching
)
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot          # webapp_sample folder
$toolsDir = $PSScriptRoot
$sheetId = "13-O-DYPJ_T98LJRIByvGRT82gF1lWfpizEcOzvwaOR4"
$csvUrl = "https://docs.google.com/spreadsheets/d/$sheetId/export?format=csv&gid=0"
$csvPath = Join-Path $toolsDir "sheet_latest.csv"

function Find-Exe($name, $fallback) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    if (Test-Path $fallback) { return $fallback }
    return $null
}

# --- 1. get the sheet ---
if ($InputFile -and (Test-Path $InputFile)) {
    Write-Host "Using provided input file: $InputFile"
    $srcFile = $InputFile
} else {
    Write-Host "Downloading sheet as CSV..."
    $ok = $false
    try {
        Invoke-WebRequest -Uri $csvUrl -OutFile $csvPath -UseBasicParsing
        $head = Get-Content $csvPath -TotalCount 1 -Encoding UTF8
        if ($head -notmatch "<html|<HTML") { $ok = $true }
    } catch { $ok = $false }
    if (-not $ok) {
        Write-Host ""
        Write-Host "Auto-download failed (sheet is not shared as anyone-with-link)." -ForegroundColor Yellow
        Write-Host "Fix (either one):" -ForegroundColor Yellow
        Write-Host "  1) Open the sheet -> Share -> Anyone with the link (Viewer), then run again"
        Write-Host "  2) Or open the sheet -> File -> Download -> CSV, save it as:"
        Write-Host "     $csvPath"
        Write-Host "     then run again"
        if (Test-Path $csvPath) { Remove-Item $csvPath -Force }
        exit 1
    }
    $srcFile = $csvPath
    Write-Host "Downloaded OK."
}

# --- 2. regenerate data.js ---
Write-Host "Converting to data.js..."
python (Join-Path $toolsDir "convert_data.py") $srcFile
if ($LASTEXITCODE -ne 0) { Write-Host "convert_data.py failed" -ForegroundColor Red; exit 1 }

# --- 3. commit + push if git is set up ---
$git = Find-Exe "git" "C:\Program Files\Git\cmd\git.exe"
if (-not $git) { Write-Host "git not found -- data.js updated locally only."; exit 0 }
Push-Location $root
try {
    & $git diff --quiet -- data.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "No changes in data.js -- nothing to publish."
        exit 0
    }
    $email = & $git config user.email
    if (-not $email) {
        Write-Host "git identity not configured yet -- data.js updated locally; commit/push happens after deploy setup" -ForegroundColor Yellow
        exit 0
    }
    & $git add data.js
    & $git commit -m ("update data from sheet " + (Get-Date -Format "yyyy-MM-dd"))
    $remote = & $git remote
    if ($remote) {
        & $git push
        Write-Host "Pushed -- GitHub Pages will update in about a minute" -ForegroundColor Green
    } else {
        Write-Host "Committed locally (no remote yet -- push becomes possible after first deploy)" -ForegroundColor Yellow
    }
} finally { Pop-Location }
