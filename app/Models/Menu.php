<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Menu extends Model
{
    protected $fillable = [
        'name',
        'location',
        'description',
        'design_settings',
        'is_active',
        'is_global',
        'order',
    ];

    protected $casts = [
        'design_settings' => 'array',
        'is_active' => 'boolean',
        'is_global' => 'boolean',
        'order' => 'integer',
    ];

    protected $attributes = [
        'design_settings' => '{}',
        'is_active' => true,
        'is_global' => false,
        'order' => 0,
    ];

    protected $appends = ['logo_url'];

    /**
     * Get all menu items for this menu
     */
    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('order');
    }

    /**
     * Get root level menu items (no parent)
     */
    public function rootItems(): HasMany
    {
        return $this->hasMany(MenuItem::class)
            ->whereNull('parent_id')
            ->orderBy('order');
    }

    /**
     * Get the logo media
     */
    public function logoMedia(): BelongsTo
    {
        // Use a custom foreign key based on JSON path
        $mediaId = $this->design_settings['logo']['media_id'] ?? null;
        return $this->belongsTo(\App\Models\Media::class, 'id', 'id')
            ->where('id', $mediaId);
    }

    /**
     * Get logo URL accessor
     */
    public function getLogoUrlAttribute(): ?string
    {
        $mediaId = $this->design_settings['logo']['media_id'] ?? null;

        if (!$mediaId) {
            return null;
        }

        $media = \App\Models\Media::find($mediaId);

        if (!$media) {
            return null;
        }

        return $media->url;
    }

    /**
     * Get menu items with full hierarchy
     */
    public function getHierarchicalItemsAttribute()
    {
        return $this->rootItems()
            ->with('childrenRecursive')
            ->get();
    }

    /**
     * Get default design settings structure
     */
    public static function getDefaultDesignSettings(): array
    {
        return [
            'layout_type' => 'horizontal_standard',
            'submenu_style' => 'dropdown_flyout',
            'mobile_view' => 'burger_sidebar',
            'colors' => [
                'background' => '#1a1a1a',
                'link_color' => '#e2e8f0',
                'link_hover' => '#3b82f6',
                'active_text' => '#3b82f6',
                'active_background' => 'rgba(59, 130, 246, 0.1)',
            ],
            'logo' => [
                'media_id' => null,
                'width' => '150px',
                'height' => 'auto',
            ],
            'features' => [
                'sticky_header' => true,
                'transparent_on_top' => false,
                'search_bar' => false,
                'cta_button' => false,
                'social_icons' => false,
            ],
            'submenu_config' => [
                'animation' => 'fade',
                'delay' => 200,
                'width' => 'auto',
                'position' => 'left',
            ],
            'cta_button_config' => [
                'text' => 'Get Started',
                'action_type' => 'url',
                'page_id' => null,
                'url' => '#',
                'position' => 'right_of_nav',
                'styling' => [
                    'bg_color' => '#3b82f6',
                    'text_color' => '#ffffff',
                    'border_radius' => '6px',
                    'padding' => '10px 20px',
                    'hover_bg_color' => '#2563eb',
                    'hover_text_color' => '#ffffff',
                    'border_width' => '0px',
                    'border_color' => 'transparent',
                ],
            ],
            'social_icons_config' => [
                'icons' => [],
                'position' => 'right_of_nav',
                'styling' => [
                    'size' => '20px',
                    'color' => '#e2e8f0',
                    'hover_color' => '#3b82f6',
                    'spacing' => '12px',
                ],
            ],
        ];
    }
}
