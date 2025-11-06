<?php

/**
 * Laravel Application Entry Point (Root Directory Fallback)
 *
 * This file redirects all requests to the public directory.
 * Ideally, your web server's document root should point to /public instead.
 */

// Check if we're accessing the installer
if (str_contains($_SERVER['REQUEST_URI'] ?? '', '/install/') ||
    str_contains($_SERVER['REQUEST_URI'] ?? '', 'web-installer.php')) {
    // Allow direct access to installer files
    return false;
}

// Get the URI and remove the leading slash
$uri = $_SERVER['REQUEST_URI'] ?? '/';

// Redirect to public directory
$publicIndex = __DIR__ . '/public/index.php';

// Set the public directory as working directory
$_SERVER['SCRIPT_FILENAME'] = $publicIndex;
$_SERVER['SCRIPT_NAME'] = '/index.php';

// Include the actual Laravel entry point
require $publicIndex;
