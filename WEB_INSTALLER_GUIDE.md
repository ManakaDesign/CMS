# 🚀 CMS Web Installer - Installation Guide

## For Shared Hosting without Shell Access

Dieser Guide ist für dich, wenn:
- ❌ Du Probleme beim lokalen Entzippen hast (Pfade zu lang)
- ❌ Du keinen SSH-Zugang zu deinem Shared Hosting hast
- ✅ Du eine einfache Web-basierte Installation möchtest

---

## 📥 Schritt 1: Dateien runterladen

### Option A: Direkt vom Repository (Empfohlen)
1. Gehe zu: https://github.com/ManakaDesign/CMS
2. Branch auswählen: `claude/analyze-progress-context-011CUrwcbeVoeABYz5xWsyU7`
3. Klicke "Code" → "Download ZIP"
4. **Speichere als:** `cms.zip` (wichtig!)

### Option B: Release Download (wenn verfügbar)
1. Gehe zu: https://github.com/ManakaDesign/CMS/releases
2. Lade die neueste Version runter
3. **Umbenennen zu:** `cms.zip`

---

## 📤 Schritt 2: Dateien hochladen

**Du brauchst nur 2 Dateien hochzuladen!**

### Per FTP (FileZilla, WinSCP, etc.):

1. **Verbinde dich** mit deinem Webserver
2. **Navigiere** zum Document Root (meist `/public_html/` oder `/htdocs/`)
3. **Lade hoch**:
   - `cms.zip` (die komplette ZIP-Datei)
   - `web-installer.php` (einzelne Datei aus dem Repository)

```
/public_html/
├── cms.zip              ← Die große ZIP-Datei
└── web-installer.php    ← Der Web-Installer
```

### Per cPanel File Manager:

1. **Login** in cPanel
2. **Öffne** "File Manager"
3. **Gehe zu** Document Root
4. **Klicke** "Upload"
5. **Wähle beide Dateien**:
   - `cms.zip`
   - `web-installer.php`
6. **Warte** bis Upload fertig ist

**⏱️ Upload-Zeit:**
- Bei 60MB ZIP über DSL 16.000: ca. 5-10 Minuten
- Bei schnellerem Internet: 1-3 Minuten

---

## 🎯 Schritt 3: Web-Installer öffnen

1. **Öffne deinen Browser**
2. **Gehe zu:** `https://deine-domain.de/web-installer.php`

Du siehst jetzt den **CMS Web Installer**!

---

## 🔍 Schritt 4: Status prüfen

Der Installer zeigt dir:

### ✅ Wenn alles OK ist:
```
📦 Package Status
  ZIP File: ✓ Found
  Filename: cms.zip
  Size: 60.5 MB
  ZipArchive Extension: ✓ Available
```

**Button:** "Extract CMS Package" ist klickbar

### ❌ Wenn ZIP fehlt:
```
📦 Package Status
  ZIP File: ✗ Not Found
  Filename: cms.zip
```

**Lösung:** ZIP-Datei muss `cms.zip` heißen und im selben Ordner sein!

### ❌ Wenn ZipArchive fehlt:
```
ZipArchive Extension: ✗ Not Available
```

**Lösung:** Kontaktiere deinen Hoster, um PHP ZipArchive zu aktivieren

---

## ⚡ Schritt 5: Entpacken

1. **Klicke** auf "Extract CMS Package"
2. **Warte** während der Extraktion:
   - Progress Bar zeigt Fortschritt
   - Kann 2-5 Minuten dauern
   - **NICHT** Browser schließen!

3. **Bei Erfolg siehst du:**
   ```
   ✓ Successfully extracted 8290 files!

   [✓ Continue to Installation]
   ```

4. **Klicke** "Continue to Installation"
5. **Du wirst weitergeleitet** zu `/install/setup.php`

---

## 🎉 Schritt 6: Normale Installation

Ab hier geht es weiter wie in der normalen Anleitung:

1. **System Requirements Check**
2. **Datenbank-Konfiguration**
   - Gib deine MySQL-Daten ein
   - Datenbank muss bereits erstellt sein
3. **Site Settings**
4. **Admin Account erstellen**
5. **Fertig!** → Login unter `/admin`

Siehe: `INSTALLATION_SHARED_HOSTING.md` für Details

---

## 🔧 Troubleshooting

### Problem: "ZIP File Not Found"

**Lösung:**
- Datei muss **exakt** `cms.zip` heißen (Kleinbuchstaben!)
- Muss im **selben Ordner** wie `web-installer.php` sein
- Prüfe per FTP ob Datei wirklich hochgeladen wurde

### Problem: "ZipArchive Extension Not Available"

**Lösung:**
- Kontaktiere deinen Hosting-Provider
- Bitte um Aktivierung der PHP ZipArchive Extension
- Oder wechsle zu einem besseren Hoster

### Problem: "Extraction Failed" / Timeout

**Lösung:**
- Server hat zu wenig Memory/Zeit
- Kontaktiere Hoster für höhere Limits
- Oder nutze SSH-Zugang falls verfügbar:
  ```bash
  unzip cms.zip
  ```

### Problem: "Permission Denied" beim Schreiben

**Lösung:**
```bash
chmod 755 /pfad/zum/web-root
```

Oder in cPanel:
- Rechtsklick auf Ordner → Permissions → 755

---

## 🔐 Nach der Installation

### Sicherheit:

**Lösche folgende Dateien:**
```bash
rm web-installer.php
rm cms.zip
```

Oder per FTP:
- `web-installer.php` löschen
- `cms.zip` löschen

Diese Dateien sind nur für die Installation nötig!

---

## 📁 Finale Struktur

Nach erfolgreicher Extraktion:

```
/public_html/
├── app/
├── bootstrap/
├── config/
├── database/
├── install/
├── public/
│   ├── index.php
│   └── admin/
├── resources/
├── routes/
├── storage/
├── vendor/              ← Jetzt vorhanden!
├── .env.example
├── artisan
└── composer.json
```

---

## ⚡ Vorteile des Web-Installers

✅ **Keine lokalen Entpack-Probleme** (Windows Pfadlänge)
✅ **Kein SSH nötig** - alles über Browser
✅ **Automatische Extraktion** auf dem Server
✅ **Progress-Anzeige** - du siehst den Fortschritt
✅ **Fehlerbehandlung** - hilfreiche Meldungen
✅ **2-Datei-Upload** statt 8290 Dateien einzeln!

---

## 🎯 Zusammenfassung

1. **Download:** `cms.zip` + `web-installer.php`
2. **Upload:** Beide Dateien per FTP
3. **Browser:** `https://deine-domain.de/web-installer.php`
4. **Klick:** "Extract CMS Package"
5. **Warten:** 2-5 Minuten
6. **Weiter:** Normale Installation

**Gesamtzeit: ~10-15 Minuten** ⚡

---

**Viel Erfolg!** 🚀

Bei Problemen: Check `INSTALLATION_SHARED_HOSTING.md` für weitere Hilfe.
