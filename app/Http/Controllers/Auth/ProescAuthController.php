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

class ProescAuthController extends Controller
{
    /**
     * Handle legacy authentication attempt
     */
    public function attemptProesc(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'acesso_aplicativo' => 'boolean',
        ]);

        try {
            $response = Http::post(config('app.proesc_url') . '/login_suporte/', [
                'email' => $request->email,
                'password' => $request->password,
                'acesso_aplicativo' => $request->boolean('acesso_aplicativo', true),
                'lembrar' => $request->boolean('remember', false),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                Log::info('Legacy auth response:', $data);
                
                if ($data['status'] === 'success') {
                    $user = $this->findOrCreateUser($data['person']);
                    
                    Auth::login($user, $request->boolean('remember', false));
                    
                    Session::put('proesc_user_data', $data['person']);
                    
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
        $email = $legacyUserData['email'] ?? $legacyUserData['email_suporte'] ?? $legacyUserData['email_comunicacao'] ?? null;
        
        if (!$email) {
            throw new \Exception('Email not found in legacy user data');
        }
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $user = User::create([
                'name' => $legacyUserData['name'] ?? $legacyUserData['nome'] ?? $email,
                'email' => $email,
                'password' => Hash::make(Str::random(16)),
            ]);
        } else {
            $user->update([
                'name' => $legacyUserData['name'] ?? $legacyUserData['nome'] ?? $email,
            ]);
        }
        
        return $user;
    }

    /**
     * Check if user is authenticated via legacy system
     */
    public function checkProescAuth(): JsonResponse
    {
        if (Auth::check()) {
            $user = Auth::user();
            $legacyData = Session::get('proesc_user_data');
            
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
    public function logoutProesc(Request $request): JsonResponse
    {
        Auth::logout();
        Session::forget(['proesc_user_data']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }
} 