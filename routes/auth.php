<?php

use App\Http\Controllers\Auth\ProescAuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::post('login/proesc', [ProescAuthController::class, 'attemptProesc'])->name('login.proesc');
    Route::get('auth/proesc/check', [ProescAuthController::class, 'checkProescAuth'])->name('auth.proesc.check');
});

Route::middleware('auth')->group(function () {
    Route::post('logout/proesc', [ProescAuthController::class, 'logoutProesc'])->name('logout.proesc');
});
