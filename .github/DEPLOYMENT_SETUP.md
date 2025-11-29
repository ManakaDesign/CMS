# GitHub Actions Deployment Setup

Dieses Repository ist so konfiguriert, dass Änderungen an `claude/**` Branches automatisch auf deinen Webserver deployt werden.

## Wie es funktioniert

1. **Du pushst Code** zu einem `claude/*` Branch → GitHub Actions startet automatisch
2. **GitHub Actions** verbindet sich per SSH zu deinem Webserver
3. **Deployment-Prozess** läuft automatisch (git pull, composer, npm, migrations)
4. **Fertig!** Deine Änderungen sind live auf dem Webserver

## Setup: GitHub Secrets konfigurieren

Damit GitHub Actions sich mit deinem Server verbinden kann, musst du folgende **Secrets** in deinem GitHub Repository hinzufügen:

### 1. Gehe zu GitHub Repository Settings
```
GitHub Repository → Settings → Secrets and variables → Actions → New repository secret
```

### 2. Füge diese Secrets hinzu:

#### `SERVER_HOST`
- **Beschreibung**: Die IP-Adresse oder Domain deines Webservers
- **Beispiel**: `123.45.67.89` oder `server.deine-domain.de`

#### `SERVER_USER`
- **Beschreibung**: SSH-Benutzername für den Server
- **Beispiel**: `root` oder `www-data` oder `dein-username`

#### `SSH_PRIVATE_KEY`
- **Beschreibung**: Dein privater SSH-Key für passwortlose Authentifizierung
- **So erstellst du den Key**:
  ```bash
  # Auf deinem lokalen Rechner / in Claude Code
  ssh-keygen -t ed25519 -C "github-actions"

  # Private Key anzeigen und kopieren
  cat ~/.ssh/id_ed25519

  # Public Key auf Server hochladen
  ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server-ip
  ```
- **Wichtig**: Den **privaten** Key (ohne `.pub`) als Secret einfügen

#### `SERVER_PATH` (Optional)
- **Beschreibung**: Absoluter Pfad zum CMS-Verzeichnis auf dem Server
- **Standard**: `/var/www/CMS`
- **Beispiel**: `/home/username/public_html/CMS`

#### `SERVER_PORT` (Optional)
- **Beschreibung**: SSH-Port (falls nicht Standard)
- **Standard**: `22`
- **Nur nötig wenn**: Dein Server einen anderen SSH-Port nutzt

## SSH-Key Setup (Detailliert)

### Option A: Bestehenden SSH-Key nutzen

Falls du bereits einen SSH-Key hast, den du für deinen Server nutzt:

```bash
# Private Key anzeigen
cat ~/.ssh/id_rsa
# oder
cat ~/.ssh/id_ed25519

# Kopiere die gesamte Ausgabe und füge sie als GitHub Secret ein
```

### Option B: Neuen SSH-Key nur für GitHub Actions

```bash
# 1. Neuen Key generieren
ssh-keygen -t ed25519 -f ~/.ssh/github_actions -C "github-actions-deploy"

# 2. Public Key auf Server kopieren
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server-ip

# 3. Teste die Verbindung
ssh -i ~/.ssh/github_actions user@your-server-ip

# 4. Private Key anzeigen und kopieren
cat ~/.ssh/github_actions
```

Füge den privaten Key als `SSH_PRIVATE_KEY` Secret in GitHub ein.

## Testen

Nach dem Setup:

1. **Mache eine kleine Änderung** in deinem Code
2. **Committe und pushe** zu deinem Claude-Branch:
   ```bash
   git add .
   git commit -m "Test GitHub Actions deployment"
   git push
   ```
3. **Gehe zu GitHub** → "Actions" Tab
4. **Du solltest sehen**: Workflow läuft und zeigt alle Schritte
5. **Nach ~1-2 Minuten**: Änderungen sind auf deinem Webserver live

## Troubleshooting

### Deployment schlägt fehl mit "Permission denied"
→ Überprüfe, dass der SSH-Key korrekt eingerichtet ist und auf dem Server liegt

### "git: command not found"
→ Git muss auf deinem Webserver installiert sein: `sudo apt install git`

### "composer: command not found"
→ Composer muss installiert sein: [Installation Guide](https://getcomposer.org/download/)

### "npm: command not found"
→ Node.js und NPM müssen installiert sein: `sudo apt install nodejs npm`

### Workflow läuft nicht
→ Überprüfe, dass du zu einem `claude/*` Branch pushst, nicht zu `main`

## Workflow deaktivieren

Falls du das automatische Deployment temporär deaktivieren möchtest:

1. Gehe zu GitHub → Actions → "Deploy to Webserver" Workflow
2. Klicke auf "..." → "Disable workflow"

## Sicherheit

- **Secrets sind verschlüsselt** in GitHub und niemals in Logs sichtbar
- **Private Keys** verlassen niemals GitHub, nur SSH-Verbindung wird aufgebaut
- **Deployment-Logs** zeigen keine sensiblen Daten

## Support

Bei Problemen, siehe GitHub Actions Logs:
```
GitHub Repository → Actions → Click on failed workflow → Click on "Deploy to Development Server" job
```
