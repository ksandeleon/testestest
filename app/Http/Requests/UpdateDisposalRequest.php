<?php

namespace App\Http\Requests;

use App\Models\Disposal;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDisposalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('disposals.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'reason' => 'sometimes|required|string|in:' . implode(',', Disposal::getReasons()),
            'description' => 'sometimes|required|string|min:10',
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
            'reason.in' => 'Invalid disposal reason.',
            'description.min' => 'Description must be at least 10 characters.',
            'scheduled_for.after' => 'Scheduled date must be in the future.',
        ];
    }
}
