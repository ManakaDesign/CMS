# React Builder Demo

Diese Demo-Version des React Builders läuft vollständig im Browser mit LocalStorage.

## Live-Demo

Sobald GitHub Pages aktiviert ist, wird die Demo hier verfügbar sein:
**https://manakadesign.github.io/CMS/demo**

## GitHub Pages Aktivieren

So aktivierst du GitHub Pages für dieses Repository:

### Schritt 1: Repository-Einstellungen öffnen
1. Gehe zu deinem GitHub Repository: https://github.com/ManakaDesign/CMS
2. Klicke auf **Settings** (Einstellungen)
3. Scrolle im linken Menü zu **Pages**

### Schritt 2: GitHub Pages konfigurieren
1. Unter **Source** (Quelle):
   - Wähle **Deploy from a branch**
2. Unter **Branch**:
   - Wähle den Branch: **`claude/continue-previous-session-011CUvHw9EsXr9GL1Sypbn3Z`** (oder deinen Main-Branch)
   - Wähle den Ordner: **`/docs`**
3. Klicke auf **Save**

### Schritt 3: Warten
GitHub Pages braucht ein paar Minuten zum Deployment. Du siehst oben eine Benachrichtigung:
```
Your site is live at https://manakadesign.github.io/CMS/
```

## Demo aufrufen

Nach dem Deployment ist die Demo erreichbar unter:
- **Haupt-URL**: https://manakadesign.github.io/CMS/demo
- **Root-URL**: https://manakadesign.github.io/CMS/ (leitet zur Demo weiter)

## Features

- ✅ **Kein Backend erforderlich** - Läuft vollständig im Browser
- ✅ **LocalStorage** - Daten werden im Browser gespeichert
- ✅ **Auto-Save** - Automatisches Speichern alle 1 Sekunde
- ✅ **Beispieldaten** - Vorgeladene Demo-Seite
- ✅ **Alle Builder-Features**:
  - Drag & Drop von Elementen
  - Inline-Textbearbeitung
  - Hover-Highlighting
  - Element-Toolbar
  - Responsive Breakpoints
  - Padding/Margin mit Verlinkung
  - Export zu HTML

## Demo aktualisieren

Um die Demo zu aktualisieren:

```bash
cd resources/react-builder
npm run build:demo
cp -r dist/* ../../docs/
git add docs/
git commit -m "Update demo"
git push
```

GitHub Pages wird automatisch innerhalb weniger Minuten aktualisiert.

## Lokale Vorschau

Um die Demo lokal zu testen:

```bash
cd resources/react-builder
npm run build:demo
npm run preview
```

Dann öffne: http://localhost:4173/CMS/demo
