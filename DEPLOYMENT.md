# Deployment Guide

Das CMS nutzt **GitHub Actions** für automatischen Build und **Plesk Git** für automatisches Deployment.

## Wie funktioniert es?

```
1. Code ändern in Claude Code
2. git push zu GitHub
   ↓
3. GitHub Actions: Baut React-Frontend automatisch
4. GitHub Actions: Committed Build-Files zurück ins Repo
   ↓
5. Plesk: Pullt automatisch via Webhook
6. Plesk: Führt Migrations & Cache-Clear aus
   ↓
7. ✅ Änderungen sind live!
```

**Du musst nur noch:** `git push` 🚀

---

## Plesk Git Konfiguration

### **1. Repository in Plesk hinzufügen**

```
Plesk → Git → "Repository hinzufügen"
```

**Felder ausfüllen:**

| Feld | Wert |
|------|------|
| **Repository Name** | `CMS` |
| **Repository URL** | `https://github.com/ManakaDesign/CMS.git` |
| **Bereitstellungsmodus** | Automatisch |

**Speichern**

---

### **2. Branch auswählen**

Nach dem Speichern:

```
Plesk → Git → CMS → Git-Repository öffnen
```

Dort findest du die Option:
```
"Verzweigung claude/continue-chat-session-01JqEHcEDY5rtDtwGHkQsJBK automatisch bereitstellen"
```

**Aktiviere diese Option!** ✅

---

### **3. Deployment-Script konfigurieren**

```
Plesk → Git → CMS → Zusätzliche Bereitstellungsaktionen
```

**Aktivieren:** ☑ Zusätzliche Bereitstellungsaktionen aktivieren

**Script-Inhalt:**

```bash
echo "🚀 Deployment gestartet"

# Database Migrations
php artisan migrate --force

# Cache optimieren
php artisan config:cache
php artisan route:cache
php artisan view:clear

echo "✅ Deployment abgeschlossen"
```

**Falls das Script Fehler wirft**, probiere dieses minimale Script:

```bash
php artisan cache:clear
php artisan config:cache
echo "Deployment abgeschlossen"
```

Oder deaktiviere die Bereitstellungsaktionen komplett und führe Cache-Befehle manuell per SSH aus.

---

### **4. GitHub Webhook einrichten**

Nach dem Setup zeigt Plesk eine **Webhook-URL** an:

```
Plesk → Git → CMS → [Webhook-URL wird angezeigt]
```

Kopiere diese URL (z.B. `https://cms.manaka-design.de:8443/modules/git/webhook/xxx`)

**In GitHub eintragen:**

```
1. Gehe zu: https://github.com/ManakaDesign/CMS/settings/hooks
2. Klicke: "Add webhook"
3. Fülle aus:
   - Payload URL: [Plesk Webhook-URL]
   - Content type: application/json
   - Which events: Just the push event
   - ☑ Active
4. Klicke: "Add webhook"
```

---

## GitHub Actions

Der Workflow läuft automatisch bei jedem Push zu `claude/**` Branches.

### **Was der Workflow macht:**

1. ✅ Checkt Code aus GitHub aus
2. ✅ Installiert Node.js 20
3. ✅ Führt `npm ci` aus (installiert Dependencies)
4. ✅ Führt `npm run build:prod` aus (baut React-Frontend)
5. ✅ Committed Build-Files zurück (`public/admin/`, `admin.blade.php`)
6. ✅ Pusht zum Branch

### **Workflow-Status ansehen:**

```
GitHub → Actions Tab → "Build Frontend Assets"
```

Dort siehst du alle Builds und eventuelle Fehler.

---

## Workflow für Entwicklung

### **Normal entwickeln:**

```bash
# 1. Code ändern (React, PHP, etc.)
# 2. Committen
git add .
git commit -m "Beschreibung"

# 3. Pushen
git push

# 4. ✅ Fertig! GitHub baut, Plesk deployt
```

### **Was passiert automatisch:**

