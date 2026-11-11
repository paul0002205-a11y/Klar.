# Klar. — P-009

Eine minimalistische, privat genutzte Offline-first-Checklisten-PWA mit hochwertigem Dark Mode, entwickelt von P1aulie.

## Funktionsumfang (v0.3)
- Beliebige „Frei seit …“-Zähler (Name, Datum und Uhrzeit; erstellen, bearbeiten, löschen)
- Tägliche Checkliste mit frei konfigurierbaren Aufgaben und automatischem Tagesreset
- Tagesfortschritt mit Prozentwert
- Kalenderwochen-Navigation (Montag–Sonntag) mit Erledigungsquote, perfekten Tagen und aktueller Serie
- Wochenbericht als Excel-kompatible CSV-Datei: Tageswerte, Wochenzusammenfassung und Frei-seit-Zähler
- Lokale Browser-Datenhaltung ohne Benutzerkonto, Server oder Cloud
- JSON-Backup und -Wiederherstellung einschließlich Verlauf
- Responsive Android-/Desktop-PWA, Cache für Offline-Nutzung

## Installation
1. Repository in GitHub Pages als statische Website veröffentlichen (Settings → Pages → Deploy from a branch → main / (root)).
2. HTTPS-Website in Chrome auf Android öffnen.
3. Über das Menü „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.
4. Nach vollständigem ersten Laden kann die installierte App offline verwendet werden. Den Offline-Start auf dem eigenen Gerät prüfen.

## Wochenexport (CSV)
In „Deine Woche“ mit ‹ und › die Kalenderwoche wählen, dann „Woche als CSV exportieren“ auswählen. Der Bericht enthält für jeden Tag erledigte/gesamte Aufgaben, Prozentquote (bei fehlenden Daten leer), die Wochensumme und aktive Frei-seit-Zähler mit Stand am Ende der gewählten Woche beziehungsweise heute.

Der CSV-Export ist ein reiner Bericht und **kein importierbares Backup**. Für vollständige Datensicherung weiterhin „Backup speichern“ als JSON benutzen.

## Updates und Datenexport
**Vor Updates immer in Klar. „Backup speichern“ verwenden.** Die unverschlüsselte JSON-Datei sicher außerhalb des Browser-Speichers aufbewahren.
- Ein Update auf derselben Webadresse im selben Browserprofil erhält normalerweise den lokalen Speicher.
- Bei einem Wechsel von Domain, Browser, Browserprofil oder Gerät werden Daten nicht automatisch übertragen. In der neuen Installation „Backup laden“ wählen und JSON-Datei importieren.
- Der Import ersetzt nach ausdrücklicher Bestätigung sämtliche aktuellen App-Daten.
- Der lokale Speicher verwendet weiter den Schlüssel `klar.p009.v1`. v0.3 liest ältere v0.1-/v0.2-Backups und übernimmt Zähler, Aufgaben und Häkchen.
- Frühere v0.1-Häkchen werden nicht rückwirkend als Verlaufsprozente rekonstruiert, weil der damals gültige Tagesumfang nicht gespeichert wurde.
- Browserdaten-Löschung kann ohne Backup zu Datenverlust führen.
- **Debug-APK:** GitHub Actions verwendet normalerweise einen neuen Debug-Signaturschlüssel pro Runner. Beim Umstieg von einer bereits installierten v0.2-Debug-APK kann deshalb Deinstallation notwendig sein: unbedingt vorher JSON-Backup exportieren und danach importieren.

## Entwicklung und Prüfung
Die App hat keine Laufzeitabhängigkeiten und benötigt kein Build-System. Testprotokoll: `TESTING.md`.
Der Offline-/Installations-Test auf realem Android/HTTPS-Hosting steht noch aus.

Nur Projekt P-009. Keine Verbindungen zu Code P, DevControl oder CALTRAIN.
