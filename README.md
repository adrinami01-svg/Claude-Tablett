# Claude-Tablett – Hub-App

Eine kleine App (PWA), mit der du deinen **Mein Hub** (Claude-Artifact) mit einem Tipp vom Homescreen öffnest.

## Was sie kann
- **Großer „Mein Hub öffnen“-Button** – ein Tipp, und der Hub ist da.
- **Terminplan**: Wochenleiste mit Punkten pro Tag, Liste für den gewählten Tag, „Danach (nächste 30 Tage)“ und Countdown bis zur nächsten Prüfung.
- **Alle Termine**: eintragen (auch wöchentlich wiederholt), löschen mit Rückgängig, Import aus `.json` (Hub) oder `.ics` (Kalender), Sicherung als `.json`, Export als `.ics` mit Erinnerung 1 Tag vor Prüfungen.
- **Schnellnotiz**: speichert automatisch, mit einem Tipp in die Obsidian-Inbox.
- **Lern-Timer** 25/5 Minuten mit Ton und Vibration, zählt Lerneinheiten pro Tag/Woche.
- **Lernkarten** (Karteikasten mit 5 Fächern) mit über 50 Pflege-Fachbegriffen, eigene Stapel, viele Karten auf einmal einfügen; „Lernkarte des Tages“ auf der Übersicht.
- **Noten**: Noten pro Fach/CE mit Gewichtung, Durchschnitt pro Fach und gesamt.
- **Wetter** für heute und morgen (Open-Meteo, ohne Anmeldung) mit Schirm-Hinweis.
- **Gewohnheiten** zum Abhaken mit 7-Tage-Verlauf und Serie 🔥.
- **Paper-Trading-Bot** (`trading.html`, Link „📈 Paper-Trading“ in der Tab-Leiste): handelt mit Spielgeld auf echten Kursen: Krypto über Binance (BTC, ETH, SOL …, rund um die Uhr) oder **Nasdaq-100-Aktien** über Twelve Data (QQQ, NVDA, AAPL …, kostenloser Key nötig, gehandelt wird nur zu US-Börsenzeiten 15:30–22:00 Uhr). Strategien: Trendfolge (SMA 20/50), Rücksetzer kaufen (RSI), Ausbruch (Donchian) oder **KI-Agent**, bei dem Claude pro neuer Kerze kaufen/verkaufen/halten entscheidet (eigener API-Key nötig, Tageslimit einstellbar). Stop-Loss, Gewinnziel, Risiko je Trade, Gebühren und Schlupf werden simuliert. Mit **Backtest** über die letzten 1000 Kerzen im Vergleich zu „nur halten“, Trade-Liste als CSV. Läuft nur, solange die Seite offen ist (Option „Bildschirm anlassen“).
- **Komplett-Sicherung** aller Daten in eine Datei und Wiederherstellen.
- **Schnellzugriff-Kacheln**: Obsidian (Vault & Inbox), Gmail, Kalender, Claude – frei anpassbar (Bearbeiten → hinzufügen, verschieben, entfernen).
- **Auto-Start** (optional, in den Einstellungen): öffnet beim Start nach 2 Sekunden direkt den Hub, mit „Abbrechen“.
- **App-Shortcuts** (Android): lange auf das App-Symbol drücken → Hub, Obsidian oder Gmail direkt.
- **Tastatur** (Tablet mit Tastatur): `0` = Hub, `1`–`9` = Kacheln.
- **Offline**: die Startseite lädt auch ohne Netz.
- Hell/Dunkel automatisch, große Touch-Flächen.

Kacheln, Termine und Notiz werden **nur auf dem Gerät** gespeichert – nichts davon landet im Repo.

## Installieren
1. **GitHub Pages einschalten**: Repo → *Settings → Pages → Source: „GitHub Actions“*. Danach veröffentlicht der Workflow die App bei jedem Push auf `main` unter
   `https://adrinami01-svg.github.io/Claude-Tablett/`.
2. Die Adresse auf dem Tablet öffnen:
   - **iPad (Safari)**: Teilen → „Zum Home-Bildschirm“.
   - **Android (Chrome)**: Menü → „App installieren“ (oder Button „Als App installieren“ in der App).

Lokal testen: `python3 -m http.server` im Ordner starten und `http://localhost:8000` öffnen.
