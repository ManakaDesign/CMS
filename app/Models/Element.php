<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Element extends Model
{
    protected $fillable = [
        'page_id',
        'type',
        'settings',
        'styles',
        'parent_id',
        'order',
        'is_visible',
    ];

    protected $casts = [
        'settings' => 'array',
        'styles' => 'array',
        'is_visible' => 'boolean',
    ];

    protected $attributes = [
        'is_visible' => true,
        'order' => 0,
    ];

    // ============================================
    // Relationships
    // ============================================

    /**
     * Element belongs to a page
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Element can have a parent element (nested structure)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Element::class, 'parent_id');
    }

    /**
     * Element can have child elements
     */
    public function children(): HasMany
    {
        return $this->hasMany(Element::class, 'parent_id')->orderBy('order');
    }

    // ============================================
    // Scopes
    // ============================================

    /**
     * Scope to get only visible elements
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope to get top-level elements (no parent)
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope to filter by element type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Get element setting by key
     */
    public function getSetting(string $key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }

    /**
     * Set element setting
     */
    public function setSetting(string $key, $value): self
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->settings = $settings;
        return $this;
    }

    /**
     * Get styles for specific breakpoint
     */
    public function getStylesForBreakpoint(string $breakpoint): array
    {
        return $this->styles[$breakpoint] ?? [];
    }

    /**
     * Set styles for specific breakpoint
     */
    public function setStylesForBreakpoint(string $breakpoint, array $styles): self
    {
        $allStyles = $this->styles ?? [];
        $allStyles[$breakpoint] = $styles;
        $this->styles = $allStyles;
        return $this;
    }

    /**
     * Check if element is a container type (can have children)
     */
    public function isContainer(): bool
    {
        return in_array($this->type, ['section', 'row', 'column', 'container']);
    }

    /**
     * Get all descendants (children, grandchildren, etc.)
     */
    public function getAllDescendants(): array
    {
        $descendants = [];

        foreach ($this->children as $child) {
            $descendants[] = $child;
            $descendants = array_merge($descendants, $child->getAllDescendants());
        }

        return $descendants;
    }

    /**
     * Duplicate element with all children
     */
    public function duplicate(): self
    {
        $clone = $this->replicate();
        $clone->order = $this->order + 1;
        $clone->save();

        // Duplicate children
        foreach ($this->children as $child) {
            $childClone = $child->duplicate();
            $childClone->parent_id = $clone->id;
            $childClone->save();
        }

        return $clone;
    }
}
