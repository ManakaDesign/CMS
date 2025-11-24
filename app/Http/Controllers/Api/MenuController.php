<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuController extends Controller
{
    /**
     * Display a listing of menus
     */
    public function index(): JsonResponse
    {
        $menus = Menu::with(['rootItems.childrenRecursive'])
            ->orderBy('order')
            ->get();

        return response()->json($menus);
    }

    /**
     * Store a newly created menu
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'design_settings' => 'nullable|array',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        // Set default design settings if not provided
        if (!isset($validated['design_settings'])) {
            $validated['design_settings'] = Menu::getDefaultDesignSettings();
        }

        $menu = Menu::create($validated);
        $menu->load(['rootItems.childrenRecursive']);

        return response()->json($menu, 201);
    }

    /**
     * Display the specified menu
     */
    public function show(Menu $menu): JsonResponse
    {
        $menu->load(['rootItems.childrenRecursive']);
        return response()->json($menu);
    }

    /**
     * Update the specified menu
     */
    public function update(Request $request, Menu $menu): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'design_settings' => 'nullable|array',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        $menu->update($validated);
        $menu->load(['rootItems.childrenRecursive']);

        return response()->json($menu);
    }

    /**
     * Remove the specified menu
     */
    public function destroy(Menu $menu): JsonResponse
    {
        $menu->delete();
        return response()->json(['message' => 'Menu deleted successfully']);
    }

    /**
     * Duplicate a menu
     */
    public function duplicate(Menu $menu): JsonResponse
    {
        $newMenu = $menu->replicate();
        $newMenu->name = $menu->name . ' (Copy)';
        $newMenu->is_active = false;
        $newMenu->save();

        // Duplicate all menu items recursively
        $this->duplicateMenuItems($menu->rootItems, $newMenu->id, null);

        $newMenu->load(['rootItems.childrenRecursive']);
        return response()->json($newMenu, 201);
    }

    /**
     * Reorder menus
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'menus' => 'required|array',
            'menus.*.id' => 'required|exists:menus,id',
            'menus.*.order' => 'required|integer',
        ]);

        foreach ($validated['menus'] as $menuData) {
            Menu::where('id', $menuData['id'])->update(['order' => $menuData['order']]);
        }

        return response()->json(['message' => 'Menus reordered successfully']);
    }

    /**
     * Helper: Duplicate menu items recursively
     */
    private function duplicateMenuItems($items, int $newMenuId, ?int $newParentId): void
    {
        foreach ($items as $item) {
            $newItem = $item->replicate();
            $newItem->menu_id = $newMenuId;
            $newItem->parent_id = $newParentId;
            $newItem->save();

            // Recursively duplicate children
            if ($item->children->count() > 0) {
                $this->duplicateMenuItems($item->children, $newMenuId, $newItem->id);
            }
        }
    }
}
