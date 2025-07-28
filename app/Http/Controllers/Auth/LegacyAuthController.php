<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LegacyAuthController extends Controller
{
    /**
     * Handle legacy authentication attempt
     */
    public function attemptLegacy(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'acesso_aplicativo' => 'boolean',
        ]);

        try {
            // Make request to legacy endpoint
            $response = Http::post(config('app.legacy_api_url') . '/login_suporte/', [
                'email' => $request->email,
                'password' => $request->password,
                'acesso_aplicativo' => $request->boolean('acesso_aplicativo', true),
                'lembrar' => $request->boolean('remember', false),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Debug: Log the response structure
                Log::info('Legacy auth response:', $data);
                
                if ($data['status'] === 'success') {
                    // Find or create user in local database
                    $user = $this->findOrCreateUser($data['person']);
                    
                    // Authenticate the user with Laravel
                    Auth::login($user, $request->boolean('remember', false));
                    
                    // Store legacy user data in session for additional info
                    Session::put('legacy_user_data', $data['person']);
                    
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Authentication successful',
                        'user' => $user
                    ]);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => $data['person'] ?? 'Authentication failed'
                    ], 401);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Legacy authentication service unavailable'
                ], 503);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authentication failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Find or create user from legacy data
     */
    private function findOrCreateUser($legacyUserData): User
    {
        // Handle different possible field names for email
        $email = $legacyUserData['email'] ?? $legacyUserData['email_suporte'] ?? $legacyUserData['email_comunicacao'] ?? null;
        
        if (!$email) {
            throw new \Exception('Email not found in legacy user data');
        }
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            // Create new user from legacy data
            $user = User::create([
                'name' => $legacyUserData['name'] ?? $legacyUserData['nome'] ?? $email,
                'email' => $email,
                'password' => Hash::make(Str::random(16)), // Random password since we don't have it
            ]);
        } else {
            // Update existing user with latest legacy data
            $user->update([
                'name' => $legacyUserData['name'] ?? $legacyUserData['nome'] ?? $email,
            ]);
        }
        
        return $user;
    }

    /**
     * Check if user is authenticated via legacy system
     */
    public function checkLegacyAuth(): JsonResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            $legacyData = Session::get('legacy_user_data');
            
            return response()->json([
                'status' => 'success',
                'authenticated' => true,
                'user' => $user,
                'legacy_data' => $legacyData
            ]);
        }

        return response()->json([
            'status' => 'error',
            'authenticated' => false
        ], 401);
    }

    /**
     * Logout from legacy system
     */
    public function logoutLegacy(Request $request): JsonResponse
    {
        Auth::logout();
        Session::forget(['legacy_user_data']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }
} 