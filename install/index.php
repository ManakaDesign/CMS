<?php
/**
 * CMS Installer - Entry Point
 * Redirects to setup wizard if not installed
 */

// Check if already installed
$installedFile = __DIR__ . '/../.installed';
$envFile = __DIR__ . '/../.env';

if (file_exists($installedFile) && file_exists($envFile)) {
    // Already installed, redirect to main app
    header('Location: /');
    exit;
}

// Redirect to setup wizard
header('Location: /install/setup.php');
exit;
