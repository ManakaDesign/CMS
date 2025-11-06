# CMS Installation auf Shared Hosting

## 📦 Was ist bereits vorbereitet?

✅ **Alle PHP Dependencies** (Composer) installiert
✅ **React Builder** komplett gebaut und optimiert
✅ **Laravel konfiguriert** mit MySQL-Support
✅ **Admin-Panel Route** eingerichtet (`/admin`)
✅ **API-Endpunkte** für Builder fertig

---

## 🚀 Installation auf Shared Hosting

### Schritt 1: Projekt hochladen

#### Option A: Via FTP/SFTP (z.B. FileZilla)
1. Verbinde dich mit deinem Shared Hosting per FTP
2. Navigiere zum **Document Root** (meist `/htdocs`, `/public_html` oder `/www`)
3. Lade **ALLE** Dateien aus diesem Ordner hoch
   - ⚠️ **Wichtig**: Auch versteckte Dateien wie `.env`, `.htaccess`!

#### Option B: Via cPanel File Manager
1. Logge dich in cPanel ein
2. Öffne "File Manager"
3. Navigiere zum Document Root
4. Uploade alle Dateien als ZIP und entpacke sie dort

### Schritt 2: MySQL-Zugang bereitstellen

**✨ Wichtig: Der Installation Wizard erstellt die Datenbank automatisch!**

Du benötigst nur:
1. **MySQL/MariaDB Zugang** (meist schon vom Hoster vorhanden)
2. **Benutzername & Passwort** mit `CREATE DATABASE` Berechtigung
3. **Host-Adresse** (meist `localhost`)

Der Wizard erstellt dann automatisch:
- Die Datenbank (wenn sie noch nicht existiert)
- Alle Tabellen
- Den Admin-User
- Die komplette Konfiguration

**Optional:** Du kannst die Datenbank auch vorher manuell erstellen (z.B. in cPanel/phpMyAdmin), dann braucht der User keine CREATE DATABASE Rechte.

### Schritt 3: Installation Wizard starten

**Das war's schon mit der Vorbereitung!** 🎉

Öffne jetzt einfach im Browser:

```
https://deine-domain.de/install/setup.php
```

Der Installation Wizard führt dich durch folgende Schritte:

#### 🚀 Schritt 1: Willkommen
- Übersicht über den Installationsprozess

#### ✅ Schritt 2: System-Check
- Prüft PHP-Version, Extensions, Permissions
- Zeigt alle Anforderungen mit ✅/❌

#### 🗄️ Schritt 3: Datenbank-Konfiguration
Eingabe von:
- Database Host (meist `localhost`)
- Database Port (meist `3306`)
- Database Name (z.B. `cms_database` - wird automatisch erstellt!)
- Database Username
- Database Password

Der Wizard testet die Verbindung und erstellt die Datenbank automatisch.

#### ⚙️ Schritt 4: Website-Einstellungen
- Site Name (z.B. "Meine Website")
- Site URL (wird automatisch erkannt)

#### 👤 Schritt 5: Admin-Account
- Deine E-Mail Adresse
- Sicheres Passwort (mindestens 8 Zeichen)

#### ✨ Schritt 6: Installation
Der Wizard führt automatisch aus:
- ✅ Generiert `.env` Datei mit sicheren Keys
- ✅ Erstellt Datenbank (falls nicht vorhanden)
- ✅ Führt alle Migrations aus (erstellt Tabellen)
- ✅ Erstellt deinen Admin-User
- ✅ Setzt alle Permissions
- ✅ Fertig in unter 5 Minuten!

**Funktioniert auch auf Shared Hosting ohne SSH!** Der Wizard erkennt automatisch, ob `exec()` verfügbar ist und nutzt einen Fallback für eingeschränkte Hosting-Umgebungen.

### Schritt 4: Admin-Login

Nach erfolgreicher Installation:

1. Öffne: `https://deine-domain.de/admin`
2. Login mit den Zugangsdaten, die du im Wizard eingegeben hast
3. 🎉 **Fertig!** Du kannst jetzt Seiten erstellen und das CMS nutzen!

---

## ⚠️ Wichtig: Permissions

Der Installation Wizard benötigt **Schreibrechte** für folgende Ordner:
```
storage/
bootstrap/cache/
```

Falls der Wizard Fehler meldet, setze die Permissions:

**In cPanel:**
- Rechtsklick auf Ordner → "Change Permissions" → 755 oder 775

**Via SSH/FTP:**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

---

## 🔧 Häufige Probleme & Lösungen

### Problem: "500 Internal Server Error"
**Lösung:**
- Prüfe `.htaccess` Datei im `public/` Ordner
- Aktiviere `mod_rewrite` in cPanel
- Prüfe PHP-Version (mindestens PHP 8.2 erforderlich)

### Problem: "Storage not writable"
**Lösung:**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Problem: "Database connection error"
**Lösung:**
- Prüfe `.env` Datei:
  - DB_HOST korrekt? (manchmal `127.0.0.1` statt `localhost`)
  - DB_DATABASE, DB_USERNAME, DB_PASSWORD richtig?
- Teste Verbindung in phpMyAdmin

### Problem: "Admin Panel lädt nicht"
**Lösung:**
- Prüfe ob `/admin/` Route funktioniert
- Öffne Browser-Console (F12) → Fehler anzeigen
- Prüfe ob `/admin/assets/` Dateien erreichbar sind

### Problem: "API calls fail (CORS errors)"
**Lösung:**
Füge in `.env` hinzu:
```env
SESSION_DOMAIN=.deine-domain.de
SANCTUM_STATEFUL_DOMAINS=deine-domain.de,www.deine-domain.de
```

---

## 📁 Wichtige Verzeichnisse

```
/                          → Laravel Root
├── public/               → Web Root (DocumentRoot hier setzen!)
│   ├── index.php        → Laravel Entry Point
│   ├── admin/           → React Admin Panel
│   └── .htaccess        → Apache Rewrite Rules
├── app/                 → Laravel Code
├── routes/              → API & Web Routes
├── resources/           → Views & Source
├── storage/             → Uploads, Cache, Logs
├── database/            → Migrations & Seeders
└── .env                 → Konfiguration
```

**⚠️ WICHTIG für Shared Hosting:**
Setze den **Document Root** auf `/public/` (nicht auf Root!)
- In cPanel: "Domains" → "Document Root" → `/public_html/cms/public`

---

## 🔐 Sicherheit nach Installation

1. **Admin-Passwort ändern**
   - Login → Settings → Change Password

2. **APP_DEBUG deaktivieren**
   ```env
   APP_DEBUG=false
   ```

3. **Installation Wizard löschen** (nach erfolgreicher Installation)
   ```bash
   rm -rf install/
   ```

4. **.env schützen** (sollte automatisch durch `.htaccess` passieren)
   ```
   # .htaccess prüfen:
   <Files .env>
       Order allow,deny
       Deny from all
   </Files>
   ```

---

## ✅ Nach erfolgreicher Installation

Du kannst dann:
- ✅ Im **Dashboard** neue Seiten erstellen (`/admin`)
- ✅ Im **Visual Builder** Seiten designen
- ✅ **Elemente** per Drag & Drop hinzufügen
- ✅ **Seiten veröffentlichen**

---

## 🆘 Support

Bei Problemen:
1. Prüfe `storage/logs/laravel.log` für Fehler
2. Aktiviere `APP_DEBUG=true` in `.env` (temporär!)
3. Browser Console (F12) für JavaScript-Fehler

---

**Viel Erfolg! 🚀**
