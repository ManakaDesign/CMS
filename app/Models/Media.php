<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = [
        'filename',
        'original_filename',
        'path',
        'webp_path',
        'thumbnail_path',
        'medium_path',
        'disk',
        'mime_type',
        'size',
        'width',
        'height',
        'alt_text',
        'caption',
        'is_svg_colorable',
        'metadata',
        'user_id',
        'folder_id',
    ];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'is_svg_colorable' => 'boolean',
        'metadata' => 'array',
    ];

    protected $attributes = [
        'disk' => 'public',
    ];

    protected $appends = [
        'url',
        'webp_url',
        'thumbnail_url',
        'medium_url',
        'is_image',
        'is_video',
        'is_svg',
        'human_size',
        'dimensions',
    ];

    // ============================================
    // Relationships
    // ============================================

    /**
     * Media belongs to a user (uploader)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Media belongs to a folder
     */
    public function folder(): BelongsTo
    {
        return $this->belongsTo(MediaFolder::class, 'folder_id');
    }

    // ============================================
    // Scopes
    // ============================================

    /**
     * Scope to filter by mime type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('mime_type', 'like', $type . '%');
    }

    /**
     * Scope to get images only
     */
    public function scopeImages($query)
    {
        return $query->where('mime_type', 'like', 'image/%');
    }

    /**
     * Scope to get videos only
     */
    public function scopeVideos($query)
    {
        return $query->where('mime_type', 'like', 'video/%');
    }

    // ============================================
    // Accessors
    // ============================================

    /**
     * Get full URL to the media file
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    /**
     * Get WebP version URL
     */
    public function getWebpUrlAttribute(): ?string
    {
        if (!$this->webp_path) {
            return null;
        }
        return Storage::disk($this->disk)->url($this->webp_path);
    }

    /**
     * Get thumbnail URL
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail_path) {
            return $this->url;
        }
        return Storage::disk($this->disk)->url($this->thumbnail_path);
    }

    /**
     * Get medium size URL
     */
    public function getMediumUrlAttribute(): ?string
    {
        if (!$this->medium_path) {
            return $this->url;
        }
        return Storage::disk($this->disk)->url($this->medium_path);
    }

    /**
     * Get human-readable file size
     */
    public function getHumanSizeAttribute(): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }

    /**
     * Check if media is an image
     */
    public function getIsImageAttribute(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Check if media is a video
     */
    public function getIsVideoAttribute(): bool
    {
        return str_starts_with($this->mime_type, 'video/');
    }

    /**
     * Get dimensions as string
     */
    public function getDimensionsAttribute(): ?string
    {
        if ($this->width && $this->height) {
            return $this->width . ' × ' . $this->height;
        }
        return null;
    }

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Delete media file from storage (including all optimized versions)
     */
    public function deleteFile(): bool
    {
        $deleted = Storage::disk($this->disk)->delete($this->path);

        // Delete optimized versions
        if ($this->webp_path) {
            Storage::disk($this->disk)->delete($this->webp_path);
        }
        if ($this->thumbnail_path) {
            Storage::disk($this->disk)->delete($this->thumbnail_path);
        }
        if ($this->medium_path) {
            Storage::disk($this->disk)->delete($this->medium_path);
        }

        return $deleted;
    }

    /**
     * Check if media is SVG
     */
    public function getIsSvgAttribute(): bool
    {
        return $this->mime_type === 'image/svg+xml';
    }
}
