<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    /**
     * Display all menu items for a specific menu
     */
    public function index($menuId)
    {
        $menu = Menu::findOrFail($menuId);
        $items = MenuItem::where('menu_id', $menuId)
            ->with('children.children')
            ->root()
            ->orderBy('order')
            ->get();

        return response()->json($items);
    }

    /**
     * Store a newly created menu item
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'parent_id' => 'nullable|exists:menu_items,id',
            'type' => 'required|in:page,url,group',
            'label' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'page_id' => 'nullable|exists:pages,id',
            'open_in_new_tab' => 'nullable|boolean',
            'is_group' => 'nullable|boolean',
            'columns' => 'nullable|integer|min:1|max:6',
            'icon' => 'nullable|string|max:255',
            'icon_type' => 'nullable|in:react,svg',
            'icon_svg_url' => 'nullable|string|max:255',
            'custom_styles' => 'nullable|array',
            'visibility_desktop' => 'nullable|boolean',
            'visibility_mobile' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        $item = MenuItem::create($validated);
        $item->load('children');

        return response()->json($item, 201);
    }

    /**
     * Display a specific menu item with children
     */
    public function show($id)
    {
        $item = MenuItem::with('children.children')->findOrFail($id);
        return response()->json($item);
    }

    /**
     * Update the specified menu item
     */
    public function update(Request $request, $id)
    {
        $item = MenuItem::findOrFail($id);

        $validated = $request->validate([
            'parent_id' => 'nullable|exists:menu_items,id',
            'type' => 'sometimes|in:page,url,group',
            'label' => 'sometimes|string|max:255',
            'url' => 'nullable|string|max:255',
            'page_id' => 'nullable|exists:pages,id',
            'open_in_new_tab' => 'nullable|boolean',
            'is_group' => 'nullable|boolean',
            'columns' => 'nullable|integer|min:1|max:6',
            'icon' => 'nullable|string|max:255',
            'icon_type' => 'nullable|in:react,svg',
            'icon_svg_url' => 'nullable|string|max:255',
            'custom_styles' => 'nullable|array',
            'visibility_desktop' => 'nullable|boolean',
            'visibility_mobile' => 'nullable|boolean',
            'order' => 'nullable|integer',
        ]);

        $item->update($validated);
        $item->load('children');

        return response()->json($item);
    }

    /**
     * Remove the specified menu item
     */
    public function destroy($id)
    {
        $item = MenuItem::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Menu item deleted successfully']);
    }

    /**
     * Reorder menu items (for drag & drop)
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:menu_items,id',
            'items.*.order' => 'required|integer',
            'items.*.parent_id' => 'nullable|exists:menu_items,id',
        ]);

        foreach ($validated['items'] as $itemData) {
            MenuItem::where('id', $itemData['id'])->update([
                'order' => $itemData['order'],
                'parent_id' => $itemData['parent_id'] ?? null,
            ]);
        }

        return response()->json(['message' => 'Menu items reordered successfully']);
    }
}
