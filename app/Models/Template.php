<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Template extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'type',
        'structure',
        'description',
        'thumbnail',
        'is_default',
    ];

    protected $casts = [
        'structure' => 'array',
        'is_default' => 'boolean',
    ];

    protected $attributes = [
        'type' => 'page',
        'is_default' => false,
    ];

    // ============================================
    // Relationships
    // ============================================

    /**
     * Template has many pages
     */
    public function pages(): HasMany
    {
        return $this->hasMany(Page::class);
    }

    // ============================================
    // Scopes
    // ============================================

    /**
     * Scope to filter by type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get default template
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    // ============================================
    // Accessors & Mutators
    // ============================================

    /**
     * Auto-generate slug from name if not provided
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;

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

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Set as default template for its type
     */
    public function setAsDefault(): bool
    {
        // Unset current default
        static::where('type', $this->type)
              ->where('is_default', true)
              ->update(['is_default' => false]);

        // Set this as default
        $this->is_default = true;
        return $this->save();
    }

    /**
     * Get structure section by key
     */
    public function getStructureSection(string $key, $default = null)
    {
        return data_get($this->structure, $key, $default);
    }
}
