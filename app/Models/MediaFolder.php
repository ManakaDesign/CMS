<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MediaFolder extends Model
{
    protected $fillable = [
        'name',
        'parent_id',
        'user_id',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    // ============================================
    // Relationships
    // ============================================

    /**
     * Folder belongs to a user (creator)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Folder belongs to a parent folder
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'parent_id');
    }

    /**
     * Folder has many child folders
     */
    public function children(): HasMany
    {
        return $this->hasMany(MediaFolder::class, 'parent_id')->orderBy('order');
    }

    /**
     * Folder has many media files
     */
    public function media(): HasMany
    {
        return $this->hasMany(Media::class, 'folder_id')->orderBy('created_at', 'desc');
    }

    // ============================================
    // Accessors
    // ============================================

    /**
     * Get full path of folder (breadcrumb)
     */
    public function getPathAttribute(): string
    {
        $path = [$this->name];
        $parent = $this->parent;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }

        return implode(' / ', $path);
    }

    /**
     * Get all child folder IDs (recursive)
     */
    public function getChildIdsAttribute(): array
    {
        $ids = [$this->id];

        foreach ($this->children as $child) {
            $ids = array_merge($ids, $child->child_ids);
        }

        return $ids;
    }

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Check if folder is a descendant of another folder
     */
    public function isDescendantOf(MediaFolder $folder): bool
    {
        $parent = $this->parent;

        while ($parent) {
            if ($parent->id === $folder->id) {
                return true;
            }
            $parent = $parent->parent;
        }

        return false;
    }

    /**
     * Get folder tree structure (with children)
     */
    public static function getTree(?int $parentId = null): array
    {
        return self::where('parent_id', $parentId)
            ->orderBy('order')
            ->get()
            ->map(function ($folder) {
                return [
                    'id' => $folder->id,
                    'name' => $folder->name,
                    'parent_id' => $folder->parent_id,
                    'media_count' => $folder->media()->count(),
                    'children' => self::getTree($folder->id),
                ];
            })
            ->toArray();
    }
}
