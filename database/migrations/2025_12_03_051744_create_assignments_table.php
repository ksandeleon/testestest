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
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');

            $table->enum('status', ['pending', 'approved', 'active', 'returned', 'cancelled'])
                ->default('active');

            $table->date('assigned_date');
            $table->date('due_date')->nullable();
            $table->date('returned_date')->nullable();

            $table->text('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();

            $table->string('condition_on_assignment')->default('good'); // good, fair, poor

            $table->softDeletes();
            $table->timestamps();

            // Indexes for better query performance
            $table->index(['user_id', 'status']);
            $table->index(['item_id', 'status']);
            $table->index('assigned_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
