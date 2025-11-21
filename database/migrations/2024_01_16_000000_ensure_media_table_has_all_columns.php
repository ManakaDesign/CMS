<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This migration ensures all required columns exist in the media table,
     * regardless of which previous migrations ran in which order.
     */
    public function up(): void
    {
        if (Schema::hasTable('media')) {
            Schema::table('media', function (Blueprint $table) {
                // Check and add each column if it doesn't exist
                if (!Schema::hasColumn('media', 'is_svg_colorable')) {
                    $table->boolean('is_svg_colorable')->default(false)->after('height');
                }
                if (!Schema::hasColumn('media', 'metadata')) {
                    $table->json('metadata')->nullable()->after('is_svg_colorable');
                }
                if (!Schema::hasColumn('media', 'webp_path')) {
                    $table->string('webp_path')->nullable()->after('path');
                }
                if (!Schema::hasColumn('media', 'thumbnail_path')) {
                    $table->string('thumbnail_path')->nullable()->after('webp_path');
                }
                if (!Schema::hasColumn('media', 'medium_path')) {
                    $table->string('medium_path')->nullable()->after('thumbnail_path');
                }
                if (!Schema::hasColumn('media', 'folder_id')) {
                    $table->foreignId('folder_id')->nullable()->after('user_id')->constrained('media_folders')->nullOnDelete();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('media')) {
            Schema::table('media', function (Blueprint $table) {
                if (Schema::hasColumn('media', 'is_svg_colorable')) {
                    $table->dropColumn('is_svg_colorable');
                }
                if (Schema::hasColumn('media', 'metadata')) {
                    $table->dropColumn('metadata');
                }
                if (Schema::hasColumn('media', 'webp_path')) {
                    $table->dropColumn('webp_path');
                }
                if (Schema::hasColumn('media', 'thumbnail_path')) {
                    $table->dropColumn('thumbnail_path');
                }
                if (Schema::hasColumn('media', 'medium_path')) {
                    $table->dropColumn('medium_path');
                }
                if (Schema::hasColumn('media', 'folder_id')) {
                    $table->dropForeign(['folder_id']);
                    $table->dropColumn('folder_id');
                }
            });
        }
    }
};
