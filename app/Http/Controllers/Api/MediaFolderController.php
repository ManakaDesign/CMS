<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaFolder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MediaFolderController extends Controller
{
    /**
     * Get folder tree structure
     */
    public function index(Request $request): JsonResponse
    {
        // Get tree structure starting from root
        $tree = MediaFolder::getTree();

        return response()->json([
            'data' => $tree,
        ]);
    }

    /**
     * Create a new folder
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $folder = MediaFolder::create([
            'name' => $request->input('name'),
            'parent_id' => $request->input('parent_id'),
            'user_id' => $request->user()->id,
            'order' => MediaFolder::where('parent_id', $request->input('parent_id'))->max('order') + 1,
        ]);

        return response()->json([
            'message' => 'Folder created successfully',
            'folder' => $folder,
        ], 201);
    }

    /**
     * Get folder details with media
     */
    public function show(MediaFolder $folder): JsonResponse
    {
        $folder->load(['media' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }, 'children']);

        return response()->json($folder);
    }

    /**
     * Update folder
     */
    public function update(Request $request, MediaFolder $folder): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'parent_id' => 'nullable|exists:media_folders,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Check if moving to a child folder (prevent infinite loop)
        if ($request->has('parent_id')) {
            $newParent = MediaFolder::find($request->input('parent_id'));
            if ($newParent && $newParent->isDescendantOf($folder)) {
                return response()->json([
                    'message' => 'Cannot move folder to its own descendant',
                ], 422);
            }
        }

        $folder->update($request->only(['name', 'parent_id']));

        return response()->json([
            'message' => 'Folder updated successfully',
            'folder' => $folder,
        ]);
    }

    /**
     * Delete folder
     */
    public function destroy(MediaFolder $folder): JsonResponse
    {
        // Check if folder has media or children
        $mediaCount = $folder->media()->count();
        $childrenCount = $folder->children()->count();

        if ($mediaCount > 0 || $childrenCount > 0) {
            return response()->json([
                'message' => 'Folder is not empty. Please delete or move all media and subfolders first.',
            ], 422);
        }

        $folder->delete();

        return response()->json([
            'message' => 'Folder deleted successfully',
        ]);
    }

    /**
     * Reorder folders
     */
    public function reorder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'folders' => 'required|array',
            'folders.*.id' => 'required|exists:media_folders,id',
            'folders.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        foreach ($request->input('folders') as $folderData) {
            MediaFolder::where('id', $folderData['id'])->update(['order' => $folderData['order']]);
        }

        return response()->json([
            'message' => 'Folders reordered successfully',
        ]);
    }
}
