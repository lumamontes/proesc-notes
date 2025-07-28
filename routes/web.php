<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Support login page
Route::get('login', function () {
    return Inertia::render('auth/login');
})->name('login');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        return Inertia::render('dashboard', [
            'user' => $request->user()
        ]);
    })->name('dashboard');
    
    // Notes routes
    Route::get('notes/{id}', function (Request $request, string $id) {
        return Inertia::render('notes/[id]', [
            'noteId' => $id,
            'user' => $request->user()
        ]);
    })->name('notes.show');
    
    // Test route to verify authentication
    Route::get('test-auth', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
            'auth_check' => \Illuminate\Support\Facades\Auth::check(),
            'user_id' => \Illuminate\Support\Facades\Auth::id(),
        ]);
    })->name('test.auth');
});

// Logout route
Route::post('logout', function (Request $request) {
    \Illuminate\Support\Facades\Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    
    return redirect()->route('login');
})->name('logout');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
