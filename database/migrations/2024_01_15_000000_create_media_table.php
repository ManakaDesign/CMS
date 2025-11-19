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
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('original_filename');
            $table->string('path');
            $table->string('disk')->default('public');
            $table->string('mime_type');
            $table->unsignedBigInteger('size'); // in bytes
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();

            // SVG specific
            $table->boolean('is_svg_colorable')->default(false);

            // Additional metadata
            $table->json('metadata')->nullable();

            // Optimized versions
            $table->string('webp_path')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->string('medium_path')->nullable();

            $table->string('alt_text')->nullable();
            $table->text('caption')->nullable();

            // Foreign keys (will be constrained after media_folders table is created)
            $table->unsignedBigInteger('folder_id')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->timestamps();

            $table->index('mime_type');
            $table->index('user_id');
            $table->index('folder_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
