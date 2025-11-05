<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Page extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'template_id',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'status',
        'published_at',
        'user_id',
        'order',
        'show_in_menu',
        'parent_id',
    ];

    protected $casts = [
        'content' => 'array',
        'published_at' => 'datetime',
        'show_in_menu' => 'boolean',
    ];

    protected $attributes = [
        'status' => 'draft',
        'show_in_menu' => true,
        'order' => 0,
    ];

    // ============================================
    // Relationships
    // ============================================

    /**
     * Page belongs to a user (author)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Page belongs to a template
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    /**
     * Page has many elements
     */
    public function elements(): HasMany
    {
        return $this->hasMany(Element::class)->orderBy('order');
    }

    /**
     * Page can have a parent page (hierarchical structure)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'parent_id');
    }

    /**
     * Page can have child pages
     */
    public function children(): HasMany
    {
        return $this->hasMany(Page::class, 'parent_id')->orderBy('order');
    }

    // ============================================
    // Scopes
    // ============================================

    /**
     * Scope to get only published pages
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                     ->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }

    /**
     * Scope to get only draft pages
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Scope to get pages visible in menu
     */
    public function scopeInMenu($query)
    {
        return $query->where('show_in_menu', true);
    }

    /**
     * Scope to get top-level pages (no parent)
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    // ============================================
    // Accessors & Mutators
    // ============================================

    /**
     * Auto-generate slug from title if not provided
     */
    public function setTitleAttribute($value)
    {
        $this->attributes['title'] = $value;

        if (empty($this->attributes['slug'])) {
            $this->attributes['slug'] = Str::slug($value);
        }
    }

    /**
     * Ensure slug is unique
     */
    public function setSlugAttribute($value)
    {
        $slug = Str::slug($value);
        $count = 0;
        $originalSlug = $slug;

        while (static::where('slug', $slug)->where('id', '!=', $this->id ?? 0)->exists()) {
            $count++;
            $slug = $originalSlug . '-' . $count;
        }

        $this->attributes['slug'] = $slug;
    }

    /**
     * Get full URL for the page
     */
    public function getUrlAttribute(): string
    {
        return config('app.url') . '/sites/' . $this->slug;
    }

    /**
     * Get effective meta title (falls back to title)
     */
    public function getEffectiveMetaTitleAttribute(): string
    {
        return $this->meta_title ?? $this->title;
    }

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Check if page is published
     */
    public function isPublished(): bool
    {
        return $this->status === 'published'
               && $this->published_at !== null
               && $this->published_at <= now();
    }

    /**
     * Publish the page
     */
    public function publish(): bool
    {
        $this->status = 'published';
        $this->published_at = $this->published_at ?? now();
        return $this->save();
    }

    /**
     * Unpublish the page
     */
    public function unpublish(): bool
    {
        $this->status = 'draft';
        return $this->save();
    }

    /**
     * Get breadcrumb trail for hierarchical pages
     */
    public function getBreadcrumbs(): array
    {
        $breadcrumbs = [$this];
        $parent = $this->parent;

        while ($parent) {
            array_unshift($breadcrumbs, $parent);
            $parent = $parent->parent;
        }

        return $breadcrumbs;
    }
}
