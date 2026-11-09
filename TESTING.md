# Klar. v0.2 — Testbericht (2026-11-09)

## Bestanden
- JavaScript-Syntax (`node --check`): `app.js`, `sw.js`.
- Browser-Test mit Chromium (mobiler und Desktop-Viewport, JS/CSS im Testdokument eingebettet):
  - Frei-seit-Zähler erstellen und anzeigen
  - Tägliche Aufgaben hinzufügen und abhaken
  - Fortschrittswert und 7-Tage-Verlauf korrekt aktualisieren
  - Perfekte Tage und aktuelle Serie aktualisieren
  - Lokaler Zustand nach Neuinitialisierung weiterhin vorhanden
  - JSON-Export und -Import einschließlich Verlauf
  - Automatische Übernahme des lokalen v0.1-Datenformats (Zähler, Aufgaben und Häkchen)
  - Nutzereingaben werden als Text gerendert (keine HTML-Ausführung)
  - Keine JavaScript-Laufzeitfehler in den Szenarien
- Manifest-Datei und App-Icons vorhanden.

## Noch zu testen
- Echte HTTPS-PWA-Installation und Service-Worker-Offline-Neuladen auf Android; isolierte Browserumgebung blockierte URL-Navigation im Test.
- Langzeittest über mehrere reale Kalendertage und Browser-/Gerätewechsel.
- Erst nach GitHub-Pages-Aktivierung kann die veröffentlichte Version getestet werden.

## Datensicherheit bei Updates
- v0.1 bleibt per Import und lokalen Speicher lesbar. v0.2 exportiert auch `history`.
- Vor Aktualisierungen JSON-Backup speichern. Daten bleiben bei unveränderter Webadresse und unverändertem Browserprofil erhalten. Keine Cloud-Synchronisierung.