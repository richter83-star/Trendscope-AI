# Trendscope AI (skeleton)

This repository provides a lightweight starter implementation for the AI Product Trend Forecasting app described in `Jobsss.txt`. It includes:

- Node.js + Express mock API with watchlist limits, product search, and subscription tiers.
- Python Flask ML microservice that scores products using rank velocity, price momentum, and review growth.
- React Native (Expo) UI scaffolding with shared components for product display and trending dashboard.

## Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

The API exposes endpoints for health checks, mock authentication, subscription tiers, watchlist management, and product search/detail requests. Environment variables live in `.env.example`.

## ML Service (Python)

```bash
cd ml_service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The `/trend-score` endpoint returns a computed score and label. `/health` reports service status.

## Mobile (React Native / Expo)

```bash
cd mobile
npm install
npm start
```

The Expo app renders a dashboard of trending products using the `ProductCard` and `TrendBadge` components.

## Notes

This codebase is a foundation and does not yet include production integrations (Stripe, Firebase, Redis, PostgreSQL, PA-API) or full scheduling. It is meant to illustrate the architecture, key endpoints, and UI building blocks for the full feature set in `Jobsss.txt`.

## Windows 10+ quick installer

Run the bundled PowerShell script from an **elevated (Administrator)** terminal to install prerequisites with winget and set up each project workspace:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
./scripts/windows-installer.ps1
```

Add `-SkipMobile` if you do not want to install the React Native / Expo dependencies on the first pass. After the script finishes you can start services with the standard commands shown in the output (e.g., `cd backend && npm run dev`, `cd ml_service && .\.venv\Scripts\activate && python app.py`).

If you want to validate the script from a non-Windows host or without making changes, use the dry-run mode:

```powershell
./scripts/windows-installer.ps1 -DryRun -SkipMobile
```
