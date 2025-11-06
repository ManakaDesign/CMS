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

// Get the URI and remove query string
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// Check if the requested file exists in public/ directory
$publicPath = __DIR__ . '/public' . $uri;

// If it's a file and exists, serve it directly
if (is_file($publicPath)) {
    // Determine the content type
    $mimeTypes = [
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'svg'  => 'image/svg+xml',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'  => 'font/ttf',
    ];

    $extension = strtolower(pathinfo($publicPath, PATHINFO_EXTENSION));
    $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

    header('Content-Type: ' . $mimeType);
    readfile($publicPath);
    exit;
}

// Redirect to public directory for Laravel routing
$publicIndex = __DIR__ . '/public/index.php';

// Set the public directory as working directory
$_SERVER['SCRIPT_FILENAME'] = $publicIndex;
$_SERVER['SCRIPT_NAME'] = '/index.php';

// Include the actual Laravel entry point
require $publicIndex;
