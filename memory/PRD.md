# CCTV Monitor App - PRD

## Original Problem Statement
Build a CCTV camera monitoring app with:
- Two cameras named "Pelle" and "Printer"
- Google login authentication
- Live MJPEG stream display with placeholder images
- LIVE indicator and battery percentage overlay
- Status section with Connection Strength and Uptime
- Motion detection and sound alerts
- Camera settings (brightness, contrast)
- Dark modern CCTV aesthetic
- Security: Only accessible within same WiFi network

## User Personas
- **Home User**: Monitors cameras on local network for security
- **Pet Owner**: Watches pet cam (Pelle) remotely within home

## Core Requirements (Static)
1. Google OAuth authentication via Emergent Auth
2. Dual camera switching (Pelle/Printer)
3. Live video feed with overlays
4. Camera settings persistence
5. Alert toggles (motion/sound)
6. Local network security model

## What's Been Implemented (2026-03-31)
- ✅ Google OAuth login with Emergent Auth
- ✅ Custom logo (green P with camera lens)
- ✅ Dashboard with camera toggle
- ✅ Video stream container with LIVE/battery overlays
- ✅ Status cards (Connection, Uptime)
- ✅ Motion & Sound alert toggles
- ✅ Camera settings panel (brightness/contrast sliders)
- ✅ Swedish localization
- ✅ Security notice for local WiFi
- ✅ Dark CCTV aesthetic with Outfit/JetBrains Mono fonts
- ✅ Mobile-first responsive design

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB
- **Auth**: Emergent Google OAuth

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (Important)
- Stream URL configuration per camera
- Actual MJPEG stream integration
- Push notifications for alerts

### P2 (Nice to have)
- Recording/snapshot functionality
- Multi-user support
- Camera scheduling

## Next Tasks
1. Add ability to configure actual camera stream URLs
2. Implement real motion detection algorithm
3. Add sound detection with mic access
