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
            $table->enum('type', ['page', 'url', 'group'])->default('page');
            $table->string('label');
            $table->string('url')->nullable();
            $table->foreignId('page_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('open_in_new_tab')->default(false);
            $table->boolean('is_group')->default(false);
            $table->integer('columns')->nullable(); // For multi-column groups
            $table->string('icon')->nullable(); // Icon name for React icons
            $table->string('icon_type')->nullable(); // 'react' or 'svg'
            $table->string('icon_svg_url')->nullable(); // SVG URL from media library
            $table->json('custom_styles')->nullable(); // Custom CSS or style overrides
            $table->boolean('visibility_desktop')->default(true);
            $table->boolean('visibility_mobile')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
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
