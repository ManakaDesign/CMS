<?php

use Illuminate\Support\Facades\Route;

// Frontend - Public pages will be served here
Route::get('/', function () {
    return view('welcome');
});

// Admin Panel - React SPA
Route::get('/public/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');
