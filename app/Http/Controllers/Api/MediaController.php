<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    protected MediaService $mediaService;

    public function __construct(MediaService $mediaService)
    {
        $this->mediaService = $mediaService;
    }

    /**
     * Display a listing of media
     */
    public function index(Request $request): JsonResponse
    {
        $query = Media::with('user:id,name', 'folder:id,name');

        // Filter by folder
        if ($request->has('folder_id')) {
            if ($request->folder_id === 'null' || $request->folder_id === null) {
                $query->whereNull('folder_id');
            } else {
                $query->where('folder_id', $request->folder_id);
            }
        }

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
            'file' => 'required|file|max:51200', // 50MB max
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
            'folder_id' => 'nullable|exists:media_folders,id',
            'make_svg_colorable' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $makeSvgColorable = $request->boolean('make_svg_colorable', false);

        // Process upload with MediaService
        $processedData = $this->mediaService->processUpload($file, $makeSvgColorable);

        // Create media record
        $media = Media::create([
            ...$processedData,
            'alt_text' => $request->input('alt_text'),
            'caption' => $request->input('caption'),
            'folder_id' => $request->input('folder_id'),
            'user_id' => $request->user()->id,
        ]);

        // Load relationships
        $media->load('user:id,name', 'folder:id,name');

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
            'folder_id' => 'nullable|exists:media_folders,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $media->update($request->only(['alt_text', 'caption', 'folder_id']));
        $media->load('user:id,name', 'folder:id,name');

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
