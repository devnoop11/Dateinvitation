# Dateinvitation 💌

Lokale, statische Website nach dem verlinkten Chat: chinesische Bug-Systemmeldung, ausweichender No-Button, Yes-Bestätigung mit Herzen und kopierbarer Antwort. Die Signatur lautet **来自一位在意你的人**.

## Lokal öffnen

`index.html` im Browser öffnen. Es sind keine Installation, kein Build und keine externen Bibliotheken nötig. Für die Zwischenablage ist ein lokaler Webserver zuverlässiger:

```sh
cd /pfad/zu/date-invitation
python3 -m http.server 4173 --bind 127.0.0.1
```

Danach http://127.0.0.1:4173 öffnen. Falls Kopieren nicht verfügbar ist, markiert die Seite den Antworttext zur manuellen Übernahme.

## Smartphone

Für kleine Bildschirme ab 320 px optimiert: gut lesbare Texte, mindestens 48 px hohe Touch-Buttons und sichere Abstände zum Bildschirmrand. Der No-Button weicht beim Berühren aus und bleibt im sichtbaren Bereich. Die Zusage scrollt auf kleinen Displays in den sichtbaren Bereich. Die Seite berücksichtigt reduzierte Bewegung und Displayaussparungen.

## GitHub Pages

1. Den Inhalt dieses Ordners einschließlich `.github` in ein GitHub-Repository übernehmen und auf den Branch `main` pushen.
2. Im Repository unter **Settings → Pages → Build and deployment → Source** die Option **GitHub Actions** auswählen.
3. Unter **Actions → Deploy to GitHub Pages → Run workflow** die erste Veröffentlichung starten. Bei späteren Pushes auf `main` läuft sie automatisch.

Die Veröffentlichung nutzt `.github/workflows/pages.yml`. Alle Asset-Pfade sind relativ; dadurch funktionieren auch Projekt-URLs wie `https://USERNAME.github.io/REPOSITORY/`.

## Anpassen

- `index.html`: chinesische Texte und Einladung
- `style.css`: Farben, Layout und Animationen
- `script.js`: ausweichender Button, Bestätigung und Kopieren

Die Website versendet keine Antwort automatisch. Ein Klick auf Yes bleibt im Browser; die empfangende Person kann die Antwort kopieren und selbst verschicken. Es gibt keinen Server, keine Analyse und keine Speicherung persönlicher Daten.

Die HTML-Anhänge des geteilten Chats waren nicht abrufbar; diese Version wurde anhand der sichtbaren Beschreibung und Texte neu umgesetzt.
