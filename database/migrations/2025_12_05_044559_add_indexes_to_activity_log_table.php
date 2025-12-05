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
        Schema::table('activity_log', function (Blueprint $table) {
            // Index for date filtering
            $table->index('created_at', 'activity_log_created_at_index');

            // Composite index for user filtering (causer)
            $table->index(['causer_type', 'causer_id'], 'activity_log_causer_index');

            // Composite index for entity filtering (subject)
            $table->index(['subject_type', 'subject_id'], 'activity_log_subject_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->dropIndex('activity_log_created_at_index');
            $table->dropIndex('activity_log_causer_index');
            $table->dropIndex('activity_log_subject_index');
        });
    }
};
