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

### Schritt 2: MySQL-Datenbank erstellen

1. **In cPanel / phpMyAdmin**:
   - Erstelle eine neue MySQL-Datenbank (z.B. `cms_database`)
   - Erstelle einen MySQL-User
   - Gib dem User alle Rechte auf die Datenbank
   - Notiere dir:
     - Datenbank-Name
     - Benutzername
     - Passwort
     - Host (meist `localhost`)

### Schritt 3: .env konfigurieren

1. Öffne die Datei `.env` im Hauptverzeichnis
2. Passe folgende Zeilen an:

```env
APP_NAME="Dein CMS Name"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://deine-domain.de

DB_CONNECTION=mysql
DB_HOST=localhost               # Oder vom Hoster bereitgestellt
DB_PORT=3306
DB_DATABASE=cms_database        # Deine Datenbank
DB_USERNAME=dein_user           # Dein MySQL-User
DB_PASSWORD=dein_passwort       # Dein MySQL-Passwort
```

### Schritt 4: Datenbank-Setup

Du hast **zwei Optionen**:

#### Option A: Automatisch mit Installation Wizard
1. Öffne im Browser: `https://deine-domain.de/install/setup.php`
2. Folge den Anweisungen des Wizards
3. Der Wizard erstellt automatisch:
   - Datenbank-Tabellen
   - Admin-User
   - Basis-Konfiguration

#### Option B: Manuell (wenn kein PHP CLI verfügbar)

**Via SSH (falls vorhanden):**
```bash
cd /pfad/zum/cms
php artisan migrate --force
php artisan db:seed
```

**Via phpMyAdmin:**
1. Importiere die SQL-Datei `database/migrations_sql_dump.sql` (falls vorhanden)
2. Oder kopiere den SQL-Code aus den Migration-Files

### Schritt 5: Permissions setzen

Folgende Ordner müssen **beschreibbar** sein (chmod 775 oder 777):
```
storage/
storage/app/
storage/framework/
storage/framework/sessions/
storage/framework/views/
storage/framework/cache/
storage/logs/
bootstrap/cache/
```

**In cPanel:**
- Rechtsklick auf Ordner → "Change Permissions" → 755 oder 775

**Via SSH:**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Schritt 6: Admin-Login

1. Öffne: `https://deine-domain.de/admin`
2. Login mit:
   - **Email**: `admin@example.com`
   - **Passwort**: `password`
3. ⚠️ **WICHTIG**: Ändere sofort das Passwort!

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
