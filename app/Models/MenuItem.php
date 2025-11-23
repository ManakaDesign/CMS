<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuItem extends Model
{
    protected $fillable = [
        'menu_id',
        'parent_id',
        'type',
        'label',
        'url',
        'page_id',
        'open_in_new_tab',
        'is_group',
        'columns',
        'icon',
        'icon_type',
        'icon_svg_url',
        'custom_styles',
        'visibility_desktop',
        'visibility_mobile',
        'order',
    ];

    protected $casts = [
        'custom_styles' => 'array',
        'open_in_new_tab' => 'boolean',
        'is_group' => 'boolean',
        'visibility_desktop' => 'boolean',
        'visibility_mobile' => 'boolean',
    ];

    /**
     * Get the menu this item belongs to
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Get the parent menu item (for nested items)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    /**
     * Get child menu items (for nested items)
     */
    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('order');
    }

    /**
     * Get the page this menu item links to
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Scope to get only root items (no parent)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }
}
