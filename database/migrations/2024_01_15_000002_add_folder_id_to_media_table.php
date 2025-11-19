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
            // Add folder_id column if it doesn't exist (might already be in create_media_table)
            if (!Schema::hasColumn('media', 'folder_id')) {
                $table->unsignedBigInteger('folder_id')->nullable()->after('user_id');
                $table->index('folder_id');
            }

            // Add foreign key constraint (requires media_folders table to exist first)
            // Check if constraint doesn't already exist
            $sm = Schema::getConnection()->getDoctrineSchemaManager();
            $foreignKeys = $sm->listTableForeignKeys('media');
            $hasFolderConstraint = false;
            foreach ($foreignKeys as $fk) {
                if (in_array('folder_id', $fk->getLocalColumns())) {
                    $hasFolderConstraint = true;
                    break;
                }
            }
            if (!$hasFolderConstraint) {
                $table->foreign('folder_id')->references('id')->on('media_folders')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropColumn('folder_id');
        });
    }
};
