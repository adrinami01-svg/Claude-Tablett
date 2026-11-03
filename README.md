# Claude-Tablett – Hub-App

Eine kleine App (PWA), mit der du deinen **Mein Hub** (Claude-Artifact) mit einem Tipp vom Homescreen öffnest.

## Was sie kann
- **Großer „Mein Hub öffnen“-Button** – ein Tipp, und der Hub ist da.
- **Schnellzugriff-Kacheln**: Obsidian (Vault & Inbox), Gmail, Kalender, Claude – frei anpassbar (Bearbeiten → hinzufügen, verschieben, entfernen).
- **Auto-Start** (optional, in den Einstellungen): öffnet beim Start nach 2 Sekunden direkt den Hub, mit „Abbrechen“.
- **App-Shortcuts** (Android): lange auf das App-Symbol drücken → Hub, Obsidian oder Gmail direkt.
- **Tastatur** (Tablet mit Tastatur): `0` = Hub, `1`–`9` = Kacheln.
- **Offline**: die Startseite lädt auch ohne Netz.
- Hell/Dunkel automatisch, große Touch-Flächen.

Kacheln und Einstellungen werden pro Gerät im Browser gespeichert.

## Installieren
1. **GitHub Pages einschalten**: Repo → *Settings → Pages → Source: „GitHub Actions“*. Danach veröffentlicht der Workflow die App bei jedem Push auf `main` unter
   `https://adrinami01-svg.github.io/Claude-Tablett/`.
2. Die Adresse auf dem Tablet öffnen:
   - **iPad (Safari)**: Teilen → „Zum Home-Bildschirm“.
   - **Android (Chrome)**: Menü → „App installieren“ (oder Button „Als App installieren“ in der App).

Lokal testen: `python3 -m http.server` im Ordner starten und `http://localhost:8000` öffnen.
