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
        Schema::create('disposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->onDelete('cascade');
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->foreignId('executed_by')->nullable()->constrained('users');

            $table->string('status')->default('pending'); // pending, approved, rejected, executed
            $table->string('reason'); // obsolete, damaged_beyond_repair, expired, lost, stolen, donated, sold, other
            $table->text('description');
            $table->text('approval_notes')->nullable();
            $table->text('execution_notes')->nullable();

            $table->decimal('estimated_value', 15, 2)->nullable();
            $table->decimal('disposal_cost', 15, 2)->nullable();
            $table->string('disposal_method')->nullable(); // destroy, donate, sell, recycle, other
            $table->string('recipient')->nullable(); // For donations or sales

            $table->timestamp('requested_at');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->timestamp('scheduled_for')->nullable();

            $table->json('attachments')->nullable(); // Photos, documents
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('reason');
            $table->index('requested_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disposals');
    }
};
