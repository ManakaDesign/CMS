<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

// Frontend - Public pages will be served here
Route::get('/', function () {
    return view('welcome');
});

// Cache clearing route (for debugging/deployment)
Route::get('/clear-cache-secret-route', function () {
    try {
        $results = [];

        // Clear all caches
        Artisan::call('route:clear');
        $results[] = 'Route cache cleared';

        Artisan::call('config:clear');
        $results[] = 'Config cache cleared';

        Artisan::call('view:clear');
        $results[] = 'View cache cleared';

        Artisan::call('cache:clear');
        $results[] = 'Application cache cleared';

        return response()->json([
            'success' => true,
            'message' => 'All caches cleared successfully',
            'details' => $results
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to clear caches',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Admin Panel - React SPA
// Support both /public/admin (when document root is project root)
// and /admin (when document root is /public folder)
Route::get('/public/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');

Route::get('/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');

// Fallback login route (Sanctum redirect target)
Route::get('/login', function () {
    return response()->json([
        'error' => 'Unauthenticated',
        'message' => 'Please login via /api/auth/login'
    ], 401);
})->name('login');
