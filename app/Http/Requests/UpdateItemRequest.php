<?php

namespace App\Http\Requests;

use App\Models\Item;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('item'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $itemId = $this->route('item')->id;

        return [
            // IAR & Property Information
            'iar_number' => ['nullable', 'string', 'max:255'],
            'property_number' => ['required', 'string', 'max:255', Rule::unique('items')->ignore($itemId)],
            'fund_cluster' => ['nullable', 'string', 'max:255'],

            // Item Description
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'model' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255', Rule::unique('items')->ignore($itemId)],
            'manufacturer' => ['nullable', 'string', 'max:255'],

            // Classification
            'category_id' => ['required', 'exists:categories,id'],
            'location_id' => ['required', 'exists:locations,id'],

            // Financial Information
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_of_measure' => ['nullable', 'string', 'max:50'],
            'estimated_useful_life' => ['nullable', 'integer', 'min:0'],

            // Dates
            'date_acquired' => ['required', 'date'],
            'warranty_expiry' => ['nullable', 'date', 'after:date_acquired'],

            // Supplier Information
            'supplier' => ['nullable', 'string', 'max:255'],
            'invoice_number' => ['nullable', 'string', 'max:255'],

            // Status & Condition
            'status' => [
                'nullable',
                Rule::in([
                    Item::STATUS_AVAILABLE,
                    Item::STATUS_ASSIGNED,
                    Item::STATUS_IN_USE,
                    Item::STATUS_UNDER_MAINTENANCE,
                    Item::STATUS_PENDING_DISPOSAL,
                    Item::STATUS_DISPOSED,
                    Item::STATUS_LOST,
                    Item::STATUS_DAMAGED,
                ]),
            ],
            'condition' => ['nullable', Rule::in(['excellent', 'good', 'fair', 'poor', 'damaged'])],
            'condition_notes' => ['nullable', 'string'],

            // Maintenance
            'last_maintenance_date' => ['nullable', 'date'],
            'next_maintenance_due' => ['nullable', 'date', 'after:last_maintenance_date'],
            'maintenance_frequency_months' => ['nullable', 'integer', 'min:1'],

            // Additional Information
            'barcode' => ['nullable', 'string', 'max:255', Rule::unique('items')->ignore($itemId)],
            'notes' => ['nullable', 'string'],
            'image_path' => ['nullable', 'string', 'max:500'],

            // Ownership & Assignment
            'custodian_id' => ['nullable', 'exists:users,id'],
            'department' => ['nullable', 'string', 'max:255'],
            'room_assignment' => ['nullable', 'string', 'max:255'],

            // Tracking
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'iar_number' => 'IAR number',
            'property_number' => 'property number',
            'category_id' => 'category',
            'location_id' => 'location',
            'unit_cost' => 'unit cost',
            'date_acquired' => 'date acquired',
            'warranty_expiry' => 'warranty expiry',
            'custodian_id' => 'custodian',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'property_number.unique' => 'This property number is already in use by another item.',
            'serial_number.unique' => 'This serial number is already registered to another item.',
            'warranty_expiry.after' => 'Warranty expiry must be after the acquisition date.',
        ];
    }
}
