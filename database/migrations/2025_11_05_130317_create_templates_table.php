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
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['page', 'header', 'footer', 'global'])->default('page');
            $table->json('structure')->nullable(); // Template layout structure
            $table->text('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('type');
            $table->index('is_default');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
