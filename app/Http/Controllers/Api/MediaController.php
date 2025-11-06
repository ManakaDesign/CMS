<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Display a listing of media
     */
    public function index(Request $request): JsonResponse
    {
        $query = Media::with('user:id,name');

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('filename', 'like', '%' . $request->search . '%')
                  ->orWhere('original_filename', 'like', '%' . $request->search . '%')
                  ->orWhere('alt_text', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 30);
        $media = $query->paginate($perPage);

        return response()->json($media);
    }

    /**
     * Upload a new media file
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $originalFilename = $file->getClientOriginalName();
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('uploads', $filename, 'public');

        // Get image dimensions if it's an image
        $width = null;
        $height = null;
        if (str_starts_with($file->getMimeType(), 'image/')) {
            try {
                [$width, $height] = getimagesize($file->getRealPath());
            } catch (\Exception $e) {
                // Ignore if we can't get dimensions
            }
        }

        $media = Media::create([
            'filename' => $filename,
            'original_filename' => $originalFilename,
            'path' => $path,
            'disk' => 'public',
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'alt_text' => $request->input('alt_text'),
            'caption' => $request->input('caption'),
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Media uploaded successfully',
            'media' => $media,
        ], 201);
    }

    /**
     * Display the specified media
     */
    public function show(Media $media): JsonResponse
    {
        $media->load('user:id,name,email');

        return response()->json($media);
    }

    /**
     * Update the specified media
     */
    public function update(Request $request, Media $media): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $media->update($request->only(['alt_text', 'caption']));

        return response()->json([
            'message' => 'Media updated successfully',
            'media' => $media,
        ]);
    }

    /**
     * Remove the specified media
     */
    public function destroy(Media $media): JsonResponse
    {
        // Delete file from storage
        $media->deleteFile();

        // Delete database record
        $media->delete();

        return response()->json([
            'message' => 'Media deleted successfully',
        ]);
    }
}
