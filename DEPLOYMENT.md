# Deployment Guide

Da Node.js nicht auf dem Webserver verfügbar ist, bauen wir das React-Frontend **lokal** und committen die fertigen Build-Files zu Git.

## Wie funktioniert Deployment?

### **Option A: Automatisches Deploy-Script** ⭐ EMPFOHLEN

Nutze das `deploy.sh` Script, das alles automatisch macht:

```bash
./deploy.sh
```

**Was das Script macht:**
1. ✅ Baut das React-Frontend lokal (`npm run build:prod`)
2. ✅ Aktualisiert `admin.blade.php` automatisch mit neuen Asset-Pfaden
3. ✅ Added Build-Files zu Git (`public/admin/`)
4. ✅ Committed die Änderungen
5. ✅ Pusht zu GitHub
6. ✅ Plesk pullt automatisch via Webhook

**Ein Befehl - alles erledigt!** 🚀

---

### **Option B: Manuell** (falls Deploy-Script nicht funktioniert)

```bash
# 1. Frontend bauen
cd resources/react-builder
npm run build:prod
cd ../..

# 2. Build-Files zu Git hinzufügen
git add public/admin/
git add resources/views/admin.blade.php

# 3. Committen
git commit -m "Update frontend build"

# 4. Pushen
git push
```

---

## Plesk Git Konfiguration

### **Repository Settings:**
- **Repository URL**: `https://github.com/ManakaDesign/CMS.git`
- **Branch**: `claude/continue-chat-session-01JqEHcEDY5rtDtwGHkQsJBK`
- **Bereitstellungsmodus**: Automatisch

### **Deployment-Script** (in Plesk):

```bash
# Database Migrations
php artisan migrate --force

# Cache optimieren
php artisan config:cache
php artisan route:cache
php artisan view:clear

echo "✅ Deployment completed!"
```

### **GitHub Webhook:**

Nach dem Setup in Plesk wird eine Webhook-URL angezeigt (z.B. `https://cms.manaka-design.de:8443/modules/git/webhook/xxx`).

Diese URL muss in GitHub eingetragen werden:
```
GitHub → Settings → Webhooks → Add webhook
→ Payload URL: [Plesk Webhook-URL]
→ Content type: application/json
→ Events: Just the push event
```

---

## Workflow

### **Entwicklung:**
```
1. Code ändern (React, PHP, etc.)
2. ./deploy.sh ausführen
3. ✅ Automatisch auf Server deployed
4. Im Browser testen
```

### **Was wird deployed:**
- ✅ PHP-Dateien (Backend)
- ✅ React-Dateien (kompiliert als public/admin/)
- ✅ Datenbank-Migrations
- ✅ Config-Änderungen

### **Was bleibt unverändert:**
- 🔒 `.env` (Kunden-Konfiguration)
- 🔒 `storage/` (Uploads, Logs)
- 🔒 Datenbank-Daten (nur Struktur wird updated)

---

## Troubleshooting

### Deploy-Script funktioniert nicht

**Fehler**: `permission denied: ./deploy.sh`
```bash
chmod +x deploy.sh
```

**Fehler**: `npm: command not found`
→ Stelle sicher, dass du im `/home/user/CMS` Verzeichnis bist und Node.js lokal installiert ist

### Plesk Deployment schlägt fehl

**Überprüfe in Plesk:**
```
Git → CMS → Bereitstellungsverlauf
```

Dort siehst du die Logs und eventuelle Fehlermeldungen.

**Häufige Fehler:**
- `php artisan: command not found` → PHP-Pfad in Plesk prüfen
- `Permission denied` → Dateiberechtigungen auf Server prüfen

---

## Wichtig

⚠️ **Immer das Deploy-Script nutzen** - nicht nur `git push`!

Wenn du nur `git push` machst **ohne vorher zu bauen**, werden alte Frontend-Assets deployed und deine React-Änderungen sind nicht sichtbar.

**Richtig:**
```bash
./deploy.sh  # ✅ Baut + Committed + Pusht
```

**Falsch:**
```bash
git push     # ❌ Pusht ohne zu bauen
```
