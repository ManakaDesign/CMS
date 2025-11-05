<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PageController extends Controller
{
    /**
     * Display a listing of pages
     */
    public function index(Request $request): JsonResponse
    {
        $query = Page::with(['user:id,name,email', 'template:id,name']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by parent (top-level or children)
        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('slug', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $pages = $query->paginate($perPage);

        return response()->json($pages);
    }

    /**
     * Store a newly created page
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug',
            'content' => 'nullable|array',
            'template_id' => 'nullable|exists:templates,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'status' => 'nullable|in:draft,published',
            'published_at' => 'nullable|date',
            'parent_id' => 'nullable|exists:pages,id',
            'show_in_menu' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $page = Page::create([
            ...$request->only([
                'title', 'slug', 'content', 'template_id',
                'meta_title', 'meta_description', 'meta_keywords',
                'status', 'published_at', 'parent_id', 'show_in_menu', 'order'
            ]),
            'user_id' => $request->user()->id,
        ]);

        $page->load(['user', 'template', 'elements']);

        return response()->json([
            'message' => 'Page created successfully',
            'page' => $page,
        ], 201);
    }

    /**
     * Display the specified page
     */
    public function show(Page $page): JsonResponse
    {
        $page->load([
            'user:id,name,email',
            'template',
            'elements' => function ($query) {
                $query->with('children');
            },
            'parent:id,title,slug',
            'children:id,title,slug',
        ]);

        return response()->json($page);
    }

    /**
     * Update the specified page
     */
    public function update(Request $request, Page $page): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:pages,slug,' . $page->id,
            'content' => 'nullable|array',
            'template_id' => 'nullable|exists:templates,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            'status' => 'nullable|in:draft,published',
            'published_at' => 'nullable|date',
            'parent_id' => 'nullable|exists:pages,id',
            'show_in_menu' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $page->update($request->only([
            'title', 'slug', 'content', 'template_id',
            'meta_title', 'meta_description', 'meta_keywords',
            'status', 'published_at', 'parent_id', 'show_in_menu', 'order'
        ]));

        $page->load(['user', 'template', 'elements']);

        return response()->json([
            'message' => 'Page updated successfully',
            'page' => $page,
        ]);
    }

    /**
     * Remove the specified page
     */
    public function destroy(Page $page): JsonResponse
    {
        $page->delete();

        return response()->json([
            'message' => 'Page deleted successfully',
        ]);
    }

    /**
     * Publish a page
     */
    public function publish(Page $page): JsonResponse
    {
        $page->publish();

        return response()->json([
            'message' => 'Page published successfully',
            'page' => $page,
        ]);
    }

    /**
     * Unpublish a page
     */
    public function unpublish(Page $page): JsonResponse
    {
        $page->unpublish();

        return response()->json([
            'message' => 'Page unpublished successfully',
            'page' => $page,
        ]);
    }

    /**
     * Duplicate a page
     */
    public function duplicate(Page $page): JsonResponse
    {
        $newPage = $page->replicate();
        $newPage->title = $page->title . ' (Copy)';
        $newPage->slug = $page->slug . '-copy';
        $newPage->status = 'draft';
        $newPage->published_at = null;
        $newPage->save();

        // Duplicate elements
        foreach ($page->elements()->topLevel()->get() as $element) {
            $this->duplicateElement($element, $newPage->id);
        }

        $newPage->load(['elements']);

        return response()->json([
            'message' => 'Page duplicated successfully',
            'page' => $newPage,
        ], 201);
    }

    /**
     * Helper to duplicate element with children
     */
    protected function duplicateElement($element, $newPageId, $newParentId = null)
    {
        $newElement = $element->replicate();
        $newElement->page_id = $newPageId;
        $newElement->parent_id = $newParentId;
        $newElement->save();

        foreach ($element->children as $child) {
            $this->duplicateElement($child, $newPageId, $newElement->id);
        }

        return $newElement;
    }
}
