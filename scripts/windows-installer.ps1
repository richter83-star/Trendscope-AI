[CmdletBinding()]
param(
    [switch]$SkipMobile,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Section {
    param([string]$Message)
    Write-Host "`n[$Message]" -ForegroundColor Cyan
}

function Assert-Administrator {
    if ($DryRun) { return }

    $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw 'Run this script from an elevated PowerShell session ("Run as Administrator").'
    }
}

function Assert-WindowsHost {
    if ($IsWindows) { return }
    if ($DryRun) {
        Write-Host 'Non-Windows host detected; continuing in dry-run mode only.' -ForegroundColor Yellow
    } else {
        throw 'This installer must be run on Windows 10 or newer. Re-run with -DryRun to validate on other platforms.'
    }
}

function Ensure-Winget {
    if ($DryRun) {
        Write-Host 'winget check skipped (dry-run).' -ForegroundColor Yellow
        return
    }

    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw 'winget is required. Install it from the Microsoft Store (App Installer) and make sure it is on your PATH.'
    }
}

function Ensure-NodeJs {
    $requiredMajor = 18
    $currentVersion = $null

    if (Get-Command node -ErrorAction SilentlyContinue) {
        $currentVersion = (& node --version).TrimStart('v')
        $major = [int]($currentVersion.Split('.')[0])
        if ($major -ge $requiredMajor) {
            Write-Host "Node.js $currentVersion detected; skipping install." -ForegroundColor Green
            return
        }
        Write-Host "Node.js $currentVersion is below required $requiredMajor.x; installing LTS build..." -ForegroundColor Yellow
    } else {
        Write-Host 'Node.js not found; installing LTS build...' -ForegroundColor Yellow
    }

    if ($DryRun) {
        Write-Host 'winget install OpenJS.NodeJS.LTS (skipped: dry-run).' -ForegroundColor Yellow
    } else {
        winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements
    }
}

function Ensure-Python {
    $requiredMinor = 10

    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        Write-Host 'Python 3 not found; installing via winget...' -ForegroundColor Yellow
        if ($DryRun) {
            Write-Host 'winget install Python.Python.3.11 (skipped: dry-run).' -ForegroundColor Yellow
        } else {
            winget install --id Python.Python.3.11 -e --source winget --accept-package-agreements --accept-source-agreements
        }
    }

    $versionParts = ((& python --version).Split()[1]).Split('.')
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]

    if ($major -lt 3 -or ($major -eq 3 -and $minor -lt $requiredMinor)) {
        Write-Host "Python $major.$minor detected; installing Python 3.$requiredMinor or newer..." -ForegroundColor Yellow
        if ($DryRun) {
            Write-Host 'winget install Python.Python.3.11 (skipped: dry-run).' -ForegroundColor Yellow
        } else {
            winget install --id Python.Python.3.11 -e --source winget --accept-package-agreements --accept-source-agreements
        }
    } else {
        Write-Host "Python $major.$minor detected; skipping install." -ForegroundColor Green
    }
}

function Install-Backend {
    Write-Section 'Backend (Node.js API)'
    Push-Location "$PSScriptRoot\..\backend"
    if ($DryRun) {
        Write-Host 'npm install (skipped: dry-run).' -ForegroundColor Yellow
    } else {
        npm install
    }
    Pop-Location
}

function Install-MLService {
    Write-Section 'ML Service (Python)'
    Push-Location "$PSScriptRoot\..\ml_service"
    if ($DryRun) {
        Write-Host 'python -m venv .venv (skipped: dry-run).' -ForegroundColor Yellow
        Write-Host '.venv\\Scripts\\python.exe -m pip install --upgrade pip (skipped: dry-run).' -ForegroundColor Yellow
        Write-Host '.venv\\Scripts\\python.exe -m pip install -r requirements.txt (skipped: dry-run).' -ForegroundColor Yellow
    } else {
        python -m venv .venv
        & "$PSScriptRoot\..\ml_service\.venv\Scripts\python.exe" -m pip install --upgrade pip
        & "$PSScriptRoot\..\ml_service\.venv\Scripts\python.exe" -m pip install -r requirements.txt
    }
    Pop-Location
}

function Install-Mobile {
    Write-Section 'Mobile (React Native / Expo)'
    Push-Location "$PSScriptRoot\..\mobile"
    if ($DryRun) {
        Write-Host 'npm install (skipped: dry-run).' -ForegroundColor Yellow
    } else {
        npm install
    }
    Pop-Location
}

function Show-NextSteps {
    Write-Section 'Next Steps'
    Write-Host 'Backend:   cd backend; npm run dev' -ForegroundColor Green
    Write-Host 'ML API:    cd ml_service; .\\.venv\\Scripts\\activate; python app.py' -ForegroundColor Green
    Write-Host 'Mobile:    cd mobile; npm start' -ForegroundColor Green
}

Write-Section 'Prerequisite checks'
Assert-WindowsHost
Assert-Administrator
Ensure-Winget
Ensure-NodeJs
Ensure-Python

Install-Backend
Install-MLService
if (-not $SkipMobile) {
    Install-Mobile
} else {
    Write-Host 'Skipping mobile dependency install (run without -SkipMobile to include it).' -ForegroundColor Yellow
}

Show-NextSteps
Write-Host "\nWindows setup complete." -ForegroundColor Cyan
