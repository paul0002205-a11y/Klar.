# Klar. v0.3 — QA-Protokoll (2026-11-11)

## Erfolgreich überprüft
- GitHub Actions Android-APK-Build: erfolgreich; APK als `builds/Klar-v0.3-debug.apk` vorhanden.
- APK-Dateistruktur und ZIP-Integrität geprüft; Android-Signaturblock vorhanden.
- Aus der **gebauten APK** extrahiertes `assets/app.js`: JavaScript-Syntaxprüfung erfolgreich.
- In der gebauten APK sind `saveWeeklyReport` und `text/csv` im Android-Dex vorhanden.
- Aus der APK extrahierter JavaScript-Code: sieben Tage Montag–Sonntag, Vorwochen-Navigation, Wochenquote mit gewichteten Aufgaben-Zahlen, fehlende Tage, CSV-Header/BOM und Schutz vor Tabellenformeln geprüft.
- Klar.-v0.2 JSON-Backup wird weiterhin unverändert unterstützt.
- Keine Netzberechtigung erforderlich; Web-Inhalte sind in APK enthalten.

## Signatur- / Update-Hinweis
Die Debug-Signer-Zertifikate der APKs v0.2 und v0.3 **unterscheiden sich**. Android akzeptiert deshalb **kein Update über eine installierte v0.2-Debug-APK mit derselben Paket-ID**.

**Vor einer Deinstallation**: in v0.2 `Backup speichern` als JSON ausführen und Datei prüfen. Danach v0.2 deinstallieren, v0.3 installieren, dort `Backup laden` auswählen. Ein CSV-Wochenbericht ist **kein** importierbares Backup.

Für spätere normale App-Updates wird ein dauerhaftes, geschütztes Release-Signing-Setup benötigt.

## Nicht auf Hardware geprüft
- Echte Installation und Funktionsabläufe auf einem Pixel/Android-Gerät
- SAF-Dokumentdialog für den CSV-Export auf einem realen Gerät
- Gerätewechsel und mehrere Wochen in Echtzeit
