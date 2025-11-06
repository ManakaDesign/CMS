<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TemplateController extends Controller
{
    /**
     * Display a listing of templates
     */
    public function index(Request $request): JsonResponse
    {
        $query = Template::query();

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter default
        if ($request->has('is_default')) {
            $query->where('is_default', $request->boolean('is_default'));
        }

        $query->orderBy('name');

        $templates = $query->get();

        return response()->json($templates);
    }

    /**
     * Store a newly created template
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:templates,slug',
            'type' => 'required|in:page,header,footer,global',
            'structure' => 'nullable|array',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $template = Template::create($request->all());

        if ($request->boolean('is_default')) {
            $template->setAsDefault();
        }

        return response()->json([
            'message' => 'Template created successfully',
            'template' => $template,
        ], 201);
    }

    /**
     * Display the specified template
     */
    public function show(Template $template): JsonResponse
    {
        return response()->json($template);
    }

    /**
     * Update the specified template
     */
    public function update(Request $request, Template $template): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:templates,slug,' . $template->id,
            'type' => 'sometimes|required|in:page,header,footer,global',
            'structure' => 'nullable|array',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $template->update($request->all());

        if ($request->has('is_default') && $request->boolean('is_default')) {
            $template->setAsDefault();
        }

        return response()->json([
            'message' => 'Template updated successfully',
            'template' => $template,
        ]);
    }

    /**
     * Remove the specified template
     */
    public function destroy(Template $template): JsonResponse
    {
        // Check if template is in use
        if ($template->pages()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete template that is in use',
            ], 422);
        }

        $template->delete();

        return response()->json([
            'message' => 'Template deleted successfully',
        ]);
    }
}
