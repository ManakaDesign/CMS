<?php
/**
 * Add missing personal_access_tokens table
 * Run this if you installed before this table was added
 */

// Load environment variables
require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// Get database credentials from .env
$host = $_ENV['DB_HOST'] ?? '127.0.0.1';
$port = $_ENV['DB_PORT'] ?? '3306';
$database = $_ENV['DB_DATABASE'] ?? '';
$username = $_ENV['DB_USERNAME'] ?? '';
$password = $_ENV['DB_PASSWORD'] ?? '';

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$database";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to database successfully.\n\n";

    // Check if table already exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'personal_access_tokens'");
    if ($stmt->rowCount() > 0) {
        echo "✓ Table 'personal_access_tokens' already exists. No action needed.\n";
        exit(0);
    }

    // Create the table
    $sql = "
        CREATE TABLE `personal_access_tokens` (
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
    ";

    $pdo->exec($sql);
    echo "✓ Table 'personal_access_tokens' created successfully!\n";

    // Add to migrations table
    $stmt = $pdo->prepare("INSERT IGNORE INTO migrations (migration, batch) VALUES (?, 1)");
    $stmt->execute(['2025_11_05_130320_create_personal_access_tokens_table']);
    echo "✓ Migration record added.\n\n";

    echo "Done! You can now log in to the admin panel.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
