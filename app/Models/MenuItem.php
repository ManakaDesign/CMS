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
        'label',
        'url',
        'page_id',
        'type',
        'target',
        'icon_type',
        'icon_name',
        'icon_media_id',
        'custom_styles',
        'mega_menu_config',
        'order',
        'is_visible',
        'css_class',
    ];

    protected $casts = [
        'menu_id' => 'integer',
        'parent_id' => 'integer',
        'page_id' => 'integer',
        'icon_media_id' => 'integer',
        'custom_styles' => 'array',
        'mega_menu_config' => 'array',
        'order' => 'integer',
        'is_visible' => 'boolean',
    ];

    protected $attributes = [
        'type' => 'link',
        'target' => '_self',
        'order' => 0,
        'is_visible' => true,
    ];

    protected $with = ['page', 'iconMedia'];

    /**
     * Get the menu this item belongs to
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Get the parent menu item
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    /**
     * Get the child menu items
     */
    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('order');
    }

    /**
     * Get all descendants recursively
     */
    public function childrenRecursive(): HasMany
    {
        return $this->children()->with('childrenRecursive');
    }

    /**
     * Get the linked page
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Get the icon media
     */
    public function iconMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'icon_media_id');
    }

    /**
     * Get the computed URL for this menu item
     */
    public function getComputedUrlAttribute(): ?string
    {
        if ($this->type === 'page' && $this->page) {
            return '/' . $this->page->slug;
        }

        if ($this->type === 'custom' && $this->url) {
            return $this->url;
        }

        return null;
    }

    /**
     * Check if this item has children
     */
    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Get depth level in hierarchy (0 = root)
     */
    public function getDepthAttribute(): int
    {
        $depth = 0;
        $parent = $this->parent;

        while ($parent) {
            $depth++;
            $parent = $parent->parent;
        }

        return $depth;
    }
}
