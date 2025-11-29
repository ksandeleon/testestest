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
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id();

            // Item Reference
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();

            // Maintenance Classification
            $table->enum('maintenance_type', [
                'preventive',      // Scheduled routine maintenance
                'corrective',      // Fix issues/problems
                'predictive',      // Based on condition monitoring
                'emergency'        // Urgent unplanned maintenance
            ])->default('corrective');

            $table->enum('status', [
                'pending',         // Waiting to be scheduled
                'scheduled',       // Date/time assigned
                'in_progress',     // Work has started
                'completed',       // Work finished
                'cancelled'        // Request cancelled
            ])->default('pending');

            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'critical'
            ])->default('medium');

            // Maintenance Details
            $table->string('title');
            $table->text('description');
            $table->text('issue_reported')->nullable(); // What's the problem?
            $table->text('action_taken')->nullable();   // What was done to fix it?
            $table->text('recommendations')->nullable(); // Future recommendations

            // Financial
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->decimal('actual_cost', 15, 2)->nullable();
            $table->boolean('cost_approved')->default(false);
            $table->text('cost_breakdown')->nullable(); // JSON or text breakdown

            // Scheduling & Tracking
            $table->dateTime('scheduled_date')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->integer('estimated_duration')->nullable(); // in minutes
            $table->integer('actual_duration')->nullable();    // in minutes

            // Assignments & Approvals
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            // Attachments & Documentation
            $table->json('attachments')->nullable(); // Photos, receipts, documents
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // Additional flexible data

            // Status Before & After
            $table->string('item_condition_before')->nullable(); // excellent, good, fair, poor
            $table->string('item_condition_after')->nullable();
            $table->string('item_status_before')->nullable();
            $table->string('item_status_after')->nullable();

            // Tracking
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('item_id');
            $table->index('status');
            $table->index('maintenance_type');
            $table->index('priority');
            $table->index('assigned_to');
            $table->index('requested_by');
            $table->index('scheduled_date');
            $table->index(['status', 'scheduled_date']); // Composite for queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenances');
    }
};
