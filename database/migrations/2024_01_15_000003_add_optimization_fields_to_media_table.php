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
            // Check if columns already exist (they might be in create_media_table)
            if (!Schema::hasColumn('media', 'webp_path')) {
                $table->string('webp_path')->nullable()->after('path');
            }
            if (!Schema::hasColumn('media', 'thumbnail_path')) {
                $table->string('thumbnail_path')->nullable()->after('webp_path');
            }
            if (!Schema::hasColumn('media', 'medium_path')) {
                $table->string('medium_path')->nullable()->after('thumbnail_path');
            }
            if (!Schema::hasColumn('media', 'is_svg_colorable')) {
                $table->boolean('is_svg_colorable')->default(false)->after('height');
            }
            if (!Schema::hasColumn('media', 'metadata')) {
                $table->json('metadata')->nullable()->after('is_svg_colorable');
            }
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
