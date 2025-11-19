<?php
/**
 * Migration Runner - Run database migrations via browser
 * Upload this file to your web root and access via browser
 * Delete this file after running!
 */

// Check if already migrated
$lockFile = __DIR__ . '/.migrate.lock';
if (file_exists($lockFile)) {
    die('
        <html>
        <head><title>Already Migrated</title></head>
        <body style="font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px;">
            <div style="background: #d4edda; border: 2px solid #c3e6cb; border-radius: 8px; padding: 30px;">
                <h1 style="color: #155724;">✓ Migrationen bereits ausgeführt</h1>
                <p>Die Migrationen wurden bereits erfolgreich ausgeführt.</p>
                <p><strong>Sicherheitshinweis:</strong> Bitte löschen Sie <code>migrate.php</code> und <code>.migrate.lock</code> aus dem Root-Verzeichnis!</p>
            </div>
        </body>
        </html>
    ');
}

// Check if vendor directory exists
$vendorDir = __DIR__ . '/vendor';
if (!file_exists($vendorDir) || !file_exists($vendorDir . '/autoload.php')) {
    die('
        <html>
        <head><title>Error - Missing Dependencies</title></head>
        <body style="font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px;">
            <div style="background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 8px; padding: 30px;">
                <h1 style="color: #721c24;">❌ Fehlende Dependencies</h1>
                <p>Das <code>vendor/</code> Verzeichnis wurde nicht gefunden.</p>
                <p>Bitte stellen Sie sicher, dass alle CMS-Dateien hochgeladen wurden.</p>
            </div>
        </body>
        </html>
    ');
}

// Bootstrap Laravel
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Migrationen ausführen</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .info-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px 20px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .step {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .step.success { border-left-color: #10b981; background: #f0fdf4; }
        .step.error { border-left-color: #ef4444; background: #fef2f2; }
        .step h3 {
            margin-bottom: 8px;
            color: #333;
            font-size: 16px;
        }
        .step p, .step pre {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }
        .step pre {
            background: #e5e7eb;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
            margin-top: 10px;
        }
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.2s;
            margin-top: 20px;
        }
        .btn:hover { background: #5568d3; }
        .btn.success {
            background: #10b981;
        }
        .btn.success:hover {
            background: #059669;
        }
        code {
            background: #e5e7eb;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <?php
        if (!isset($_POST['run_migrations'])) {
            // Show confirmation page
            ?>
            <h1>🔄 Datenbank-Migrationen</h1>
            <p class="subtitle">Führe fehlende Datenbank-Migrationen aus</p>

            <div class="info-box">
                <strong>ℹ️ Was macht dieses Skript?</strong>
                <p style="margin-top: 10px;">
                    Dieses Skript führt die neueste Migration aus, die fehlende Spalten zur <code>media</code> Tabelle hinzufügt:
                </p>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    <li><code>metadata</code> (JSON)</li>
                    <li><code>webp_path</code></li>
                    <li><code>thumbnail_path</code></li>
                    <li><code>medium_path</code></li>
                    <li><code>is_svg_colorable</code></li>
                    <li><code>folder_id</code> (falls noch nicht vorhanden)</li>
                </ul>
            </div>

            <div class="warning-box">
                <strong>⚠️ Wichtig:</strong>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    <li>Erstellen Sie vorher ein Backup Ihrer Datenbank!</li>
                    <li>Löschen Sie <code>migrate.php</code> nach der Ausführung!</li>
                    <li>Diese Datei sollte nicht öffentlich zugänglich bleiben!</li>
                </ul>
            </div>

            <form method="post">
                <button type="submit" name="run_migrations" class="btn">
                    ▶ Migrationen ausführen
                </button>
            </form>
            <?php
        } else {
            // Run migrations
            echo '<h1>⚙️ Führe Migrationen aus...</h1>';
            echo '<p class="subtitle">Bitte warten Sie, während die Datenbank aktualisiert wird.</p>';

            $errors = [];
            $output = [];

            try {
                // Run migrations
                $exitCode = $kernel->call('migrate', ['--force' => true]);

                echo '<div class="step success">';
                echo '<h3>✓ Migrationen erfolgreich ausgeführt</h3>';
                echo '<p>Die Datenbank wurde erfolgreich aktualisiert.</p>';

                // Get output
                $output = $kernel->output();
                if (!empty($output)) {
                    echo '<pre>' . htmlspecialchars($output) . '</pre>';
                }
                echo '</div>';

                // Create lock file
                file_put_contents($lockFile, date('Y-m-d H:i:s'));

                echo '<div class="warning-box">';
                echo '<strong>🔒 Nächste Schritte:</strong>';
                echo '<ol style="margin-top: 10px; margin-left: 20px;">';
                echo '<li>Löschen Sie <code>migrate.php</code> aus dem Root-Verzeichnis</li>';
                echo '<li>Optional: Löschen Sie auch <code>.migrate.lock</code></li>';
                echo '<li>Der Media-Upload sollte jetzt funktionieren!</li>';
                echo '</ol>';
                echo '</div>';

                echo '<a href="/admin" class="btn success">✓ Zur Mediathek</a>';

            } catch (Exception $e) {
                echo '<div class="step error">';
                echo '<h3>✗ Fehler beim Ausführen der Migrationen</h3>';
                echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
                echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
                echo '</div>';

                echo '<div class="warning-box">';
                echo '<strong>Mögliche Lösungen:</strong>';
                echo '<ul style="margin-top: 10px; margin-left: 20px;">';
                echo '<li>Prüfen Sie die Datenbank-Verbindung in der <code>.env</code> Datei</li>';
                echo '<li>Stellen Sie sicher, dass der Datenbank-User ausreichende Rechte hat</li>';
                echo '<li>Kontaktieren Sie Ihren Hosting-Support</li>';
                echo '</ul>';
                echo '</div>';
            }
        }
        ?>
    </div>
</body>
</html>
