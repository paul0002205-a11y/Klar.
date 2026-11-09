# Klar. — P-009

Eine kleine, offline-first Checklisten-App für Android und Desktop.

## v0.1
- Frei-seit-Zähler mit Namen und Startzeitpunkt, anpassbar und löschbar
- Eigene wiederkehrende Aufgaben, täglich automatisch neue Häkchen
- Tagesfortschritt, Dark-Mode-UI, responsive
- Lokaler Browser-Speicher und JSON-Backup/Restore
- Keine Accounts, Cloud oder Abonnements

## Starten
Statische Dateien via HTTPS hosten, z. B. GitHub Pages (Settings → Pages → Deploy from branch → main / root).
In Chrome auf Android öffnen und über das Menü **App installieren** bzw. **Zum Startbildschirm hinzufügen** auswählen.
Nach dem ersten Laden ist die App über den Service Worker offline verfügbar.

Die Einträge liegen nur im Browser des Geräts. Wird die Website-Speicherung gelöscht, gehen sie ohne JSON-Backup verloren.

Projekt P-009 · by P1aulie
