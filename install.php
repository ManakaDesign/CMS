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
            text-decoration: none;
            display: inline-block;
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
        .info-box {
            background: #eff6ff;
            border: 1px solid #3b82f6;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .info-box h4 {
            color: #1e40af;
            margin-bottom: 8px;
        }
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

            // Step 1: Check if files are present
            echo '<div class="step">';
            echo '<h3>1. CMS-Dateien prüfen</h3>';
            $requiredFiles = ['vendor/autoload.php', 'app', 'database', 'public'];
            $missingFiles = [];
            foreach ($requiredFiles as $file) {
                if (!file_exists(__DIR__ . '/' . $file)) {
                    $missingFiles[] = $file;
                }
            }
            if (empty($missingFiles)) {
                echo '<p style="color: #10b981;">✓ Alle CMS-Dateien vorhanden</p>';
                echo '</div>';
            } else {
                echo '<p style="color: #ef4444;">✗ Fehlende Dateien/Ordner:</p>';
                echo '<ul>';
                foreach ($missingFiles as $file) {
                    echo '<li>' . htmlspecialchars($file) . '</li>';
                }
                echo '</ul>';
                echo '<p style="margin-top: 10px;">Stellen Sie sicher, dass alle CMS-Dateien hochgeladen wurden.</p>';
                echo '</div>';
                $errors[] = 'CMS-Dateien unvollständig';
            }

            // Step 2: Check PHP version
            echo '<div class="step">';
            echo '<h3>2. PHP Version prüfen</h3>';
            if (version_compare(PHP_VERSION, '8.1.0', '>=')) {
                echo '<p style="color: #10b981;">✓ PHP ' . PHP_VERSION . ' ist installiert</p>';
                echo '</div>';
            } else {
                echo '<p style="color: #ef4444;">✗ PHP 8.1 oder höher wird benötigt (aktuell: ' . PHP_VERSION . ')</p>';
                echo '</div>';
                $errors[] = 'PHP Version zu alt';
            }

            // Step 3: Check required extensions
            echo '<div class="step">';
            echo '<h3>3. PHP Erweiterungen prüfen</h3>';
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

            // Step 4: Check .env file
            echo '<div class="step">';
            echo '<h3>4. Konfiguration prüfen</h3>';
            if (file_exists(__DIR__ . '/.env')) {
                echo '<p style="color: #10b981;">✓ .env Datei vorhanden</p>';
            } else {
                echo '<p style="color: #f59e0b;">⚠ .env Datei nicht gefunden, wird von .env.example erstellt</p>';
                if (file_exists(__DIR__ . '/.env.example')) {
                    copy(__DIR__ . '/.env.example', __DIR__ . '/.env');
                    echo '<p style="color: #10b981; margin-top: 5px;">✓ .env Datei erstellt</p>';
                } else {
                    echo '<p style="color: #ef4444;">✗ .env.example nicht gefunden</p>';
                    $errors[] = '.env Datei fehlt';
                }
            }
            echo '</div>';

            // Step 5: Check directories
            echo '<div class="step">';
            echo '<h3>5. Verzeichnis-Berechtigungen prüfen</h3>';
            $directories = [
                'storage/app',
                'storage/framework/cache',
                'storage/framework/sessions',
                'storage/framework/views',
                'storage/logs',
                'storage/app/public/uploads',
                'storage/app/public/uploads/thumbs',
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
                echo '<p style="margin-top: 10px;">Führen Sie aus: <code>chmod -R 775 storage bootstrap/cache</code></p>';
                $warnings[] = 'Verzeichnis-Berechtigungen';
            }
            echo '</div>';

            // Step 6: Run migrations
            if (empty($errors)) {
                echo '<div class="step">';
                echo '<h3>6. Datenbank-Migrationen ausführen</h3>';

                require __DIR__ . '/vendor/autoload.php';
                $app = require_once __DIR__ . '/bootstrap/app.php';

                try {
                    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

                    // Check if APP_KEY is set
                    if (empty(env('APP_KEY'))) {
                        $kernel->call('key:generate', ['--force' => true]);
                        echo '<p style="color: #10b981;">✓ Application Key generiert</p>';
                    }

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

                        echo '<div class="info-box" style="margin-top: 20px;">';
                        echo '<h4>📝 Nächste Schritte:</h4>';
                        echo '<ul style="margin-top: 10px;">';
                        echo '<li>Konfigurieren Sie die Datenbank-Verbindung in <code>.env</code></li>';
                        echo '<li>Erstellen Sie einen Admin-Benutzer</li>';
                        echo '<li>Löschen Sie <code>install.php</code> aus Sicherheitsgründen</li>';
                        echo '</ul>';
                        echo '</div>';

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
                    echo '<p style="margin-top: 10px;">Prüfen Sie die Datenbank-Verbindung in der <code>.env</code> Datei.</p>';
                    echo '<p style="margin-top: 5px;">Oder führen Sie manuell aus: <code>php artisan migrate --force</code></p>';
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
            echo '<h3>⚠️ Sicherheitshinweis</h3>';
            echo '<p>Löschen Sie <code>install.php</code> aus Sicherheitsgründen!</p>';
            echo '<p style="margin-top: 10px;">Um die Installation erneut auszuführen, löschen Sie die Datei <code>.install.lock</code>.</p>';
            echo '</div>';

        } else {
            // Show install form
            echo '<div style="text-align: center; margin-bottom: 30px; font-size: 48px;">🚀</div>';
            echo '<h1>CMS Installation</h1>';
            echo '<p class="subtitle">Willkommen! Dieser Assistent richtet Ihr CMS in wenigen Schritten ein.</p>';

            echo '<div class="step">';
            echo '<h3>Was wird installiert?</h3>';
            echo '<ul>';
            echo '<li>Datenbank-Tabellen (Seiten, Media, Benutzer)</li>';
            echo '<li>Media Bibliothek mit Bild-Optimierung</li>';
            echo '<li>Ordner-Struktur für Uploads</li>';
            echo '<li>Application Key & Konfiguration</li>';
            echo '</ul>';
            echo '</div>';

            echo '<div class="step">';
            echo '<h3>Voraussetzungen</h3>';
            echo '<ul>';
            echo '<li>PHP 8.1 oder höher</li>';
            echo '<li>MySQL, PostgreSQL oder SQLite Datenbank</li>';
            echo '<li>GD Extension (für Bild-Verarbeitung)</li>';
            echo '<li>Schreibrechte für storage/ Verzeichnisse</li>';
            echo '<li>Alle CMS-Dateien hochgeladen</li>';
            echo '</ul>';
            echo '</div>';

            echo '<div class="info-box">';
            echo '<h4>💡 Tipp: Datenbank-Konfiguration</h4>';
            echo '<p>Stellen Sie sicher, dass die <code>.env</code> Datei korrekt konfiguriert ist:</p>';
            echo '<ul style="margin-top: 10px;">';
            echo '<li><code>DB_CONNECTION=mysql</code> (oder pgsql/sqlite)</li>';
            echo '<li><code>DB_HOST=127.0.0.1</code></li>';
            echo '<li><code>DB_DATABASE=ihr_datenbank_name</code></li>';
            echo '<li><code>DB_USERNAME=ihr_benutzer</code></li>';
            echo '<li><code>DB_PASSWORD=ihr_passwort</code></li>';
            echo '</ul>';
            echo '</div>';

            echo '<form method="post" style="text-align: center;">';
            echo '<button type="submit" name="install" class="btn">Installation starten</button>';
            echo '</form>';
        }
        ?>
    </div>
</body>
</html>
