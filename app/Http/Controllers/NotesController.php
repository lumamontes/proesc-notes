<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class NotesController extends Controller
{
    public function index(): JsonResponse
    {
        Log::info('NotesController@index called', ['user_id' => Auth::id()]);
        
        $notes = Auth::user()
            ->notes()
            ->orderBy('updated_at', 'desc')
            ->get();

        Log::info('Notes retrieved', ['count' => $notes->count()]);

        return response()->json($notes);
    }

    public function show(string $id): JsonResponse
    {
        Log::info('NotesController@show called', ['note_id' => $id, 'user_id' => Auth::id()]);
        
        $note = Auth::user()
            ->notes()
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($note);
    }

    public function store(Request $request): JsonResponse
    {
        Log::info('NotesController@store called', ['user_id' => Auth::id()]);
        
        $validated = $request->validate([
            'id' => 'required|string|uuid',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $note = Auth::user()->notes()->create($validated);

        Log::info('Note created', ['note_id' => $note->id]);

        return response()->json($note, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        Log::info('NotesController@update called', ['note_id' => $id, 'user_id' => Auth::id()]);
        
        $note = Auth::user()
            ->notes()
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
        ]);

        $note->update($validated);

        Log::info('Note updated', ['note_id' => $note->id]);

        return response()->json($note);
    }

    public function destroy(string $id): JsonResponse
    {
        Log::info('NotesController@destroy called', ['note_id' => $id, 'user_id' => Auth::id()]);
        
        $note = Auth::user()
            ->notes()
            ->where('id', $id)
            ->firstOrFail();

        $note->delete();

        Log::info('Note deleted', ['note_id' => $id]);

        return response()->json(['message' => 'Note deleted successfully']);
    }

    public function sync(Request $request): JsonResponse
    {
        Log::info('NotesController@sync called', ['user_id' => Auth::id()]);
        
        $validated = $request->validate([
            'notes' => 'required|array',
            'notes.*.id' => 'required|string|uuid',
            'notes.*.title' => 'required|string|max:255',
            'notes.*.content' => 'required|string',
        ]);

        Log::info('Syncing notes', ['count' => count($validated['notes'])]);

        $syncedNotes = [];

        foreach ($validated['notes'] as $noteData) {
            $existingNote = Auth::user()->notes()->where('id', $noteData['id'])->first();

            if ($existingNote) {
                if (strtotime(now()) > strtotime($existingNote->updated_at)) {
                    $existingNote->update([
                        'title' => $noteData['title'],
                        'content' => $noteData['content'],
                        'updated_at' => now(),
                    ]);
                    $syncedNotes[] = $existingNote;
                    Log::info('Note updated during sync', ['note_id' => $existingNote->id]);
                }
            } else {
                $newNote = Auth::user()->notes()->create([
                    'id' => $noteData['id'],
                    'title' => $noteData['title'],
                    'content' => $noteData['content'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $syncedNotes[] = $newNote;
                Log::info('Note created during sync', ['note_id' => $newNote->id]);
            }
        }

        Log::info('Sync completed', ['synced_count' => count($syncedNotes)]);

        return response()->json([
            'message' => 'Notes synced successfully',
            'synced_count' => count($syncedNotes),
        ]);
    }
} 