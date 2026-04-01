# Pelle - CCTV Kameraövervakning

## Problembeskrivning
En-kamera React SPA ("Pelle") för lokal hosting via GitHub Pages. Ljust grönt tema, ingen autentisering, localStorage för kamera-IP, PWA-stöd.

## Kärnfunktioner (Implementerade)
- Enkel kamera-dashboard ("Pelle") med MJPEG-stream
- Inställningssida med localStorage (LocalConfigContext)
- React Router med `basename="/Pelle"` för GitHub Pages
- PWA manifest och SVG-ikoner
- Ljust grönt tema med tecknad kamera-logotyp
- Fullscreen med rotera 180, spegla horisontellt/vertikalt
- Screenshot-knapp
- Kompakta statusrutor (anslutningsstyrka, drifttid)
- LIVE-indikator (röd vid anslutning, grå vid offline)
- Batteriprocentvisning ovanför video
- Zoom-knappar (+/-) på höger sida av videospelaren
- Faktisk kamera-drifttid (baserad på anslutningsstatus)
- Rörelse- och ljuddetekteringsvarningar med switchar

## Teknikstack
- Frontend: React.js, Tailwind CSS, Lucide React, Shadcn UI
- State: React Context + localStorage
- Deploy: GitHub Pages (statisk)
- Backend: Ej använd

## Kritiska regler
- ALDRIG ta bort `basename="/Pelle"` från App.js
- ALDRIG ta bort `homepage` från package.json
- Ingen autentisering
- Allt på svenska

## Backlog
- P1: Verifiera dynamisk batterihämtning från `/battery`-endpoint
- P2: Rensa bort oanvända backend-filer
