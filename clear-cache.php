<?php
/**
 * Clear Laravel Cache - Run via Browser
 * Upload this file to your web root and access via browser
 * Delete this file after running!
 */

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
    <title>Cache leeren</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
        h1 { color: #333; margin-bottom: 20px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; border-radius: 4px; color: #155724; }
        .error { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0; border-radius: 4px; color: #721c24; }
        .info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 10px 0; border-radius: 4px; color: #0c5460; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
        }
        .btn:hover { background: #5568d3; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <?php
        if (!isset($_POST['clear_cache'])) {
            ?>
            <h1>🔄 Laravel Cache leeren</h1>
            <div class="info">
                <strong>ℹ️ Was macht dieses Skript?</strong>
                <p style="margin-top: 10px;">
                    Dieses Skript löscht folgende Caches:
                </p>
                <ul style="margin-top: 10px; margin-left: 20px;">
                    <li>Route Cache</li>
                    <li>Config Cache</li>
                    <li>View Cache</li>
                    <li>Application Cache</li>
                </ul>
            </div>

            <div class="error">
                <strong>⚠️ Wichtig:</strong>
                <p style="margin-top: 10px;">
                    Löschen Sie <code>clear-cache.php</code> nach der Ausführung aus Sicherheitsgründen!
                </p>
            </div>

            <form method="post">
                <button type="submit" name="clear_cache" class="btn">
                    ▶ Cache leeren
                </button>
            </form>
            <?php
        } else {
            echo '<h1>⚙️ Leere Cache...</h1>';

            $results = [];
            $errors = [];

            try {
                // Clear route cache
                try {
                    Artisan::call('route:clear');
                    $results[] = 'Route Cache gelöscht';
                } catch (Exception $e) {
                    $errors[] = 'Route Cache: ' . $e->getMessage();
                }

                // Clear config cache
                try {
                    Artisan::call('config:clear');
                    $results[] = 'Config Cache gelöscht';
                } catch (Exception $e) {
                    $errors[] = 'Config Cache: ' . $e->getMessage();
                }

                // Clear view cache
                try {
                    Artisan::call('view:clear');
                    $results[] = 'View Cache gelöscht';
                } catch (Exception $e) {
                    $errors[] = 'View Cache: ' . $e->getMessage();
                }

                // Clear application cache
                try {
                    Artisan::call('cache:clear');
                    $results[] = 'Application Cache gelöscht';
                } catch (Exception $e) {
                    $errors[] = 'Application Cache: ' . $e->getMessage();
                }

                // Show results
                if (!empty($results)) {
                    echo '<div class="success">';
                    echo '<strong>✓ Erfolgreich gelöscht:</strong>';
                    echo '<ul style="margin-top: 10px; margin-left: 20px;">';
                    foreach ($results as $result) {
                        echo '<li>' . htmlspecialchars($result) . '</li>';
                    }
                    echo '</ul>';
                    echo '</div>';
                }

                if (!empty($errors)) {
                    echo '<div class="error">';
                    echo '<strong>✗ Fehler:</strong>';
                    echo '<ul style="margin-top: 10px; margin-left: 20px;">';
                    foreach ($errors as $error) {
                        echo '<li>' . htmlspecialchars($error) . '</li>';
                    }
                    echo '</ul>';
                    echo '</div>';
                }

                echo '<div class="info">';
                echo '<strong>🔒 Nächste Schritte:</strong>';
                echo '<ol style="margin-top: 10px; margin-left: 20px;">';
                echo '<li>Löschen Sie <code>clear-cache.php</code> aus dem Root-Verzeichnis</li>';
                echo '<li>Testen Sie die Mediathek erneut</li>';
                echo '</ol>';
                echo '</div>';

                echo '<a href="/admin" class="btn">✓ Zur Admin-Oberfläche</a>';

            } catch (Exception $e) {
                echo '<div class="error">';
                echo '<strong>✗ Fehler beim Leeren des Caches:</strong>';
                echo '<p>' . htmlspecialchars($e->getMessage()) . '</p>';
                echo '<pre>' . htmlspecialchars($e->getTraceAsString()) . '</pre>';
                echo '</div>';
            }
        }
        ?>
    </div>
</body>
</html>
