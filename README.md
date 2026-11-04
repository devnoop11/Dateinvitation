# Dateinvitation 💌

Eine persönliche Einladung auf Chinesisch mit chinesischer Terminauswahl und chinesischer WeChat-Nachricht, optimiert für Smartphone und Desktop. Nach der Zusage kann die Empfängerin dieses Wochenende, Samstag, Sonntag oder einen eigenen Termin wählen. Die optionale Uhrzeit und das gewählte Datum werden in eine Nachricht für WeChat übernommen.

## Lokal öffnen

`index.html` direkt im Browser öffnen oder einen lokalen Webserver starten:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Danach http://127.0.0.1:4173 öffnen. Keine Installation, kein Build und keine externen Bibliotheken erforderlich.

## Bedienung

1. Mit **好呀** die Einladung annehmen.
2. Dieses Wochenende, Samstag oder Sonntag auswählen – oder ein eigenes Datum vorschlagen.
3. Optional eine Uhrzeit angeben.
4. **复制消息** wählen und den Text in WeChat einfügen und abschicken.

Die Wochenenddaten werden im lokalen Kalender des Browsers berechnet. Am Sonntag ist der vergangene Samstag nicht mehr auswählbar. Eigene Termine dürfen nicht in der Vergangenheit liegen. Eine Uhrzeit ist optional. Die Nachricht zeigt die Auswahl vor dem Kopieren an. Falls die Zwischenablage nicht verfügbar ist, wird der Text zum manuellen Kopieren markiert.

Die Website sendet nichts automatisch, speichert keine persönlichen Daten und hat keine E-Mail-Benachrichtigung.

## GitHub Pages

Live: https://devnoop11.github.io/Dateinvitation/

Pushes auf `main` veröffentlichen über `.github/workflows/pages.yml` automatisch. Unter **Settings → Pages → Source** muss **GitHub Actions** gewählt sein. GitHub Pages muss nach einem Wechsel der Repository-Sichtbarkeit gegebenenfalls erneut aktiviert werden.

## Foto

Das persönliche Foto liegt unter `assets/portrait.jpg` und ist als großes Motiv mit weichem Übergang in die Einladung eingebunden. EXIF-, IPTC- und Kommentar-Metadaten wurden bei der Übernahme entfernt; die JPEG-Bilddaten bleiben unverändert. Der Pages-Workflow übernimmt den Asset-Ordner.

## Dateien

- `index.html`: chinesische Einladung und chinesische Terminauswahl
- `style.css`: responsive Darstellung und Animationen
- `script.js`: Buttons, Wochenendberechnung und kopierbare Nachricht

Alle Asset-Pfade sind relativ und funktionieren unter der Projekt-URL. Die Seite berücksichtigt reduzierte Bewegung und Displayaussparungen.
