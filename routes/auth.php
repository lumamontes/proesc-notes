<?php

use App\Http\Controllers\Auth\LegacyAuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // Legacy authentication routes for support users
    Route::post('login/legacy', [LegacyAuthController::class, 'attemptLegacy'])->name('login.legacy');
    Route::get('auth/legacy/check', [LegacyAuthController::class, 'checkLegacyAuth'])->name('auth.legacy.check');
});

Route::middleware('auth')->group(function () {
    // Legacy logout route
    Route::post('logout/legacy', [LegacyAuthController::class, 'logoutLegacy'])->name('logout.legacy');
});
