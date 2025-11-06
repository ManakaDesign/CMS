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
        'disk',
        'mime_type',
        'size',
        'width',
        'height',
        'alt_text',
        'caption',
        'user_id',
    ];

    protected $casts = [
        'size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    protected $attributes = [
        'disk' => 'public',
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
     * Delete media file from storage
     */
    public function deleteFile(): bool
    {
        return Storage::disk($this->disk)->delete($this->path);
    }

    /**
     * Get thumbnail URL (for images)
     */
    public function getThumbnailUrl(?int $width = 150, ?int $height = 150): ?string
    {
        if (!$this->is_image) {
            return null;
        }

        // TODO: Implement thumbnail generation with Intervention Image
        // For now, return original URL
        return $this->url;
    }
}
