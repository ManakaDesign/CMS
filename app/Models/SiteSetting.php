<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
    ];

    protected $attributes = [
        'type' => 'string',
        'group' => 'general',
    ];

    // Cache settings for 1 hour
    const CACHE_TTL = 3600;

    // ============================================
    // Scopes
    // ============================================

    /**
     * Scope to filter by group
     */
    public function scopeOfGroup($query, string $group)
    {
        return $query->where('group', $group);
    }

    // ============================================
    // Accessors & Mutators
    // ============================================

    /**
     * Get typed value
     */
    public function getValueAttribute($value)
    {
        return $this->castValue($value, $this->type);
    }

    /**
     * Set value with automatic type detection
     */
    public function setValueAttribute($value)
    {
        // Store as string, will be cast on retrieval
        $this->attributes['value'] = is_array($value) || is_object($value)
            ? json_encode($value)
            : $value;
    }

    // ============================================
    // Helper Methods
    // ============================================

    /**
     * Cast value to appropriate type
     */
    protected function castValue($value, string $type)
    {
        return match($type) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'float' => (float) $value,
            'json' => json_decode($value, true),
            'array' => is_string($value) ? json_decode($value, true) : $value,
            default => $value,
        };
    }

    /**
     * Get setting by key with caching
     */
    public static function get(string $key, $default = null)
    {
        return Cache::remember(
            "setting.{$key}",
            self::CACHE_TTL,
            function () use ($key, $default) {
                $setting = static::where('key', $key)->first();
                return $setting ? $setting->value : $default;
            }
        );
    }

    /**
     * Set setting by key
     */
    public static function set(string $key, $value, string $type = 'string', string $group = 'general'): self
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'type' => $type,
                'group' => $group,
            ]
        );

        // Clear cache
        Cache::forget("setting.{$key}");
        Cache::forget("settings.{$group}");

        return $setting;
    }

    /**
     * Get all settings for a group
     */
    public static function getGroup(string $group): array
    {
        return Cache::remember(
            "settings.{$group}",
            self::CACHE_TTL,
            function () use ($group) {
                return static::where('group', $group)
                    ->get()
                    ->pluck('value', 'key')
                    ->toArray();
            }
        );
    }

    /**
     * Clear settings cache
     */
    public static function clearCache(?string $key = null): void
    {
        if ($key) {
            Cache::forget("setting.{$key}");
        } else {
            // Clear all setting caches
            Cache::flush(); // or use tags if available
        }
    }

    /**
     * Boot method to clear cache on save/delete
     */
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($setting) {
            Cache::forget("setting.{$setting->key}");
            Cache::forget("settings.{$setting->group}");
        });

        static::deleted(function ($setting) {
            Cache::forget("setting.{$setting->key}");
            Cache::forget("settings.{$setting->group}");
        });
    }
}
