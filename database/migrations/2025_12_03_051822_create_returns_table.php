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
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained()->onDelete('cascade');
            $table->foreignId('returned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('inspected_by')->nullable()->constrained('users')->onDelete('set null');

            $table->enum('status', ['pending_inspection', 'inspected', 'approved', 'rejected'])
                ->default('pending_inspection');

            $table->dateTime('return_date');
            $table->dateTime('inspection_date')->nullable();

            $table->string('condition_on_return'); // good, fair, poor, damaged
            $table->boolean('is_damaged')->default(false);
            $table->text('damage_description')->nullable();
            $table->json('damage_images')->nullable(); // Array of image paths

            $table->boolean('is_late')->default(false);
            $table->integer('days_late')->default(0);

            $table->text('return_notes')->nullable();
            $table->text('inspection_notes')->nullable();

            $table->decimal('penalty_amount', 10, 2)->default(0);
            $table->boolean('penalty_paid')->default(false);

            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('return_date');
            $table->index('is_damaged');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
