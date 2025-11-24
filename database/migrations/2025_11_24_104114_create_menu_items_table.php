<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('menu_items')->onDelete('cascade');

            // Content
            $table->string('label');
            $table->string('url')->nullable(); // Custom URL
            $table->foreignId('page_id')->nullable()->constrained('pages')->onDelete('cascade'); // Link to page
            $table->string('type')->default('link'); // link, page, custom, group (for mega menu)
            $table->string('target')->default('_self'); // _self, _blank

            // Icon
            $table->string('icon_type')->nullable(); // react-icon, svg, none
            $table->string('icon_name')->nullable(); // FiHome
            $table->foreignId('icon_media_id')->nullable()->constrained('media')->onDelete('set null'); // SVG from media

            // Styling & Settings
            $table->json('custom_styles')->nullable(); // Individual item styles
            $table->json('mega_menu_config')->nullable(); // For mega menu columns
            // {
            //   "columns": [
            //     {
            //       "title": "Category 1",
            //       "icon": "FiTarget",
            //       "items": [child menu_item ids]
            //     }
            //   ]
            // }

            // Position & Visibility
            $table->integer('order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->string('css_class')->nullable(); // Custom CSS class

            $table->timestamps();

            // Indexes
            $table->index(['menu_id', 'parent_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
