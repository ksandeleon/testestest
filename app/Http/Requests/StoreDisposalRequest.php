<?php

namespace App\Http\Requests;

use App\Models\Disposal;
use Illuminate\Foundation\Http\FormRequest;

class StoreDisposalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('disposals.create');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'item_id' => 'required|exists:items,id',
            'reason' => 'required|string|in:' . implode(',', Disposal::getReasons()),
            'description' => 'required|string|min:10',
            'estimated_value' => 'nullable|numeric|min:0',
            'disposal_method' => 'nullable|string|in:' . implode(',', Disposal::getMethods()),
            'recipient' => 'nullable|string|max:255',
            'scheduled_for' => 'nullable|date|after:today',
            'attachments' => 'nullable|array',
            'attachments.*' => 'string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'item_id.required' => 'Please select an item to dispose.',
            'item_id.exists' => 'The selected item does not exist.',
            'reason.required' => 'Please provide a reason for disposal.',
            'reason.in' => 'Invalid disposal reason.',
            'description.required' => 'Please provide a detailed description.',
            'description.min' => 'Description must be at least 10 characters.',
            'scheduled_for.after' => 'Scheduled date must be in the future.',
        ];
    }
}
