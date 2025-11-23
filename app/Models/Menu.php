<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'location',
        'type',
        'design_settings',
        'is_active',
        'order',
    ];

    protected $casts = [
        'design_settings' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get all menu items for this menu
     */
    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class)->whereNull('parent_id')->orderBy('order');
    }

    /**
     * Get all menu items including nested ones
     */
    public function allItems(): HasMany
    {
        return $this->hasMany(MenuItem::class)->orderBy('order');
    }
}
