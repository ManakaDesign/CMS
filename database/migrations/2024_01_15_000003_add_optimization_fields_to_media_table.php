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
        Schema::table('media', function (Blueprint $table) {
            // Optimized versions
            $table->string('webp_path')->nullable()->after('path');
            $table->string('thumbnail_path')->nullable()->after('webp_path');
            $table->string('medium_path')->nullable()->after('thumbnail_path');

            // SVG specific
            $table->boolean('is_svg_colorable')->default(false)->after('height');

            // Additional metadata
            $table->json('metadata')->nullable()->after('is_svg_colorable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn([
                'webp_path',
                'thumbnail_path',
                'medium_path',
                'is_svg_colorable',
                'metadata'
            ]);
        });
    }
};
