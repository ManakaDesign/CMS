<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    /**
     * Display a listing of menu items for a specific menu
     */
    public function index(Request $request): JsonResponse
    {
        $query = MenuItem::query();

        if ($request->has('menu_id')) {
            $query->where('menu_id', $request->menu_id);
        }

        if ($request->has('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        $items = $query->with(['children', 'page', 'iconMedia'])
            ->orderBy('order')
            ->get();

        return response()->json($items);
    }

    /**
     * Store a newly created menu item
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'parent_id' => 'nullable|exists:menu_items,id',
            'label' => 'required|string|max:255',
            'url' => 'nullable|string|max:255',
            'page_id' => 'nullable|exists:pages,id',
            'type' => 'required|in:link,page,custom,group',
            'target' => 'in:_self,_blank',
            'icon_type' => 'nullable|in:react-icon,svg,none',
            'icon_name' => 'nullable|string|max:255',
            'icon_media_id' => 'nullable|exists:media,id',
            'custom_styles' => 'nullable|array',
            'mega_menu_config' => 'nullable|array',
            'order' => 'integer',
            'is_visible' => 'boolean',
            'css_class' => 'nullable|string|max:255',
        ]);

        // If no order is specified, put it at the end
        if (!isset($validated['order'])) {
            $maxOrder = MenuItem::where('menu_id', $validated['menu_id'])
                ->where('parent_id', $validated['parent_id'] ?? null)
                ->max('order');
            $validated['order'] = ($maxOrder ?? -1) + 1;
        }

        $item = MenuItem::create($validated);
        $item->load(['children', 'page', 'iconMedia']);

        return response()->json($item, 201);
    }

    /**
     * Display the specified menu item
     */
    public function show(MenuItem $menuItem): JsonResponse
    {
        $menuItem->load(['children', 'page', 'iconMedia', 'parent']);
        return response()->json($menuItem);
    }

    /**
     * Update the specified menu item
     */
    public function update(Request $request, MenuItem $menuItem): JsonResponse
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:menu_items,id',
            'label' => 'sometimes|required|string|max:255',
            'url' => 'nullable|string|max:255',
            'page_id' => 'nullable|exists:pages,id',
            'type' => 'in:link,page,custom,group',
            'target' => 'in:_self,_blank',
            'icon_type' => 'nullable|in:react-icon,svg,none',
            'icon_name' => 'nullable|string|max:255',
            'icon_media_id' => 'nullable|exists:media,id',
            'custom_styles' => 'nullable|array',
            'mega_menu_config' => 'nullable|array',
            'order' => 'integer',
            'is_visible' => 'boolean',
            'css_class' => 'nullable|string|max:255',
        ]);

        $menuItem->update($validated);
        $menuItem->load(['children', 'page', 'iconMedia']);

        return response()->json($menuItem);
    }

    /**
     * Remove the specified menu item
     */
    public function destroy(MenuItem $menuItem): JsonResponse
    {
        $menuItem->delete();
        return response()->json(['message' => 'Menu item deleted successfully']);
    }

    /**
     * Reorder menu items
     */
    public function reorder(Request $request): JsonResponse
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

    /**
     * Duplicate a menu item
     */
    public function duplicate(MenuItem $menuItem): JsonResponse
    {
        $newItem = $menuItem->replicate();
        $newItem->label = $menuItem->label . ' (Copy)';

        // Put it right after the original
        $newItem->order = $menuItem->order + 1;
        $newItem->save();

        // Shift all items after this one
        MenuItem::where('menu_id', $menuItem->menu_id)
            ->where('parent_id', $menuItem->parent_id)
            ->where('order', '>', $menuItem->order)
            ->where('id', '!=', $newItem->id)
            ->increment('order');

        $newItem->load(['children', 'page', 'iconMedia']);
        return response()->json($newItem, 201);
    }

    /**
     * Bulk create menu items from pages
     */
    public function bulkCreateFromPages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'parent_id' => 'nullable|exists:menu_items,id',
            'page_ids' => 'required|array',
            'page_ids.*' => 'exists:pages,id',
        ]);

        $items = [];
        $order = MenuItem::where('menu_id', $validated['menu_id'])
            ->where('parent_id', $validated['parent_id'] ?? null)
            ->max('order') ?? -1;

        foreach ($validated['page_ids'] as $pageId) {
            $page = \App\Models\Page::find($pageId);
            $order++;

            $item = MenuItem::create([
                'menu_id' => $validated['menu_id'],
                'parent_id' => $validated['parent_id'] ?? null,
                'label' => $page->title,
                'page_id' => $pageId,
                'type' => 'page',
                'order' => $order,
            ]);

            $item->load(['page', 'iconMedia']);
            $items[] = $item;
        }

        return response()->json($items, 201);
    }
}
