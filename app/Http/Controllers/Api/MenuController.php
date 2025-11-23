<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MenuController extends Controller
{
    /**
     * Display a listing of all menus
     */
    public function index()
    {
        $menus = Menu::with('items')->orderBy('order')->get();
        return response()->json($menus);
    }

    /**
     * Store a newly created menu
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:menus',
            'location' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'design_settings' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $menu = Menu::create($validated);
        $menu->load('items');

        return response()->json($menu, 201);
    }

    /**
     * Display a specific menu with all its items (nested)
     */
    public function show($id)
    {
        $menu = Menu::with(['items' => function ($query) {
            $query->with('children.children'); // Load up to 3 levels deep
        }])->findOrFail($id);

        return response()->json($menu);
    }

    /**
     * Update the specified menu
     */
    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:menus,slug,' . $id,
            'location' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:255',
            'design_settings' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        $menu->update($validated);
        $menu->load('items');

        return response()->json($menu);
    }

    /**
     * Remove the specified menu
     */
    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json(['message' => 'Menu deleted successfully']);
    }

    /**
     * Duplicate an existing menu
     */
    public function duplicate($id)
    {
        $originalMenu = Menu::with(['allItems'])->findOrFail($id);

        // Create a copy of the menu
        $newMenu = $originalMenu->replicate();
        $newMenu->name = $originalMenu->name . ' (Copy)';
        $newMenu->slug = $originalMenu->slug . '-copy-' . time();
        $newMenu->is_active = false;
        $newMenu->save();

        // Copy all menu items with parent-child relationships
        $itemMap = []; // Map old IDs to new IDs

        foreach ($originalMenu->allItems as $item) {
            $newItem = $item->replicate();
            $newItem->menu_id = $newMenu->id;
            $newItem->parent_id = null; // Temporarily set to null
            $newItem->save();

            $itemMap[$item->id] = $newItem->id;
        }

        // Update parent_id references
        foreach ($originalMenu->allItems as $item) {
            if ($item->parent_id && isset($itemMap[$item->parent_id])) {
                $newItem = MenuItem::find($itemMap[$item->id]);
                $newItem->parent_id = $itemMap[$item->parent_id];
                $newItem->save();
            }
        }

        $newMenu->load('items');
        return response()->json($newMenu, 201);
    }
}
