<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ElementController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\MediaFolderController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\TemplateController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no auth required)
Route::prefix('public')->group(function () {
    // Get published pages for frontend
    Route::get('/pages', [PageController::class, 'index'])->name('api.public.pages.index');
    Route::get('/pages/{page:slug}', [PageController::class, 'show'])->name('api.public.pages.show');
});

// DEBUG ROUTES - Remove after debugging
Route::get('/debug/ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is reachable!',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::get('/debug/headers', function () {
    return response()->json([
        'success' => true,
        'authorization_header' => request()->header('Authorization'),
        'bearer_token' => request()->bearerToken(),
        'all_headers' => request()->headers->all(),
    ]);
});

Route::get('/debug/auth', function () {
    return response()->json([
        'success' => true,
        'is_authenticated' => auth()->check(),
        'user_id' => auth()->id(),
        'user_email' => auth()->user()?->email,
        'bearer_token_received' => request()->bearerToken() ? 'yes' : 'no',
    ]);
})->middleware(['auth:sanctum']);

Route::get('/debug/folders', function () {
    try {
        $folders = \App\Models\MediaFolder::all();
        return response()->json([
            'success' => true,
            'count' => $folders->count(),
            'folders' => $folders,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
})->middleware(['auth:sanctum']);

// Authentication routes (no auth required)
Route::prefix('auth')->name('api.auth.')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::post('/register', [AuthController::class, 'register'])->name('register');

    // These require authentication
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/me', [AuthController::class, 'me'])->name('me');
    });
});

// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {

    // Pages
    Route::prefix('pages')->name('api.pages.')->group(function () {
        Route::get('/', [PageController::class, 'index'])->name('index');
        Route::post('/', [PageController::class, 'store'])->name('store');
        Route::get('/{page}', [PageController::class, 'show'])->name('show');
        Route::put('/{page}', [PageController::class, 'update'])->name('update');
        Route::delete('/{page}', [PageController::class, 'destroy'])->name('destroy');

        // Page actions
        Route::post('/{page}/publish', [PageController::class, 'publish'])->name('publish');
        Route::post('/{page}/unpublish', [PageController::class, 'unpublish'])->name('unpublish');
        Route::post('/{page}/duplicate', [PageController::class, 'duplicate'])->name('duplicate');
    });

    // Elements
    Route::prefix('elements')->name('api.elements.')->group(function () {
        Route::get('/pages/{page}', [ElementController::class, 'index'])->name('index');
        Route::post('/', [ElementController::class, 'store'])->name('store');
        Route::get('/{element}', [ElementController::class, 'show'])->name('show');
        Route::put('/{element}', [ElementController::class, 'update'])->name('update');
        Route::delete('/{element}', [ElementController::class, 'destroy'])->name('destroy');

        // Element actions
        Route::post('/{element}/duplicate', [ElementController::class, 'duplicate'])->name('duplicate');
        Route::post('/reorder', [ElementController::class, 'reorder'])->name('reorder');
    });

    // Media
    Route::prefix('media')->name('api.media.')->group(function () {
        Route::get('/', [MediaController::class, 'index'])->name('index');
        Route::post('/', [MediaController::class, 'store'])->name('store');

        // Bulk actions - Must come before {media} route
        Route::post('/bulk/move', [MediaController::class, 'bulkMove'])->name('bulk.move');
        Route::post('/bulk/delete', [MediaController::class, 'bulkDestroy'])->name('bulk.delete');

        // Media Folders - Must come BEFORE {media} routes to avoid route conflict
        Route::prefix('folders')->name('folders.')->group(function () {
            Route::get('/', [MediaFolderController::class, 'index'])->name('index');
            Route::post('/', [MediaFolderController::class, 'store'])->name('store');
            Route::get('/{folder}', [MediaFolderController::class, 'show'])->name('show');
            Route::put('/{folder}', [MediaFolderController::class, 'update'])->name('update');
            Route::delete('/{folder}', [MediaFolderController::class, 'destroy'])->name('destroy');
            Route::post('/reorder', [MediaFolderController::class, 'reorder'])->name('reorder');
        });

        // Media resource routes - These come AFTER folders to prevent 'folders' being matched as {media}
        Route::get('/{media}', [MediaController::class, 'show'])->name('show');
        Route::put('/{media}', [MediaController::class, 'update'])->name('update');
        Route::delete('/{media}', [MediaController::class, 'destroy'])->name('destroy');
    });

    // Templates
    Route::prefix('templates')->name('api.templates.')->group(function () {
        Route::get('/', [TemplateController::class, 'index'])->name('index');
        Route::post('/', [TemplateController::class, 'store'])->name('store');
        Route::get('/{template}', [TemplateController::class, 'show'])->name('show');
        Route::put('/{template}', [TemplateController::class, 'update'])->name('update');
        Route::delete('/{template}', [TemplateController::class, 'destroy'])->name('destroy');
    });

    // Menus
    Route::prefix('menus')->name('api.menus.')->group(function () {
        Route::get('/', [MenuController::class, 'index'])->name('index');
        Route::post('/', [MenuController::class, 'store'])->name('store');
        Route::get('/{menu}', [MenuController::class, 'show'])->name('show');
        Route::put('/{menu}', [MenuController::class, 'update'])->name('update');
        Route::delete('/{menu}', [MenuController::class, 'destroy'])->name('destroy');

        // Menu actions
        Route::post('/{menu}/duplicate', [MenuController::class, 'duplicate'])->name('duplicate');

        // Menu Items (nested under menus)
        Route::prefix('{menu}/items')->name('items.')->group(function () {
            Route::get('/', [MenuItemController::class, 'index'])->name('index');
        });
    });

    // Menu Items (standalone routes)
    Route::prefix('menu-items')->name('api.menu-items.')->group(function () {
        Route::post('/', [MenuItemController::class, 'store'])->name('store');
        Route::get('/{menuItem}', [MenuItemController::class, 'show'])->name('show');
        Route::put('/{menuItem}', [MenuItemController::class, 'update'])->name('update');
        Route::delete('/{menuItem}', [MenuItemController::class, 'destroy'])->name('destroy');

        // Menu item actions
        Route::post('/reorder', [MenuItemController::class, 'reorder'])->name('reorder');
    });

    // User info
    Route::get('/user', function () {
        return response()->json(auth()->user());
    })->name('api.user');
});
