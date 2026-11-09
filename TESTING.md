# Klar. v0.1 — QA-Protokoll (2026-11-09)

## Verifiziert
- JavaScript-Syntax: `node --check app.js` und `node --check sw.js` erfolgreich.
- `manifest.webmanifest`: gültiges JSON; Standalone-Anzeige und relative Pfade.
- Browser-Smoketest (Chromium / Playwright, lokale HTML/CSS/JS-Injektion):
  - Erstanzeige und leere Zustände
  - Zähler mit selbst gewähltem Namen/Startzeitpunkt anlegen
  - Zwei tägliche Aufgaben erstellen
  - Aufgaben abhaken und Fortschritt berechnen
  - Daten speichern und nach neuer Dokumentinitialisierung wiederherstellen (Storage-Simulation)
  - Aufgabe bearbeiten/löschen
  - JSON-Export und JSON-Import
  - HTML-Eingaben werden als Text angezeigt, nicht ausgeführt
  - Darstellung bei 390 px und 1365 px Viewport geprüft
- GitHub: HTML, CSS, JavaScript, Manifest, Service Worker, SVG und 192/512-PNG-Icons im Repository geprüft.

## Noch offen
- Live-Hosting über HTTPS/GitHub Pages: muss in Repository-Einstellungen aktiviert werden.
- Service-Worker-Installation, Offline-Reload und Android-Installationsdialog müssen nach dem Live-Hosting auf einer echten HTTPS-Origin getestet werden. Die isolierte Chromium-Testumgebung blockiert Netzwerk-Navigation.
- Browserübergreifende QA und Backup nach tatsächlichem Android-Gerätewechsel stehen aus.

## Datenschutz
- Keine Nutzer-Daten im GitHub-Repository.
- Fortschritte werden nur lokal im Browser gespeichert; JSON-Backups sind nicht verschlüsselt.
- Auf demselben Gerät sind Browserprofile getrennt; bei Löschen von Website-Daten ohne Backup droht Datenverlust.
