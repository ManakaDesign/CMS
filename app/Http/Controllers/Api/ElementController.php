<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Element;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ElementController extends Controller
{
    /**
     * Display elements for a page
     */
    public function index(Page $page): JsonResponse
    {
        $elements = $page->elements()->topLevel()->with('children')->get();

        return response()->json($elements);
    }

    /**
     * Store a new element
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page_id' => 'required|exists:pages,id',
            'type' => 'required|string|max:255',
            'settings' => 'nullable|array',
            'styles' => 'nullable|array',
            'parent_id' => 'nullable|exists:elements,id',
            'order' => 'nullable|integer',
            'is_visible' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $element = Element::create($request->all());
        $element->load('children');

        return response()->json([
            'message' => 'Element created successfully',
            'element' => $element,
        ], 201);
    }

    /**
     * Display the specified element
     */
    public function show(Element $element): JsonResponse
    {
        $element->load(['page', 'parent', 'children']);

        return response()->json($element);
    }

    /**
     * Update the specified element
     */
    public function update(Request $request, Element $element): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|required|string|max:255',
            'settings' => 'nullable|array',
            'styles' => 'nullable|array',
            'parent_id' => 'nullable|exists:elements,id',
            'order' => 'nullable|integer',
            'is_visible' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $element->update($request->all());
        $element->load('children');

        return response()->json([
            'message' => 'Element updated successfully',
            'element' => $element,
        ]);
    }

    /**
     * Remove the specified element
     */
    public function destroy(Element $element): JsonResponse
    {
        // Delete all descendants
        foreach ($element->getAllDescendants() as $descendant) {
            $descendant->delete();
        }

        $element->delete();

        return response()->json([
            'message' => 'Element deleted successfully',
        ]);
    }

    /**
     * Duplicate an element
     */
    public function duplicate(Element $element): JsonResponse
    {
        $newElement = $element->duplicate();

        return response()->json([
            'message' => 'Element duplicated successfully',
            'element' => $newElement,
        ], 201);
    }

    /**
     * Reorder elements
     */
    public function reorder(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'elements' => 'required|array',
            'elements.*.id' => 'required|exists:elements,id',
            'elements.*.order' => 'required|integer',
            'elements.*.parent_id' => 'nullable|exists:elements,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        foreach ($request->elements as $elementData) {
            Element::where('id', $elementData['id'])->update([
                'order' => $elementData['order'],
                'parent_id' => $elementData['parent_id'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Elements reordered successfully',
        ]);
    }
}
