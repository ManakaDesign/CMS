<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CMS Installation</title>
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
            max-width: 600px;
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
        .step {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .step.success { border-left-color: #10b981; background: #f0fdf4; }
        .step.error { border-left-color: #ef4444; background: #fef2f2; }
        .step.warning { border-left-color: #f59e0b; background: #fffbeb; }
        .step h3 {
            margin-bottom: 8px;
            color: #333;
            font-size: 16px;
        }
        .step p {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }
        .step code {
            background: #e5e7eb;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
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
        .btn:disabled {
            background: #cbd5e1;
            cursor: not-allowed;
        }
        .success-icon { color: #10b981; font-size: 48px; text-align: center; margin-bottom: 20px; }
        .error-icon { color: #ef4444; font-size: 48px; text-align: center; margin-bottom: 20px; }
        ul { margin: 10px 0; padding-left: 20px; }
        ul li { margin: 5px 0; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <?php
        // Configuration
        $installLockFile = __DIR__ . '/.install.lock';
        $isInstalled = file_exists($installLockFile);

        // Check if running installation
        if (isset($_POST['install']) && !$isInstalled) {
            echo '<div class="success-icon">⚙️</div>';
            echo '<h1>Installation läuft...</h1>';
            echo '<p class="subtitle">Bitte warten Sie, während das System eingerichtet wird.</p>';

            $errors = [];
            $warnings = [];

            // Step 1: Check PHP version
            echo '<div class="step">';
            echo '<h3>1. PHP Version prüfen</h3>';
            if (version_compare(PHP_VERSION, '8.1.0', '>=')) {
                echo '<p style="color: #10b981;">✓ PHP ' . PHP_VERSION . ' ist installiert</p>';
                echo '</div>';
            } else {
                echo '<p style="color: #ef4444;">✗ PHP 8.1 oder höher wird benötigt (aktuell: ' . PHP_VERSION . ')</p>';
                echo '</div>';
                $errors[] = 'PHP Version zu alt';
            }

            // Step 2: Check required extensions
            echo '<div class="step">';
            echo '<h3>2. PHP Erweiterungen prüfen</h3>';
            $required_extensions = ['pdo', 'mbstring', 'fileinfo', 'gd'];
            $missing = [];
            foreach ($required_extensions as $ext) {
                if (!extension_loaded($ext)) {
                    $missing[] = $ext;
                }
            }
            if (empty($missing)) {
                echo '<p style="color: #10b981;">✓ Alle benötigten Erweiterungen sind vorhanden</p>';
            } else {
                echo '<p style="color: #ef4444;">✗ Fehlende Erweiterungen: ' . implode(', ', $missing) . '</p>';
                $errors[] = 'Fehlende PHP Erweiterungen';
            }
            echo '</div>';

            // Step 3: Check directories
            echo '<div class="step">';
            echo '<h3>3. Verzeichnis-Berechtigungen prüfen</h3>';
            $directories = [
                'storage/app',
                'storage/framework/cache',
                'storage/framework/sessions',
                'storage/framework/views',
                'storage/logs',
                'storage/app/public/uploads',
                'bootstrap/cache'
            ];
            $notWritable = [];
            foreach ($directories as $dir) {
                $path = __DIR__ . '/' . $dir;
                if (!is_dir($path)) {
                    @mkdir($path, 0775, true);
                }
                if (!is_writable($path)) {
                    $notWritable[] = $dir;
                }
            }
            if (empty($notWritable)) {
                echo '<p style="color: #10b981;">✓ Alle Verzeichnisse sind beschreibbar</p>';
            } else {
                echo '<p style="color: #f59e0b;">⚠ Nicht beschreibbar: ' . implode(', ', $notWritable) . '</p>';
                echo '<p>Führen Sie aus: <code>chmod -R 775 storage bootstrap/cache</code></p>';
                $warnings[] = 'Verzeichnis-Berechtigungen';
            }
            echo '</div>';

            // Step 4: Create thumbnails directory
            echo '<div class="step">';
            echo '<h3>4. Thumbnail-Verzeichnis erstellen</h3>';
            $thumbsDir = __DIR__ . '/storage/app/public/uploads/thumbs';
            if (!is_dir($thumbsDir)) {
                @mkdir($thumbsDir, 0775, true);
            }
            if (is_dir($thumbsDir) && is_writable($thumbsDir)) {
                echo '<p style="color: #10b981;">✓ Thumbnail-Verzeichnis erstellt</p>';
            } else {
                echo '<p style="color: #f59e0b;">⚠ Konnte Thumbnail-Verzeichnis nicht erstellen</p>';
                $warnings[] = 'Thumbnail-Verzeichnis';
            }
            echo '</div>';

            // Step 5: Run migrations
            if (empty($errors)) {
                echo '<div class="step">';
                echo '<h3>5. Datenbank-Migrationen ausführen</h3>';

                require __DIR__ . '/vendor/autoload.php';
                $app = require_once __DIR__ . '/bootstrap/app.php';

                try {
                    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

                    // Run migrations
                    $exitCode = $kernel->call('migrate', ['--force' => true]);

                    if ($exitCode === 0) {
                        echo '<p style="color: #10b981;">✓ Datenbank-Migrationen erfolgreich ausgeführt</p>';

                        // Create install lock file
                        file_put_contents($installLockFile, date('Y-m-d H:i:s'));

                        echo '</div>';
                        echo '<div class="step success">';
                        echo '<div class="success-icon" style="font-size: 64px; margin: 30px 0;">✓</div>';
                        echo '<h3 style="text-align: center; font-size: 24px; color: #10b981;">Installation erfolgreich!</h3>';
                        echo '<p style="text-align: center; margin-top: 10px;">Ihr CMS ist jetzt einsatzbereit.</p>';
                        echo '<div style="text-align: center; margin-top: 20px;">';
                        echo '<a href="/" class="btn">Zum CMS</a>';
                        echo '</div>';
                        echo '</div>';

                        if (!empty($warnings)) {
                            echo '<div class="step warning">';
                            echo '<h3>⚠️ Warnungen</h3>';
                            echo '<ul>';
                            foreach ($warnings as $warning) {
                                echo '<li>' . htmlspecialchars($warning) . '</li>';
                            }
                            echo '</ul>';
                            echo '<p style="margin-top: 10px;">Diese Warnungen sollten behoben werden, sind aber nicht kritisch.</p>';
                            echo '</div>';
                        }
                    } else {
                        throw new Exception('Migration fehlgeschlagen');
                    }
                } catch (Exception $e) {
                    echo '<p style="color: #ef4444;">✗ Fehler: ' . htmlspecialchars($e->getMessage()) . '</p>';
                    echo '<p style="margin-top: 10px;">Führen Sie manuell aus: <code>php artisan migrate --force</code></p>';
                    echo '</div>';
                    $errors[] = 'Migration fehlgeschlagen';
                }
            }

            // Show errors
            if (!empty($errors)) {
                echo '<div class="step error">';
                echo '<h3>❌ Installation fehlgeschlagen</h3>';
                echo '<ul>';
                foreach ($errors as $error) {
                    echo '<li>' . htmlspecialchars($error) . '</li>';
                }
                echo '</ul>';
                echo '<p style="margin-top: 15px;"><a href="install.php" class="btn">Erneut versuchen</a></p>';
                echo '</div>';
            }

        } elseif ($isInstalled) {
            // Already installed
            echo '<div class="success-icon">✓</div>';
            echo '<h1>CMS bereits installiert</h1>';
            echo '<p class="subtitle">Die Installation wurde bereits am ' . htmlspecialchars(file_get_contents($installLockFile)) . ' durchgeführt.</p>';
            echo '<div class="step">';
            echo '<p>Ihr CMS ist bereits eingerichtet und einsatzbereit.</p>';
            echo '<p style="margin-top: 15px;"><a href="/" class="btn">Zum CMS</a></p>';
            echo '</div>';
            echo '<div class="step warning">';
            echo '<h3>Installation erneut ausführen?</h3>';
            echo '<p>Um die Installation erneut auszuführen, löschen Sie die Datei <code>.install.lock</code> im Hauptverzeichnis.</p>';
            echo '</div>';

        } else {
            // Show install form
            echo '<h1>CMS Installation</h1>';
            echo '<p class="subtitle">Willkommen! Dieser Assistent richtet Ihr CMS in wenigen Schritten ein.</p>';

            echo '<div class="step">';
            echo '<h3>Was wird installiert?</h3>';
            echo '<ul>';
            echo '<li>Datenbank-Tabellen für Media Bibliothek</li>';
            echo '<li>Ordner-Struktur für Uploads</li>';
            echo '<li>Optimierungs-Features für Bilder</li>';
            echo '<li>SVG Colorable-Unterstützung</li>';
            echo '</ul>';
            echo '</div>';

            echo '<div class="step">';
            echo '<h3>Voraussetzungen</h3>';
            echo '<ul>';
            echo '<li>PHP 8.1 oder höher</li>';
            echo '<li>MySQL oder PostgreSQL Datenbank</li>';
            echo '<li>GD oder Imagick Extension</li>';
            echo '<li>Schreibrechte für storage/ Verzeichnisse</li>';
            echo '</ul>';
            echo '</div>';

            echo '<form method="post">';
            echo '<button type="submit" name="install" class="btn">Installation starten</button>';
            echo '</form>';
        }
        ?>
    </div>
</body>
</html>
