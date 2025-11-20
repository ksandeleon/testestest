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
        Schema::create('items', function (Blueprint $table) {
            $table->id();

            // IAR & Property Information (from label)
            $table->string('iar_number')->unique(); // e.g., "IAR # 164-2021-054"
            $table->string('property_number')->unique(); // e.g., "2021-06-086-164"
            $table->string('fund_cluster')->nullable(); // e.g., "FUND 164"

            // Item Description
            $table->string('name'); // Item name
            $table->text('description'); // Full description from label
            $table->string('brand')->nullable(); // e.g., "ACER VERITON"
            $table->string('model')->nullable(); // e.g., "M4665G"
            $table->string('serial_number')->nullable(); // e.g., "DTVSPS01G107025E43000"
            $table->text('specifications')->nullable(); // Technical specs

            // Financial Information
            $table->decimal('acquisition_cost', 15, 2); // ₱ 78,710.00
            $table->string('unit_of_measure')->default('unit'); // unit, piece, set, etc.
            $table->integer('quantity')->default(1);

            // Classification & Location
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();

            // Ownership & Accountability
            $table->foreignId('accountable_person_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('accountable_person_name')->nullable(); // DR. JESUS PAGUIGAN
            $table->string('accountable_person_position')->nullable(); // Position/Title

            // Dates
            $table->date('date_acquired'); // JUNE 04, 2021
            $table->date('date_inventoried')->nullable();
            $table->date('estimated_useful_life')->nullable(); // End of useful life

            // Status & Condition
            $table->enum('status', [
                'available',
                'assigned',
                'in_use',
                'in_maintenance',
                'for_disposal',
                'disposed',
                'lost',
                'damaged'
            ])->default('available');

            $table->enum('condition', [
                'excellent',
                'good',
                'fair',
                'poor',
                'for_repair',
                'unserviceable'
            ])->default('good');

            // QR Code
            $table->string('qr_code')->unique()->nullable(); // Generated QR code path/data
            $table->string('qr_code_path')->nullable(); // Path to QR code image

            // Tracking
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('remarks')->nullable();
            $table->json('metadata')->nullable(); // Additional flexible data

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index('iar_number');
            $table->index('property_number');
            $table->index('serial_number');
            $table->index('status');
            $table->index('category_id');
            $table->index('location_id');
            $table->index('accountable_person_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
