<?php
/**
 * CMS Installation Wizard
 * Multi-step installation process
 */

session_start();

// Check if already installed (allow step 6 to show success message)
$installedFile = __DIR__ . '/../.installed';
$currentStep = $_GET['step'] ?? 1;
if (file_exists($installedFile) && $currentStep != 6) {
    header('Location: /');
    exit;
}

// Check if vendor directory exists
$vendorDir = __DIR__ . '/../vendor';
if (!file_exists($vendorDir) || !file_exists($vendorDir . '/autoload.php')) {
    die('
        <html>
        <head>
            <title>CMS Installation - Missing Dependencies</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; }
                .error-box { background: #fee; border: 2px solid #c33; border-radius: 8px; padding: 30px; margin: 20px 0; }
                h1 { color: #c33; }
                code { background: #f5f5f5; padding: 2px 8px; border-radius: 3px; font-family: monospace; }
                .solution { background: #efe; border-left: 4px solid #4a4; padding: 15px; margin: 20px 0; }
                ol { padding-left: 20px; }
                li { margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="error-box">
                <h1>❌ Missing Dependencies (vendor/ directory)</h1>
                <p>The <code>vendor/</code> directory is missing. This directory contains all required PHP dependencies.</p>

                <div class="solution">
                    <h2>✅ Solution:</h2>
                    <ol>
                        <li><strong>Re-download the complete package</strong> from GitHub (make sure <code>vendor/</code> is included)</li>
                        <li><strong>OR</strong> run <code>composer install</code> locally:
                            <ul>
                                <li>Open terminal/command prompt</li>
                                <li>Navigate to the CMS directory</li>
                                <li>Run: <code>composer install --no-dev</code></li>
                                <li>Re-upload all files including <code>vendor/</code></li>
                            </ul>
                        </li>
                    </ol>
                </div>

                <p><strong>Note:</strong> The latest version should include <code>vendor/</code> in the repository for easy shared hosting deployment.</p>
            </div>
        </body>
        </html>
    ');
}

require_once 'requirements.php';

// Get current step
$step = $_GET['step'] ?? 1;
$step = (int)$step;

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    handlePostRequest($step);
}

// Include header
includeHeader($step);

// Display current step
switch ($step) {
    case 1:
        displayWelcome();
        break;
    case 2:
        displayRequirements();
        break;
    case 3:
        displayDatabaseConfig();
        break;
    case 4:
        displaySiteSettings();
        break;
    case 5:
        displayAdminAccount();
        break;
    case 6:
        displayComplete();
        break;
    default:
        displayWelcome();
}

// Include footer
includeFooter();

// ====================
// FUNCTIONS
// ====================

function handlePostRequest(int $step): void
{
    if ($step === 3) {
        handleDatabaseConfig();
    } elseif ($step === 4) {
        handleSiteSettings();
    } elseif ($step === 5) {
        handleAdminAccount();
    }
}

function handleDatabaseConfig(): void
{
    $host = $_POST['db_host'] ?? '';
    $port = $_POST['db_port'] ?? '3306';
    $database = $_POST['db_database'] ?? '';
    $username = $_POST['db_username'] ?? '';
    $password = $_POST['db_password'] ?? '';

    // Test database connection
    try {
        // First, try to connect directly to the database (if it already exists)
        $dsnWithDb = "mysql:host=$host;port=$port;dbname=$database";
        try {
            $pdo = new PDO($dsnWithDb, $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Database exists and connection successful!
            $dbExists = true;
        } catch (PDOException $e) {
            // Database doesn't exist or connection failed, try to create it
            $dbExists = false;
        }

        // If database doesn't exist, try to create it
        if (!$dbExists) {
            try {
                $dsn = "mysql:host=$host;port=$port";
                $pdo = new PDO($dsn, $username, $password);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                // Try to create database
                $pdo->exec("CREATE DATABASE `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

                // Reconnect to the newly created database
                $pdo = new PDO($dsnWithDb, $username, $password);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            } catch (PDOException $createError) {
                // Cannot create database - user needs to create it manually
                $_SESSION['error'] = "Cannot create database automatically. Please create the database '<strong>$database</strong>' manually in cPanel/phpMyAdmin first, then try again.<br><br>Error: " . $createError->getMessage();
                header('Location: ?step=3');
                exit;
            }
        }

        // Save to session
        $_SESSION['db_config'] = [
            'host' => $host,
            'port' => $port,
            'database' => $database,
            'username' => $username,
            'password' => $password,
        ];

        // Create .env file
        createEnvFile($_SESSION['db_config']);

        // Redirect to next step
        header('Location: ?step=4');
        exit;
    } catch (PDOException $e) {
        $_SESSION['error'] = 'Database connection failed: ' . $e->getMessage() . '<br><br><strong>Troubleshooting:</strong><ul><li>Check username and password</li><li>Verify database host (try "127.0.0.1" instead of "localhost")</li><li>Ensure user has permissions to access the database</li></ul>';
        header('Location: ?step=3');
        exit;
    }
}

function handleSiteSettings(): void
{
    $siteName = $_POST['site_name'] ?? '';
    $siteUrl = $_POST['site_url'] ?? '';

    $_SESSION['site_config'] = [
        'name' => $siteName,
        'url' => $siteUrl,
    ];

    // Update .env with site URL
    updateEnvFile('APP_URL', $siteUrl);

    header('Location: ?step=5');
    exit;
}

function handleAdminAccount(): void
{
    $email = $_POST['admin_email'] ?? '';
    $password = $_POST['admin_password'] ?? '';
    $confirmPassword = $_POST['admin_password_confirm'] ?? '';

    // Validation
    if (empty($email) || empty($password)) {
        $_SESSION['error'] = 'Email and password are required';
        header('Location: ?step=5');
        exit;
    }

    if ($password !== $confirmPassword) {
        $_SESSION['error'] = 'Passwords do not match';
        header('Location: ?step=5');
        exit;
    }

    if (strlen($password) < 8) {
        $_SESSION['error'] = 'Password must be at least 8 characters';
        header('Location: ?step=5');
        exit;
    }

    $_SESSION['admin_config'] = [
        'email' => $email,
        'password' => $password,
    ];

    // Run installation
    runInstallation();

    header('Location: ?step=6');
    exit;
}

function runInstallation(): void
{
    try {
        // Check if exec() is available
        $execAvailable = function_exists('exec') && !in_array('exec', array_map('trim', explode(',', ini_get('disable_functions'))));

        if ($execAvailable) {
            // Try to run via artisan commands (faster and cleaner)
            runInstallationViaArtisan();
        } else {
            // Fallback for shared hosting without exec()
            runInstallationManually();
        }

        // Create .installed lock file ONLY if installation succeeded
        file_put_contents(__DIR__ . '/../.installed', date('Y-m-d H:i:s'));

        // Clear session
        session_destroy();
    } catch (Exception $e) {
        // Log error and show to user
        $_SESSION['error'] = 'Installation failed: ' . $e->getMessage() . '<br><br>Stack trace: <pre>' . $e->getTraceAsString() . '</pre>';

        // Delete .installed file if it exists (to allow retry)
        @unlink(__DIR__ . '/../.installed');

        // Redirect back to admin account step
        header('Location: ?step=5');
        exit;
    }
}

function runInstallationViaArtisan(): void
{
    $baseDir = __DIR__ . '/..';

    // Generate APP_KEY
    $commands = [
        "cd $baseDir && php artisan key:generate --force",
        "cd $baseDir && php artisan migrate --force",
        "cd $baseDir && php artisan storage:link",
    ];

    $output = [];
    $returnVar = 0;

    foreach ($commands as $cmd) {
        exec($cmd . ' 2>&1', $output, $returnVar);
        if ($returnVar !== 0) {
            // If artisan fails, fallback to manual installation
            runInstallationManually();
            return;
        }
    }

    // Create admin user using artisan
    $email = $_SESSION['admin_config']['email'];
    $password = $_SESSION['admin_config']['password'];
    $siteName = $_SESSION['site_config']['name'] ?? 'My CMS';

    $createAdminCmd = sprintf(
        'cd %s && php artisan tinker --execute="\\App\\Models\\User::create([\'name\' => \'%s\', \'email\' => \'%s\', \'password\' => bcrypt(\'%s\')])"',
        $baseDir,
        addslashes($siteName . ' Admin'),
        addslashes($email),
        addslashes($password)
    );

    exec($createAdminCmd . ' 2>&1', $output, $returnVar);

    if ($returnVar !== 0) {
        // Create user manually if command fails
        createAdminUserManually($email, $password, $siteName);
    }
}

function runInstallationManually(): void
{
    try {
        // Generate APP_KEY
        generateAppKey();

        // Run migrations manually
        runMigrationsManually();

        // Create admin user
        $email = $_SESSION['admin_config']['email'];
        $password = $_SESSION['admin_config']['password'];
        $siteName = $_SESSION['site_config']['name'] ?? 'My CMS';
        createAdminUserManually($email, $password, $siteName);

        // Create storage link (symbolic link might not work on shared hosting)
        @symlink(__DIR__ . '/../storage/app/public', __DIR__ . '/../public/storage');

    } catch (Exception $e) {
        $_SESSION['error'] = 'Installation failed: ' . $e->getMessage();
        throw $e;
    }
}

function generateAppKey(): void
{
    $key = 'base64:' . base64_encode(random_bytes(32));
    updateEnvFile('APP_KEY', $key);
}

function runMigrationsManually(): void
{
    $dbConfig = $_SESSION['db_config'];
    $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}";
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create migrations table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS migrations (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            migration VARCHAR(255) NOT NULL,
            batch INT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");

    // Create all tables directly with SQL
    $tables = [
        'users' => "
            CREATE TABLE IF NOT EXISTS `users` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `name` VARCHAR(255) NOT NULL,
                `email` VARCHAR(255) NOT NULL UNIQUE,
                `email_verified_at` TIMESTAMP NULL,
                `password` VARCHAR(255) NOT NULL,
                `remember_token` VARCHAR(100) NULL,
                `created_at` TIMESTAMP NULL,
                `updated_at` TIMESTAMP NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'password_reset_tokens' => "
            CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
                `email` VARCHAR(255) PRIMARY KEY,
                `token` VARCHAR(255) NOT NULL,
                `created_at` TIMESTAMP NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'sessions' => "
            CREATE TABLE IF NOT EXISTS `sessions` (
                `id` VARCHAR(255) PRIMARY KEY,
                `user_id` BIGINT UNSIGNED NULL,
                `ip_address` VARCHAR(45) NULL,
                `user_agent` TEXT NULL,
                `payload` LONGTEXT NOT NULL,
                `last_activity` INT NOT NULL,
                INDEX `sessions_user_id_index` (`user_id`),
                INDEX `sessions_last_activity_index` (`last_activity`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'cache' => "
            CREATE TABLE IF NOT EXISTS `cache` (
                `key` VARCHAR(255) PRIMARY KEY,
                `value` MEDIUMTEXT NOT NULL,
                `expiration` INT NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'cache_locks' => "
            CREATE TABLE IF NOT EXISTS `cache_locks` (
                `key` VARCHAR(255) PRIMARY KEY,
                `owner` VARCHAR(255) NOT NULL,
                `expiration` INT NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'jobs' => "
            CREATE TABLE IF NOT EXISTS `jobs` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `queue` VARCHAR(255) NOT NULL,
                `payload` LONGTEXT NOT NULL,
                `attempts` TINYINT UNSIGNED NOT NULL,
                `reserved_at` INT UNSIGNED NULL,
                `available_at` INT UNSIGNED NOT NULL,
                `created_at` INT UNSIGNED NOT NULL,
                INDEX `jobs_queue_index` (`queue`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'job_batches' => "
            CREATE TABLE IF NOT EXISTS `job_batches` (
                `id` VARCHAR(255) PRIMARY KEY,
                `name` VARCHAR(255) NOT NULL,
                `total_jobs` INT NOT NULL,
                `pending_jobs` INT NOT NULL,
                `failed_jobs` INT NOT NULL,
                `failed_job_ids` LONGTEXT NOT NULL,
                `options` MEDIUMTEXT NULL,
                `cancelled_at` INT NULL,
                `created_at` INT NOT NULL,
                `finished_at` INT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'failed_jobs' => "
            CREATE TABLE IF NOT EXISTS `failed_jobs` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `uuid` VARCHAR(255) NOT NULL UNIQUE,
                `connection` TEXT NOT NULL,
                `queue` TEXT NOT NULL,
                `payload` LONGTEXT NOT NULL,
                `exception` LONGTEXT NOT NULL,
                `failed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'templates' => "
            CREATE TABLE IF NOT EXISTS `templates` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `name` VARCHAR(255) NOT NULL,
                `slug` VARCHAR(255) NOT NULL UNIQUE,
                `type` ENUM('page', 'header', 'footer', 'global') NOT NULL DEFAULT 'page',
                `structure` JSON NULL,
                `description` TEXT NULL,
                `thumbnail` VARCHAR(255) NULL,
                `is_default` BOOLEAN NOT NULL DEFAULT 0,
                `created_at` TIMESTAMP NULL,
                `updated_at` TIMESTAMP NULL,
                INDEX `templates_type_index` (`type`),
                INDEX `templates_is_default_index` (`is_default`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'pages' => "
            CREATE TABLE IF NOT EXISTS `pages` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `slug` VARCHAR(255) NOT NULL UNIQUE,
                `content` JSON NULL,
                `template_id` BIGINT UNSIGNED NULL,
                `meta_title` VARCHAR(255) NULL,
                `meta_description` TEXT NULL,
                `meta_keywords` VARCHAR(255) NULL,
                `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
                `published_at` TIMESTAMP NULL,
                `user_id` BIGINT UNSIGNED NOT NULL,
                `order` INT NOT NULL DEFAULT 0,
                `show_in_menu` BOOLEAN NOT NULL DEFAULT 1,
                `parent_id` BIGINT UNSIGNED NULL,
                `created_at` TIMESTAMP NULL,
                `updated_at` TIMESTAMP NULL,
                `deleted_at` TIMESTAMP NULL,
                INDEX `pages_slug_index` (`slug`),
                INDEX `pages_status_index` (`status`),
                INDEX `pages_published_at_index` (`published_at`),
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
                FOREIGN KEY (`parent_id`) REFERENCES `pages`(`id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'elements' => "
            CREATE TABLE IF NOT EXISTS `elements` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `page_id` BIGINT UNSIGNED NOT NULL,
                `type` VARCHAR(255) NOT NULL,
                `settings` JSON NULL,
                `styles` JSON NULL,
                `parent_id` BIGINT UNSIGNED NULL,
                `order` INT NOT NULL DEFAULT 0,
                `is_visible` BOOLEAN NOT NULL DEFAULT 1,
                `created_at` TIMESTAMP NULL,
                `updated_at` TIMESTAMP NULL,
                INDEX `elements_page_id_index` (`page_id`),
                INDEX `elements_parent_id_index` (`parent_id`),
                INDEX `elements_order_index` (`order`),
                INDEX `elements_type_index` (`type`),
                FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'media_folders' => "
            CREATE TABLE IF NOT EXISTS `media_folders` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `name` VARCHAR(255) NOT NULL,
                `parent_id` BIGINT UNSIGNED NULL,
                `user_id` BIGINT UNSIGNED NOT NULL,
                `order` INT NOT NULL DEFAULT 0,
                `created_at` TIMESTAMP NULL,
                `updated_at` TIMESTAMP NULL,
                INDEX `media_folders_parent_id_index` (`parent_id`),
                INDEX `media_folders_user_id_index` (`user_id`),
                FOREIGN KEY (`parent_id`) REFERENCES `media_folders`(`id`) ON DELETE CASCADE,
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'media' => "
            CREATE TABLE IF NOT EXISTS `media` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `filename` VARCHAR(255) NOT NULL,
                `original_filename` VARCHAR(255) NOT NULL,
                `path` VARCHAR(255) NOT NULL,
                `disk` VARCHAR(255) NOT NULL DEFAULT 'public',
                `mime_type` VARCHAR(255) NOT NULL,
                `size` BIGINT UNSIGNED NOT NULL,
                `width` INT NULL,
                `height` INT NULL,
                `is_svg_colorable` BOOLEAN NOT NULL DEFAULT 0,
                `metadata` JSON NULL,
                `webp_path` VARCHAR(255) NULL,
                `thumbnail_path` VARCHAR(255) NULL,
                `medium_path` VARCHAR(255) NULL,
                `alt_text` VARCHAR(255) NULL,
                `caption` TEXT NULL,
                `folder_id` BIGINT UNSIGNED NULL,
                `user_id` BIGINT UNSIGNED NOT NULL,
                `created_at` TIMESTAMP NULL,
                `updated_at` TIMESTAMP NULL,
                INDEX `media_mime_type_index` (`mime_type`),
                INDEX `media_user_id_index` (`user_id`),
                INDEX `media_folder_id_index` (`folder_id`),
                FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
                FOREIGN KEY (`folder_id`) REFERENCES `media_folders`(`id`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'site_settings' => "
            CREATE TABLE IF NOT EXISTS `site_settings` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `key` VARCHAR(255) NOT NULL UNIQUE,
                `value` TEXT NULL,
                `type` VARCHAR(255) NOT NULL DEFAULT 'string',
                `group` VARCHAR(255) NOT NULL DEFAULT 'general',
                `description` TEXT NULL,
                `created_at` TIMESTAMP NULL,
                `updated_at` TIMESTAMP NULL,
                INDEX `site_settings_key_index` (`key`),
                INDEX `site_settings_group_index` (`group`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
        'personal_access_tokens' => "
            CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
                `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                `tokenable_type` VARCHAR(255) NOT NULL,
                `tokenable_id` BIGINT UNSIGNED NOT NULL,
                `name` VARCHAR(255) NOT NULL,
                `token` VARCHAR(64) NOT NULL UNIQUE,
                `abilities` TEXT NULL,
                `last_used_at` TIMESTAMP NULL,
                `expires_at` TIMESTAMP NULL,
                `created_at` TIMESTAMP NULL,
                `updated_at` TIMESTAMP NULL,
                INDEX `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ",
    ];

    // Execute each table creation
    foreach ($tables as $tableName => $sql) {
        try {
            $pdo->exec($sql);

            // Record migration
            $migrationName = getMigrationNameForTable($tableName);
            $stmt = $pdo->prepare("INSERT IGNORE INTO migrations (migration, batch) VALUES (?, 1)");
            $stmt->execute([$migrationName]);
        } catch (PDOException $e) {
            // Table might already exist, continue
            error_log("Migration warning for table $tableName: " . $e->getMessage());
        }
    }
}

function getMigrationNameForTable(string $tableName): string
{
    $migrationMap = [
        'users' => '0001_01_01_000000_create_users_table',
        'password_reset_tokens' => '0001_01_01_000000_create_users_table',
        'sessions' => '0001_01_01_000000_create_users_table',
        'cache' => '0001_01_01_000001_create_cache_table',
        'cache_locks' => '0001_01_01_000001_create_cache_table',
        'jobs' => '0001_01_01_000002_create_jobs_table',
        'job_batches' => '0001_01_01_000002_create_jobs_table',
        'failed_jobs' => '0001_01_01_000002_create_jobs_table',
        'pages' => '2025_11_05_130251_create_pages_table',
        'templates' => '2025_11_05_130317_create_templates_table',
        'elements' => '2025_11_05_130318_create_elements_table',
        'media' => '2024_01_15_000000_create_media_table',
        'media_folders' => '2024_01_15_000001_create_media_folders_table',
        'site_settings' => '2025_11_05_130319_create_site_settings_table',
        'personal_access_tokens' => '2025_11_05_130320_create_personal_access_tokens_table',
    ];

    return $migrationMap[$tableName] ?? $tableName;
}

function createAdminUserManually(string $email, string $password, string $siteName): void
{
    $dbConfig = $_SESSION['db_config'];
    $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}";
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Hash password using bcrypt
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    // Insert admin user
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, password, email_verified_at, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW(), NOW())
    ");

    $stmt->execute([
        $siteName . ' Admin',
        $email,
        $hashedPassword
    ]);
}

function createEnvFile(array $dbConfig): void
{
    $envExample = __DIR__ . '/../.env.example';
    $envFile = __DIR__ . '/../.env';

    if (!file_exists($envFile)) {
        copy($envExample, $envFile);
    }

    $env = file_get_contents($envFile);

    // Update database config - handles both commented and uncommented lines
    $env = preg_replace('/^#?\s*DB_CONNECTION=.*/m', 'DB_CONNECTION=mysql', $env);
    $env = preg_replace('/^#?\s*DB_HOST=.*/m', 'DB_HOST=' . $dbConfig['host'], $env);
    $env = preg_replace('/^#?\s*DB_PORT=.*/m', 'DB_PORT=' . $dbConfig['port'], $env);
    $env = preg_replace('/^#?\s*DB_DATABASE=.*/m', 'DB_DATABASE=' . $dbConfig['database'], $env);
    $env = preg_replace('/^#?\s*DB_USERNAME=.*/m', 'DB_USERNAME=' . $dbConfig['username'], $env);
    $env = preg_replace('/^#?\s*DB_PASSWORD=.*/m', 'DB_PASSWORD=' . $dbConfig['password'], $env);

    file_put_contents($envFile, $env);
}

function updateEnvFile(string $key, string $value): void
{
    $envFile = __DIR__ . '/../.env';
    $env = file_get_contents($envFile);
    // Handle both commented and uncommented lines
    $env = preg_replace("/^#?\s*$key=.*/m", "$key=$value", $env);
    file_put_contents($envFile, $env);
}

function displayWelcome(): void
{
    ?>
    <div class="step-content">
        <h2>🚀 Welcome to CMS Installation</h2>
        <p>Thank you for choosing our CMS! This wizard will guide you through the installation process.</p>

        <div class="info-box">
            <h3>Before you begin, make sure you have:</h3>
            <ul>
                <li>✅ MySQL/MariaDB server access</li>
                <li>✅ Database username and password</li>
                <li>✅ Write permissions for storage/ and bootstrap/cache/ directories</li>
            </ul>
            <p><small><strong>Note:</strong> The installer will try to create the database automatically. If that fails, you can create it manually in cPanel/phpMyAdmin.</small></p>
        </div>

        <div class="info-box info-box-success">
            <h3>✨ What this installer does for you:</h3>
            <ul>
                <li>Automatically creates your database</li>
                <li>Generates secure .env configuration</li>
                <li>Runs all database migrations</li>
                <li>Creates your admin account</li>
                <li>Sets up the CMS in under 5 minutes!</li>
            </ul>
        </div>

        <p>The installation process will take approximately 5-10 minutes.</p>

        <div class="button-group">
            <a href="?step=2" class="button button-primary">Get Started →</a>
        </div>
    </div>
    <?php
}

function displayRequirements(): void
{
    $checker = new SystemRequirements();
    $requirements = $checker->getRequirements();
    $allPassed = $checker->allPassed();

    ?>
    <div class="step-content">
        <h2>System Requirements Check</h2>
        <p>Checking your server configuration...</p>

        <div class="requirements-list">
            <?php foreach ($requirements as $name => $req): ?>
                <div class="requirement-item <?= $req['passed'] ? 'passed' : 'failed' ?>">
                    <div class="requirement-icon">
                        <?= $req['passed'] ? '✅' : '❌' ?>
                    </div>
                    <div class="requirement-details">
                        <strong><?= htmlspecialchars($name) ?></strong>
                        <div class="requirement-info">
                            <span>Required: <?= htmlspecialchars($req['required']) ?></span>
                            <span>Current: <?= htmlspecialchars($req['current']) ?></span>
                        </div>
                        <?php if (isset($req['description'])): ?>
                            <div class="requirement-description">
                                <?= htmlspecialchars($req['description']) ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if (!$allPassed): ?>
            <div class="alert alert-error">
                <strong>⚠️ Requirements not met</strong>
                <p>Please fix the issues above before continuing with the installation.</p>
            </div>
        <?php endif; ?>

        <div class="button-group">
            <a href="?step=1" class="button">← Back</a>
            <?php if ($allPassed): ?>
                <a href="?step=3" class="button button-primary">Continue →</a>
            <?php else: ?>
                <a href="?step=2" class="button button-secondary">Recheck</a>
            <?php endif; ?>
        </div>
    </div>
    <?php
}

function displayDatabaseConfig(): void
{
    $error = $_SESSION['error'] ?? '';
    unset($_SESSION['error']);

    ?>
    <div class="step-content">
        <h2>Database Configuration</h2>
        <p>Enter your MySQL database details below.</p>

        <?php if ($error): ?>
            <div class="alert alert-error">
                <?= $error ?>
            </div>
        <?php endif; ?>

        <div class="info-box">
            <h3>💡 Database Setup Options</h3>
            <p><strong>Option 1 (Automatic):</strong> Enter a database name below. The installer will try to create it automatically.</p>
            <p><strong>Option 2 (Manual):</strong> If your hosting doesn't allow automatic database creation:</p>
            <ol>
                <li>Create the database in cPanel → MySQL Databases (or phpMyAdmin)</li>
                <li>Create a MySQL user with all privileges on that database</li>
                <li>Enter the database name and credentials below</li>
            </ol>
        </div>

        <form method="POST" action="?step=3" class="install-form">
            <div class="form-group">
                <label for="db_host">Database Host</label>
                <input type="text" id="db_host" name="db_host" value="localhost" required>
                <small>Usually "localhost"</small>
            </div>

            <div class="form-group">
                <label for="db_port">Database Port</label>
                <input type="text" id="db_port" name="db_port" value="3306" required>
                <small>Default is 3306</small>
            </div>

            <div class="form-group">
                <label for="db_database">Database Name</label>
                <input type="text" id="db_database" name="db_database" required>
                <small>Enter your database name. If it doesn't exist, the installer will try to create it. If auto-creation fails, please create it manually in cPanel/phpMyAdmin.</small>
            </div>

            <div class="form-group">
                <label for="db_username">Database Username</label>
                <input type="text" id="db_username" name="db_username" required>
            </div>

            <div class="form-group">
                <label for="db_password">Database Password</label>
                <input type="password" id="db_password" name="db_password">
                <small>Leave empty if no password</small>
            </div>

            <div class="button-group">
                <a href="?step=2" class="button">← Back</a>
                <button type="submit" class="button button-primary">Test & Continue →</button>
            </div>
        </form>
    </div>
    <?php
}

function displaySiteSettings(): void
{
    $currentUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http")
                  . "://$_SERVER[HTTP_HOST]";
    $currentUrl = rtrim($currentUrl, '/install/setup.php');

    ?>
    <div class="step-content">
        <h2>Site Settings</h2>
        <p>Configure your website's basic settings.</p>

        <form method="POST" action="?step=4" class="install-form">
            <div class="form-group">
                <label for="site_name">Site Name</label>
                <input type="text" id="site_name" name="site_name" value="My CMS Website" required>
                <small>You can change this later</small>
            </div>

            <div class="form-group">
                <label for="site_url">Site URL</label>
                <input type="url" id="site_url" name="site_url" value="<?= htmlspecialchars($currentUrl) ?>" required>
                <small>The URL where your site is accessible</small>
            </div>

            <div class="button-group">
                <a href="?step=3" class="button">← Back</a>
                <button type="submit" class="button button-primary">Continue →</button>
            </div>
        </form>
    </div>
    <?php
}

function displayAdminAccount(): void
{
    $error = $_SESSION['error'] ?? '';
    unset($_SESSION['error']);

    ?>
    <div class="step-content">
        <h2>Create Admin Account</h2>
        <p>Create your administrator account to manage the CMS.</p>

        <?php if ($error): ?>
            <div class="alert alert-error">
                <?= $error ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="?step=5" class="install-form">
            <div class="form-group">
                <label for="admin_email">Admin Email</label>
                <input type="email" id="admin_email" name="admin_email" required>
                <small>You'll use this to log in</small>
            </div>

            <div class="form-group">
                <label for="admin_password">Password</label>
                <input type="password" id="admin_password" name="admin_password" required minlength="8">
                <small>Minimum 8 characters</small>
            </div>

            <div class="form-group">
                <label for="admin_password_confirm">Confirm Password</label>
                <input type="password" id="admin_password_confirm" name="admin_password_confirm" required minlength="8">
            </div>

            <div class="button-group">
                <a href="?step=4" class="button">← Back</a>
                <button type="submit" class="button button-primary">Install CMS →</button>
            </div>
        </form>
    </div>
    <?php
}

function displayComplete(): void
{
    // Verify installation
    $envFile = __DIR__ . '/../.env';
    $appKeySet = false;
    $dbConfigured = false;

    if (file_exists($envFile)) {
        $envContent = file_get_contents($envFile);
        $appKeySet = preg_match('/^APP_KEY=base64:.+/m', $envContent);
        $dbConfigured = preg_match('/^DB_DATABASE=.+/m', $envContent) && !preg_match('/^DB_DATABASE=laravel/m', $envContent);
    }

    ?>
    <div class="step-content success">
        <div class="success-icon">✅</div>
        <h2>Installation Complete!</h2>
        <p>Your CMS has been successfully installed and is ready to use.</p>

        <?php if (!$appKeySet || !$dbConfigured): ?>
        <div class="alert alert-danger">
            <strong>⚠️ Configuration Warning</strong>
            <?php if (!$appKeySet): ?>
                <p>APP_KEY might not be set correctly. Check your .env file.</p>
            <?php endif; ?>
            <?php if (!$dbConfigured): ?>
                <p>Database might not be configured correctly. Check your .env file.</p>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <div class="info-box">
            <h3>Installation Summary:</h3>
            <ul>
                <li>✅ Configuration file created (.env)</li>
                <li><?php echo $appKeySet ? '✅' : '❌'; ?> Application key generated</li>
                <li><?php echo $dbConfigured ? '✅' : '❌'; ?> Database configured</li>
                <li>✅ Database tables created</li>
                <li>✅ Admin account created</li>
            </ul>
        </div>

        <div class="info-box">
            <h3>Next Steps:</h3>
            <ol>
                <li>Log in to your admin panel</li>
                <li>Configure your site settings</li>
                <li>Create your first page</li>
                <li>Start building!</li>
            </ol>
        </div>

        <div class="alert alert-warning">
            <strong>🔒 Security Recommendation</strong>
            <p>For security reasons, consider deleting the <code>/install</code> directory after installation.</p>
        </div>

        <div class="button-group">
            <a href="/admin" class="button button-primary button-large">Go to Admin Panel →</a>
        </div>
    </div>
    <?php
}

function includeHeader(int $step): void
{
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CMS Installation</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .installer-container {
                max-width: 700px;
                width: 100%;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }

            .installer-header {
                background: #667eea;
                color: white;
                padding: 30px;
                text-align: center;
            }

            .installer-header h1 {
                font-size: 28px;
                margin-bottom: 10px;
            }

            .progress-bar {
                display: flex;
                justify-content: space-between;
                padding: 20px 30px;
                background: #f7fafc;
                border-bottom: 1px solid #e2e8f0;
            }

            .progress-step {
                flex: 1;
                text-align: center;
                position: relative;
                opacity: 0.5;
            }

            .progress-step.active {
                opacity: 1;
                font-weight: 600;
                color: #667eea;
            }

            .progress-step.completed {
                opacity: 1;
                color: #48bb78;
            }

            .progress-step::before {
                content: attr(data-step);
                display: block;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #cbd5e0;
                color: white;
                line-height: 32px;
                margin: 0 auto 8px;
                font-size: 14px;
            }

            .progress-step.active::before {
                background: #667eea;
            }

            .progress-step.completed::before {
                content: "✓";
                background: #48bb78;
            }

            .step-content {
                padding: 40px;
            }

            h2 {
                color: #2d3748;
                margin-bottom: 10px;
                font-size: 24px;
            }

            p {
                color: #718096;
                margin-bottom: 20px;
                line-height: 1.6;
            }

            .info-box {
                background: #ebf8ff;
                border-left: 4px solid #4299e1;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
            }

            .info-box h3 {
                color: #2c5282;
                margin-bottom: 10px;
                font-size: 16px;
            }

            .info-box ul, .info-box ol {
                margin-left: 20px;
                color: #2c5282;
            }

            .info-box li {
                margin: 5px 0;
            }

            .info-box-success {
                background: #f0fdf4;
                border-left-color: #22c55e;
            }

            .info-box-success h3 {
                color: #166534;
            }

            .info-box-success ul, .info-box-success li {
                color: #166534;
            }

            .alert {
                padding: 15px;
                border-radius: 4px;
                margin: 20px 0;
            }

            .alert-error {
                background: #fff5f5;
                border-left: 4px solid #f56565;
                color: #742a2a;
            }

            .alert-warning {
                background: #fffaf0;
                border-left: 4px solid #ed8936;
                color: #7c2d12;
            }

            .requirements-list {
                margin: 20px 0;
            }

            .requirement-item {
                display: flex;
                align-items: flex-start;
                padding: 15px;
                margin: 10px 0;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                background: #f7fafc;
            }

            .requirement-item.passed {
                background: #f0fff4;
                border-color: #9ae6b4;
            }

            .requirement-item.failed {
                background: #fff5f5;
                border-color: #fc8181;
            }

            .requirement-icon {
                font-size: 24px;
                margin-right: 15px;
            }

            .requirement-details {
                flex: 1;
            }

            .requirement-info {
                display: flex;
                gap: 20px;
                margin-top: 5px;
                font-size: 14px;
                color: #718096;
            }

            .requirement-description {
                font-size: 12px;
                color: #a0aec0;
                margin-top: 5px;
            }

            .install-form {
                margin: 30px 0;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #2d3748;
                font-weight: 500;
            }

            .form-group input {
                width: 100%;
                padding: 12px;
                border: 1px solid #cbd5e0;
                border-radius: 6px;
                font-size: 15px;
                transition: border-color 0.2s;
            }

            .form-group input:focus {
                outline: none;
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .form-group small {
                display: block;
                margin-top: 5px;
                color: #718096;
                font-size: 13px;
            }

            .button-group {
                display: flex;
                gap: 10px;
                margin-top: 30px;
            }

            .button {
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                font-size: 15px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                transition: all 0.2s;
                font-weight: 500;
            }

            .button-primary {
                background: #667eea;
                color: white;
            }

            .button-primary:hover {
                background: #5a67d8;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .button-secondary {
                background: #edf2f7;
                color: #2d3748;
            }

            .button-secondary:hover {
                background: #e2e8f0;
            }

            .button-large {
                padding: 16px 32px;
                font-size: 16px;
            }

            .success {
                text-align: center;
            }

            .success-icon {
                font-size: 72px;
                margin-bottom: 20px;
            }

            code {
                background: #edf2f7;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                color: #e53e3e;
            }

            @media (max-width: 768px) {
                .installer-container {
                    margin: 0;
                }

                .step-content {
                    padding: 20px;
                }

                .progress-bar {
                    padding: 15px;
                    font-size: 12px;
                }

                .progress-step::before {
                    width: 28px;
                    height: 28px;
                    line-height: 28px;
                    font-size: 12px;
                }

                .button-group {
                    flex-direction: column;
                }

                .button {
                    width: 100%;
                    text-align: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="installer-container">
            <div class="installer-header">
                <h1>🎨 CMS Installation</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 0;">Modern Content Management System</p>
            </div>

            <div class="progress-bar">
                <div class="progress-step <?= $step >= 1 ? ($step > 1 ? 'completed' : 'active') : '' ?>" data-step="1">
                    <span>Welcome</span>
                </div>
                <div class="progress-step <?= $step >= 2 ? ($step > 2 ? 'completed' : 'active') : '' ?>" data-step="2">
                    <span>Requirements</span>
                </div>
                <div class="progress-step <?= $step >= 3 ? ($step > 3 ? 'completed' : 'active') : '' ?>" data-step="3">
                    <span>Database</span>
                </div>
                <div class="progress-step <?= $step >= 4 ? ($step > 4 ? 'completed' : 'active') : '' ?>" data-step="4">
                    <span>Settings</span>
                </div>
                <div class="progress-step <?= $step >= 5 ? ($step > 5 ? 'completed' : 'active') : '' ?>" data-step="5">
                    <span>Admin</span>
                </div>
                <div class="progress-step <?= $step >= 6 ? 'active' : '' ?>" data-step="6">
                    <span>Complete</span>
                </div>
            </div>
    <?php
}

function includeFooter(): void
{
    ?>
        </div>
    </body>
    </html>
    <?php
}