```
→ GitHub Actions baut Frontend (~2-3 Minuten)
→ Committed Build-Files zurück
→ Plesk Webhook triggered
→ Plesk pullt Code + Build-Files
→ Plesk führt Migrations & Cache aus
→ ✅ Live!
```

---

## Was wird deployed?

### **Automatisch deployed:**
- ✅ PHP-Dateien (Backend, Controller, Models)
- ✅ React-Dateien (kompiliert als `public/admin/`)
- ✅ CSS/JS Assets
- ✅ Datenbank-Migrations (neue Spalten/Tabellen)
- ✅ Config-Änderungen

### **Bleibt unverändert:**
- 🔒 `.env` (Server-spezifische Konfiguration)
- 🔒 `storage/` (Uploads, Logs, Cache)
- 🔒 Datenbank-Daten (nur Struktur wird updated, keine Daten gelöscht)

---

## Troubleshooting

### GitHub Actions schlägt fehl

**Fehler ansehen:**
```
GitHub → Actions → [Fehlgeschlagener Workflow] → Logs
```

**Häufige Fehler:**

1. **`npm ci` schlägt fehl**
   - Lösung: `package-lock.json` ist out-of-sync
   - Fix: Lokal `npm install` und `package-lock.json` committen

2. **Build schlägt fehl**
   - Lösung: TypeScript-Fehler im Code
   - Fix: Lokal `npm run build:prod` ausführen, Fehler beheben

3. **Push schlägt fehl (Permission denied)**
   - Das sollte nicht passieren, da `GITHUB_TOKEN` automatisch gesetzt ist
   - Falls doch: Überprüfe Repository → Settings → Actions → Workflow permissions

### Plesk Deployment schlägt fehl

**Logs ansehen:**
```
Plesk → Git → CMS → Bereitstellungsverlauf → [Letzter Eintrag]
```

**Häufige Fehler:**

1. **`php artisan: command not found`**
   - Lösung: PHP-Pfad in Plesk prüfen
   - Eventuell vollen Pfad nutzen: `/usr/bin/php artisan ...`

2. **`Permission denied`**
   - Lösung: Dateiberechtigungen auf Server prüfen
   - Per SSH: `chmod -R 755 /pfad/zum/cms`

3. **Webhook wird nicht getriggert**
   - Lösung: Webhook-URL in GitHub überprüfen
   - Test: GitHub → Webhooks → [Webhook] → "Recent Deliveries"

### Frontend-Änderungen nicht sichtbar

1. **GitHub Actions Workflow abwarten** (~2-3 Min)
   - Check: GitHub → Actions → Workflow sollte ✅ grün sein

2. **Plesk Deployment abwarten** (~30 Sek)
   - Check: Plesk → Git → Bereitstellungsverlauf

3. **Browser Hard-Refresh**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

4. **Falls immer noch alte Version:**
   - Check: Sind Build-Files im Repo?
   - GitHub → `public/admin/` sollte aktualisiert sein

---

## SSH-Zugang (für manuelle Befehle)

Falls du manuell Befehle ausführen musst:

```bash
# Verbinden
ssh -p 2121 benutzername@80.74.149.78

# Zum CMS-Verzeichnis
cd /pfad/zum/cms

# Cache löschen
php artisan cache:clear

# Config neu laden
php artisan config:cache

# Migrations ausführen
php artisan migrate
```

---

## Wichtige Hinweise

⚠️ **Warte auf GitHub Actions**: Nach `git push` dauert es 2-3 Minuten bis der Build fertig ist. Erst dann pullt Plesk die fertigen Assets.

⚠️ **Kein manuelles Bauen mehr nötig**: Führe NICHT mehr `npm run build:prod` lokal aus - das macht GitHub Actions automatisch.

⚠️ **Branch-Naming**: Nur `claude/**` Branches lösen den Auto-Build aus. Andere Branches (z.B. `main`) werden nicht automatisch gebaut.

---

## Support

Bei Problemen:

1. **GitHub Actions Logs** checken (GitHub → Actions)
2. **Plesk Deployment Logs** checken (Plesk → Git → Bereitstellungsverlauf)
3. **Browser Console** checken (F12 → Console für Frontend-Fehler)
